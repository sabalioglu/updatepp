import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, Recipe, MealPlan, ShoppingListItem } from '@/types';
import { mockPantryItems, mockRecipes, mockMealPlans, mockShoppingList } from './mockData';

// Storage keys
const STORAGE_KEYS = {
  PANTRY_ITEMS: 'pantry_items',
  RECIPES: 'recipes',
  MEAL_PLANS: 'meal_plans',
  SHOPPING_LIST: 'shopping_list',
};

// Initialize storage with mock data if empty
export const initializeStorage = async () => {
  try {
    // Check if pantry items exist
    const pantryItems = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    if (!pantryItems) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PANTRY_ITEMS,
        JSON.stringify(mockPantryItems)
      );
    }

    // Check if recipes exist
    const recipes = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!recipes) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECIPES,
        JSON.stringify(mockRecipes)
      );
    }

    // Check if meal plans exist
    const mealPlans = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
    if (!mealPlans) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(mockMealPlans)
      );
    }

    // Check if shopping list exists
    const shoppingList = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    if (!shoppingList) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOPPING_LIST,
        JSON.stringify(mockShoppingList)
      );
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Pantry Item Storage Functions
export const getPantryItems = async (): Promise<PantryItem[]> => {
  try {
    const items = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error getting pantry items:', error);
    return [];
  }
};

export const savePantryItem = async (item: PantryItem): Promise<void> => {
  try {
    const items = await getPantryItems();
    const existingItemIndex = items.findIndex((i) => i.id === item.id);

    if (existingItemIndex !== -1) {
      // Update existing item
      items[existingItemIndex] = item;
    } else {
      // Add new item
      items.push(item);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving pantry item:', error);
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    const items = await getPantryItems();
    const updatedItems = items.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error deleting pantry item:', error);
  }
};

// Recipe Storage Functions
export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipes = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
    return recipes ? JSON.parse(recipes) : [];
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    const recipes = await getRecipes();
    const existingRecipeIndex = recipes.findIndex((r) => r.id === recipe.id);

    if (existingRecipeIndex !== -1) {
      // Update existing recipe
      recipes[existingRecipeIndex] = recipe;
    } else {
      // Add new recipe
      recipes.push(recipe);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    const recipes = await getRecipes();
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Error deleting recipe:', error);
  }
};

// Meal Plan Storage Functions
export const getMealPlans = async (): Promise<MealPlan[]> => {
  try {
    const mealPlans = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
    return mealPlans ? JSON.parse(mealPlans) : [];
  } catch (error) {
    console.error('Error getting meal plans:', error);
    return [];
  }
};

export const saveMealPlan = async (mealPlan: MealPlan): Promise<void> => {
  try {
    const mealPlans = await getMealPlans();
    const existingPlanIndex = mealPlans.findIndex((p) => p.id === mealPlan.id);

    if (existingPlanIndex !== -1) {
      // Update existing meal plan
      mealPlans[existingPlanIndex] = mealPlan;
    } else {
      // Add new meal plan
      mealPlans.push(mealPlan);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
  } catch (error) {
    console.error('Error saving meal plan:', error);
  }
};

export const deleteMealPlan = async (planId: string): Promise<void> => {
  try {
    const mealPlans = await getMealPlans();
    const updatedPlans = mealPlans.filter((plan) => plan.id !== planId);
    await AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(updatedPlans));
  } catch (error) {
    console.error('Error deleting meal plan:', error);
  }
};

// Shopping List Storage Functions
export const getShoppingList = async (): Promise<ShoppingListItem[]> => {
  try {
    const list = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return [];
  }
};

export const saveShoppingListItem = async (item: ShoppingListItem): Promise<void> => {
  try {
    const items = await getShoppingList();
    const existingItemIndex = items.findIndex((i) => i.id === item.id);

    if (existingItemIndex !== -1) {
      // Update existing item
      items[existingItemIndex] = item;
    } else {
      // Add new item
      items.push(item);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving shopping list item:', error);
  }
};

export const deleteShoppingListItem = async (itemId: string): Promise<void> => {
  try {
    const items = await getShoppingList();
    const updatedItems = items.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
  }
};

export const clearCheckedItems = async (): Promise<void> => {
  try {
    const items = await getShoppingList();
    const updatedItems = items.filter((item) => !item.checked);
    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Error clearing checked items:', error);
  }
};