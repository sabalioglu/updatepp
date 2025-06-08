import { PantryItem, Recipe, MealPlan, ShoppingListItem } from '@/types';
import { addDays, subDays, format } from 'date-fns';

// Helper to generate dates relative to today
const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

// Empty pantry data - user must add items to get suggestions
export const mockPantryItems: PantryItem[] = [];

// Empty recipe data - recipes will be suggested based on pantry items
export const mockRecipes: Recipe[] = [];

// Mock meal plan data
export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    date: formatDate(today),
    meals: [],
  },
  {
    id: '2',
    date: formatDate(addDays(today, 1)),
    meals: [],
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
    name: 'Bread',
    quantity: 1,
    unit: 'pack',
    category: 'grains',
    checked: false,
    source: 'manual',
  },
];