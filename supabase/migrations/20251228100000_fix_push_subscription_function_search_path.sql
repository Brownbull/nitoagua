-- Fix search_path security issue for push_subscriptions trigger function
-- Atlas Code Review finding: function_search_path_mutable warning
-- Story 12-6 code review fix

CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
