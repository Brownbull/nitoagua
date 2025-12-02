-- nitoagua Initial Schema Migration
-- Story 1.2: Supabase Database Setup
-- Created: 2025-12-02

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Links to Supabase auth.users, stores consumer and supplier profiles
-- Supplier-specific fields (price tiers, service_area) nullable for consumers

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  special_instructions TEXT,
  service_area TEXT,
  price_100l INTEGER,
  price_1000l INTEGER,
  price_5000l INTEGER,
  price_10000l INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WATER_REQUESTS TABLE
-- ============================================
-- Supports both registered users (consumer_id) and guests (guest_* fields)
-- tracking_token enables guest status tracking without auth
-- Status workflow: pending -> accepted -> delivered (or cancelled)

CREATE TABLE water_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES profiles(id),
  guest_name TEXT,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  tracking_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  address TEXT NOT NULL,
  special_instructions TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  amount INTEGER NOT NULL CHECK (amount IN (100, 1000, 5000, 10000)),
  is_urgent BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled')),
  supplier_id UUID REFERENCES profiles(id),
  delivery_window TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE water_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES TABLE
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - WATER_REQUESTS TABLE
-- ============================================

-- Anyone can create requests (guest flow support)
CREATE POLICY "Anyone can create requests"
  ON water_requests
  FOR INSERT
  WITH CHECK (true);

-- Suppliers can read pending requests (to accept them)
-- Consumers can read their own requests
-- Suppliers can read requests assigned to them
CREATE POLICY "Users can read relevant requests"
  ON water_requests
  FOR SELECT
  USING (
    -- Pending requests visible to suppliers
    (status = 'pending' AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'supplier'
    ))
    -- Consumers can see their own requests
    OR consumer_id = auth.uid()
    -- Suppliers can see requests assigned to them
    OR supplier_id = auth.uid()
  );

-- Consumers can cancel their own pending requests
CREATE POLICY "Consumers can cancel own pending requests"
  ON water_requests
  FOR UPDATE
  USING (
    consumer_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );

-- Suppliers can update requests assigned to them (accept, mark delivered)
CREATE POLICY "Suppliers can update assigned requests"
  ON water_requests
  FOR UPDATE
  USING (
    supplier_id = auth.uid()
    OR (
      status = 'pending'
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'supplier')
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_water_requests_status ON water_requests(status);
CREATE INDEX idx_water_requests_supplier_id ON water_requests(supplier_id);
CREATE INDEX idx_water_requests_consumer_id ON water_requests(consumer_id);
CREATE INDEX idx_water_requests_tracking_token ON water_requests(tracking_token);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
