import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, Recipe, MealPlan, ShoppingListItem, UserProfile } from '@/types';
import { mockPantryItems, mockRecipes, mockMealPlans, mockShoppingList } from './mockData';

// Storage keys
const STORAGE_KEYS = {
  PANTRY_ITEMS: 'pantry_items',
  RECIPES: 'recipes',
  MEAL_PLANS: 'meal_plans',
  SHOPPING_LIST: 'shopping_list',
  USER_PROFILE: 'user_profile',
};

// Initialize storage with mock data if empty
export const initializeStorage = async () => {
  try {
    console.log('storage: Initializing storage...');
    
    // Check if pantry items exist
    const pantryItems = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    if (!pantryItems) {
      console.log('storage: No pantry items found, initializing with mock data');
      await AsyncStorage.setItem(
        STORAGE_KEYS.PANTRY_ITEMS,
        JSON.stringify(mockPantryItems)
      );
    } else {
      console.log('storage: Pantry items already exist in storage');
    }

    // Check if recipes exist
    const recipes = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!recipes) {
      console.log('storage: No recipes found, initializing with mock data');
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECIPES,
        JSON.stringify(mockRecipes)
      );
    } else {
      console.log('storage: Recipes already exist in storage');
    }

    // Check if meal plans exist
    const mealPlans = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
    if (!mealPlans) {
      console.log('storage: No meal plans found, initializing with mock data');
      await AsyncStorage.setItem(
        STORAGE_KEYS.MEAL_PLANS,
        JSON.stringify(mockMealPlans)
      );
    } else {
      console.log('storage: Meal plans already exist in storage');
    }

    // Check if shopping list exists
    const shoppingList = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    if (!shoppingList) {
      console.log('storage: No shopping list found, initializing with mock data');
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOPPING_LIST,
        JSON.stringify(mockShoppingList)
      );
    } else {
      console.log('storage: Shopping list already exists in storage');
    }

    console.log('storage: Storage initialization completed');
  } catch (error) {
    console.error('storage: Error initializing storage:', error);
  }
};

// User Profile Storage Functions
export const initializeUserProfile = async () => {
  try {
    console.log('storage: Initializing user profile...');
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!profile) {
      console.log('storage: No user profile found, creating default profile');
      const defaultProfile: UserProfile = {
        id: 'user-1',
        name: '',
        dietaryPreferences: [],
        allergies: [],
        intolerances: [],
        dietaryRestrictions: [],
        cuisinePreferences: [],
        cookingSkillLevel: 'beginner',
        preferredMealTypes: [],
        weeklyMealFrequency: 7,
        servingSizePreference: 2,
        dislikedIngredients: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
        privacySettings: {
          shareHealthData: false,
          sharePreferences: true,
          allowAnalytics: true,
        },
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
      console.log('storage: Default user profile created');
    } else {
      console.log('storage: User profile already exists');
    }
  } catch (error) {
    console.error('storage: Error initializing user profile:', error);
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    console.log('storage: Getting user profile...');
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const result = profile ? JSON.parse(profile) : null;
    console.log('storage: Retrieved user profile:', result ? 'found' : 'not found');
    return result;
  } catch (error) {
    console.error('storage: Error getting user profile:', error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    console.log('storage: Saving user profile:', profile.id);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    console.log('storage: User profile saved successfully');
  } catch (error) {
    console.error('storage: Error saving user profile:', error);
    throw error;
  }
};

// Pantry Item Storage Functions
export const getPantryItems = async (): Promise<PantryItem[]> => {
  try {
    console.log('storage: Getting pantry items...');
    const items = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    const result = items ? JSON.parse(items) : [];
    console.log('storage: Retrieved pantry items:', result.length, 'items');
    
    // Log first few items for debugging
    if (result.length > 0) {
      console.log('storage: Sample items:', result.slice(0, 3).map((item: PantryItem) => ({
        id: item.id,
        name: item.name,
        category: item.category
      })));
    }
    
    return result;
  } catch (error) {
    console.error('storage: Error getting pantry items:', error);
    return [];
  }
};

export const savePantryItem = async (item: PantryItem): Promise<void> => {
  try {
    console.log('storage: Saving pantry item:', {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit
    });

    const items = await getPantryItems();
    console.log('storage: Current items count before save:', items.length);
    
    const existingItemIndex = items.findIndex((i) => i.id === item.id);

    if (existingItemIndex !== -1) {
      // Update existing item
      console.log('storage: Updating existing item at index:', existingItemIndex);
      items[existingItemIndex] = item;
    } else {
      // Add new item
      console.log('storage: Adding new item to pantry');
      items.push(item);
    }

    const itemsJson = JSON.stringify(items);
    console.log('storage: Saving items array with length:', items.length);
    console.log('storage: JSON size:', itemsJson.length, 'characters');
    
    await AsyncStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, itemsJson);
    console.log('storage: Pantry item saved successfully to AsyncStorage');

    // Verify the save by reading it back
    const verification = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
    if (verification) {
      const verifiedItems = JSON.parse(verification);
      console.log('storage: Verification - items count after save:', verifiedItems.length);
      
      // Check if our item is there
      const savedItem = verifiedItems.find((i: PantryItem) => i.id === item.id);
      if (savedItem) {
        console.log('storage: Verification - item successfully saved:', savedItem.name);
      } else {
        console.error('storage: Verification failed - item not found after save');
      }
    } else {
      console.error('storage: Verification failed - no data found after save');
    }
  } catch (error) {
    console.error('storage: Error saving pantry item:', error);
    console.error('storage: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  try {
    console.log('storage: Deleting pantry item:', itemId);
    const items = await getPantryItems();
    console.log('storage: Current items count before delete:', items.length);
    
    const updatedItems = items.filter((item) => item.id !== itemId);
    console.log('storage: Items count after filter:', updatedItems.length);
    
    await AsyncStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, JSON.stringify(updatedItems));
    console.log('storage: Pantry item deleted successfully');
  } catch (error) {
    console.error('storage: Error deleting pantry item:', error);
    throw error;
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