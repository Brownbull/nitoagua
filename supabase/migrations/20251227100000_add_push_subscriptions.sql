-- Push Notification Subscriptions
-- Story 12-6: Web Push Notifications
-- Stores Web Push API subscription data for each user's devices

-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,  -- User agent public key
  auth TEXT NOT NULL,    -- Auth secret
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Each endpoint is unique per user (same device = same endpoint)
  UNIQUE(user_id, endpoint)
);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for Edge Function)
CREATE POLICY "Service role can manage all subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Index for efficient user queries
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();
