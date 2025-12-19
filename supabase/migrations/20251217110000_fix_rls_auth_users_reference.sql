-- Migration: Fix RLS policies that incorrectly reference auth.users
-- Problem: Policies using `SELECT email FROM auth.users` fail with 42501 (permission denied)
-- Solution: Use auth.jwt()->>'email' which extracts email from JWT token without DB access
-- Story: Testing-1 - E2E Testing Reliability Improvements

-- ============================================
-- FIX: notifications table RLS policy
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all notifications" ON notifications;

-- Recreate with correct JWT-based email check
CREATE POLICY "Admins can read all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowed_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- FIX: provider_verification_queue table RLS policy (if exists)
-- ============================================

DO $$
BEGIN
  -- Check if the table and policy exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'provider_verification_queue'
  ) THEN
    -- Drop problematic admin policy if it exists
    DROP POLICY IF EXISTS "Admins can view verification queue" ON provider_verification_queue;
    DROP POLICY IF EXISTS "Admins can update verification queue" ON provider_verification_queue;

    -- Recreate with correct JWT-based email check
    CREATE POLICY "Admins can view verification queue"
      ON provider_verification_queue FOR SELECT
      TO authenticated
      USING (
        provider_id = auth.uid() OR
        EXISTS (SELECT 1 FROM admin_allowed_emails WHERE email = auth.jwt()->>'email')
      );

    CREATE POLICY "Admins can update verification queue"
      ON provider_verification_queue FOR UPDATE
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM admin_allowed_emails WHERE email = auth.jwt()->>'email')
      );
  END IF;
END $$;

-- ============================================
-- FIX: offers table RLS policy
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'offers'
  ) THEN
    -- Drop problematic admin policy if it exists
    DROP POLICY IF EXISTS "Admins can read all offers" ON offers;

    -- Recreate with correct JWT-based email check
    CREATE POLICY "Admins can read all offers"
      ON offers FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admin_allowed_emails
          WHERE email = auth.jwt()->>'email'
        )
      );
  END IF;
END $$;

-- ============================================
-- FIX: provider_documents table RLS policy
-- ============================================

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all documents" ON provider_documents;

-- Recreate with correct JWT-based email check
CREATE POLICY "Admins can view all documents"
  ON provider_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowed_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

COMMENT ON TABLE notifications IS 'In-app notifications - RLS fixed to use auth.jwt() instead of auth.users';
