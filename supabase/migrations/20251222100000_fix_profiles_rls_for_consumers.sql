-- Migration: Allow consumers to view supplier profiles for their requests
-- Story: 11-2 CHAIN-1 Production Testing
-- Issue: Consumer can't view request status page because profiles RLS blocks
--        the join to fetch supplier info (name, phone)
--
-- Root Cause: profiles table only has "Users can read own profile" policy
--
-- Solution: Use a SECURITY DEFINER function to avoid circular dependency.
-- The water_requests RLS policies reference profiles, so a direct policy
-- on profiles that references water_requests would cause infinite recursion.
--
-- The SECURITY DEFINER function executes with postgres privileges, bypassing
-- RLS checks on the tables it queries internally.

-- Create a SECURITY DEFINER function to check if user can view a profile
CREATE OR REPLACE FUNCTION can_view_supplier_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is viewing their own profile
    SELECT 1 WHERE profile_id = auth.uid()
  )
  OR EXISTS (
    -- User is a consumer with a request assigned to this supplier
    SELECT 1 FROM water_requests wr
    WHERE wr.supplier_id = profile_id
    AND wr.consumer_id = auth.uid()
  )
  OR EXISTS (
    -- User is a consumer with an offer from this provider
    SELECT 1 FROM offers o
    JOIN water_requests wr ON wr.id = o.request_id
    WHERE o.provider_id = profile_id
    AND wr.consumer_id = auth.uid()
  )
$$;

-- Create policy using the SECURITY DEFINER function
-- This replaces the original "Users can read own profile" policy by also
-- allowing access to supplier profiles for consumers' requests
CREATE POLICY "Users can view profiles they have access to"
ON profiles
FOR SELECT
USING (can_view_supplier_profile(id));
