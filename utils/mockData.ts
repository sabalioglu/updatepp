import { PantryItem, Recipe, MealPlan, ShoppingListItem } from '@/types';
import { addDays, subDays, format } from 'date-fns';

// Helper to generate dates relative to today
const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

// Mock pantry data
export const mockPantryItems: PantryItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'l',
    purchaseDate: formatDate(subDays(today, 2)),
    expiryDate: formatDate(addDays(today, 5)),
    notes: 'Whole milk',
    image: 'https://images.pexels.com/photos/5946422/pexels-photo-5946422.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '2',
    name: 'Eggs',
    category: 'dairy',
    quantity: 12,
    unit: 'pcs',
    purchaseDate: formatDate(subDays(today, 4)),
    expiryDate: formatDate(addDays(today, 14)),
    notes: 'Free range',
    image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '3',
    name: 'Chicken Breast',
    category: 'meat',
    quantity: 500,
    unit: 'g',
    purchaseDate: formatDate(subDays(today, 1)),
    expiryDate: formatDate(addDays(today, 2)),
    notes: 'Organic, free range',
    image: 'https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '4',
    name: 'Pasta',
    category: 'grains',
    quantity: 500,
    unit: 'g',
    purchaseDate: formatDate(subDays(today, 30)),
    expiryDate: formatDate(addDays(today, 365)),
    notes: 'Spaghetti',
    image: 'https://images.pexels.com/photos/128865/pexels-photo-128865.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '5',
    name: 'Tomatoes',
    category: 'vegetables',
    quantity: 6,
    unit: 'pcs',
    purchaseDate: formatDate(subDays(today, 3)),
    expiryDate: formatDate(addDays(today, 4)),
    notes: 'Fresh, ripe',
    image: 'https://images.pexels.com/photos/53588/tomatoes-vegetables-food-frisch-53588.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '6',
    name: 'Canned Beans',
    category: 'canned',
    quantity: 2,
    unit: 'can',
    purchaseDate: formatDate(subDays(today, 60)),
    expiryDate: formatDate(addDays(today, 500)),
    notes: 'Black beans',
    image: 'https://images.pexels.com/photos/8469561/pexels-photo-8469561.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: '7',
    name: 'Bread',
    category: 'grains',
    quantity: 1,
    unit: 'pack',
    purchaseDate: formatDate(subDays(today, 1)),
    expiryDate: formatDate(addDays(today, 3)),
    notes: 'Whole grain',
    image: 'https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

