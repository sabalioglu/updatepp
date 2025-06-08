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