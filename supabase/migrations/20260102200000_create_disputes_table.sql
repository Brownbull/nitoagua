-- Migration: Create Disputes Table
-- Story: 12.7-5 Consumer Dispute Option
-- Date: 2026-01-02
--
-- This migration creates the disputes table to allow consumers to report
-- issues with completed deliveries (fraud protection).
--
-- Dispute types:
-- - not_delivered: Never received (fraud risk)
-- - wrong_quantity: Received less than ordered
-- - late_delivery: Delivered outside window
-- - quality_issue: Water quality problems
-- - other: Free text issues

-- ============================================================================
-- PART 1: Create disputes table
-- ============================================================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES water_requests(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN (
    'not_delivered',
    'wrong_quantity',
    'late_delivery',
    'quality_issue',
    'other'
  )),
  description TEXT,
  evidence_url TEXT,  -- Supabase Storage path (optional photo evidence)
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'under_review',
    'resolved_consumer',  -- Resolved in consumer's favor
    'resolved_provider',  -- Resolved in provider's favor
    'closed'
  )),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Ensure one dispute per request (consumer can only dispute once)
  UNIQUE(request_id)
);

-- Add comment for table documentation
COMMENT ON TABLE disputes IS 'Consumer disputes for delivered water requests. One dispute per request maximum.';
COMMENT ON COLUMN disputes.dispute_type IS 'Type of dispute: not_delivered, wrong_quantity, late_delivery, quality_issue, other';
COMMENT ON COLUMN disputes.status IS 'Dispute status: open, under_review, resolved_consumer, resolved_provider, closed';
COMMENT ON COLUMN disputes.evidence_url IS 'Optional photo evidence path in Supabase Storage';

-- ============================================================================
-- PART 2: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_disputes_request_id ON disputes(request_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_consumer_id ON disputes(consumer_id);
CREATE INDEX idx_disputes_provider_id ON disputes(provider_id);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);

-- ============================================================================
-- PART 3: Enable RLS and create policies
-- Uses optimized (select auth.uid()) pattern per Atlas Section 4
-- ============================================================================

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Consumers can create disputes for their own delivered requests
CREATE POLICY "Consumers can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    consumer_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM water_requests wr
      WHERE wr.id = disputes.request_id
      AND wr.consumer_id = (select auth.uid())
      AND wr.status = 'delivered'
    )
  );

-- Consumers can view their own disputes
CREATE POLICY "Consumers can view own disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (consumer_id = (select auth.uid()));

-- Providers can view disputes filed against them
CREATE POLICY "Providers can view disputes against them"
  ON disputes FOR SELECT
  TO authenticated
  USING (provider_id = (select auth.uid()));

-- Admins can view all disputes
CREATE POLICY "Admins can view all disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Admins can update disputes (for resolution)
CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================================
-- PART 4: Create updated_at trigger
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update updated_at
CREATE TRIGGER disputes_updated_at_trigger
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_disputes_updated_at();

-- ============================================================================
-- PART 5: Add dispute_window_hours to admin_settings
-- ============================================================================

-- Insert default dispute window setting (48 hours)
-- Consumer can file disputes within this time window after delivery
INSERT INTO admin_settings (key, value, updated_at)
VALUES (
  'dispute_window_hours',
  '48',
  NOW()
)
ON CONFLICT (key) DO NOTHING;
