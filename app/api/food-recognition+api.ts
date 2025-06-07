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

    const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare the prompt for food recognition and recipe suggestions
    const systemPrompt = `You are a food recognition and recipe suggestion AI for a pantry management app called Pantry Pal. Your ONLY purpose is to:

1. Identify food items in images
2. Suggest recipes based on identified ingredients
3. Provide pantry management advice

STRICT RULES:
- ONLY discuss food, cooking, recipes, and pantry management
- REFUSE to answer any questions not related to food/cooking
- If asked about anything else, respond: "I can only help with food recognition and recipe suggestions for Pantry Pal."
- Focus on practical, actionable advice for reducing food waste
- Suggest recipes that use common pantry staples

When analyzing food images:
1. List all identifiable food items
2. Assess freshness/quality if visible
3. Suggest 2-3 recipes using those ingredients
4. Provide storage tips to extend shelf life
5. Recommend complementary ingredients from a typical pantry

Format your response as JSON with this structure:
{
  "identifiedFoods": ["item1", "item2", "item3"],
  "freshnessAssessment": "brief assessment of visible food quality",
  "suggestedRecipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "mainIngredients": ["ingredient1", "ingredient2"],
      "cookTime": "estimated time",
      "difficulty": "easy/medium/hard"
    }
  ],
  "storageTips": ["tip1", "tip2"],
  "complementaryIngredients": ["ingredient1", "ingredient2"]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pantry-pal.app',
        'X-Title': 'Pantry Pal Food Recognition',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this food image and provide recipe suggestions.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

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
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, return a structured error
      parsedResponse = {
        identifiedFoods: ['Unable to identify'],
        freshnessAssessment: 'Could not assess',
        suggestedRecipes: [{
          name: 'Analysis Error',
          description: 'Unable to analyze the image properly',
          mainIngredients: [],
          cookTime: 'N/A',
          difficulty: 'N/A'
        }],
        storageTips: ['Please try taking another photo'],
        complementaryIngredients: []
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
    console.error('Food recognition API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}