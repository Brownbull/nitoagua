-- Add rating columns to profiles table for provider ratings
-- Story 12.8-5: Admin Providers UX & Ratings

-- Add columns for storing provider rating aggregates
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Create index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_profiles_average_rating ON profiles(average_rating DESC NULLS LAST)
WHERE role IN ('supplier', 'provider');

-- Add comment for documentation
COMMENT ON COLUMN profiles.average_rating IS 'Average rating from consumer reviews (1-5 scale)';
COMMENT ON COLUMN profiles.rating_count IS 'Total number of ratings received';
