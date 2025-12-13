-- ============================================
-- V2 Provider Verification Schema
-- Epic 6 - Story 6.3: Provider Verification Queue
-- ============================================

-- Add verification_status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT
  DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'more_info_needed'));

-- Add email column to profiles (for provider contact)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add internal_notes for admin notes on applications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add rejection_reason for rejected applications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add bank info columns for providers
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Create provider_documents table
CREATE TABLE IF NOT EXISTS provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cedula', 'licencia', 'permiso_sanitario', 'certificacion', 'vehiculo')),
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id)
);

-- Enable RLS on provider_documents
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own documents
CREATE POLICY "Providers can manage own documents"
ON provider_documents FOR ALL
USING (provider_id = auth.uid());

-- Admins can view all documents (using admin role check)
CREATE POLICY "Admins can view all documents"
ON provider_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_allowed_emails
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Create index for faster document lookups
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider ON provider_documents(provider_id);

-- Create index for verification queue queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status, created_at)
  WHERE role = 'supplier' OR role = 'provider';

-- Add comment
COMMENT ON COLUMN profiles.verification_status IS 'Provider verification status: pending, approved, rejected, more_info_needed';
COMMENT ON TABLE provider_documents IS 'Documents uploaded by providers for verification';
