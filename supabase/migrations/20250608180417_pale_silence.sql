/*
  # Create pantry items table

  1. New Tables
    - `pantry_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `category` (text)
      - `quantity` (numeric)
      - `unit` (text)
      - `purchase_date` (date)
      - `expiry_date` (date, nullable)
      - `notes` (text)
      - `image` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on pantry_items table
    - Add policies for authenticated users to manage their own pantry items
*/

-- Create pantry_items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'pcs',
  purchase_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  notes text DEFAULT '',
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create policies for pantry_items
CREATE POLICY "Users can view own pantry items"
  ON pantry_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pantry items"
  ON pantry_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry items"
  ON pantry_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry items"
  ON pantry_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_category ON pantry_items(category);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry_date ON pantry_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_pantry_items_name ON pantry_items(name);

-- Create trigger for updated_at
CREATE TRIGGER update_pantry_items_updated_at 
  BEFORE UPDATE ON pantry_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();