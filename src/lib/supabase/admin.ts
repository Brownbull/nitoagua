import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase Admin Client
 *
 * Uses SERVICE_ROLE_KEY to bypass Row Level Security (RLS).
 * ONLY use this for server-side operations where RLS bypass is intentional.
 *
 * Security notes:
 * - Never expose this client to the browser
 * - Only use in API routes and server actions
 * - SERVICE_ROLE_KEY should only be set in server environment
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