// Mock recipe data
export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish with creamy egg sauce, bacon and cheese.',
    ingredients: [
      { id: '1', name: 'Spaghetti', quantity: 200, unit: 'g', optional: false },
      { id: '2', name: 'Bacon', quantity: 100, unit: 'g', optional: false },
      { id: '3', name: 'Eggs', quantity: 2, unit: 'pcs', optional: false },
      { id: '4', name: 'Parmesan', quantity: 50, unit: 'g', optional: false },
      { id: '5', name: 'Black Pepper', quantity: 1, unit: 'tsp', optional: false },
    ],
    instructions: [
      'Cook pasta according to package instructions.',
      'In a pan, cook bacon until crispy.',
      'In a bowl, mix eggs and grated cheese.',
      'Drain pasta and immediately add to the pan with bacon.',
      'Remove from heat and add egg mixture, stirring quickly.',
      'Season with black pepper and serve immediately.'
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['pasta', 'italian', 'quick', 'eggs'],
    favorite: true,
  },
  {
    id: '2',
    name: 'Chicken Stir-fry',
    description: 'A quick and healthy stir fry with chicken and vegetables.',
    ingredients: [
      { id: '1', name: 'Chicken Breast', quantity: 300, unit: 'g', optional: false },
      { id: '2', name: 'Broccoli', quantity: 1, unit: 'pcs', optional: false },
      { id: '3', name: 'Carrots', quantity: 2, unit: 'pcs', optional: false },
      { id: '4', name: 'Soy Sauce', quantity: 2, unit: 'tbsp', optional: false },
      { id: '5', name: 'Garlic', quantity: 2, unit: 'pcs', optional: false },
      { id: '6', name: 'Rice', quantity: 200, unit: 'g', optional: true },
    ],
    instructions: [
      'Slice chicken into thin strips.',
      'Chop vegetables into bite-sized pieces.',
      'Heat oil in a wok or large frying pan.',
      'Stir-fry chicken until cooked through.',
      'Add vegetables and stir-fry for 3-4 minutes.',
      'Add soy sauce and garlic, cook for another minute.',
      'Serve over cooked rice if desired.'
    ],
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    image: 'https://images.pexels.com/photos/262945/pexels-photo-262945.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['chicken', 'asian', 'healthy', 'quick'],
    favorite: false,
  },
  {
    id: '3',
    name: 'Tomato and Egg Breakfast',
    description: 'Simple and nutritious breakfast using pantry staples.',
    ingredients: [
      { id: '1', name: 'Eggs', quantity: 3, unit: 'pcs', optional: false },
      { id: '2', name: 'Tomatoes', quantity: 2, unit: 'pcs', optional: false },
      { id: '3', name: 'Salt', quantity: 1, unit: 'tsp', optional: false },
      { id: '4', name: 'Black Pepper', quantity: 1, unit: 'tsp', optional: false },
      { id: '5', name: 'Bread', quantity: 2, unit: 'pcs', optional: true },
    ],
    instructions: [
      'Dice tomatoes into small cubes.',
      'Beat eggs in a bowl with salt and pepper.',
      'Heat oil in a non-stick pan over medium heat.',
      'Add tomatoes and cook until soft, about 2 minutes.',
      'Pour in beaten eggs and stir gently until set but still moist.',
      'Serve hot with toast if desired.'
    ],
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    image: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['breakfast', 'vegetarian', 'quick', 'eggs'],
    favorite: true,
  },
];

// Mock meal plan data
export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    date: formatDate(today),
    meals: [
      {
        id: '1',
        type: 'breakfast',
        recipeId: '3',
        recipeName: 'Tomato and Egg Breakfast',
        notes: '',
      },
      {
        id: '2',
        type: 'lunch',
        recipeId: null,
        recipeName: 'Leftover pasta',
        notes: 'From yesterday',
      },
      {
        id: '3',
        type: 'dinner',
        recipeId: '2',
        recipeName: 'Chicken Stir-fry',
        notes: '',
      },
    ],
  },
  {
    id: '2',
    date: formatDate(addDays(today, 1)),
    meals: [
      {
        id: '1',
        type: 'breakfast',
        recipeId: null,
        recipeName: 'Cereal with milk',
        notes: '',
      },
      {
        id: '2',
        type: 'lunch',
        recipeId: null,
        recipeName: 'Sandwich',
        notes: '',
      },
      {
        id: '3',
        type: 'dinner',
        recipeId: '1',
        recipeName: 'Spaghetti Carbonara',
        notes: '',
      },
    ],
  },
];

// Mock shopping list data
export const mockShoppingList: ShoppingListItem[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: 1,
    unit: 'l',
    category: 'dairy',
    checked: false,
    source: 'low-stock',
  },
  {
    id: '2',
    name: 'Chicken Breast',
    quantity: 500,
    unit: 'g',
    category: 'meat',
    checked: false,
    source: 'recipe',
    recipeId: '2',
  },
  {
    id: '3',
    name: 'Broccoli',
    quantity: 1,
    unit: 'pcs',
    category: 'vegetables',
    checked: true,
    source: 'recipe',
    recipeId: '2',
  },
  {
    id: '4',
    name: 'Pasta Sauce',
    quantity: 1,
    unit: 'bottle',
    category: 'condiments',
    checked: false,
    source: 'manual',
  },
  {
    id: '5',
    name: 'Bread',
    quantity: 1,
    unit: 'pack',
    category: 'grains',
    checked: false,
    source: 'low-stock',
  },
];