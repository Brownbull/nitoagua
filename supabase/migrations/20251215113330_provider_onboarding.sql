-- Migration: Provider Onboarding Tables
-- Created: 2025-12-15
-- Story: 7-1 Provider Registration Flow

-- ============================================
-- COMUNAS (Service Areas)
-- ============================================

CREATE TABLE IF NOT EXISTS comunas (
  id TEXT PRIMARY KEY,           -- 'villarrica', 'pucon'
  name TEXT NOT NULL,            -- 'Villarrica', 'Pucón'
  region TEXT NOT NULL,          -- 'Araucanía'
  active BOOLEAN DEFAULT TRUE
);

-- Seed initial comunas
INSERT INTO comunas (id, name, region) VALUES
  ('villarrica', 'Villarrica', 'Araucanía'),
  ('pucon', 'Pucón', 'Araucanía'),
  ('lican-ray', 'Licán Ray', 'Araucanía'),
  ('curarrehue', 'Curarrehue', 'Araucanía'),
  ('freire', 'Freire', 'Araucanía')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PROVIDER SERVICE AREAS (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS provider_service_areas (
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comuna_id TEXT REFERENCES comunas(id),
  PRIMARY KEY (provider_id, comuna_id)
);

-- Enable RLS
ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_service_areas
CREATE POLICY "Providers can view own service areas"
ON provider_service_areas FOR SELECT
USING (provider_id = auth.uid());

CREATE POLICY "Providers can insert own service areas"
ON provider_service_areas FOR INSERT
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can delete own service areas"
ON provider_service_areas FOR DELETE
USING (provider_id = auth.uid());

CREATE POLICY "Admins can view all service areas"
ON provider_service_areas FOR SELECT
USING (
  EXISTS (SELECT 1 FROM admin_allowed_emails WHERE email = auth.jwt()->>'email')
);

-- ============================================
-- RLS Policies for provider_documents (if not exists)
-- ============================================

-- Check if policies already exist before creating
DO $$
BEGIN
  -- Providers can view own documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_documents'
    AND policyname = 'Providers can view own documents'
  ) THEN
    CREATE POLICY "Providers can view own documents"
    ON provider_documents FOR SELECT
    USING (provider_id = auth.uid());
  END IF;

  -- Providers can insert own documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_documents'
    AND policyname = 'Providers can insert own documents'
  ) THEN
    CREATE POLICY "Providers can insert own documents"
    ON provider_documents FOR INSERT
    WITH CHECK (provider_id = auth.uid());
  END IF;

  -- Providers can delete own documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_documents'
    AND policyname = 'Providers can delete own documents'
  ) THEN
    CREATE POLICY "Providers can delete own documents"
    ON provider_documents FOR DELETE
    USING (provider_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_provider_areas_comuna ON provider_service_areas(comuna_id);
CREATE INDEX IF NOT EXISTS idx_provider_areas_provider ON provider_service_areas(provider_id);
CREATE INDEX IF NOT EXISTS idx_comunas_active ON comunas(active) WHERE active = TRUE;
