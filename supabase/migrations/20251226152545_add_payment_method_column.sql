-- Migration: Add payment_method column to water_requests
-- Story: 12-2 Payment Method Selection
--
-- This column was created in production but missing migration file.
-- Using IF NOT EXISTS/IF EXISTS to make migration idempotent.

-- Add column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'water_requests' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE water_requests ADD COLUMN payment_method text DEFAULT 'cash';
    END IF;
END $$;

-- Add check constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'water_requests_payment_method_check'
    ) THEN
        ALTER TABLE water_requests
        ADD CONSTRAINT water_requests_payment_method_check
        CHECK (payment_method = ANY (ARRAY['cash'::text, 'transfer'::text]));
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN water_requests.payment_method IS 'Payment method: cash (default) or transfer';
