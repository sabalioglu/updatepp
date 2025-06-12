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

    let finalTranscription = transcription;

    // Step 1: Transcribe audio using OpenAI Whisper if not already provided
    if (!transcription && audioBase64) {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API key not configured',
            transcription: null,
            pantryItems: []
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      try {
        console.log('🎤 OpenAI Whisper Transcription Request:', {
          mimeType: mimeType,
          audioBase64Length: audioBase64.length,
          apiKeyPresent: !!openaiApiKey,
          timestamp: new Date().toISOString()
        });

        // Convert base64 to buffer for FormData
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        console.log('🎤 Audio buffer size:', audioBuffer.length, 'bytes');
        
        // Determine file extension and content type based on MIME type
        let fileExtension = '.m4a';
        let contentType = 'audio/m4a';
        
        if (mimeType) {
          if (mimeType.includes('webm')) {
            fileExtension = '.webm';
            contentType = 'audio/webm';
          } else if (mimeType.includes('wav')) {
            fileExtension = '.wav';
            contentType = 'audio/wav';
          } else if (mimeType.includes('mp3')) {
            fileExtension = '.mp3';
            contentType = 'audio/mp3';
          } else if (mimeType.includes('m4a') || mimeType.includes('mp4')) {
            fileExtension = '.m4a';
            contentType = 'audio/m4a';
          }
        }

        console.log('🎤 Using file extension:', fileExtension, 'Content-Type:', contentType);

        // Create FormData for Whisper API
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: contentType });
        formData.append('file', audioBlob, `voice${fileExtension}`);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        formData.append('language', 'en'); // Optional: specify language

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: formData,
        });

        console.log('🎤 OpenAI Whisper Response Status:', whisperResponse.status);

        if (!whisperResponse.ok) {
          let rawError = '';
          try {
            rawError = await whisperResponse.text();
          } catch (e) {
            rawError = '[Unable to read error body]';
          }
          
          console.log("❌ OpenAI Whisper API Raw Error:", rawError);

          try {
            const parsed = JSON.parse(rawError);
            console.log("🧠 OpenAI Whisper JSON Error:", parsed);
            
            // Log specific error details for debugging
            if (parsed.error) {
              console.log("🔍 Detailed Whisper Error Analysis:", {
                type: parsed.error.type,
                message: parsed.error.message,
                code: parsed.error.code,
                mimeTypeUsed: contentType,
                audioSize: audioBuffer.length,
                platform: 'API Route'
              });
            }
          } catch (e) {
            console.log("⚠️ OpenAI Whisper response was not valid JSON.");
            console.log("📄 Raw error content:", rawError.substring(0, 500));
          }

          return new Response(
            JSON.stringify({ 
              error: 'Failed to transcribe audio with Whisper',
              transcription: null,
              pantryItems: [],
              debugInfo: {
                service: 'OpenAI Whisper',
                mimeType: contentType,
                audioSize: audioBuffer.length,
                httpStatus: whisperResponse.status
              }
            }),
            {
              status: whisperResponse.status,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const whisperData = await whisperResponse.json();
        finalTranscription = whisperData.text;

        console.log('✅ Whisper Transcription Success:', {
          transcriptionLength: finalTranscription?.length || 0,
          hasContent: !!finalTranscription,
          service: 'OpenAI Whisper'
        });

        if (!finalTranscription) {
          console.log('❌ No transcription content received from Whisper');
          return new Response(
            JSON.stringify({ 
              error: 'No transcription received from Whisper',
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
        console.log('📝 Final Whisper Transcription:', finalTranscription);
      } catch (transcriptionError) {
        console.error('💥 Whisper Transcription Request Error:', transcriptionError);
        console.error('🔧 Error Details:', {
          name: transcriptionError.name,
          message: transcriptionError.message,
          stack: transcriptionError.stack?.substring(0, 500)
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to transcribe audio with Whisper',
            transcription: null,
            pantryItems: [],
            debugInfo: {
              service: 'OpenAI Whisper',
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

    // Step 2: Extract pantry items from transcription using OpenAI GPT-4o-mini
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          transcription: finalTranscription,
          pantryItems: []
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let pantryItems = [];
    let summary = 'Transcription completed';
    let suggestions = [];
    let extractionError = null;

    try {
      console.log('🔍 Starting pantry item extraction with GPT-4o-mini...');
      
      const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'You are a pantry assistant that returns structured JSON data for food inventory management. You ONLY process food-related voice notes and extract specific food items with quantities, categories, and storage information. Always respond with valid JSON in the exact format specified.'
            },
            {
              role: 'user',
              content: `Voice transcription to analyze: "${finalTranscription}". 

Please return the data in strict JSON format as specified:

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

Rules:
- Extract specific food items with quantities when mentioned
- Assign appropriate food categories (fruits, vegetables, dairy, meat, seafood, grains, canned, frozen, spices, condiments, other)
- Estimate realistic expiry dates based on typical storage life
- If no food items are mentioned, return empty arrays
- Generate helpful storage suggestions`
            }
          ]
        }),
      });

      console.log('🔍 GPT-4o-mini Extraction Response Status:', extractionResponse.status);

      if (extractionResponse.ok) {
        try {
          const extractionData = await extractionResponse.json();
          const aiResponse = extractionData.choices?.[0]?.message?.content;

          if (aiResponse) {
            const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsedResponse = JSON.parse(cleanedResponse);
            
            pantryItems = Array.isArray(parsedResponse.pantryItems) ? parsedResponse.pantryItems : [];
            summary = parsedResponse.summary || 'Items extracted from voice note';
            suggestions = Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : [];
            
            console.log('✅ GPT-4o-mini Extraction Success:', {
              itemsFound: pantryItems.length,
              summary: summary
            });
          }
        } catch (parseError) {
          console.error('💥 Error parsing GPT-4o-mini extraction response:', parseError);
          extractionError = 'Failed to parse pantry items from transcription';
          summary = "Could not extract pantry items from AI response.";
          suggestions = ["Please rephrase your voice note or try again."];
        }
      } else {
        let rawError = '';
        try {
          rawError = await extractionResponse.text();
        } catch (e) {
          rawError = '[Unable to read error body]';
        }
        
        console.log("❌ GPT-4o-mini Extraction API Raw Error:", rawError);

        try {
          const parsed = JSON.parse(rawError);
          console.log("🧠 GPT-4o-mini Extraction JSON Error:", parsed);
        } catch (e) {
          console.log("⚠️ GPT-4o-mini extraction response was not valid JSON.");
          console.log("📄 Raw error content:", rawError.substring(0, 500));
        }

        extractionError = 'Failed to extract pantry items from transcription';
        summary = "Could not extract pantry items from AI response.";
        suggestions = ["Please rephrase your voice note or try again."];
      }
    } catch (extractionRequestError) {
      console.error('💥 GPT-4o-mini extraction request error:', extractionRequestError);
      console.error('🔧 Error Details:', {
        name: extractionRequestError.name,
        message: extractionRequestError.message
      });
      extractionError = 'Failed to extract pantry items from transcription';
      summary = "Could not extract pantry items from AI response.";
      suggestions = ["Please rephrase your voice note or try again."];
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
      hasError: !!response.error,
      transcriptionService: 'OpenAI Whisper',
      extractionService: 'OpenAI GPT-4o-mini'
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