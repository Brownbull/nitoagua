-- Migration: Add expires_at to provider_documents
-- Created: 2025-12-15
-- Story: 7-5 Provider Document Management

-- Add expires_at column for document expiration tracking
ALTER TABLE provider_documents
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_provider_docs_expires_at
ON provider_documents(expires_at)
WHERE expires_at IS NOT NULL;

-- Add update policy for providers to update their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_documents'
    AND policyname = 'Providers can update own documents'
  ) THEN
    CREATE POLICY "Providers can update own documents"
    ON provider_documents FOR UPDATE
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());
  END IF;
END $$;
