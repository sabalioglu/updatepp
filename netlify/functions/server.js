const path = require('path');
const fs = require('fs');

exports.handler = async (event, context) => {
  try {
    const { httpMethod, path: requestPath, queryStringParameters, headers, body } = event;
    
    // Handle API routes
    if (requestPath.startsWith('/api/')) {
      const apiPath = requestPath.replace('/api/', '');
      
      // Handle food recognition API
      if (apiPath === 'food-recognition' && httpMethod === 'POST') {
        try {
          const requestBody = JSON.parse(body || '{}');
          const { imageBase64 } = requestBody;
          
          if (!imageBase64) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              },
              body: JSON.stringify({ error: 'No image data provided' }),
            };
          }

          const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
          
          if (!apiKey) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Gemini API key not configured' }),
            };
          }

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
}

Please analyze this food image and provide recipe suggestions.`;

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
                temperature: 0.7,
                maxOutputTokens: 1000,
              }
            }),
          });

          if (!response.ok) {
            const rawError = await response.text();
            console.log("❌ Gemini Food Recognition API Raw Error:", rawError);

            try {
              const parsed = JSON.parse(rawError);
              console.log("🧠 Gemini Food Recognition JSON Error:", parsed);
            } catch (e) {
              console.log("⚠️ Gemini food recognition response was not valid JSON.");
            }

            return {
              statusCode: response.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Failed to analyze image' }),
            };
          }

          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!aiResponse) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'No response from AI' }),
            };
          }

          // Try to parse the JSON response from the AI
          let parsedResponse;
          try {
            const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedResponse = JSON.parse(cleanedResponse);
          } catch (parseError) {
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

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(parsedResponse),
          };

        } catch (error) {
          console.error('Food recognition API error:', error);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal server error' }),
          };
        }
      }

      // Handle calorie counter API
      if (apiPath === 'calorie-counter' && httpMethod === 'POST') {
        try {
          const requestBody = JSON.parse(body || '{}');
          const { imageBase64 } = requestBody;
          
          if (!imageBase64) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              },
              body: JSON.stringify({ error: 'No image data provided' }),
            };
          }

          const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
          
          if (!apiKey) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Gemini API key not configured' }),
            };
          }

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
            const rawError = await response.text();
            console.log("❌ Gemini Calorie Counter API Raw Error:", rawError);

            try {
              const parsed = JSON.parse(rawError);
              console.log("🧠 Gemini Calorie Counter JSON Error:", parsed);
            } catch (e) {
              console.log("⚠️ Gemini calorie counter response was not valid JSON.");
            }

            return {
              statusCode: response.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Failed to analyze image' }),
            };
          }

          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!aiResponse) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'No response from AI' }),
            };
          }

          // Try to parse the JSON response from the AI
          let parsedResponse;
          try {
            const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedResponse = JSON.parse(cleanedResponse);
          } catch (parseError) {
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

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(parsedResponse),
          };

        } catch (error) {
          console.error('Calorie counter API error:', error);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal server error' }),
          };
        }
      }

      // Handle voice to pantry API
      if (apiPath === 'voice-to-pantry' && httpMethod === 'POST') {
        try {
          const requestBody = JSON.parse(body || '{}');
          const { audioBase64, transcription, mimeType } = requestBody;
          
          if (!transcription && !audioBase64) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              },
              body: JSON.stringify({ error: 'No audio data or transcription provided' }),
            };
          }

          let finalTranscription = transcription;

          // Step 1: Transcribe audio using OpenAI Whisper if not already provided
          if (!transcription && audioBase64) {
            const openaiApiKey = process.env.OPENAI_API_KEY;
            
            if (!openaiApiKey) {
              return {
                statusCode: 500,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ 
                  error: 'OpenAI API key not configured',
                  transcription: null,
                  pantryItems: []
                }),
              };
            }

            try {
              // Use the provided mimeType or fallback to audio/mp4 for better compatibility
              const audioMimeType = mimeType || 'audio/mp4';
              
              console.log('🎤 Netlify OpenAI Whisper Transcription Request:', {
                mimeType: audioMimeType,
                audioBase64Length: audioBase64.length,
                apiKeyPresent: !!openaiApiKey,
                timestamp: new Date().toISOString()
              });

              // Convert base64 to buffer for FormData
              const audioBuffer = Buffer.from(audioBase64, 'base64');
              console.log('🎤 Netlify Audio buffer size:', audioBuffer.length, 'bytes');
              
              // Determine file extension based on MIME type
              let fileExtension = '.m4a';
              if (audioMimeType.includes('webm')) {
                fileExtension = '.webm';
              } else if (audioMimeType.includes('wav')) {
                fileExtension = '.wav';
              } else if (audioMimeType.includes('mp3')) {
                fileExtension = '.mp3';
              }

              // Create FormData for Whisper API
              const FormData = require('form-data');
              const formData = new FormData();
              formData.append('file', audioBuffer, {
                filename: `voice${fileExtension}`,
                contentType: audioMimeType,
              });
              formData.append('model', 'whisper-1');
              formData.append('response_format', 'json');
              formData.append('language', 'en');

              const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  ...formData.getHeaders(),
                },
                body: formData,
              });

              console.log('🎤 Netlify OpenAI Whisper Response Status:', whisperResponse.status);

              if (!whisperResponse.ok) {
                let rawError = '';
                try {
                  rawError = await whisperResponse.text();
                } catch (e) {
                  rawError = '[Unable to read error body]';
                }
                
                console.log("❌ Netlify OpenAI Whisper API Raw Error:", rawError);

                try {
                  const parsed = JSON.parse(rawError);
                  console.log("🧠 Netlify OpenAI Whisper JSON Error:", parsed);
                  
                  // Log specific error details for debugging
                  if (parsed.error) {
                    console.log("🔍 Netlify Detailed Whisper Error Analysis:", {
                      type: parsed.error.type,
                      message: parsed.error.message,
                      code: parsed.error.code,
                      mimeTypeUsed: audioMimeType,
                      audioSize: audioBuffer.length,
                      platform: 'Netlify Function'
                    });
                  }
                } catch (e) {
                  console.log("⚠️ Netlify OpenAI Whisper response was not valid JSON.");
                  console.log("📄 Raw error content:", rawError.substring(0, 500));
                }

                return {
                  statusCode: whisperResponse.status,
                  headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                  },
                  body: JSON.stringify({ 
                    error: 'Failed to transcribe audio with Whisper',
                    transcription: null,
                    pantryItems: [],
                    debugInfo: {
                      service: 'OpenAI Whisper',
                      mimeType: audioMimeType,
                      audioSize: audioBuffer.length,
                      httpStatus: whisperResponse.status
                    }
                  }),
                };
              }

              const whisperData = await whisperResponse.json();
              finalTranscription = whisperData.text;

              console.log('✅ Netlify Whisper Transcription Success:', {
                transcriptionLength: finalTranscription?.length || 0,
                hasContent: !!finalTranscription,
                service: 'OpenAI Whisper'
              });

              if (!finalTranscription) {
                console.log('❌ Netlify No transcription content received from Whisper');
                return {
                  statusCode: 500,
                  headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                  },
                  body: JSON.stringify({ 
                    error: 'No transcription received from Whisper',
                    transcription: null,
                    pantryItems: []
                  }),
                };
              }

              finalTranscription = finalTranscription.trim();
              console.log('📝 Netlify Final Whisper Transcription:', finalTranscription);
            } catch (transcriptionError) {
              console.error('💥 Netlify Whisper Transcription Request Error:', transcriptionError);
              console.error('🔧 Netlify Error Details:', {
                name: transcriptionError.name,
                message: transcriptionError.message,
                stack: transcriptionError.stack?.substring(0, 500)
              });
              
              return {
                statusCode: 500,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ 
                  error: 'Failed to transcribe audio with Whisper',
                  transcription: null,
                  pantryItems: [],
                  debugInfo: {
                    service: 'OpenAI Whisper',
                    errorType: transcriptionError.name,
                    errorMessage: transcriptionError.message
                  }
                }),
              };
            }
          }

          // Step 2: Extract pantry items from transcription using OpenAI GPT-4.1 Mini
          const openaiApiKey = process.env.OPENAI_API_KEY;
          
          if (!openaiApiKey) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ 
                error: 'OpenAI API key not configured',
                transcription: finalTranscription,
                pantryItems: []
              }),
            };
          }

          let pantryItems = [];
          let summary = 'Transcription completed';
          let suggestions = [];
          let extractionError = null;

          try {
            console.log('🔍 Netlify Starting pantry item extraction with GPT-4.1 Mini...');
            
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

            console.log('🔍 Netlify GPT-4.1 Mini Extraction Response Status:', extractionResponse.status);

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
                  
                  console.log('✅ Netlify GPT-4.1 Mini Extraction Success:', {
                    itemsFound: pantryItems.length,
                    summary: summary
                  });
                }
              } catch (parseError) {
                console.error('💥 Netlify Error parsing GPT-4.1 Mini extraction response:', parseError);
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
              
              console.log("❌ Netlify GPT-4.1 Mini Extraction API Raw Error:", rawError);

              try {
                const parsed = JSON.parse(rawError);
                console.log("🧠 Netlify GPT-4.1 Mini Extraction JSON Error:", parsed);
              } catch (e) {
                console.log("⚠️ Netlify GPT-4.1 Mini extraction response was not valid JSON.");
                console.log("📄 Raw error content:", rawError.substring(0, 500));
              }

              extractionError = 'Failed to extract pantry items from transcription';
              summary = "Could not extract pantry items from AI response.";
              suggestions = ["Please rephrase your voice note or try again."];
            }
          } catch (extractionRequestError) {
            console.error('💥 Netlify GPT-4.1 Mini extraction request error:', extractionRequestError);
            console.error('🔧 Netlify Error Details:', {
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

          console.log('📤 Netlify Final API Response:', {
            hasTranscription: !!response.transcription,
            itemCount: response.pantryItems.length,
            hasError: !!response.error,
            transcriptionService: 'OpenAI Whisper',
            extractionService: 'OpenAI GPT-4.1 Mini'
          });

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(response),
          };

        } catch (error) {
          console.error('💥 Netlify Voice to pantry API error:', error);
          console.error('🔧 Netlify Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 500)
          });
          
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: 'Internal server error',
              transcription: null,
              pantryItems: [],
              debugInfo: {
                errorType: error.name,
                errorMessage: error.message
              }
            }),
          };
        }
      }

      // Handle OPTIONS requests for CORS
      if (httpMethod === 'OPTIONS') {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: '',
        };
      }

      // API route not found
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'API route not found' }),
      };
    }

    // For non-API routes, return 404 since we're handling static files differently
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<h1>404 - Not Found</h1>',
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};