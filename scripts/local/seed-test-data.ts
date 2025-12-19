#!/usr/bin/env npx ts-node

/**
 * Test Data Seeding Script
 *
 * Seeds the database with deterministic test data for E2E integration tests.
 * Uses upsert operations to ensure idempotency (can run multiple times safely).
 *
 * Usage:
 *   npm run seed:test          # Seed local Supabase
 *   npm run seed:test:clean    # Remove seeded test data
 *
 * Or directly:
 *   npx ts-node scripts/seed-test-data.ts [--clean]
 *
 * Environment:
 *   - Local Supabase must be running (npx supabase start)
 *   - Uses service role key to bypass RLS
 *
 * NOTE: Test data constants are duplicated in tests/fixtures/test-data.ts
 *       for E2E test imports. If you change values here, update there too.
 */

import { createClient } from "@supabase/supabase-js";

// Local Supabase configuration (default)
const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};

// Production config via environment variables
const PROD_CONFIG = {
  url: process.env.SUPABASE_URL || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_KEY || "",
};

// Use production if env vars are set, otherwise local
const useProduction = !!(PROD_CONFIG.url && PROD_CONFIG.serviceRoleKey);
const CONFIG = useProduction ? PROD_CONFIG : LOCAL_CONFIG;

// =============================================================================
// TEST DATA CONSTANTS (keep in sync with tests/fixtures/test-data.ts)
// =============================================================================

const TEST_SUPPLIER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "test-supplier@test.local",
  password: "TestSupplier123!",
  profile: {
    role: "supplier",
    name: "Don Pedro (Test Supplier)",
    phone: "+56911111111",
    service_area: "villarrica",
    price_100l: 5000,
    price_1000l: 15000,
    price_5000l: 50000,
    price_10000l: 80000,
    is_available: true,
  },
};

const TEST_CONSUMER = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "test-consumer@test.local",
  password: "TestConsumer123!",
  profile: {
    role: "consumer",
    name: "Doña María (Test Consumer)",
    phone: "+56922222222",
    address: "Calle Test 123, Villarrica",
    special_instructions: "Casa con reja verde",
  },
};

