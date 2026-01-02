-- Enable realtime for water_requests and offers tables
-- This allows the admin dashboard to receive live updates when orders change status

-- Add water_requests to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE water_requests;

-- Add offers to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE offers;

-- Set REPLICA IDENTITY to FULL for better change tracking
-- This ensures UPDATE events include both old and new values
ALTER TABLE water_requests REPLICA IDENTITY FULL;
ALTER TABLE offers REPLICA IDENTITY FULL;
