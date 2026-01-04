-- =============================================================================
-- SEED TEST SCENARIO - Optional pre-populated data for manual testing
-- =============================================================================
--
-- Purpose: Create specific scenarios that are tedious to set up manually
-- Use: Run AFTER full-cleanup.sql if you need pre-existing data
--
-- This file is a template - add/modify scenarios as needed for your test round.
-- =============================================================================

-- =============================================================================
-- SCENARIO 1: Provider with existing deliveries and earnings
-- =============================================================================
-- Uncomment to create a provider with delivery history for earnings testing

/*
-- Get supplier ID (adjust name if different)
DO $$
DECLARE
  v_supplier_id UUID;
  v_consumer_id UUID;
  v_request_id UUID;
BEGIN
  -- Get test users
  SELECT id INTO v_supplier_id FROM profiles WHERE name = 'Supplier Test' LIMIT 1;
  SELECT id INTO v_consumer_id FROM profiles WHERE name = 'Consumer Test' LIMIT 1;

  -- Create a delivered request from yesterday
  INSERT INTO water_requests (
    id, consumer_id, address, amount, status, supplier_id,
    delivery_window, created_at, accepted_at, delivered_at, comuna_id, payment_method
  ) VALUES (
    gen_random_uuid(),
    v_consumer_id,
    'Calle Test 123, Villarrica',
    1000,
    'delivered',
    v_supplier_id,
    'Ayer 14:00 - 15:00',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '30 minutes',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
    'villarrica',
    'cash'
  ) RETURNING id INTO v_request_id;

  -- Add commission owed entry
  INSERT INTO commission_ledger (provider_id, request_id, type, amount, description)
  VALUES (v_supplier_id, v_request_id, 'commission_owed', 2250, 'Comisión 15% - 1000L entrega');

  RAISE NOTICE 'Created delivered request with commission for Supplier Test';
END $$;
*/

-- =============================================================================
-- SCENARIO 2: Active request waiting for offers
-- =============================================================================
-- Uncomment to create a pending request for offer testing

/*
DO $$
DECLARE
  v_consumer_id UUID;
BEGIN
  SELECT id INTO v_consumer_id FROM profiles WHERE name = 'Consumer Test' LIMIT 1;

  INSERT INTO water_requests (
    consumer_id, address, amount, status, created_at, comuna_id, payment_method, is_urgent
  ) VALUES (
    v_consumer_id,
    'Av. Principal 456, Villarrica',
    5000,
    'pending',
    NOW() - INTERVAL '10 minutes',
    'villarrica',
    'transfer',
    false
  );

  RAISE NOTICE 'Created pending request for Consumer Test';
END $$;
*/

-- =============================================================================
-- SCENARIO 3: Request with multiple competing offers
-- =============================================================================
-- Uncomment to test offer comparison UI

/*
DO $$
DECLARE
  v_consumer_id UUID;
  v_supplier1_id UUID;
  v_supplier2_id UUID;
  v_request_id UUID;
BEGIN
  SELECT id INTO v_consumer_id FROM profiles WHERE name = 'Consumer Test' LIMIT 1;
  SELECT id INTO v_supplier1_id FROM profiles WHERE name = 'Supplier Test' LIMIT 1;
  SELECT id INTO v_supplier2_id FROM profiles WHERE name LIKE '%Supplier%' AND id != v_supplier1_id LIMIT 1;

  -- Create pending request
  INSERT INTO water_requests (
    id, consumer_id, address, amount, status, created_at, comuna_id, payment_method
  ) VALUES (
    gen_random_uuid(),
    v_consumer_id,
    'Calle Competencia 789, Villarrica',
    1000,
    'pending',
    NOW() - INTERVAL '5 minutes',
    'villarrica',
    'cash'
  ) RETURNING id INTO v_request_id;

  -- Offer from supplier 1 (more expensive, sooner)
  INSERT INTO offers (request_id, provider_id, delivery_window_start, delivery_window_end, expires_at, status)
  VALUES (
    v_request_id,
    v_supplier1_id,
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '30 minutes',
    'active'
  );

  -- Offer from supplier 2 (if exists)
  IF v_supplier2_id IS NOT NULL THEN
    INSERT INTO offers (request_id, provider_id, delivery_window_start, delivery_window_end, expires_at, status)
    VALUES (
      v_request_id,
      v_supplier2_id,
      NOW() + INTERVAL '2 hours',
      NOW() + INTERVAL '3 hours',
      NOW() + INTERVAL '30 minutes',
      'active'
    );
  END IF;

  RAISE NOTICE 'Created request with competing offers';
END $$;
*/

-- =============================================================================
-- SCENARIO 4: Dispute for admin resolution testing
-- =============================================================================
-- Uncomment to create a dispute for admin panel testing

/*
DO $$
DECLARE
  v_consumer_id UUID;
  v_supplier_id UUID;
  v_request_id UUID;
BEGIN
  SELECT id INTO v_consumer_id FROM profiles WHERE name = 'Consumer Test' LIMIT 1;
  SELECT id INTO v_supplier_id FROM profiles WHERE name = 'Supplier Test' LIMIT 1;

  -- Create delivered request
  INSERT INTO water_requests (
    id, consumer_id, address, amount, status, supplier_id,
    created_at, accepted_at, delivered_at, comuna_id, payment_method
  ) VALUES (
    gen_random_uuid(),
    v_consumer_id,
    'Calle Disputa 321, Villarrica',
    1000,
    'delivered',
    v_supplier_id,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 30 minutes',
    NOW() - INTERVAL '30 minutes',
    'villarrica',
    'cash'
  ) RETURNING id INTO v_request_id;

  -- Create open dispute
  INSERT INTO disputes (request_id, consumer_id, provider_id, dispute_type, description, status)
  VALUES (
    v_request_id,
    v_consumer_id,
    v_supplier_id,
    'wrong_quantity',
    'Recibí menos agua de lo solicitado',
    'open'
  );

  RAISE NOTICE 'Created dispute for admin testing';
END $$;
*/

-- =============================================================================
-- ADD YOUR OWN SCENARIOS BELOW
-- =============================================================================

-- Your custom scenarios here...

SELECT 'Seed script ready. Uncomment scenarios as needed.' as status;
