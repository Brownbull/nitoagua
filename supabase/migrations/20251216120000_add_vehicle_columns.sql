-- Migration: Add vehicle and availability columns to profiles
-- Story: 7-9 UX Alignment Vehicle Information
-- Created: 2025-12-16

-- ============================================
-- ADD VEHICLE AND AVAILABILITY FIELDS
-- ============================================

-- Add vehicle_type column (type of vehicle for delivery)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vehicle_type TEXT
  CHECK (vehicle_type IS NULL OR vehicle_type IN ('moto', 'auto', 'camioneta', 'camion'));

-- Add vehicle_capacity column (capacity in liters)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vehicle_capacity INTEGER
  CHECK (vehicle_capacity IS NULL OR (vehicle_capacity >= 20 AND vehicle_capacity <= 10000));

-- Add working_hours column (daily availability)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS working_hours TEXT
  CHECK (working_hours IS NULL OR working_hours IN ('4-6', '6-8', '8-10', '10+'));

-- Add working_days column (array of available days)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS working_days TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN profiles.vehicle_type IS 'Type of delivery vehicle: moto (up to 100L), auto (up to 300L), camioneta (up to 1000L), camion (5000-10000L)';
COMMENT ON COLUMN profiles.vehicle_capacity IS 'Maximum water capacity in liters for this provider vehicle';
COMMENT ON COLUMN profiles.working_hours IS 'Daily working hours range: 4-6, 6-8, 8-10, or 10+ hours';
COMMENT ON COLUMN profiles.working_days IS 'Array of available days: lun, mar, mie, jue, vie, sab, dom';

-- Create index for filtering providers by vehicle type
CREATE INDEX IF NOT EXISTS idx_profiles_vehicle_type ON profiles(vehicle_type)
  WHERE vehicle_type IS NOT NULL;
