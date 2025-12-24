-- Migration: Add request_cancelled status to offers table
-- Story: 11A-2 C11 Provider Cancellation Notification
-- Purpose: Allow marking offers as cancelled when consumer cancels request

-- Drop existing constraint and add new one with request_cancelled status
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;

ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('active', 'accepted', 'expired', 'cancelled', 'request_filled', 'request_cancelled'));

-- Update status comment
COMMENT ON COLUMN offers.status IS 'active = awaiting consumer decision, accepted = chosen by consumer, expired = past expires_at, cancelled = provider withdrew, request_filled = another offer was accepted, request_cancelled = consumer cancelled the request';
