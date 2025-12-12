-- Migration: 006_v2_admin_auth
-- Description: Admin authentication tables for allowlist-based access
-- Story: 6-1 Admin Authentication and Access

-- Admin allowed emails table for allowlist-based authentication
CREATE TABLE IF NOT EXISTS admin_allowed_emails (
    email TEXT PRIMARY KEY,
    added_by TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT
);

-- Admin settings table for platform configuration
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on admin tables
ALTER TABLE admin_allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_allowed_emails
-- Only allow reads if the user's email is in the allowlist (for checking access)
-- Service role can manage the table
CREATE POLICY "Allow authenticated users to check their own email"
    ON admin_allowed_emails
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- RLS policies for admin_settings
-- Only admins (users with email in admin_allowed_emails) can read settings
CREATE POLICY "Allow admins to read settings"
    ON admin_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_allowed_emails
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Seed initial admin email(s) for testing
-- Note: In production, add real admin emails via Supabase dashboard or service role
INSERT INTO admin_allowed_emails (email, added_by, notes)
VALUES
    ('admin@nitoagua.cl', 'system', 'Initial admin account for testing'),
    ('khujta.ai@gmail.com', 'system', 'Project owner admin account')
ON CONFLICT (email) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE admin_allowed_emails IS 'Allowlist of emails permitted to access the admin panel';
COMMENT ON TABLE admin_settings IS 'Platform configuration settings managed by admins';
