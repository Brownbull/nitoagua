#!/usr/bin/env npx ts-node

/**
 * Cleanup Production Test Data
 *
 * Removes all test users and test data from production Supabase
 * before going live with real users.
 *
 * Usage:
 *   # Dry run (shows what would be deleted):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/cleanup-production-test-data.ts
 *
 *   # Actually delete:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/cleanup-production-test-data.ts --confirm
 *
 * What gets deleted:
 *   - Test users: admin@nitoagua.cl, consumer@nitoagua.cl, supplier@nitoagua.cl
 *   - Their profiles
 *   - Admin allowlist entry for admin@nitoagua.cl
 *   - Any water_requests associated with test users
 *   - Any offers associated with test users
 */

import { createClient } from "@supabase/supabase-js";

// Support both naming conventions
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const isDryRun = !process.argv.includes("--confirm");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  console.error("\nUsage:");
  console.error("  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/cleanup-production-test-data.ts");
  process.exit(1);
}

// Test user emails to be deleted
const TEST_EMAILS = [
  "admin@nitoagua.cl",
  "consumer@nitoagua.cl",
  "supplier@nitoagua.cl",
];

async function main() {
  console.log("\n🧹 Production Test Data Cleanup Script");
  console.log(`   Target: ${SUPABASE_URL}`);
  console.log(`   Mode: ${isDryRun ? "DRY RUN (preview only)" : "DELETE"}\n`);

  if (isDryRun) {
    console.log("   ℹ️  This is a dry run. No data will be deleted.");
    console.log("   To actually delete, add --confirm flag.\n");
  } else {
    console.log("   ⚠️  WARNING: This will PERMANENTLY DELETE test data!");
    console.log("   Make sure you want to do this.\n");
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get test user IDs
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testUsers = allUsers?.users?.filter((u: any) => TEST_EMAILS.includes(u.email || "")) || [];

  if (testUsers.length === 0) {
    console.log("✓ No test users found. Nothing to clean up.\n");
    return;
  }

  console.log("📋 Test users found:");
  for (const user of testUsers) {
    console.log(`   - ${user.email} (ID: ${user.id})`);
  }

  const testUserIds = testUsers.map((u) => u.id);

  // Check for associated data
  console.log("\n🔍 Checking for associated data...\n");

  // Check water_requests
  const { data: requests, count: requestCount } = await supabase
    .from("water_requests")
    .select("id, status, tracking_token", { count: "exact" })
    .or(`consumer_id.in.(${testUserIds.join(",")}),supplier_id.in.(${testUserIds.join(",")})`);

  console.log(`   Water requests: ${requestCount || 0}`);
  if (requests && requests.length > 0) {
    for (const req of requests.slice(0, 5)) {
      console.log(`     - [${req.status}] ${req.tracking_token}`);
    }
    if (requests.length > 5) {
      console.log(`     ... and ${requests.length - 5} more`);
    }
  }

  // Check offers
  const { count: offerCount } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .in("supplier_id", testUserIds);

  console.log(`   Offers: ${offerCount || 0}`);

  // Check profiles
  const { count: profileCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("id", testUserIds);

  console.log(`   Profiles: ${profileCount || 0}`);

  // Check admin_allowed_emails
  const { data: allowlistEntries } = await supabase
    .from("admin_allowed_emails")
    .select("email")
    .in("email", TEST_EMAILS);

  console.log(`   Admin allowlist entries: ${allowlistEntries?.length || 0}`);

  if (isDryRun) {
    console.log("\n" + "=".repeat(60));
    console.log("DRY RUN COMPLETE - No data was deleted");
    console.log("=".repeat(60));
    console.log("\nTo actually delete this data, run:");
    console.log("  npm run cleanup:prod --confirm\n");
    return;
  }

  // Actually delete the data
  console.log("\n🗑️  Deleting data...\n");

  // 1. Delete offers first (foreign key to profiles/suppliers)
  if (offerCount && offerCount > 0) {
    const { error: offerError } = await supabase
      .from("offers")
      .delete()
      .in("supplier_id", testUserIds);

    if (offerError) {
      console.error(`   ✗ Failed to delete offers: ${offerError.message}`);
    } else {
      console.log(`   ✓ Deleted ${offerCount} offers`);
    }
  }

  // 2. Delete water_requests (foreign keys to consumer/supplier)
  if (requestCount && requestCount > 0) {
    const { error: requestError } = await supabase
      .from("water_requests")
      .delete()
      .or(`consumer_id.in.(${testUserIds.join(",")}),supplier_id.in.(${testUserIds.join(",")})`);

    if (requestError) {
      console.error(`   ✗ Failed to delete water requests: ${requestError.message}`);
    } else {
      console.log(`   ✓ Deleted ${requestCount} water requests`);
    }
  }

  // 3. Delete admin_allowed_emails entries
  if (allowlistEntries && allowlistEntries.length > 0) {
    const { error: allowlistError } = await supabase
      .from("admin_allowed_emails")
      .delete()
      .in("email", TEST_EMAILS);

    if (allowlistError) {
      console.error(`   ✗ Failed to delete allowlist entries: ${allowlistError.message}`);
    } else {
      console.log(`   ✓ Deleted ${allowlistEntries.length} admin allowlist entries`);
    }
  }

  // 4. Delete profiles
  if (profileCount && profileCount > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .in("id", testUserIds);

    if (profileError) {
      console.error(`   ✗ Failed to delete profiles: ${profileError.message}`);
    } else {
      console.log(`   ✓ Deleted ${profileCount} profiles`);
    }
  }

  // 5. Delete auth users
  console.log(`   Deleting ${testUsers.length} auth users...`);
  for (const user of testUsers) {
    const { error: userError } = await supabase.auth.admin.deleteUser(user.id);
    if (userError) {
      console.error(`   ✗ Failed to delete user ${user.email}: ${userError.message}`);
    } else {
      console.log(`   ✓ Deleted user: ${user.email}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Cleanup complete!");
  console.log("=".repeat(60));
  console.log("\nTest accounts have been removed. The app is ready for");
  console.log("real users. Remember to set NEXT_PUBLIC_DEV_LOGIN=false");
  console.log("in Vercel to disable dev login.\n");
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
