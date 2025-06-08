export async function POST(request: Request) {
  try {
    const { audioBase64, transcription } = await request.json();
    
    // If transcription is already provided, return it directly
    if (transcription) {
      return new Response(
        JSON.stringify({ transcription: transcription.trim() }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!audioBase64) {
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

    // Simple transcription prompt - only ask for raw text
    const transcriptionPrompt = `Transcribe the following audio into plain text. Return only the raw transcription, no summary, analysis, or additional comments. If the audio is not clear, transcribe as accurately as possible.`;

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
                text: transcriptionPrompt
              },
              {
                inline_data: {
                  mime_type: "audio/wav", // Support both wav and mp3
                  data: audioBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature for accurate transcription
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to transcribe audio' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const rawTranscription = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawTranscription) {
      return new Response(
        JSON.stringify({ error: 'No transcription received from AI' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return only the raw transcription, cleaned of any extra whitespace
    return new Response(
      JSON.stringify({ 
        transcription: rawTranscription.trim() 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Voice transcription API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}