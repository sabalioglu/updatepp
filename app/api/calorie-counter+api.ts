export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare the prompt for calorie counting and nutritional analysis
    const systemPrompt = `You are a professional nutritionist and calorie counting AI for a health app called Pantry Pal. Your ONLY purpose is to:

1. Identify food items in meal images
2. Estimate portion sizes and quantities
3. Calculate accurate calorie and nutritional information
4. Provide health insights and tips

STRICT RULES:
- ONLY discuss food, nutrition, calories, and health
- REFUSE to answer any questions not related to nutrition/health
- If asked about anything else, respond: "I can only help with calorie counting and nutritional analysis for Pantry Pal."
- Focus on accurate, evidence-based nutritional information
- Be conservative with portion size estimates

When analyzing meal images:
1. Identify all visible food items with estimated quantities
2. Calculate calories and macronutrients for each item
3. Determine meal type (breakfast, lunch, dinner, snack)
4. Provide a health score (1-100) based on nutritional balance
5. Offer practical nutritional tips

Format your response as JSON with this structure:
{
  "identifiedFoods": [
    {
      "name": "Food Name",
      "quantity": "estimated portion (e.g., 1 cup, 100g, 1 medium)",
      "calories": 150,
      "protein": 8,
      "carbs": 20,
      "fat": 5,
      "fiber": 3
    }
  ],
  "totalCalories": 500,
  "totalProtein": 25,
  "totalCarbs": 60,
  "totalFat": 15,
  "totalFiber": 8,
  "mealType": "breakfast/lunch/dinner/snack",
  "healthScore": 75,
  "nutritionalTips": [
    "tip1",
    "tip2"
  ]
}

Please analyze this meal image and provide detailed nutritional information.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Try to parse the JSON response from the AI
    let parsedResponse;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, return a structured error
      parsedResponse = {
        identifiedFoods: [{
          name: 'Unable to identify',
          quantity: 'Unknown',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        mealType: 'Unknown',
        healthScore: 0,
        nutritionalTips: ['Please try taking another photo with better lighting']
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Calorie counter API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}