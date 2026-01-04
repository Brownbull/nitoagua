-- =============================================================================
-- FULL CLEANUP - Manual Testing Database Reset
-- =============================================================================
--
-- Purpose: Clear all transactional data before a manual testing session
-- Keeps: User profiles, admin settings, comunas, service areas
-- Clears: Requests, offers, notifications, disputes, ratings, commissions
--
-- Run this before starting a new round of multi-device testing.
-- =============================================================================

-- 1. Delete ratings (references requests)
DELETE FROM ratings;

-- 2. Delete disputes (references requests)
DELETE FROM disputes;

-- 3. Delete commission_ledger (references requests)
DELETE FROM commission_ledger;

-- 4. Delete offers (references requests)
DELETE FROM offers;

-- 5. Delete notifications
DELETE FROM notifications;

-- 6. Delete withdrawal_requests
DELETE FROM withdrawal_requests;

-- 7. Delete water_requests (main table)
DELETE FROM water_requests;

-- 8. Reset provider rating stats
UPDATE profiles
SET average_rating = NULL, rating_count = 0
WHERE role = 'supplier';

-- =============================================================================
-- VERIFICATION - Confirm cleanup was successful
-- =============================================================================

SELECT
  'water_requests' as table_name, COUNT(*) as count FROM water_requests
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'commission_ledger', COUNT(*) FROM commission_ledger
UNION ALL
SELECT 'withdrawal_requests', COUNT(*) FROM withdrawal_requests;

-- Expected output: All counts should be 0
