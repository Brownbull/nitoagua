#!/usr/bin/env npx ts-node

/**
 * Seed Test Users to Supabase (for E2E testing)
 *
 * Creates test users (admin, consumer, supplier) in Supabase
 * for end-to-end testing with NEXT_PUBLIC_DEV_LOGIN=true.
 *
 * Usage:
 *   # For production (requires inline env vars):
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/seed-production-test-users.ts
 *
 *   # For local (uses .env.local):
 *   npx ts-node scripts/seed-production-test-users.ts --local
 *
 * IMPORTANT: This script is for TESTING ONLY.
 * Remove these test users before going live with real users.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const isLocal = process.argv.includes("--local");

// Load .env.local manually (only for local mode)
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env.local");
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
  } catch {
    // .env.local might not exist, that's ok
  }
}

if (isLocal) {
  loadEnvFile();
}

// Support both naming conventions for flexibility
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  console.error("\nUsage:");
  console.error("  Production: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/seed-production-test-users.ts");
  console.error("  Local:      npx ts-node scripts/seed-production-test-users.ts --local");
  process.exit(1);
}

// =============================================================================
// TEST USER DEFINITIONS
// =============================================================================

const TEST_USERS = {
  admin: {
    email: "admin@nitoagua.cl",
    password: "admin.123",
    profile: {
      role: "consumer" as const,
      name: "Admin Test",
      phone: "+56900000001",
    },
    addToAllowlist: true, // Admin needs to be in admin_allowed_emails
  },
  consumer: {
    email: "consumer@nitoagua.cl",
    password: "consumer.123",
    profile: {
      role: "consumer" as const,
      name: "Consumer Test",
      phone: "+56900000002",
      address: "Calle Test 123, Villarrica",
      special_instructions: "Casa de prueba",
    },
    addToAllowlist: false,
  },
  supplier: {
    email: "supplier@nitoagua.cl",
    password: "supplier.123",
    profile: {
      role: "supplier" as const,
      name: "Supplier Test",
      phone: "+56900000003",
      service_area: "villarrica",
      price_100l: 5000,
      price_1000l: 15000,
      price_5000l: 50000,
      price_10000l: 80000,
      is_available: true,
      verification_status: "approved",
    },
    addToAllowlist: false,
  },
};

// =============================================================================
// MAIN SCRIPT
// =============================================================================

async function main() {
  const targetType = isLocal ? "LOCAL" : "PRODUCTION";
  console.log("\n🌱 Test Users Seed Script");
  console.log(`   Target: ${targetType}`);
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log("   Mode: CREATE TEST USERS\n");
  if (!isLocal) {
    console.log("   ⚠️  WARNING: This is for TESTING ONLY!");
    console.log("   Remove these users before going live.\n");
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Seed each test user
  for (const [userType, userData] of Object.entries(TEST_USERS)) {
    await seedUser(supabase, userType, userData);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Test Users Summary:");
  console.log("=".repeat(60));
  for (const [userType, userData] of Object.entries(TEST_USERS)) {
    console.log(`\n${userType.toUpperCase()}:`);
    console.log(`   Email:    ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log(`   Role:     ${userData.profile.role}`);
    if (userData.addToAllowlist) {
      console.log(`   Admin:    ✓ (in admin_allowed_emails)`);
    }
  }
  console.log("\n" + "=".repeat(60));
  console.log("\n🔗 Login URLs:");
  console.log("   Consumer/Supplier: https://nitoagua.vercel.app/login");
  console.log("   Admin:             https://nitoagua.vercel.app/admin/login");
  console.log("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedUser(supabase: any, userType: string, userData: any) {
  console.log(`\n📧 Processing ${userType}: ${userData.email}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingUser = existingUsers?.users?.find((u: any) => u.email === userData.email);

  let userId: string;

  if (existingUser) {
    console.log(`   ✓ User already exists (ID: ${existingUser.id})`);
    userId = existingUser.id;

    // Update password to ensure it matches
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: userData.password }
    );
    if (updateError) {
      console.log(`   ⚠ Could not update password: ${updateError.message}`);
    } else {
      console.log(`   ✓ Password updated`);
    }
  } else {
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.profile.name,
      },
    });

    if (createError) {
      console.error(`   ✗ Failed to create user: ${createError.message}`);
      return;
    }

    console.log(`   ✓ Created user (ID: ${newUser.user.id})`);
    userId = newUser.user.id;
  }

  // Upsert profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...userData.profile,
    }, { onConflict: "id" });

  if (profileError) {
    console.error(`   ✗ Failed to upsert profile: ${profileError.message}`);
  } else {
    console.log(`   ✓ Profile upserted (role: ${userData.profile.role})`);
  }

  // Add to admin allowlist if needed
  if (userData.addToAllowlist) {
    const { error: allowlistError } = await supabase
      .from("admin_allowed_emails")
      .upsert({ email: userData.email, added_by: "system" }, { onConflict: "email" });

    if (allowlistError) {
      console.error(`   ✗ Failed to add to admin allowlist: ${allowlistError.message}`);
    } else {
      console.log(`   ✓ Added to admin_allowed_emails`);
    }
  }
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
