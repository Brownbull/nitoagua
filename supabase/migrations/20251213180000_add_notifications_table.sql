-- Migration: Add notifications table for in-app notifications
-- Story: 6-7 Offer Expiration Cron Job (AC6.7.3 requires provider notifications)
-- Note: This table supports the V2 notification system for providers and consumers

-- Create notifications table (per architecture.md specification)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Index for efficient user queries (unread first, then by date)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(type);

-- RLS Policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can insert notifications (for cron jobs, server actions)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can do anything
CREATE POLICY "Service role full access"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read all notifications (for monitoring)
CREATE POLICY "Admins can read all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_allowed_emails
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

COMMENT ON TABLE notifications IS 'In-app notifications for providers and consumers (V2)';
COMMENT ON COLUMN notifications.type IS 'Notification type: offer_expired, offer_accepted, request_delivered, verification_approved, etc.';
COMMENT ON COLUMN notifications.data IS 'JSON metadata related to the notification (offer_id, request_id, etc.)';
