#!/usr/bin/env npx ts-node

/**
 * Offer E2E Test Data Seeding Script
 *
 * Seeds the database with data specifically for testing offer-related flows:
 * - Story 8-3: Provider's Active Offers List
 * - Story 8-4: Withdraw Pending Offer
 *
 * Creates:
 * - An approved provider with service areas configured
 * - Pending requests that the provider can see
 * - Active offers (pending) that can be withdrawn
 * - Cancelled offers (for re-submission testing)
 * - Accepted offers (for "Ver Entrega" button testing)
 *
 * Usage:
 *   npm run seed:offers         # Seed offer test data
 *   npm run seed:offers:clean   # Remove offer test data
 *
 * Or directly:
 *   npx ts-node scripts/local/seed-offer-tests.ts [--clean]
 *
 * NOTE: Requires local Supabase running (npx supabase start)
 *       Uses the dev login test provider: supplier@nitoagua.cl
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
// OFFER TEST DATA CONSTANTS
// =============================================================================

// The dev login test provider - use this for E2E tests
const DEV_PROVIDER_EMAIL = "supplier@nitoagua.cl";

// Water requests for offer testing (pending requests the provider can see)
// NOTE: comuna_id references comunas.id (e.g., "santiago", "las-condes") - NOT the display name
const OFFER_TEST_REQUESTS = [
  {
    id: "77777777-7777-7777-7777-777777777771",
    tracking_token: "offer-test-pending-1",
    status: "pending",
    guest_phone: "+56987651001",
    guest_name: "Cliente Pendiente 1",
    guest_email: "cliente1@test.local",
    address: "Av. Test 100, Santiago",
    comuna_id: "santiago", // FK to comunas.id
    amount: 1000,
    special_instructions: "Para test de ofertas - activa",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: "77777777-7777-7777-7777-777777777772",
    tracking_token: "offer-test-pending-2",
    status: "pending",
    guest_phone: "+56987651002",
    guest_name: "Cliente Pendiente 2",
    guest_email: "cliente2@test.local",
    address: "Calle Urgente 200, Las Condes",
    comuna_id: "las-condes", // FK to comunas.id
    amount: 5000,
    special_instructions: "Urgente - para test",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    id: "77777777-7777-7777-7777-777777777773",
    tracking_token: "offer-test-pending-3",
    status: "pending",
    guest_phone: "+56987651003",
    guest_name: "Cliente Pendiente 3",
    guest_email: "cliente3@test.local",
    address: "Parcela 50, Providencia",
    comuna_id: "providencia", // FK to comunas.id
    amount: 10000,
    special_instructions: "Para reenvío de oferta",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "77777777-7777-7777-7777-777777777774",
    tracking_token: "offer-test-accepted",
    status: "accepted",
    guest_phone: "+56987651004",
    guest_name: "Cliente Aceptado",
    guest_email: "cliente4@test.local",
    address: "Av. Entrega 400, Vitacura",
    comuna_id: "vitacura", // FK to comunas.id
    amount: 1000,
    special_instructions: "Entrega confirmada",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "14:00 - 16:00",
    accepted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

// Offers in various states - will be mapped to actual provider ID
const OFFER_TEST_OFFERS = [
  // Active offer #1 - can be withdrawn (Story 8-4 AC8.4.1-8.4.3)
  {
    id: "88888888-8888-8888-8888-888888888881",
    request_id: "77777777-7777-7777-7777-777777777771", // Pending request 1
    provider_id: null, // Will be mapped to dev provider
    status: "active",
    delivery_window_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    delivery_window_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
    message: "Tengo disponibilidad",
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
  },
  // Active offer #2 - can be withdrawn
  {
    id: "88888888-8888-8888-8888-888888888882",
    request_id: "77777777-7777-7777-7777-777777777772", // Pending request 2 (urgent)
    provider_id: null,
    status: "active",
    delivery_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    delivery_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 min from now
    message: "Puedo llegar pronto",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  // Cancelled offer - for re-submission testing (Story 8-4 AC8.4.5)
  {
    id: "88888888-8888-8888-8888-888888888883",
    request_id: "77777777-7777-7777-7777-777777777773", // Pending request 3
    provider_id: null,
    status: "cancelled",
    delivery_window_start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Already expired
    message: "Cancelé esta oferta",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  // Accepted offer - for "Ver Entrega" button testing
  {
    id: "88888888-8888-8888-8888-888888888884",
    request_id: "77777777-7777-7777-7777-777777777774", // Accepted request
    provider_id: null,
    status: "accepted",
    delivery_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    message: "Confirmado",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accepted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Expired offer - for history section
  {
    id: "88888888-8888-8888-8888-888888888885",
    request_id: "77777777-7777-7777-7777-777777777771", // Same as first pending (shows history)
    provider_id: null,
    status: "expired",
    delivery_window_start: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    delivery_window_end: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Expired 3 hours ago
    message: "Oferta antigua",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

// Service areas for the provider - using comuna IDs (not display names)
// These must match the comuna_id values used in OFFER_TEST_REQUESTS
const PROVIDER_SERVICE_AREA_IDS = ["santiago", "las-condes", "providencia", "vitacura"];

// Map of id -> display name for creating comunas if needed
const TEST_COMUNAS = [
  { id: "santiago", name: "Santiago", region: "Metropolitana" },
  { id: "las-condes", name: "Las Condes", region: "Metropolitana" },
  { id: "providencia", name: "Providencia", region: "Metropolitana" },
  { id: "vitacura", name: "Vitacura", region: "Metropolitana" },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");

async function main() {
  console.log("🧪 Offer E2E Test Data Seed Script");
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
      await cleanOfferTestData(supabase);
    } else {
      const providerId = await getOrCreateTestProvider(supabase);
      await ensureProviderServiceAreas(supabase, providerId);
      await seedOfferTestRequests(supabase, providerId);
      await seedOfferTestOffers(supabase, providerId);
      await verifyOfferTestData(supabase);
    }

    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateTestProvider(supabase: any): Promise<string> {
  console.log("\n👤 Setting up test provider...");

  // Find the dev login provider
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devProvider = existingUsers?.users?.find((u: any) => u.email === DEV_PROVIDER_EMAIL);

  if (!devProvider) {
    throw new Error(
      `Dev provider ${DEV_PROVIDER_EMAIL} not found. Run 'npm run seed:local' first to create test users.`
    );
  }

  const providerId = devProvider.id;
  console.log(`  ✓ Found dev provider: ${DEV_PROVIDER_EMAIL} (ID: ${providerId})`);

  // Ensure provider is verified (approved)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      verification_status: "approved",
      is_available: true,
      role: "supplier",
    })
    .eq("id", providerId);

  if (profileError) {
    throw new Error(`Failed to update provider profile: ${profileError.message}`);
  }

  console.log("  ✓ Provider is verified and available");
  return providerId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureProviderServiceAreas(supabase: any, providerId: string) {
  console.log("\n📍 Setting up provider service areas...");

  // Check if our test comunas exist by ID
  const { data: comunas, error: comunaError } = await supabase
    .from("comunas")
    .select("id, name")
    .in("id", PROVIDER_SERVICE_AREA_IDS);

  if (comunaError) {
    console.warn(`  ⚠ Failed to fetch comunas: ${comunaError.message}`);
    console.warn("  → Service areas might not be configured. Tests may skip.");
    return;
  }

  if (!comunas || comunas.length < PROVIDER_SERVICE_AREA_IDS.length) {
    console.warn("  ⚠ Missing comunas. Creating test comunas...");

    // Create test comunas if they don't exist (using id as primary key)
    for (const comuna of TEST_COMUNAS) {
      const { error: insertError } = await supabase
        .from("comunas")
        .upsert(comuna, { onConflict: "id" });

      if (insertError) {
        console.warn(`  ⚠ Failed to create comuna ${comuna.id}: ${insertError.message}`);
      } else {
        console.log(`  ✓ Created comuna: ${comuna.name} (id: ${comuna.id})`);
      }
    }
  }

  // Link provider to service areas
  const { data: finalComunas } = await supabase
    .from("comunas")
    .select("id, name")
    .in("id", PROVIDER_SERVICE_AREA_IDS);

  if (finalComunas && finalComunas.length > 0) {
    // Delete existing service areas for this provider first
    await supabase.from("provider_service_areas").delete().eq("provider_id", providerId);

    // Insert new service areas
    const serviceAreaRecords = finalComunas.map((c: { id: string; name: string }) => ({
      provider_id: providerId,
      comuna_id: c.id,
    }));

    const { error: insertError } = await supabase
      .from("provider_service_areas")
      .insert(serviceAreaRecords);

    if (insertError) {
      console.warn(`  ⚠ Failed to link service areas: ${insertError.message}`);
    } else {
      console.log(`  ✓ Linked ${finalComunas.length} service areas to provider`);
      for (const c of finalComunas) {
        console.log(`    - ${c.name} (${c.id})`);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedOfferTestRequests(supabase: any, providerId: string) {
  console.log("\n📝 Seeding offer test water requests...");

  // Map requests - set supplier_id for accepted request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsToSeed = OFFER_TEST_REQUESTS.map((req): any => {
    return {
      ...req,
      supplier_id: req.status === "accepted" ? providerId : req.supplier_id,
    };
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
    console.log(`    - [${req.status}${req.is_urgent ? " URGENT" : ""}] ${req.guest_name} - ${req.amount}L (${req.comuna_id})`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedOfferTestOffers(supabase: any, providerId: string) {
  console.log("\n💰 Seeding offer test offers...");

  // Map offers to the actual provider ID
  const offersToSeed = OFFER_TEST_OFFERS.map((offer) => ({
    ...offer,
    provider_id: providerId,
  }));

  // Delete existing offers for these requests first (avoid unique constraint issues)
  const requestIds = OFFER_TEST_OFFERS.map((o) => o.request_id);
  await supabase.from("offers").delete().in("request_id", requestIds).eq("provider_id", providerId);

  // Insert new offers
  const { error } = await supabase.from("offers").upsert(offersToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed offers: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${offersToSeed.length} offers`);

  // Group by status
  const statusCounts = offersToSeed.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`    - ${status}: ${count}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanOfferTestData(supabase: any) {
  console.log("\n🗑️  Cleaning offer test data...");

  // Delete offers first (foreign key to water_requests)
  const offerIds = OFFER_TEST_OFFERS.map((o) => o.id);
  const { error: offerError, count: offerCount } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .in("id", offerIds);

  if (offerError) {
    console.error(`  ✗ Failed to delete offers: ${offerError.message}`);
  } else {
    console.log(`  ✓ Deleted ${offerCount || 0} offer test offers`);
  }

  // Delete water requests
  const requestIds = OFFER_TEST_REQUESTS.map((r) => r.id);
  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} offer test requests`);
  }

  console.log("\n  Note: Provider profile and service areas are preserved.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyOfferTestData(supabase: any) {
  console.log("\n🔍 Verifying offer test data...");

  // Check requests
  const { data: requests } = await supabase
    .from("water_requests")
    .select("id, status, guest_name, amount, comuna_id")
    .like("tracking_token", "offer-test-%");

  console.log(`  ✓ Found ${requests?.length || 0} offer test requests:`);
  for (const req of requests || []) {
    console.log(`    - [${req.status}] ${req.guest_name} - ${req.amount}L (${req.comuna_id})`);
  }

  // Check offers by status
  const { data: activeOffers } = await supabase
    .from("offers")
    .select("id, status")
    .in("id", OFFER_TEST_OFFERS.map((o) => o.id))
    .eq("status", "active");

  const { data: cancelledOffers } = await supabase
    .from("offers")
    .select("id, status")
    .in("id", OFFER_TEST_OFFERS.map((o) => o.id))
    .eq("status", "cancelled");

  const { data: acceptedOffers } = await supabase
    .from("offers")
    .select("id, status")
    .in("id", OFFER_TEST_OFFERS.map((o) => o.id))
    .eq("status", "accepted");

  const { data: expiredOffers } = await supabase
    .from("offers")
    .select("id, status")
    .in("id", OFFER_TEST_OFFERS.map((o) => o.id))
    .eq("status", "expired");

  console.log(`  ✓ Offers by status:`);
  console.log(`    - Active (can withdraw): ${activeOffers?.length || 0}`);
  console.log(`    - Cancelled (can re-submit): ${cancelledOffers?.length || 0}`);
  console.log(`    - Accepted (Ver Entrega): ${acceptedOffers?.length || 0}`);
  console.log(`    - Expired (history): ${expiredOffers?.length || 0}`);

  // Check provider service areas
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devProvider = existingUsers?.users?.find((u: any) => u.email === DEV_PROVIDER_EMAIL);

  if (devProvider) {
    const { data: serviceAreas } = await supabase
      .from("provider_service_areas")
      .select("comuna_id, comunas(name)")
      .eq("provider_id", devProvider.id);

    console.log(`  ✓ Provider service areas: ${serviceAreas?.length || 0}`);
  }
}

main();
