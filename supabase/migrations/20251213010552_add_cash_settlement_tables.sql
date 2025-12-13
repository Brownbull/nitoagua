-- Migration: Add Cash Settlement Tables
-- Story: 6-5 Cash Settlement Tracking
-- Date: 2025-12-13

-- ============================================================================
-- COMMISSION LEDGER TABLE
-- Append-only ledger for tracking commission entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES water_requests(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('commission_owed', 'commission_paid', 'adjustment')),
  amount INTEGER NOT NULL, -- Amount in CLP (positive for owed, positive for paid/adjustment)
  description TEXT,
  bank_reference TEXT, -- Bank reference for payments
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who recorded payment
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient provider balance queries
CREATE INDEX IF NOT EXISTS idx_commission_ledger_provider_id ON commission_ledger(provider_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_type ON commission_ledger(type);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_created_at ON commission_ledger(created_at);

-- ============================================================================
-- WITHDRAWAL REQUESTS TABLE
-- Provider payment/withdrawal requests with receipt upload
-- ============================================================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Requested amount in CLP
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  receipt_path TEXT, -- Storage path for receipt image
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who processed
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  bank_reference TEXT, -- Bank reference from admin confirmation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_provider_id ON withdrawal_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on commission_ledger
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;

-- Providers can view their own commission entries
CREATE POLICY "Providers can view own commission entries"
  ON commission_ledger FOR SELECT
  USING (provider_id = auth.uid());

-- Admins (via service role) can insert/update - handled by admin client bypassing RLS

-- Enable RLS on withdrawal_requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Providers can view their own withdrawal requests
CREATE POLICY "Providers can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  USING (provider_id = auth.uid());

-- Providers can insert their own withdrawal requests
CREATE POLICY "Providers can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (provider_id = auth.uid());

-- Admins (via service role) can update - handled by admin client bypassing RLS

-- ============================================================================
-- STORAGE BUCKET FOR RECEIPTS (if not exists)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Providers can upload receipts
CREATE POLICY "Providers can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated'
  );

-- Storage policy: Admins and providers can view receipts
CREATE POLICY "Authenticated users can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');
