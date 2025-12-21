-- Migration to add comuna_id to profiles for consumer location
-- Allows consumers to save their preferred comuna/city for faster request filling

-- Add comuna_id column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'comuna_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN comuna_id TEXT;
    COMMENT ON COLUMN profiles.comuna_id IS 'Consumer preferred comuna for delivery location';
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_comuna_id_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_comuna_id_fkey
    FOREIGN KEY (comuna_id) REFERENCES comunas(id);
  END IF;
END $$;

-- Create index for query performance
CREATE INDEX IF NOT EXISTS idx_profiles_comuna_id ON profiles(comuna_id);
