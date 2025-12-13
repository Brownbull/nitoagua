-- Migration: Add offers table for V2 offer system
-- Story: 6-6 Orders Management (needed for offer history display)
-- Note: This table will be fully utilized in Epic 8-9 (Provider Offer System)

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES water_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_window_start TIMESTAMPTZ NOT NULL,
  delivery_window_end TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'accepted', 'expired', 'cancelled', 'request_filled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (request_id, provider_id)
);

-- Add index for efficient expiration queries (used by cron job)
CREATE INDEX IF NOT EXISTS idx_offers_expires_at_active
  ON offers(expires_at)
  WHERE status = 'active';

-- Add index for request lookups
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);

-- Add index for provider lookups
CREATE INDEX IF NOT EXISTS idx_offers_provider_id ON offers(provider_id);

-- RLS Policies for offers table
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Admins can read all offers
CREATE POLICY "Admins can read all offers"
  ON offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_allowed_emails
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Providers can read their own offers
CREATE POLICY "Providers can read own offers"
  ON offers FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

-- Consumers can read offers for their requests
CREATE POLICY "Consumers can read offers for their requests"
  ON offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM water_requests wr
      WHERE wr.id = offers.request_id
      AND (wr.consumer_id = auth.uid() OR wr.supplier_id = auth.uid())
    )
  );

-- Providers can insert offers for pending requests
CREATE POLICY "Providers can create offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'provider'
      AND p.verification_status = 'approved'
    )
  );

-- Providers can update their own offers (e.g., cancel)
CREATE POLICY "Providers can update own offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- Service role can do anything (for cron jobs and admin actions)
CREATE POLICY "Service role full access"
  ON offers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add cancellation_reason column to water_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'water_requests'
    AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE water_requests ADD COLUMN cancellation_reason TEXT;
  END IF;
END $$;

-- Add cancelled_by column to water_requests if not exists (to track who cancelled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'water_requests'
    AND column_name = 'cancelled_by'
  ) THEN
    ALTER TABLE water_requests ADD COLUMN cancelled_by UUID REFERENCES profiles(id);
  END IF;
END $$;

COMMENT ON TABLE offers IS 'Stores provider offers for water delivery requests (V2 Consumer-Choice model)';
COMMENT ON COLUMN offers.status IS 'active = awaiting consumer decision, accepted = chosen by consumer, expired = past expires_at, cancelled = provider withdrew, request_filled = another offer was accepted';
