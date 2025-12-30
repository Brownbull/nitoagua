-- Migration: Optimize RLS Policy Performance
-- Story: 12.5-3 Data Fetching Optimization
-- Date: 2025-12-29
--
-- This migration addresses the #1 performance issue identified in Story 12.5-1:
-- RLS policies using auth.uid() instead of (select auth.uid())
--
-- When using auth.uid() directly, PostgreSQL re-evaluates the function for each row.
-- Using (select auth.uid()) caches the result for the entire query.
-- Expected improvement: 50-80% reduction in RLS evaluation time.

-- ============================================================================
-- PART 1: Optimize RLS Policies
-- ============================================================================

-- Drop and recreate all policies that use auth.uid() directly
-- to use (select auth.uid()) instead for better performance

-- -----------------------------------------------------------------------------
-- Table: commission_ledger
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Providers can view own commission entries" ON commission_ledger;
CREATE POLICY "Providers can view own commission entries" ON commission_ledger
    FOR SELECT
    USING (provider_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Table: notifications
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Table: offers
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Consumers can read offers for their requests" ON offers;
CREATE POLICY "Consumers can read offers for their requests" ON offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM water_requests wr
            WHERE wr.id = offers.request_id
            AND (wr.consumer_id = (select auth.uid()) OR wr.supplier_id = (select auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Providers can create offers" ON offers;
CREATE POLICY "Providers can create offers" ON offers
    FOR INSERT
    WITH CHECK (
        provider_id = (select auth.uid())
        AND EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = (select auth.uid())
            AND p.role = 'supplier'
            AND p.verification_status = 'approved'
        )
    );

DROP POLICY IF EXISTS "Providers can read own offers" ON offers;
CREATE POLICY "Providers can read own offers" ON offers
    FOR SELECT
    USING (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can update own offers" ON offers;
CREATE POLICY "Providers can update own offers" ON offers
    FOR UPDATE
    USING (provider_id = (select auth.uid()))
    WITH CHECK (provider_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Table: profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- Table: provider_documents
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Providers can delete own documents" ON provider_documents;
CREATE POLICY "Providers can delete own documents" ON provider_documents
    FOR DELETE
    USING (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can insert own documents" ON provider_documents;
CREATE POLICY "Providers can insert own documents" ON provider_documents
    FOR INSERT
    WITH CHECK (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can manage own documents" ON provider_documents;
CREATE POLICY "Providers can manage own documents" ON provider_documents
    FOR ALL
    USING (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can update own documents" ON provider_documents;
CREATE POLICY "Providers can update own documents" ON provider_documents
    FOR UPDATE
    USING (provider_id = (select auth.uid()))
    WITH CHECK (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can view own documents" ON provider_documents;
CREATE POLICY "Providers can view own documents" ON provider_documents
    FOR SELECT
    USING (provider_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Table: provider_service_areas
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Providers can delete own service areas" ON provider_service_areas;
CREATE POLICY "Providers can delete own service areas" ON provider_service_areas
    FOR DELETE
    USING (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can insert own service areas" ON provider_service_areas;
CREATE POLICY "Providers can insert own service areas" ON provider_service_areas
    FOR INSERT
    WITH CHECK (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can view own service areas" ON provider_service_areas;
CREATE POLICY "Providers can view own service areas" ON provider_service_areas
    FOR SELECT
    USING (provider_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Table: push_subscriptions
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
    FOR ALL
    USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Table: water_requests
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Consumers can cancel own pending requests" ON water_requests;
CREATE POLICY "Consumers can cancel own pending requests" ON water_requests
    FOR UPDATE
    USING (consumer_id = (select auth.uid()) AND status = 'pending')
    WITH CHECK (status = 'cancelled');

DROP POLICY IF EXISTS "Providers can view pending requests in service areas" ON water_requests;
CREATE POLICY "Providers can view pending requests in service areas" ON water_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE p.id = (select auth.uid())
            AND p.role = 'supplier'
            AND p.verification_status = 'approved'
        )
        AND status = 'pending'
        AND (
            comuna_id IS NULL
            OR comuna_id IN (
                SELECT psa.comuna_id
                FROM provider_service_areas psa
                WHERE psa.provider_id = (select auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Suppliers can update assigned requests" ON water_requests;
CREATE POLICY "Suppliers can update assigned requests" ON water_requests
    FOR UPDATE
    USING (
        supplier_id = (select auth.uid())
        OR (
            status = 'pending'
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE profiles.id = (select auth.uid())
                AND profiles.role = 'supplier'
            )
        )
    );

DROP POLICY IF EXISTS "Users can read relevant requests" ON water_requests;
CREATE POLICY "Users can read relevant requests" ON water_requests
    FOR SELECT
    USING (
        (
            status = 'pending'
            AND EXISTS (
                SELECT 1
                FROM profiles
                WHERE profiles.id = (select auth.uid())
                AND profiles.role = 'supplier'
            )
        )
        OR consumer_id = (select auth.uid())
        OR supplier_id = (select auth.uid())
    );

-- -----------------------------------------------------------------------------
-- Table: withdrawal_requests
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Providers can create withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Providers can create withdrawal requests" ON withdrawal_requests
    FOR INSERT
    WITH CHECK (provider_id = (select auth.uid()));

DROP POLICY IF EXISTS "Providers can view own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Providers can view own withdrawal requests" ON withdrawal_requests
    FOR SELECT
    USING (provider_id = (select auth.uid()));


-- ============================================================================
-- PART 1B: Optimize Admin RLS Policies (auth.jwt() patterns)
-- ============================================================================
-- These policies use auth.jwt() for admin checks. The same caching optimization
-- applies: (select auth.jwt()) caches the JWT for the entire query.

-- -----------------------------------------------------------------------------
-- Table: admin_allowed_emails
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated users to check their own email" ON admin_allowed_emails;
CREATE POLICY "Allow authenticated users to check their own email" ON admin_allowed_emails
    FOR SELECT
    USING (((select auth.jwt()) ->> 'email'::text) = email);

-- -----------------------------------------------------------------------------
-- Table: admin_settings
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow admins to read settings" ON admin_settings;
CREATE POLICY "Allow admins to read settings" ON admin_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM admin_allowed_emails
            WHERE admin_allowed_emails.email = ((select auth.jwt()) ->> 'email'::text)
        )
    );

-- -----------------------------------------------------------------------------
-- Table: notifications (admin policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can read all notifications" ON notifications;
CREATE POLICY "Admins can read all notifications" ON notifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM admin_allowed_emails
            WHERE admin_allowed_emails.email = ((select auth.jwt()) ->> 'email'::text)
        )
    );

-- -----------------------------------------------------------------------------
-- Table: offers (admin policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can read all offers" ON offers;
CREATE POLICY "Admins can read all offers" ON offers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM admin_allowed_emails
            WHERE admin_allowed_emails.email = ((select auth.jwt()) ->> 'email'::text)
        )
    );

-- -----------------------------------------------------------------------------
-- Table: provider_documents (admin policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all documents" ON provider_documents;
CREATE POLICY "Admins can view all documents" ON provider_documents
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM admin_allowed_emails
            WHERE admin_allowed_emails.email = ((select auth.jwt()) ->> 'email'::text)
        )
    );

-- -----------------------------------------------------------------------------
-- Table: provider_service_areas (admin policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all service areas" ON provider_service_areas;
CREATE POLICY "Admins can view all service areas" ON provider_service_areas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM admin_allowed_emails
            WHERE admin_allowed_emails.email = ((select auth.jwt()) ->> 'email'::text)
        )
    );

-- -----------------------------------------------------------------------------
-- Table: push_subscriptions (service role policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON push_subscriptions;
CREATE POLICY "Service role can manage all subscriptions" ON push_subscriptions
    FOR ALL
    USING (((select auth.jwt()) ->> 'role'::text) = 'service_role'::text);


-- ============================================================================
-- PART 2: Add Missing Foreign Key Indexes
-- ============================================================================
-- These indexes speed up JOINs and lookups on foreign key columns

-- admin_settings.updated_by -> profiles.id
CREATE INDEX IF NOT EXISTS idx_admin_settings_updated_by
    ON admin_settings(updated_by);

-- commission_ledger.admin_id -> profiles.id
CREATE INDEX IF NOT EXISTS idx_commission_ledger_admin_id
    ON commission_ledger(admin_id);

-- commission_ledger.request_id -> water_requests.id
CREATE INDEX IF NOT EXISTS idx_commission_ledger_request_id
    ON commission_ledger(request_id);

-- provider_documents.verified_by -> profiles.id
CREATE INDEX IF NOT EXISTS idx_provider_documents_verified_by
    ON provider_documents(verified_by);

-- water_requests.cancelled_by -> profiles.id
CREATE INDEX IF NOT EXISTS idx_water_requests_cancelled_by
    ON water_requests(cancelled_by);

-- withdrawal_requests.processed_by -> profiles.id
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by
    ON withdrawal_requests(processed_by);


-- ============================================================================
-- PART 3: Add Additional Performance Indexes
-- ============================================================================
-- These indexes support common query patterns identified in the baseline audit

-- offers.status - commonly filtered in offer queries
CREATE INDEX IF NOT EXISTS idx_offers_status
    ON offers(status);

-- profiles.role - commonly filtered in RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_role
    ON profiles(role);

-- Composite index for provider requests filtering
CREATE INDEX IF NOT EXISTS idx_water_requests_provider_status
    ON water_requests(supplier_id, status);

-- Composite index for admin orders filtering
CREATE INDEX IF NOT EXISTS idx_water_requests_status_created
    ON water_requests(status, created_at DESC);


-- ============================================================================
-- SUMMARY
-- ============================================================================
-- RLS Policies Optimized: 32 policies across 11 tables
--   - Part 1: 25 user policies using auth.uid()
--   - Part 1B: 7 admin policies using auth.jwt()
-- Missing FK Indexes Added: 6
-- Additional Performance Indexes Added: 4
--
-- Expected Impact:
-- - 50-80% reduction in RLS evaluation time
-- - Admin pages (verification, orders, dashboard) should see significant improvement
-- - Faster JOINs on foreign key lookups
-- - Improved query plans for common filters
