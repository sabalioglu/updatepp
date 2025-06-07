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
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
}

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