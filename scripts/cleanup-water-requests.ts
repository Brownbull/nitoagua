#!/usr/bin/env npx ts-node

/**
 * Cleanup Script: Delete all water requests from database
 *
 * Usage:
 *   Local:  npm run cleanup:local
 *   Remote: npm run cleanup:remote
 *
 * Or directly:
 *   npx ts-node scripts/cleanup-water-requests.ts [--remote]
 */

import { createClient } from "@supabase/supabase-js";

// Determine if we're targeting remote or local
const isRemote = process.argv.includes("--remote");

// Environment variables based on target
const config = isRemote
  ? {
      url: process.env.REMOTE_SUPABASE_URL || "https://spvbmmydrfquvndxpcug.supabase.co",
      serviceRoleKey: process.env.REMOTE_SUPABASE_SERVICE_ROLE_KEY || "",
      name: "REMOTE (Production)",
    }
  : {
      url: "http://127.0.0.1:54326",
      serviceRoleKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
      name: "LOCAL (Docker)",
    };

async function cleanup() {
  console.log(`\n🗑️  Water Requests Cleanup Script`);
  console.log(`   Target: ${config.name}`);
  console.log(`   URL: ${config.url}\n`);

  if (isRemote && !config.serviceRoleKey) {
    console.error("❌ Error: REMOTE_SUPABASE_SERVICE_ROLE_KEY environment variable is required for remote cleanup");
    console.error("   Set it in your environment or .env file");
    process.exit(1);
  }

  const supabase = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // First, count existing records
  const { count: beforeCount, error: countError } = await supabase
    .from("water_requests")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error counting records:", countError.message);
    process.exit(1);
  }

  console.log(`📊 Found ${beforeCount} water request(s)`);

  if (beforeCount === 0) {
    console.log("✅ No records to delete. Database is already clean.\n");
    return;
  }

  // Confirm before deleting (for remote only)
  if (isRemote) {
    console.log("\n⚠️  WARNING: You are about to delete PRODUCTION data!");
    console.log("   This action cannot be undone.\n");

    // In a real script, you'd add readline confirmation here
    // For now, require explicit --confirm flag for remote
    if (!process.argv.includes("--confirm")) {
      console.log("   To proceed, add --confirm flag:");
      console.log("   npm run cleanup:remote -- --confirm\n");
      process.exit(0);
    }
  }

  // Delete all water requests
  const { error: deleteError } = await supabase
    .from("water_requests")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (neq with impossible id)

  if (deleteError) {
    console.error("❌ Error deleting records:", deleteError.message);
    process.exit(1);
  }

  // Verify deletion
  const { count: afterCount } = await supabase
    .from("water_requests")
    .select("*", { count: "exact", head: true });

  console.log(`\n✅ Deleted ${beforeCount} water request(s)`);
  console.log(`   Remaining: ${afterCount}\n`);
}

cleanup().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
