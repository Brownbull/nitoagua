#!/usr/bin/env npx ts-node

/**
 * CHAIN-1 Test Cleanup Script
 *
 * Removes only the test data created during CHAIN-1 E2E testing:
 * - Water requests created after the baseline timestamp
 * - Offers on those requests
 * - Related notifications
 *
 * PRESERVES:
 * - Test user accounts
 * - User profiles
 * - Provider service areas
 * - Data that existed before testing
 *
 * Usage:
 *   # Dry run (shows what would be deleted):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/production/chain1-test-cleanup.ts
 *
 *   # Actually delete:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/production/chain1-test-cleanup.ts --confirm
 *
 *   # For local:
 *   npx ts-node scripts/production/chain1-test-cleanup.ts --local [--confirm]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

const isLocal = process.argv.includes("--local");
const isDryRun = !process.argv.includes("--confirm");

// Load environment files
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

// Load from .env.production.local first, then .env.local as fallback
if (!loadEnvFile(".env.production.local")) {
  loadEnvFile(".env.local");
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

interface BaselineData {
  timestamp: string;
  consumerId: string;
  providerId: string;
  waterRequestCount: number;
  offerCount: number;
  notificationCount: number;
}

async function main() {
  const targetType = isLocal ? "LOCAL" : "PRODUCTION";
  console.log("\n🧹 CHAIN-1 Test Cleanup Script");
  console.log(`   Target: ${targetType}`);
  console.log(`   Mode: ${isDryRun ? "DRY RUN (preview only)" : "DELETE"}`);
  console.log(`   URL: ${SUPABASE_URL}\n`);

  // Load baseline
  const baselinePath = join(process.cwd(), "scripts/production/.chain1-baseline.json");

  if (!existsSync(baselinePath)) {
    console.error("❌ No baseline file found.");
    console.error("   Run 'chain1-test-setup.ts' before testing to create a baseline.");
    process.exit(1);
  }

  const baseline: BaselineData = JSON.parse(readFileSync(baselinePath, "utf8"));
  console.log(`📋 Baseline from: ${baseline.timestamp}`);
  console.log(`   Consumer ID: ${baseline.consumerId}`);
  console.log(`   Provider ID: ${baseline.providerId}`);
  console.log(`   Pre-existing requests: ${baseline.waterRequestCount}`);
  console.log(`   Pre-existing offers: ${baseline.offerCount}`);
  console.log(`   Pre-existing notifications: ${baseline.notificationCount}\n`);

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Find data created after baseline
  console.log("🔍 Scanning for test data created after baseline...\n");

  // 1. Find new water requests
  const { data: newRequests, count: newRequestCount } = await supabase
    .from("water_requests")
    .select("id, tracking_token, status, created_at", { count: "exact" })
    .or(`consumer_id.eq.${baseline.consumerId},supplier_id.eq.${baseline.providerId}`)
    .gte("created_at", baseline.timestamp);

  console.log(`   New water requests: ${newRequestCount || 0}`);
  if (newRequests && newRequests.length > 0) {
    for (const req of newRequests.slice(0, 5)) {
      console.log(`     - [${req.status}] ${req.tracking_token} (${req.created_at})`);
    }
    if (newRequests.length > 5) {
      console.log(`     ... and ${newRequests.length - 5} more`);
    }
  }

  const newRequestIds = newRequests?.map((r) => r.id) || [];

  // 2. Find offers on new requests
  let newOfferCount = 0;
  let newOfferIds: string[] = [];

  if (newRequestIds.length > 0) {
    const { data: newOffers, count: offerCount } = await supabase
      .from("offers")
      .select("id, status, created_at", { count: "exact" })
      .in("request_id", newRequestIds);

    newOfferCount = offerCount || 0;
    newOfferIds = newOffers?.map((o) => o.id) || [];

    console.log(`   Offers on new requests: ${newOfferCount}`);
  } else {
    console.log(`   Offers on new requests: 0`);
  }

  // 3. Find new notifications
  const { data: newNotifications, count: newNotificationCount } = await supabase
    .from("notifications")
    .select("id, type, created_at", { count: "exact" })
    .or(`user_id.eq.${baseline.consumerId},user_id.eq.${baseline.providerId}`)
    .gte("created_at", baseline.timestamp);

  console.log(`   New notifications: ${newNotificationCount || 0}`);

  const newNotificationIds = newNotifications?.map((n) => n.id) || [];

  // Summary
  const totalToDelete = (newRequestCount || 0) + newOfferCount + (newNotificationCount || 0);

  if (totalToDelete === 0) {
    console.log("\n✅ No test data to clean up!\n");
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 Summary: ${totalToDelete} items to delete`);
  console.log("=".repeat(60));

  if (isDryRun) {
    console.log(`
This is a DRY RUN. No data will be deleted.

To actually delete this data, run:
  npx ts-node scripts/production/chain1-test-cleanup.ts --confirm
`);
    return;
  }

  // Actually delete
  console.log("\n🗑️ Deleting test data...\n");

  // Delete in order: offers -> requests -> notifications (respecting foreign keys)

  // 1. Delete offers first
  if (newOfferIds.length > 0) {
    const { error: offerError } = await supabase.from("offers").delete().in("id", newOfferIds);

    if (offerError) {
      console.error(`   ❌ Failed to delete offers: ${offerError.message}`);
    } else {
      console.log(`   ✓ Deleted ${newOfferIds.length} offers`);
    }
  }

  // 2. Delete water requests
  if (newRequestIds.length > 0) {
    const { error: requestError } = await supabase
      .from("water_requests")
      .delete()
      .in("id", newRequestIds);

    if (requestError) {
      console.error(`   ❌ Failed to delete requests: ${requestError.message}`);
    } else {
      console.log(`   ✓ Deleted ${newRequestIds.length} water requests`);
    }
  }

  // 3. Delete notifications
  if (newNotificationIds.length > 0) {
    const { error: notifError } = await supabase
      .from("notifications")
      .delete()
      .in("id", newNotificationIds);

    if (notifError) {
      console.error(`   ❌ Failed to delete notifications: ${notifError.message}`);
    } else {
      console.log(`   ✓ Deleted ${newNotificationIds.length} notifications`);
    }
  }

  // Remove baseline file
  try {
    unlinkSync(baselinePath);
    console.log(`\n   ✓ Removed baseline file`);
  } catch {
    // Ignore
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ CHAIN-1 Test Cleanup Complete");
  console.log("=".repeat(60));
  console.log(`
Preserved:
  ✓ Test user accounts
  ✓ User profiles
  ✓ Provider service areas
  ✓ Pre-existing data

Deleted:
  ✓ ${newRequestIds.length} water requests created during testing
  ✓ ${newOfferIds.length} offers on those requests
  ✓ ${newNotificationIds.length} related notifications
`);
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
