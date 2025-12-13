-- Migration: add_provider_directory_fields
-- Story: 6-4 Provider Directory
-- Purpose: Add columns for provider suspension/ban and commission override

-- Add suspended and banned to verification_status check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'more_info_needed'::text, 'suspended'::text, 'banned'::text]));

-- Add commission_override column (NULL means use default from admin_settings)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_override numeric(5,2) DEFAULT NULL;

-- Add suspension_reason column for tracking why a provider was suspended
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason text DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.commission_override IS 'Custom commission rate for this provider. NULL means use default from admin_settings.';
COMMENT ON COLUMN profiles.suspension_reason IS 'Reason for suspension, set by admin when suspending a provider.';
