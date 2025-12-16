-- Migration: Add licencia_conducir document type
-- Created: 2025-12-16
-- Story: 7-8 UX Alignment - Document Upload Screen

-- Update the CHECK constraint on provider_documents.type to include licencia_conducir
-- The existing constraint allows: cedula, licencia, permiso_sanitario, certificacion, vehiculo
-- We need to add licencia_conducir as a new type

-- First, drop the existing constraint
ALTER TABLE provider_documents DROP CONSTRAINT IF EXISTS provider_documents_type_check;

-- Add the updated constraint with licencia_conducir
ALTER TABLE provider_documents ADD CONSTRAINT provider_documents_type_check
CHECK (type IN ('cedula', 'licencia', 'licencia_conducir', 'permiso_sanitario', 'certificacion', 'vehiculo'));

-- Add comment explaining document types per UX mockup
COMMENT ON COLUMN provider_documents.type IS 'Document type: cedula (ID card), licencia_conducir (driver license - required for motorized), vehiculo (vehicle photos - required), permiso_sanitario (health permit - optional), certificacion (water certification - optional), licencia (legacy)';
