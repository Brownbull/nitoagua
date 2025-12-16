-- Migration: Add personal info fields to profiles
-- Story: 7-7 UX Alignment Personal Information
-- Created: 2025-12-15

-- ============================================
-- ADD RUT AND AVATAR_URL TO PROFILES
-- ============================================

-- Add RUT field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rut TEXT;

-- Add avatar_url field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- ============================================

-- Create storage bucket for profile photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile photos bucket
CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');
