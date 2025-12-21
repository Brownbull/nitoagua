-- Migration: Add in_transit_at timestamp column to water_requests
-- Story: 10-5 Request Status with Offer Context
-- AC10.5.1: Timeline should show timestamps for each status step

-- Add in_transit_at column to water_requests if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'water_requests'
    AND column_name = 'in_transit_at'
  ) THEN
    ALTER TABLE water_requests ADD COLUMN in_transit_at TIMESTAMPTZ;
    COMMENT ON COLUMN water_requests.in_transit_at IS 'Timestamp when provider marked request as in_transit (on the way to deliver)';
  END IF;
END $$;

-- Create index for query performance on status timeline queries
CREATE INDEX IF NOT EXISTS idx_water_requests_in_transit_at
  ON water_requests(in_transit_at)
  WHERE in_transit_at IS NOT NULL;
