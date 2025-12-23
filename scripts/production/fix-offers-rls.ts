#!/usr/bin/env npx ts-node

/**
 * Fix offers RLS policy in production
 *
 * Issue: Policy may be checking for role = 'provider' but profiles use role = 'supplier'
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env
function loadEnvFile(filename: string) {
  try {
    const envPath = join(process.cwd(), filename);
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

if (!loadEnvFile(".env.production.local")) {
  loadEnvFile(".env.local");
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixOffersRLS() {
  console.log("Checking and fixing offers RLS policy...\n");

  // The service role key bypasses RLS, so we can execute SQL
  const sql = `
    -- Drop the potentially incorrect policy
    DROP POLICY IF EXISTS "Providers can create offers" ON offers;

    -- Recreate with correct role name ('supplier' instead of 'provider')
    CREATE POLICY "Providers can create offers" ON offers
      FOR INSERT TO authenticated
      WITH CHECK (
        provider_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role = 'supplier'
            AND p.verification_status = 'approved'
        )
      );
  `;

  // Execute the SQL via the RPC interface
  // Note: This requires the supabase SQL function to be available
  // If not, we'd need to use the Supabase dashboard or CLI

  try {
    // Try using rpc to execute raw SQL (may not work)
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log("Could not execute SQL via RPC (expected)");
      console.log("Error:", error.message);
      console.log("\nPlease run this SQL in Supabase Dashboard -> SQL Editor:\n");
      console.log(sql);
    } else {
      console.log("✓ RLS policy updated successfully");
    }
  } catch (e) {
    console.log("SQL must be run manually in Supabase Dashboard.\n");
    console.log("Copy and paste this SQL:\n");
    console.log("========================================");
    console.log(sql);
    console.log("========================================");
  }

  // Verify provider profile
  const providerId = "cb0c1a7a-f734-4295-95cd-9d5e5f7e4ee4";
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, verification_status, is_available, vehicle_type, vehicle_capacity")
    .eq("id", providerId)
    .single();

  console.log("\nProvider profile status:");
  if (profileError) {
    console.error("Error:", profileError.message);
  } else {
    console.log(profile);
  }
}

fixOffersRLS().catch(console.error);
