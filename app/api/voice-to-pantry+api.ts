export async function POST(request: Request) {
  try {
    const { audioBase64, transcription } = await request.json();
    
    if (!transcription && !audioBase64) {
      return new Response(
        JSON.stringify({ error: 'No audio data or transcription provided' }),
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

    // Use transcription if provided, otherwise we'd need to transcribe audio first
    const textToAnalyze = transcription || "Unable to transcribe audio";

    const systemPrompt = `You are a pantry management AI for Pantry Pal. Your ONLY purpose is to:

1. Extract food items from voice transcriptions
2. Determine quantities, units, and categories
3. Estimate expiry dates based on typical food storage
4. Structure data for pantry inventory

STRICT RULES:
- ONLY process food-related voice notes
- Extract specific food items with quantities when mentioned
- Assign appropriate food categories
- Estimate realistic expiry dates
- If no food items are mentioned, return empty arrays

When analyzing voice transcriptions:
1. Identify all food items mentioned
2. Extract quantities and units (estimate if not specified)
3. Assign appropriate categories (fruits, vegetables, dairy, meat, etc.)
4. Calculate expiry dates based on typical storage life
5. Generate helpful notes from the voice content

Format your response as JSON with this structure:
{
  "pantryItems": [
    {
      "name": "Food Item Name",
      "quantity": 2,
      "unit": "pcs",
      "category": "fruits",
      "estimatedExpiryDays": 7,
      "notes": "User mentioned: fresh from farmers market"
    }
  ],
  "summary": "Added 3 items to pantry from voice note",
  "suggestions": [
    "Store bananas at room temperature",
    "Keep milk refrigerated"
  ]
}

Voice transcription to analyze: "${textToAnalyze}"`;

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
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze voice note' }),
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
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      parsedResponse = {
        pantryItems: [],
        summary: 'Unable to extract food items from voice note',
        suggestions: ['Please try speaking more clearly about specific food items']
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
    console.error('Voice to pantry API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}