// Water requests in various states
const SEEDED_REQUESTS = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    tracking_token: "seed-token-pending",
    status: "pending",
    guest_phone: "+56933333333",
    guest_name: "Guest Pending",
    guest_email: "pending@test.local",
    address: "Avenida Pendiente 100, Villarrica, Chile",
    amount: 1000,
    special_instructions: "Pending request for testing",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
  },
  {
    id: "33333333-3333-3333-3333-333333333334",
    tracking_token: "seed-token-consumer-pending",
    status: "pending",
    guest_phone: TEST_CONSUMER.profile.phone,
    guest_name: TEST_CONSUMER.profile.name,
    guest_email: TEST_CONSUMER.email,
    address: TEST_CONSUMER.profile.address,
    amount: 5000,
    special_instructions: "Consumer pending request",
    is_urgent: false,
    consumer_id: TEST_CONSUMER.id, // Will be mapped to actual ID
    supplier_id: null,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    tracking_token: "seed-token-accepted",
    status: "accepted",
    guest_phone: "+56944444444",
    guest_name: "Guest Accepted",
    guest_email: "accepted@test.local",
    address: "Calle Aceptada 200, Villarrica, Chile",
    amount: 1000,
    special_instructions: "Accepted request for testing",
    is_urgent: false,
    consumer_id: null,
    supplier_id: TEST_SUPPLIER.id, // Will be mapped to actual ID
    delivery_window: "14:00 - 16:00",
    accepted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    tracking_token: "seed-token-delivered",
    status: "delivered",
    guest_phone: "+56955555555",
    guest_name: "Guest Delivered",
    guest_email: "delivered@test.local",
    address: "Calle Entregada 300, Villarrica, Chile",
    amount: 5000,
    special_instructions: "Delivered request for testing",
    is_urgent: false,
    consumer_id: null,
    supplier_id: TEST_SUPPLIER.id,
    delivery_window: "10:00 - 12:00",
    accepted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "55555555-5555-5555-5555-555555555556",
    tracking_token: "seed-token-consumer-delivered",
    status: "delivered",
    guest_phone: TEST_CONSUMER.profile.phone,
    guest_name: TEST_CONSUMER.profile.name,
    guest_email: TEST_CONSUMER.email,
    address: TEST_CONSUMER.profile.address,
    amount: 10000,
    special_instructions: "Consumer delivered request",
    is_urgent: false,
    consumer_id: TEST_CONSUMER.id,
    supplier_id: TEST_SUPPLIER.id,
    delivery_window: "09:00 - 11:00",
    accepted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    tracking_token: "seed-token-cancelled",
    status: "cancelled",
    guest_phone: "+56966666666",
    guest_name: "Guest Cancelled",
    guest_email: "cancelled@test.local",
    address: "Calle Cancelada 400, Villarrica, Chile",
    amount: 100,
    special_instructions: "Cancelled request for testing",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    cancelled_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");

async function main() {
  console.log("🌱 Test Data Seed Script");
  console.log(`   Target: ${useProduction ? "PRODUCTION" : "LOCAL"} (${CONFIG.url})`);
  console.log(`   Mode: ${isClean ? "CLEAN" : "SEED"}`);

  const supabase = createClient(CONFIG.url, CONFIG.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    if (isClean) {
      await cleanTestData(supabase);
    } else {
      const userIds = await seedUsers(supabase);
      await seedRequests(supabase, userIds);
      await verifySeededData(supabase);
    }

    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedUsers(supabase: any) {
  console.log("\n📧 Seeding test users...");

  const supplierActualId = await upsertTestUser(supabase, TEST_SUPPLIER);
  const consumerActualId = await upsertTestUser(supabase, TEST_CONSUMER);

  return { supplierActualId, consumerActualId };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertTestUser(supabase: any, userData: typeof TEST_SUPPLIER | typeof TEST_CONSUMER): Promise<string> {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingUser = existingUsers?.users?.find((u: any) => u.email === userData.email);

  if (existingUser) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", existingUser.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: existingUser.id,
        ...userData.profile,
      });

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
    }

    console.log(`  ✓ User ${userData.email} exists (ID: ${existingUser.id})`);
    return existingUser.id;
  }

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      name: userData.profile.name,
    },
  });

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: newUser.user.id,
    ...userData.profile,
  });

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  console.log(`  ✓ Created user ${userData.email} (ID: ${newUser.user.id})`);
  return newUser.user.id;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedRequests(supabase: any, userIds: { supplierActualId: string; consumerActualId: string }) {
  console.log("\n📝 Seeding water requests...");

  // Map requests to use actual user IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsToSeed = SEEDED_REQUESTS.map((request: any) => {
    const mapped = { ...request };

    // Map supplier_id
    if (mapped.supplier_id === TEST_SUPPLIER.id) {
      mapped.supplier_id = userIds.supplierActualId;
    }

    // Map consumer_id
    if (mapped.consumer_id === TEST_CONSUMER.id) {
      mapped.consumer_id = userIds.consumerActualId;
    }

    return mapped;
  });

  // Use upsert for idempotency
  const { error } = await supabase
    .from("water_requests")
    .upsert(requestsToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed requests: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${requestsToSeed.length} water requests`);

  for (const req of requestsToSeed) {
    console.log(`    - ${req.status}: ${req.tracking_token}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanTestData(supabase: any) {
  console.log("\n🗑️  Cleaning seeded test data...");

  const requestIds = SEEDED_REQUESTS.map((r) => r.id);

  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} seeded water requests`);
  }

  console.log("\n  Note: Test user accounts are preserved for reuse.");
  console.log("  To delete users, use Supabase Dashboard or Auth Admin API.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifySeededData(supabase: any) {
  console.log("\n🔍 Verifying seeded data...");

  const errors: string[] = [];

  // Verify profiles exist
  const { count: profileCount, error: profileError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("phone", [TEST_SUPPLIER.profile.phone, TEST_CONSUMER.profile.phone]);

  if (profileError) {
    errors.push(`Failed to query profiles: ${profileError.message}`);
  } else if (!profileCount || profileCount < 2) {
    errors.push(`Expected 2 test profiles, found ${profileCount || 0}`);
  } else {
    console.log(`  ✓ Found ${profileCount} test profiles`);
  }

  // Verify requests exist with correct data
  const { data: requests, error: requestError } = await supabase
    .from("water_requests")
    .select("id, status, tracking_token")
    .like("tracking_token", "seed-token-%");

  if (requestError) {
    errors.push(`Failed to query requests: ${requestError.message}`);
  } else if (!requests || requests.length < SEEDED_REQUESTS.length) {
    errors.push(`Expected ${SEEDED_REQUESTS.length} seeded requests, found ${requests?.length || 0}`);
  } else {
    console.log(`  ✓ Found ${requests.length} seeded requests:`);
    for (const req of requests) {
      console.log(`    - [${req.status}] ${req.tracking_token}`);
    }

    // Verify each expected request exists
    for (const expected of SEEDED_REQUESTS) {
      const found = requests.find((r: { tracking_token: string }) => r.tracking_token === expected.tracking_token);
      if (!found) {
        errors.push(`Missing seeded request: ${expected.tracking_token}`);
      } else if (found.status !== expected.status) {
        errors.push(`Request ${expected.tracking_token} has status '${found.status}', expected '${expected.status}'`);
      }
    }
  }

  // FAIL if any verification errors
  if (errors.length > 0) {
    console.error("\n❌ Verification FAILED:");
    for (const error of errors) {
      console.error(`   - ${error}`);
    }
    throw new Error("Seeded data verification failed. Tests cannot rely on this data.");
  }

  console.log("\n✅ All seeded data verified successfully!");
}

main();
