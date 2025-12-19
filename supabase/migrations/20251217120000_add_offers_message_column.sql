-- Migration: Add message column to offers table
-- Story: Testing-1 - E2E Testing Reliability Improvements
-- Problem: TypeScript types expect offers.message but column doesn't exist (42703 error)

-- Add message column for providers to include optional notes with their offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS message TEXT;

COMMENT ON COLUMN offers.message IS 'Optional message from provider about the offer (e.g., delivery notes, special instructions)';
