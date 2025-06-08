/*
  # Create shopping list table

  1. New Tables
    - `shopping_list_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `quantity` (numeric)
      - `unit` (text)
      - `category` (text)
      - `checked` (boolean)
      - `source` (text) - recipe, manual, low-stock
      - `recipe_id` (uuid, nullable, references recipes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on shopping_list_items table
    - Add policies for authenticated users to manage their own shopping list
*/

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'pcs',
  category text NOT NULL,
  checked boolean DEFAULT false,
  source text DEFAULT 'manual' CHECK (source IN ('recipe', 'manual', 'low-stock')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_list_items
CREATE POLICY "Users can view own shopping list items"
  ON shopping_list_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping list items"
  ON shopping_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping list items"
  ON shopping_list_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping list items"
  ON shopping_list_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user_id ON shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_checked ON shopping_list_items(checked);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_category ON shopping_list_items(category);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_source ON shopping_list_items(source);

-- Create trigger for updated_at
CREATE TRIGGER update_shopping_list_items_updated_at 
  BEFORE UPDATE ON shopping_list_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();