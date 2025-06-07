export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string | null;
  notes: string;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  image: string;
  tags: string[];
  favorite: boolean;
  nutrition?: NutritionInfo;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryTags: DietaryTag[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  
  // Dietary Preferences
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  intolerances: string[];
  dietaryRestrictions: DietaryRestriction[];
  
  // Food Preferences
  cuisinePreferences: string[];
  cookingSkillLevel: CookingSkillLevel;
  preferredMealTypes: MealType[];
  weeklyMealFrequency: number;
  servingSizePreference: number;
  dislikedIngredients: string[];
  
  // Health Information (Optional)
  healthGoals?: HealthGoal[];
  activityLevel?: ActivityLevel;
  height?: number; // cm
  weight?: number; // kg
  targetWeight?: number; // kg
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  healthConditions?: string[];
  dailyCaloricNeeds?: number;
  macroPreferences?: MacroPreferences;
  
  // App Preferences
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  privacySettings: PrivacySettings;
}

export interface MacroPreferences {
  proteinPercentage: number; // 10-40%
  carbsPercentage: number; // 20-65%
  fatPercentage: number; // 20-35%
}

export interface PrivacySettings {
  shareHealthData: boolean;
  sharePreferences: boolean;
  allowAnalytics: boolean;
}

export type DietaryPreference = 
  | 'vegetarian' 
  | 'vegan' 
  | 'pescatarian' 
  | 'flexitarian'
  | 'omnivore';

export type DietaryRestriction = 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'soy-free' 
  | 'egg-free'
  | 'shellfish-free'
  | 'low-sodium'
  | 'low-sugar'
  | 'keto'
  | 'paleo'
  | 'whole30'
  | 'mediterranean'
  | 'dash'
  | 'low-carb'
  | 'low-fat';

export type DietaryTag = DietaryPreference | DietaryRestriction;

export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type HealthGoal = 
  | 'weight-loss' 
  | 'weight-gain' 
  | 'muscle-gain' 
  | 'maintenance'
  | 'heart-health'
  | 'diabetes-management'
  | 'digestive-health'
  | 'energy-boost'
  | 'immune-support';

export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';

export interface MealPlan {
  id: string;
  date: string;
  meals: Meal[];
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string | null;
  recipeName: string;
  notes: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  source: 'recipe' | 'manual' | 'low-stock';
  recipeId?: string;
}

export type FoodCategory = 
  | 'fruits' 
  | 'vegetables' 
  | 'dairy' 
  | 'meat' 
  | 'seafood' 
  | 'grains' 
  | 'canned' 
  | 'frozen' 
  | 'spices' 
  | 'baking' 
  | 'snacks' 
  | 'beverages' 
  | 'condiments'
  | 'other';

export type UnitOfMeasure = 
  | 'g' // grams
  | 'kg' // kilograms
  | 'ml' // milliliters
  | 'l' // liters
  | 'tsp' // teaspoon
  | 'tbsp' // tablespoon
  | 'cup' // cup
  | 'oz' // ounce
  | 'lb' // pound
  | 'pcs' // pieces
  | 'pack' // package
  | 'can' // can
  | 'bottle' // bottle
  | 'box'; // box

export interface RecipeRecommendation {
  recipe: Recipe;
  score: number;
  reasons: string[];
  matchedPreferences: string[];
  nutritionalFit: number;
  availableIngredients: number;
  totalIngredients: number;
}