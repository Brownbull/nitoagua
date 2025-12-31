#!/usr/bin/env npx ts-node

/**
 * Seed Dev Login Users to Local Supabase
 *
 * Creates the dev login test users (admin, consumer, supplier) in local Supabase.
 * These users match the credentials in src/components/auth/dev-login.tsx
 * and are required for E2E tests when NEXT_PUBLIC_DEV_LOGIN=true.
 *
 * Usage:
 *   npm run seed:dev-login          # Seed dev login users
 *   npm run seed:dev-login:clean    # Remove dev login users
 *
 * Or directly:
 *   npx ts-node scripts/local/seed-dev-login-users.ts [--clean]
 *
 * NOTE: Requires local Supabase running (npx supabase start)
 *       Uses service role key to bypass RLS
 */

import { createClient } from "@supabase/supabase-js";

// Local Supabase configuration
const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

// Dev login users - must match src/components/auth/dev-login.tsx
const DEV_USERS = {
  admin: {
    email: "admin@nitoagua.cl",
    password: "admin.123",
    profile: {
      role: "consumer" as const,
      name: "Admin Test",
      phone: "+56900000001",
    },
    addToAllowlist: true,
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
  newSupplier: {
    email: "provider2@nitoagua.cl",
    password: "provider2.123",
    // No profile - for testing onboarding flow
    profile: null,
    addToAllowlist: false,
  },
};

const isClean = process.argv.includes("--clean");

async function seedUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userType: string,
  userData: (typeof DEV_USERS)[keyof typeof DEV_USERS]
) {
  console.log(`\n📧 Processing ${userType}: ${userData.email}`);

  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingUser = existingUsers?.users.find((u: any) => u.email === userData.email);

  if (isClean) {
    // Clean mode: delete the user
    if (existingUser) {
      // Delete profile first (if exists)
      await supabase.from("profiles").delete().eq("id", existingUser.id);
      // Delete from admin allowlist (if exists)
      await supabase.from("admin_allowed_emails").delete().eq("email", userData.email);
      // Delete auth user
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`   ✓ Deleted user and profile`);
    } else {
      console.log(`   ⏭️  User not found, skipping`);
    }
    return;
  }

  // Seed mode: create or update user
  let userId: string;

  if (existingUser) {
    console.log(`   ⏭️  User exists (ID: ${existingUser.id.slice(0, 8)}...)`);
    userId = existingUser.id;
  } else {
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`   ❌ Error creating user: ${error.message}`);
      return;
    }

    userId = data.user!.id;
    console.log(`   ✓ Created user (ID: ${userId.slice(0, 8)}...)`);
  }

  // Create or update profile (if defined)
  if (userData.profile) {
    // Extract service_area before inserting (it's not a column in profiles table)
    const { service_area, ...profileData } = userData.profile as typeof userData.profile & { service_area?: string };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: userData.email,
        ...profileData,
      })
      .eq("id", userId);

    if (profileError) {
      console.error(`   ❌ Error upserting profile: ${profileError.message}`);
    } else {
      console.log(`   ✓ Profile upserted (role: ${userData.profile.role})`);
    }

    // If supplier, add service areas
    if (userData.profile.role === "supplier" && service_area) {
      // Add service areas for Villarrica, Pucón, and Licán Ray
      const serviceAreas = [
        { provider_id: userId, comuna_id: "villarrica" },
        { provider_id: userId, comuna_id: "pucon" },
        { provider_id: userId, comuna_id: "lican-ray" },
      ];

      const { error: areasError } = await supabase
        .from("provider_service_areas")
        .upsert(serviceAreas, { onConflict: "provider_id,comuna_id" });

      if (areasError) {
        console.error(`   ❌ Error adding service areas: ${areasError.message}`);
      } else {
        console.log(`   ✓ Service areas added (villarrica, pucon, lican-ray)`);
      }
    }
  } else {
    console.log(`   ⏭️  No profile (onboarding test user)`);
  }

  // Add to admin allowlist if needed
  if (userData.addToAllowlist) {
    const { error: allowlistError } = await supabase
      .from("admin_allowed_emails")
      .upsert(
        {
          email: userData.email,
          notes: "Dev login test admin",
          added_by: userId, // Required NOT NULL field - use admin's own ID
        },
        { onConflict: "email" }
      );

    if (allowlistError) {
      console.error(`   ❌ Error adding to allowlist: ${allowlistError.message}`);
    } else {
      console.log(`   ✓ Added to admin_allowed_emails`);
    }
  }
}

async function main() {
  const mode = isClean ? "CLEAN" : "SEED";
  console.log("\n🌱 Dev Login Users Seed Script");
  console.log(`   Target: LOCAL (${LOCAL_CONFIG.url})`);
  console.log(`   Mode: ${mode}`);

  const supabase = createClient(LOCAL_CONFIG.url, LOCAL_CONFIG.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Process each dev user
  for (const [userType, userData] of Object.entries(DEV_USERS)) {
    await seedUser(supabase, userType, userData);
  }

  if (!isClean) {
    console.log("\n" + "=".repeat(60));
    console.log("✅ Dev Login Users Summary:");
    console.log("=".repeat(60));
    console.log("\nThese credentials work with NEXT_PUBLIC_DEV_LOGIN=true:");
    for (const [userType, userData] of Object.entries(DEV_USERS)) {
      console.log(`\n${userType.toUpperCase()}:`);
      console.log(`   Email:    ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      if (userData.profile) {
        console.log(`   Role:     ${userData.profile.role}`);
      } else {
        console.log(`   Role:     (no profile - onboarding)`);
      }
      if (userData.addToAllowlist) {
        console.log(`   Admin:    ✓`);
      }
    }
    console.log("\n" + "=".repeat(60));
  }

  console.log("\n✅ Done!\n");
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
