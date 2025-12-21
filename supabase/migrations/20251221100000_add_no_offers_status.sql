-- Story 10.4: Request Timeout Notification
-- Add 'no_offers' status to water_requests status enum
-- Created: 2025-12-21

-- ============================================
-- STEP 1: Update status CHECK constraint
-- ============================================
-- Drop the existing constraint and add new one with 'no_offers'

ALTER TABLE water_requests
DROP CONSTRAINT IF EXISTS water_requests_status_check;

ALTER TABLE water_requests
ADD CONSTRAINT water_requests_status_check
CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled', 'no_offers'));

-- ============================================
-- STEP 2: Add timed_out_at column
-- ============================================
-- Track when request was marked as timed out

ALTER TABLE water_requests
ADD COLUMN IF NOT EXISTS timed_out_at TIMESTAMPTZ;

-- ============================================
-- STEP 3: Add index for timeout query optimization
-- ============================================
-- Index to optimize the cron job query:
-- SELECT * FROM water_requests WHERE status = 'pending' AND created_at < NOW() - INTERVAL '4 hours'

CREATE INDEX IF NOT EXISTS idx_water_requests_pending_created
ON water_requests(status, created_at)
WHERE status = 'pending';

-- ============================================
-- STEP 4: Update RLS policies for no_offers status
-- ============================================
-- no_offers requests should be visible to the consumer who created them
-- Existing policies already cover this via consumer_id check
-- No new policies needed - consumers can see their own requests regardless of status
