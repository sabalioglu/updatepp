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
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
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
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
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

          let finalTranscription = transcription;

          // Step 1: Transcribe audio if not already provided
          if (!transcription && audioBase64) {
            const transcriptionPrompt = `Transcribe the following audio into plain text. Return only the raw transcription, no summary, analysis, or additional comments. If the audio is not clear, transcribe as accurately as possible.`;

            try {
              // Use the provided mimeType or fallback to audio/mp4 for better compatibility
              const audioMimeType = mimeType || 'audio/mp4';
              
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

              if (!transcriptionResponse.ok) {
                const errorData = await transcriptionResponse.text();
                console.error('Gemini transcription API error:', errorData);
                return {
                  statusCode: transcriptionResponse.status,
                  headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                  },
                  body: JSON.stringify({ 
                    error: 'Failed to transcribe audio',
                    transcription: null,
                    pantryItems: []
                  }),
                };
              }

              const transcriptionData = await transcriptionResponse.json();
              finalTranscription = transcriptionData.candidates?.[0]?.content?.parts?.[0]?.text;

              if (!finalTranscription) {
                return {
                  statusCode: 500,
                  headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                  },
                  body: JSON.stringify({ 
                    error: 'No transcription received from AI',
                    transcription: null,
                    pantryItems: []
                  }),
                };
              }

              finalTranscription = finalTranscription.trim();
            } catch (transcriptionError) {
              console.error('Transcription error:', transcriptionError);
              return {
                statusCode: 500,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ 
                  error: 'Failed to transcribe audio',
                  transcription: null,
                  pantryItems: []
                }),
              };
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
                }
              } catch (parseError) {
                console.error('Error parsing extraction response:', parseError);
                extractionError = 'Failed to parse pantry items from transcription';
              }
            } else {
              const errorData = await extractionResponse.text();
              console.error('Gemini extraction API error:', errorData);
              extractionError = 'Failed to extract pantry items from transcription';
            }
          } catch (extractionRequestError) {
            console.error('Extraction request error:', extractionRequestError);
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
          console.error('Voice to pantry API error:', error);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: 'Internal server error',
              transcription: null,
              pantryItems: []
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