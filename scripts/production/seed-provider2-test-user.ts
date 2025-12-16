#!/usr/bin/env npx ts-node

/**
 * Seed Provider2 Test User - For testing provider onboarding flow
 *
 * Creates a test user with NO profile/role so they can go through
 * the complete provider onboarding flow.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/production/seed-provider2-test-user.ts
 *
 *   Or with --local flag:
 *   npx ts-node scripts/production/seed-provider2-test-user.ts --local
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

// Test user for provider onboarding - NO PROFILE so they go through full flow
const PROVIDER2_USER = {
  email: "provider2@nitoagua.cl",
  password: "provider2.123",
};

async function main() {
  console.log("\n🌱 Provider2 Test User Seed Script");
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log("   Purpose: Test provider onboarding flow\n");

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingUser = existingUsers?.users?.find((u: any) => u.email === PROVIDER2_USER.email);

  if (existingUser) {
    console.log(`📧 User ${PROVIDER2_USER.email} already exists (ID: ${existingUser.id})`);

    // Check if they have a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, verification_status")
      .eq("id", existingUser.id)
      .single();

    if (profile) {
      console.log(`   Current role: ${profile.role}`);
      console.log(`   Verification: ${profile.verification_status}`);
      console.log("\n   To reset for testing, delete their profile:");
      console.log(`   DELETE FROM profiles WHERE id = '${existingUser.id}';`);
    } else {
      console.log(`   ✓ No profile exists - ready for onboarding!`);
    }

    // Update password to ensure it matches
    await supabase.auth.admin.updateUserById(existingUser.id, {
      password: PROVIDER2_USER.password,
    });
    console.log(`   ✓ Password updated`);
  } else {
    // Create new user WITHOUT a profile
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: PROVIDER2_USER.email,
      password: PROVIDER2_USER.password,
      email_confirm: true,
      user_metadata: {
        name: "Provider Test 2",
      },
    });

    if (createError) {
      console.error(`❌ Failed to create user: ${createError.message}`);
      process.exit(1);
    }

    console.log(`✅ Created user (ID: ${newUser.user.id})`);
    console.log(`   ⚠️  NO PROFILE CREATED - User will go through onboarding`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📋 Provider2 Test User:");
  console.log("=".repeat(50));
  console.log(`   Email:    ${PROVIDER2_USER.email}`);
  console.log(`   Password: ${PROVIDER2_USER.password}`);
  console.log("\n🔗 Test URL:");
  console.log("   https://nitoagua.vercel.app/provider/onboarding");
  console.log("\n   1. Go to the URL above");
  console.log("   2. Click 'Comenzar con Google'");
  console.log("   3. Or use dev login with the credentials above");
  console.log("=".repeat(50) + "\n");
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
