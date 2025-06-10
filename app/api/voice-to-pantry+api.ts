export async function POST(request: Request) {
  try {
    const { audioBase64, transcription, mimeType } = await request.json();
    
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

    let finalTranscription = transcription;

    // Step 1: Transcribe audio if not already provided
    if (!transcription && audioBase64) {
      const transcriptionPrompt = `Transcribe the following audio into plain text. Return only the raw transcription, no summary, analysis, or additional comments. If the audio is not clear, transcribe as accurately as possible.`;

      try {
        // Use the provided mimeType or fallback to audio/mp4 for better compatibility
        const audioMimeType = mimeType || 'audio/mp4';
        
        console.log('🎤 Gemini Transcription Request:', {
          mimeType: audioMimeType,
          audioBase64Length: audioBase64.length,
          apiKeyPresent: !!apiKey,
          timestamp: new Date().toISOString()
        });
        
        const transcriptionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
                      mime_type: audioMimeType,
                      data: audioBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1000,
            }
          }),
        });

        console.log('🎤 Gemini Transcription Response Status:', transcriptionResponse.status);

        if (!transcriptionResponse.ok) {
          const rawError = await transcriptionResponse.text();
          console.log("❌ Gemini Transcription API Raw Error:", rawError);

          try {
            const parsed = JSON.parse(rawError);
            console.log("🧠 Gemini Transcription JSON Error:", parsed);
            
            // Log specific error details for iOS debugging
            if (parsed.error) {
              console.log("🔍 Detailed Error Analysis:", {
                code: parsed.error.code,
                message: parsed.error.message,
                status: parsed.error.status,
                details: parsed.error.details || 'No additional details',
                mimeTypeUsed: audioMimeType,
                audioSize: audioBase64.length,
                platform: 'API Route'
              });
            }
          } catch (e) {
            console.log("⚠️ Gemini transcription response was not valid JSON.");
            console.log("📄 Raw error content:", rawError.substring(0, 500));
          }

          return {
            statusCode: transcriptionResponse.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: 'Failed to transcribe audio',
              transcription: null,
              pantryItems: [],
              debugInfo: {
                mimeType: audioMimeType,
                audioSize: audioBase64.length,
                httpStatus: transcriptionResponse.status
              }
            }),
          };
        }

        const transcriptionData = await transcriptionResponse.json();
        finalTranscription = transcriptionData.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ Transcription Success:', {
          transcriptionLength: finalTranscription?.length || 0,
          hasContent: !!finalTranscription
        });

        if (!finalTranscription) {
          console.log('❌ No transcription content received from Gemini');
          return new Response(
            JSON.stringify({ 
              error: 'No transcription received from AI',
              transcription: null,
              pantryItems: []
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        finalTranscription = finalTranscription.trim();
        console.log('📝 Final Transcription:', finalTranscription);
      } catch (transcriptionError) {
        console.error('💥 Transcription Request Error:', transcriptionError);
        console.error('🔧 Error Details:', {
          name: transcriptionError.name,
          message: transcriptionError.message,
          stack: transcriptionError.stack?.substring(0, 500)
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to transcribe audio',
            transcription: null,
            pantryItems: [],
            debugInfo: {
              errorType: transcriptionError.name,
              errorMessage: transcriptionError.message
            }
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Step 2: Extract pantry items from transcription
    const extractionPrompt = `You are a pantry management AI for Pantry Pal. Your ONLY purpose is to:

1. Extract food items from voice transcriptions
2. Determine quantities, units, and categories
3. Estimate expiry dates based on typical food storage
4. Structure data for pantry inventory

STRICT RULES:
- ONLY process food-related voice notes
- Extract specific food items with quantities when mentioned
- Assign appropriate food categories (fruits, vegetables, dairy, meat, seafood, grains, canned, frozen, spices, condiments, other)
- Estimate realistic expiry dates
- If no food items are mentioned, return empty arrays

When analyzing voice transcriptions:
1. Identify all food items mentioned
2. Extract quantities and units (estimate if not specified)
3. Assign appropriate categories
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

Voice transcription to analyze: "${finalTranscription}"`;

    let pantryItems = [];
    let summary = 'Transcription completed';
    let suggestions = [];
    let extractionError = null;

    try {
      console.log('🔍 Starting pantry item extraction...');
      
      const extractionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: extractionPrompt
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

      console.log('🔍 Gemini Extraction Response Status:', extractionResponse.status);

      if (extractionResponse.ok) {
        try {
          const extractionData = await extractionResponse.json();
          const aiResponse = extractionData.candidates?.[0]?.content?.parts?.[0]?.text;

          if (aiResponse) {
            const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsedResponse = JSON.parse(cleanedResponse);
            
            pantryItems = Array.isArray(parsedResponse.pantryItems) ? parsedResponse.pantryItems : [];
            summary = parsedResponse.summary || 'Items extracted from voice note';
            suggestions = Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : [];
            
            console.log('✅ Extraction Success:', {
              itemsFound: pantryItems.length,
              summary: summary
            });
          }
        } catch (parseError) {
          console.error('💥 Error parsing extraction response:', parseError);
          extractionError = 'Failed to parse pantry items from transcription';
        }
      } else {
        const rawError = await extractionResponse.text();
        console.log("❌ Gemini Extraction API Raw Error:", rawError);

        try {
          const parsed = JSON.parse(rawError);
          console.log("🧠 Gemini Extraction JSON Error:", parsed);
        } catch (e) {
          console.log("⚠️ Gemini extraction response was not valid JSON.");
          console.log("📄 Raw error content:", rawError.substring(0, 500));
        }

        extractionError = 'Failed to extract pantry items from transcription';
      }
    } catch (extractionRequestError) {
      console.error('💥 Extraction request error:', extractionRequestError);
      console.error('🔧 Error Details:', {
        name: extractionRequestError.name,
        message: extractionRequestError.message
      });
      extractionError = 'Failed to extract pantry items from transcription';
    }

    // Return both transcription and pantry items (even if extraction failed)
    const response = {
      transcription: finalTranscription,
      pantryItems: pantryItems,
      summary: summary,
      suggestions: suggestions
    };

    // Add error message if extraction failed but transcription succeeded
    if (extractionError && pantryItems.length === 0) {
      response.error = extractionError;
    }

    console.log('📤 Final API Response:', {
      hasTranscription: !!response.transcription,
      itemCount: response.pantryItems.length,
      hasError: !!response.error
    });

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Voice to pantry API error:', error);
    console.error('🔧 Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        transcription: null,
        pantryItems: [],
        debugInfo: {
          errorType: error.name,
          errorMessage: error.message
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}