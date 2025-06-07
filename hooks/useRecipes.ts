import { useState, useEffect, useCallback } from 'react';
import { Recipe, PantryItem } from '@/types';
import { getRecipes, saveRecipe, deleteRecipe } from '@/utils/storage';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = useCallback(async (recipe: Recipe) => {
    try {
      await saveRecipe(recipe);
      await fetchRecipes(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add recipe'));
    }
  }, [fetchRecipes]);

  const updateRecipe = useCallback(async (recipe: Recipe) => {
    try {
      await saveRecipe(recipe);
      await fetchRecipes(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update recipe'));
    }
  }, [fetchRecipes]);

  const removeRecipe = useCallback(async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      await fetchRecipes(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete recipe'));
    }
  }, [fetchRecipes]);

  const toggleFavorite = useCallback(async (recipeId: string, isFavorite: boolean) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        const updatedRecipe = {
          ...recipe,
          favorite: isFavorite,
        };
        await saveRecipe(updatedRecipe);
        await fetchRecipes(); // Refresh the list
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update favorite status'));
    }
  }, [recipes, fetchRecipes]);

  // Find recipes that can be made with available pantry items
  const findRecipesFromPantry = useCallback((pantryItems: PantryItem[]) => {
    const pantryIngredients = new Map();
    
    // Create a map of pantry ingredients
    pantryItems.forEach(item => {
      pantryIngredients.set(item.name.toLowerCase(), item);
    });
    
    // Filter recipes that can be made with pantry items
    return recipes.filter(recipe => {
      // Count how many required ingredients are available
      const requiredIngredients = recipe.ingredients.filter(ing => !ing.optional);
      const availableRequired = requiredIngredients.filter(ing => 
        pantryIngredients.has(ing.name.toLowerCase())
      );
      
      // If all required ingredients are available, or at least 70% of them
      return availableRequired.length === requiredIngredients.length || 
             (availableRequired.length > 0 && 
              availableRequired.length / requiredIngredients.length >= 0.7);
    });
  }, [recipes]);

  return {
    recipes,
    loading,
    error,
    refreshRecipes: fetchRecipes,
    addRecipe,
    updateRecipe,
    removeRecipe,
    toggleFavorite,
    findRecipesFromPantry,
  };
}