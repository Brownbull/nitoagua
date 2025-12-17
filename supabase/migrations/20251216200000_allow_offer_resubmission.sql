-- Migration: Allow offer re-submission after cancellation
-- Story: 8-4 Withdraw Pending Offer (AC: 8.4.5)
--
-- Problem: The UNIQUE constraint (request_id, provider_id) prevents providers
-- from submitting a new offer after cancelling their previous one.
--
-- Solution: Replace the unique constraint with a partial unique index that
-- only enforces uniqueness for active offers. This preserves offer history
-- while allowing re-submission.

-- Step 1: Drop the existing unique constraint
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_request_id_provider_id_key;

-- Step 2: Create partial unique index for active offers only
-- This allows multiple cancelled/expired offers but only one active offer per request per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_unique_active_per_request_provider
  ON offers(request_id, provider_id)
  WHERE status = 'active';

COMMENT ON INDEX idx_offers_unique_active_per_request_provider IS
  'Ensures only one active offer per provider per request, but allows re-submission after cancellation';
