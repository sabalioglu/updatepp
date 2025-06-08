/*
  # Create shared database functions

  1. Functions
    - `update_updated_at_column()` - Automatically updates the updated_at timestamp

  This migration creates shared functions that will be used by other migrations.
  It must run before any other migrations that use these functions.
*/

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';