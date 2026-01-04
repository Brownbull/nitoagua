-- Migration: Add Commission Receipts Storage Bucket
-- Story: 12.7-12 Commission Payment Screenshot
-- Date: 2026-01-03
--
-- FIXES: BUG-012 - Storage bucket name mismatch
-- The code references 'commission-receipts' but an earlier migration
-- created a bucket named 'receipts'. This migration creates the correct bucket.

-- ============================================================================
-- STORAGE BUCKET FOR COMMISSION RECEIPTS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'commission-receipts',
  'commission-receipts',
  false,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES FOR COMMISSION RECEIPTS
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Providers can upload commission receipts" ON storage.objects;
DROP POLICY IF EXISTS "Providers can view own commission receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all commission receipts" ON storage.objects;

-- Policy: Providers can upload receipts to their own folder
-- Path format: {provider_id}/{timestamp}-receipt.{ext}
CREATE POLICY "Providers can upload commission receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'commission-receipts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Providers can view their own receipts
CREATE POLICY "Providers can view own commission receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'commission-receipts' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Admins can view all receipts (via admin_allowed_emails check)
-- Note: Admins typically use adminClient which bypasses RLS,
-- but this provides additional access if needed via regular client
CREATE POLICY "Admins can view all commission receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'commission-receipts' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_allowed_emails
      WHERE email = auth.jwt()->>'email'
    )
  );
