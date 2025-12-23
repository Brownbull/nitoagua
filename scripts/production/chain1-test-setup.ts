#!/usr/bin/env npx ts-node

/**
 * CHAIN-1 Test Setup Script
 *
 * Prepares production for CHAIN-1 (Core Transaction Flow) E2E testing:
 * - Verifies test users exist and can log in
 * - Ensures comunas are populated
 * - Ensures provider has service areas configured
 * - Records baseline data count for cleanup after testing
 *
 * Usage:
 *   # With environment variables:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/production/chain1-test-setup.ts
 *
 *   # For local testing:
 *   npx ts-node scripts/production/chain1-test-setup.ts --local
 *
 * After testing, run chain1-test-cleanup.ts to remove test data.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const isLocal = process.argv.includes("--local");

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

// Test users for CHAIN-1
const TEST_USERS = {
  consumer: {
    email: "consumer@nitoagua.cl",
    password: "test.123",
    expectedRole: "consumer",
  },
  provider: {
    email: "supplier@nitoagua.cl",
    password: "test.123",
    expectedRole: "supplier",
  },
};

// Required comunas for the request form
const REQUIRED_COMUNAS = [
  { id: "villarrica", name: "Villarrica", region: "Araucanía" },
  { id: "pucon", name: "Pucón", region: "Araucanía" },
  { id: "lican-ray", name: "Licán Ray", region: "Araucanía" },
  { id: "curarrehue", name: "Curarrehue", region: "Araucanía" },
];

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
  console.log("\n🔧 CHAIN-1 Test Setup Script");
  console.log(`   Target: ${targetType}`);
  console.log(`   URL: ${SUPABASE_URL}\n`);

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const baseline: Partial<BaselineData> = {
    timestamp: new Date().toISOString(),
  };

  // 1. Verify test users exist
  console.log("📧 Verifying test users...\n");
  const { data: allUsers } = await supabase.auth.admin.listUsers();

  for (const [role, userData] of Object.entries(TEST_USERS)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = allUsers?.users?.find((u: any) => u.email === userData.email);

    if (!user) {
      console.error(`   ❌ ${role}: ${userData.email} NOT FOUND`);
      console.error(`      Run 'npm run seed:prod:users' first to create test users.`);
      process.exit(1);
    }

    console.log(`   ✓ ${role}: ${userData.email} (ID: ${user.id})`);

    // Store IDs for baseline
    if (role === "consumer") baseline.consumerId = user.id;
    if (role === "provider") baseline.providerId = user.id;

    // Update password to match test document (test.123)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: userData.password,
    });

    if (updateError) {
      console.warn(`     ⚠ Could not set password: ${updateError.message}`);
    } else {
      console.log(`     ✓ Password set to: ${userData.password}`);
    }

    // Verify profile role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, verification_status, is_available")
      .eq("id", user.id)
      .single();

    if (profile) {
      console.log(`     ✓ Role: ${profile.role}`);
      if (role === "provider") {
        console.log(`     ✓ Verification: ${profile.verification_status}`);
        console.log(`     ✓ Available: ${profile.is_available}`);

        // Ensure provider is verified and available
        if (profile.verification_status !== "approved" || !profile.is_available) {
          await supabase
            .from("profiles")
            .update({ verification_status: "approved", is_available: true })
            .eq("id", user.id);
          console.log(`     ✓ Updated provider to approved & available`);
        }
      }
    }
  }

  // 2. Ensure comunas exist
  console.log("\n📍 Checking comunas...\n");
  const { data: existingComunas } = await supabase
    .from("comunas")
    .select("id, name")
    .in(
      "id",
      REQUIRED_COMUNAS.map((c) => c.id)
    );

  const existingIds = existingComunas?.map((c) => c.id) || [];
  const missingComunas = REQUIRED_COMUNAS.filter((c) => !existingIds.includes(c.id));

  if (missingComunas.length > 0) {
    console.log(`   Creating ${missingComunas.length} missing comunas...`);
    for (const comuna of missingComunas) {
      const { error } = await supabase.from("comunas").upsert(comuna, { onConflict: "id" });
      if (error) {
        console.error(`   ❌ Failed to create ${comuna.name}: ${error.message}`);
      } else {
        console.log(`   ✓ Created: ${comuna.name}`);
      }
    }
  } else {
    console.log(`   ✓ All ${REQUIRED_COMUNAS.length} required comunas exist`);
  }

  // 3. Ensure provider has service areas
  console.log("\n🗺️ Checking provider service areas...\n");
  const providerId = baseline.providerId!;

  const { data: serviceAreas } = await supabase
    .from("provider_service_areas")
    .select("comuna_id")
    .eq("provider_id", providerId);

  if (!serviceAreas || serviceAreas.length === 0) {
    console.log("   Adding service areas for provider...");
    for (const comuna of REQUIRED_COMUNAS) {
      const { error } = await supabase.from("provider_service_areas").upsert(
        { provider_id: providerId, comuna_id: comuna.id },
        { onConflict: "provider_id,comuna_id" }
      );
      if (!error) {
        console.log(`   ✓ Added: ${comuna.name}`);
      }
    }
  } else {
    console.log(`   ✓ Provider has ${serviceAreas.length} service areas configured`);
  }

  // 4. Record baseline data counts
  console.log("\n📊 Recording baseline data counts...\n");

  const { count: requestCount } = await supabase
    .from("water_requests")
    .select("id", { count: "exact", head: true })
    .or(`consumer_id.eq.${baseline.consumerId},supplier_id.eq.${baseline.providerId}`);

  const { count: offerCount } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", baseline.providerId);

  const { count: notificationCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .or(`user_id.eq.${baseline.consumerId},user_id.eq.${baseline.providerId}`);

  baseline.waterRequestCount = requestCount || 0;
  baseline.offerCount = offerCount || 0;
  baseline.notificationCount = notificationCount || 0;

  console.log(`   Water requests: ${baseline.waterRequestCount}`);
  console.log(`   Offers: ${baseline.offerCount}`);
  console.log(`   Notifications: ${baseline.notificationCount}`);

  // 5. Save baseline to file
  const baselinePath = join(process.cwd(), "scripts/production/.chain1-baseline.json");
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`\n   ✓ Baseline saved to: ${baselinePath}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ CHAIN-1 Test Setup Complete");
  console.log("=".repeat(60));
  console.log(`
Test Credentials:
  Consumer: ${TEST_USERS.consumer.email} / ${TEST_USERS.consumer.password}
  Provider: ${TEST_USERS.provider.email} / ${TEST_USERS.provider.password}

Login URL: https://nitoagua.vercel.app/login

After testing, run cleanup:
  npx ts-node scripts/production/chain1-test-cleanup.ts
`);
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
