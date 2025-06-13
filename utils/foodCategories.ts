export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Meat & Poultry',
  'Fish & Seafood',
  'Dairy & Eggs',
  'Grains & Cereals',
  'Legumes & Nuts',
  'Herbs & Spices',
  'Condiments & Sauces',
  'Beverages',
  'Snacks',
  'Frozen Foods',
  'Canned Goods',
  'Baking Supplies',
  'Other',
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

export const CATEGORY_COLORS: Record<FoodCategory, string> = {
  'Fruits': '#FF6B6B',
  'Vegetables': '#4ECDC4',
  'Meat & Poultry': '#FF8E53',
  'Fish & Seafood': '#45B7D1',
  'Dairy & Eggs': '#FFA726',
  'Grains & Cereals': '#8D6E63',
  'Legumes & Nuts': '#A1887F',
  'Herbs & Spices': '#66BB6A',
  'Condiments & Sauces': '#AB47BC',
  'Beverages': '#42A5F5',
  'Snacks': '#FFCA28',
  'Frozen Foods': '#26C6DA',
  'Canned Goods': '#78909C',
  'Baking Supplies': '#D4E157',
  'Other': '#BDBDBD',
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  'Fruits': '🍎',
  'Vegetables': '🥕',
  'Meat & Poultry': '🥩',
  'Fish & Seafood': '🐟',
  'Dairy & Eggs': '🥛',
  'Grains & Cereals': '🌾',
  'Legumes & Nuts': '🥜',
  'Herbs & Spices': '🌿',
  'Condiments & Sauces': '🍯',
  'Beverages': '🥤',
  'Snacks': '🍿',
  'Frozen Foods': '🧊',
  'Canned Goods': '🥫',
  'Baking Supplies': '🧁',
  'Other': '📦',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as FoodCategory] || CATEGORY_COLORS.Other;
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category as FoodCategory] || CATEGORY_ICONS.Other;
}