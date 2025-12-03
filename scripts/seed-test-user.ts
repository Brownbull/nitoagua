#!/usr/bin/env npx ts-node

/**
 * Seed Script: Create test user for local development
 *
 * Usage:
 *   npm run seed:local
 *
 * Or directly:
 *   npx ts-node scripts/seed-test-user.ts
 *
 * This creates a test supplier user for local development testing.
 * Only works with local Supabase instance (not remote).
 */

import { createClient } from "@supabase/supabase-js";

// Local Supabase configuration
const config = {
  url: "http://127.0.0.1:54326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

// Test user credentials - LOCAL DEVELOPMENT ONLY
const TEST_USER = {
  email: "khujta@gmail.com",
  password: "password.123",
  profile: {
    role: "supplier" as const,
    name: "Test Supplier",
    phone: "+56912345678",
    service_area: "villarrica",
    price_100l: 5000,
    price_1000l: 15000,
    price_5000l: 50000,
    price_10000l: 80000,
    is_available: true,
  },
};

async function seedTestUser() {
  console.log(`\n🌱 Test User Seed Script`);
  console.log(`   Target: LOCAL (Docker)`);
  console.log(`   URL: ${config.url}\n`);

  const supabase = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email === TEST_USER.email
  );

  if (existingUser) {
    console.log(`📧 User ${TEST_USER.email} already exists`);

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", existingUser.id)
      .single();

    if (existingProfile) {
      console.log(`✅ Profile already exists. No changes needed.\n`);
      return;
    }

    // Create profile for existing user
    console.log(`📝 Creating profile for existing user...`);
    const { error: profileError } = await supabase.from("profiles").insert({
      id: existingUser.id,
      ...TEST_USER.profile,
    });

    if (profileError) {
      console.error("❌ Error creating profile:", profileError.message);
      process.exit(1);
    }

    console.log(`✅ Profile created successfully!\n`);
    return;
  }

  // Create new user
  console.log(`📧 Creating user: ${TEST_USER.email}`);

  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true, // Auto-confirm email for testing
    });

  if (createError) {
    console.error("❌ Error creating user:", createError.message);
    process.exit(1);
  }

  console.log(`✅ User created with ID: ${newUser.user.id}`);

  // Create profile
  console.log(`📝 Creating supplier profile...`);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: newUser.user.id,
    ...TEST_USER.profile,
  });

  if (profileError) {
    console.error("❌ Error creating profile:", profileError.message);
    process.exit(1);
  }

  console.log(`✅ Profile created successfully!`);
  console.log(`\n📋 Test User Details:`);
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
  console.log(`   Role: ${TEST_USER.profile.role}`);
  console.log(`   Name: ${TEST_USER.profile.name}`);
  console.log(`   Service Area: ${TEST_USER.profile.service_area}\n`);
}

seedTestUser().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
