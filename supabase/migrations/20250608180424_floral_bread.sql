/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `avatar` (text, nullable)
      - `dietary_preferences` (text array)
      - `allergies` (text array)
      - `intolerances` (text array)
      - `dietary_restrictions` (text array)
      - `cuisine_preferences` (text array)
      - `cooking_skill_level` (text)
      - `preferred_meal_types` (text array)
      - `weekly_meal_frequency` (integer)
      - `serving_size_preference` (integer)
      - `disliked_ingredients` (text array)
      - `health_goals` (text array)
      - `activity_level` (text)
      - `height` (integer) - cm
      - `weight` (integer) - kg
      - `target_weight` (integer) - kg
      - `age` (integer)
      - `gender` (text)
      - `health_conditions` (text array)
      - `daily_caloric_needs` (integer)
      - `onboarding_completed` (boolean)
      - `privacy_settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on user_profiles table
    - Add policies for authenticated users to manage their own profile
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  email text DEFAULT '',
  avatar text,
  dietary_preferences text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  intolerances text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  cuisine_preferences text[] DEFAULT '{}',
  cooking_skill_level text DEFAULT 'beginner' CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_meal_types text[] DEFAULT '{}',
  weekly_meal_frequency integer DEFAULT 7,
  serving_size_preference integer DEFAULT 2,
  disliked_ingredients text[] DEFAULT '{}',
  health_goals text[] DEFAULT '{}',
  activity_level text CHECK (activity_level IN ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active')),
  height integer, -- cm
  weight integer, -- kg
  target_weight integer, -- kg
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  health_conditions text[] DEFAULT '{}',
  daily_caloric_needs integer,
  onboarding_completed boolean DEFAULT false,
  privacy_settings jsonb DEFAULT '{"shareHealthData": false, "sharePreferences": true, "allowAnalytics": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dietary_preferences ON user_profiles USING GIN(dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cuisine_preferences ON user_profiles USING GIN(cuisine_preferences);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();