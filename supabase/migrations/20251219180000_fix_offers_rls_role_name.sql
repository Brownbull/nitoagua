-- Migration: Fix offers RLS policy role name
-- Issue: Policy was checking for role = 'provider' but profiles use role = 'supplier'
--
-- This caused "No tienes permiso para crear ofertas" error when verified providers
-- tried to create offers.

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Providers can create offers" ON offers;

-- Recreate with correct role name ('supplier' instead of 'provider')
CREATE POLICY "Providers can create offers" ON offers
  FOR INSERT TO authenticated
  WITH CHECK (
    provider_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'supplier'
        AND p.verification_status = 'approved'
    )
  );

COMMENT ON POLICY "Providers can create offers" ON offers IS
  'Verified suppliers can create offers. Uses role = supplier to match profiles table convention.';
