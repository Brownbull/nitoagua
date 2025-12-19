-- Migration to add comuna_id to water_requests
-- This column enables service area filtering - providers see requests in their configured comunas
-- Story: Testing-1 - Schema sync fix for local Supabase

-- Add comuna_id column to water_requests if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'water_requests'
    AND column_name = 'comuna_id'
  ) THEN
    ALTER TABLE water_requests ADD COLUMN comuna_id TEXT;
    COMMENT ON COLUMN water_requests.comuna_id IS 'Reference to comuna for service area filtering. Allows providers to see requests in their configured areas.';
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'water_requests_comuna_id_fkey'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE water_requests
    ADD CONSTRAINT water_requests_comuna_id_fkey
    FOREIGN KEY (comuna_id) REFERENCES comunas(id);
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_water_requests_comuna_id ON water_requests(comuna_id);
