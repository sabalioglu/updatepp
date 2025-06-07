import { useState, useEffect, useCallback } from 'react';
import { RecipeRecommendation, UserProfile, Recipe, PantryItem } from '@/types';
import { useUserProfile } from './useUserProfile';
import { useRecipes } from './useRecipes';
import { usePantryItems } from './usePantryItems';

export function useRecipeRecommendations() {
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { profile } = useUserProfile();
  const { recipes } = useRecipes();
  const { items } = usePantryItems();

  const calculateRecommendationScore = useCallback((
    recipe: Recipe, 
    userProfile: UserProfile, 
    pantryItems: PantryItem[]
  ): RecipeRecommendation => {
    let score = 0;
    const reasons: string[] = [];
    const matchedPreferences: string[] = [];
    
    // Dietary preferences matching (30% weight)
    const dietaryMatch = recipe.dietaryTags.some(tag => 
      userProfile.dietaryPreferences.includes(tag as any) ||
      userProfile.dietaryRestrictions.includes(tag as any)
    );
    if (dietaryMatch) {
      score += 30;
      reasons.push('Matches your dietary preferences');
      matchedPreferences.push('Dietary preferences');
    }

    // Cuisine preferences (20% weight)
    if (userProfile.cuisinePreferences.includes(recipe.cuisine)) {
      score += 20;
      reasons.push(`You love ${recipe.cuisine} cuisine`);
      matchedPreferences.push('Cuisine preference');
    }

    // Cooking skill level (15% weight)
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const userSkillIndex = skillLevels.indexOf(userProfile.cookingSkillLevel);
    const recipeSkillIndex = skillLevels.indexOf(recipe.difficulty);
    
    if (recipeSkillIndex <= userSkillIndex) {
      score += 15;
      if (recipeSkillIndex === userSkillIndex) {
        reasons.push('Perfect difficulty level for you');
        matchedPreferences.push('Skill level');
      }
    }

    // Meal type preferences (10% weight)
    const mealTypeFromTags = recipe.tags.find(tag => 
      userProfile.preferredMealTypes.includes(tag as any)
    );
    if (mealTypeFromTags) {
      score += 10;
      reasons.push(`Great for ${mealTypeFromTags}`);
      matchedPreferences.push('Meal type');
    }

    // Pantry ingredients availability (20% weight)
    const pantryIngredientNames = pantryItems.map(item => item.name.toLowerCase());
    const availableIngredients = recipe.ingredients.filter(ingredient =>
      pantryIngredientNames.includes(ingredient.name.toLowerCase())
    ).length;
    
    const totalIngredients = recipe.ingredients.length;
    const availabilityRatio = availableIngredients / totalIngredients;
    
    if (availabilityRatio > 0.7) {
      score += 20;
      reasons.push('You have most ingredients');
      matchedPreferences.push('Pantry availability');
    } else if (availabilityRatio > 0.5) {
      score += 15;
      reasons.push('You have many ingredients');
    } else if (availabilityRatio > 0.3) {
      score += 10;
      reasons.push('You have some ingredients');
    }

    // Avoid disliked ingredients (penalty)
    const hasDislikedIngredients = recipe.ingredients.some(ingredient =>
      userProfile.dislikedIngredients.some(disliked =>
        ingredient.name.toLowerCase().includes(disliked.toLowerCase())
      )
    );
    if (hasDislikedIngredients) {
      score -= 25;
    }

    // Allergy check (complete exclusion)
    const hasAllergens = recipe.ingredients.some(ingredient =>
      userProfile.allergies.some(allergy =>
        ingredient.name.toLowerCase().includes(allergy.toLowerCase())
      )
    );
    if (hasAllergens) {
      score = 0; // Exclude completely
    }

    // Serving size preference (5% weight)
    const servingDifference = Math.abs(recipe.servings - userProfile.servingSizePreference);
    if (servingDifference <= 1) {
      score += 5;
      reasons.push('Perfect serving size');
    }

    // Nutritional fit for health goals
    let nutritionalFit = 50; // Default neutral score
    if (userProfile.healthGoals && recipe.nutrition) {
      if (userProfile.healthGoals.includes('weight-loss') && recipe.nutrition.calories < 400) {
        nutritionalFit += 30;
        reasons.push('Low calorie for weight loss');
      }
      if (userProfile.healthGoals.includes('muscle-gain') && recipe.nutrition.protein > 20) {
        nutritionalFit += 25;
        reasons.push('High protein for muscle gain');
      }
      if (userProfile.healthGoals.includes('heart-health') && recipe.nutrition.sodium < 600) {
        nutritionalFit += 20;
        reasons.push('Heart-healthy sodium levels');
      }
    }

    return {
      recipe,
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons.slice(0, 3), // Limit to top 3 reasons
      matchedPreferences,
      nutritionalFit,
      availableIngredients,
      totalIngredients,
    };
  }, []);

  const generateRecommendations = useCallback(async () => {
    if (!profile?.onboardingCompleted || recipes.length === 0) {
      setRecommendations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const scoredRecipes = recipes.map(recipe => 
        calculateRecommendationScore(recipe, profile, items)
      );

      // Filter out recipes with allergens (score 0) and sort by score
      const filteredAndSorted = scoredRecipes
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score);

      setRecommendations(filteredAndSorted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate recommendations'));
    } finally {
      setLoading(false);
    }
  }, [profile, recipes, items, calculateRecommendationScore]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const refreshRecommendations = useCallback(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
  };
}