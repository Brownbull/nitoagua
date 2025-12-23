#!/usr/bin/env npx ts-node

/**
 * Offer E2E Test Data Seeding Script
 *
 * Seeds the database with data specifically for testing offer-related flows:
 * - Story 8-3: Provider's Active Offers List
 * - Story 8-4: Withdraw Pending Offer
 * - Story 10-1: Consumer Offer List View (consumer-facing offers)
 *
 * Creates:
 * - An approved provider with service areas configured
 * - Pending requests that the provider can see
 * - Active offers (pending) that can be withdrawn
 * - Cancelled offers (for re-submission testing)
 * - Accepted offers (for "Ver Entrega" button testing)
 * - Consumer-facing offers on seeded pending requests (for Story 10-1 tests)
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
// NOTE: comuna_id references comunas.id - must match COMUNAS constant in provider-registration.ts
// Using Villarrica-area comunas (target market): villarrica, pucon, lican-ray, curarrehue, freire
// COORDINATES: Real lat/lng for map testing in Story 8-10
const OFFER_TEST_REQUESTS = [
  {
    id: "77777777-7777-7777-7777-777777777771",
    tracking_token: "offer-test-pending-1",
    status: "pending",
    guest_phone: "+56987651001",
    guest_name: "Cliente Pendiente 1",
    guest_email: "cliente1@test.local",
    address: "Av. Pedro de Valdivia 100, Villarrica",
    comuna_id: "villarrica", // FK to comunas.id - matches COMUNAS constant
    amount: 1000,
    special_instructions: "Para test de ofertas - activa",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    latitude: -39.2768, // Villarrica center
    longitude: -72.2274,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: "77777777-7777-7777-7777-777777777772",
    tracking_token: "offer-test-pending-2",
    status: "pending",
    guest_phone: "+56987651002",
    guest_name: "Cliente Pendiente 2",
    guest_email: "cliente2@test.local",
    address: "Camino a Caburgua 200, Pucón",
    comuna_id: "pucon", // FK to comunas.id - matches COMUNAS constant
    amount: 5000,
    special_instructions: "Urgente - para test",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    latitude: -39.2823, // Pucón center
    longitude: -71.9545,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    id: "77777777-7777-7777-7777-777777777773",
    tracking_token: "offer-test-pending-3",
    status: "pending",
    guest_phone: "+56987651003",
    guest_name: "Cliente Pendiente 3",
    guest_email: "cliente3@test.local",
    address: "Parcela 50, Licán Ray",
    comuna_id: "lican-ray", // FK to comunas.id - matches COMUNAS constant
    amount: 10000,
    special_instructions: "Para reenvío de oferta",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    latitude: -39.4989, // Licán Ray - south of Villarrica
    longitude: -72.1194,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "77777777-7777-7777-7777-777777777774",
    tracking_token: "offer-test-accepted",
    status: "accepted",
    guest_phone: "+56987651004",
    guest_name: "Cliente Aceptado",
    guest_email: "cliente4@test.local",
    address: "Camino Internacional, Curarrehue",
    comuna_id: "curarrehue", // FK to comunas.id - matches COMUNAS constant
    amount: 1000,
    special_instructions: "Entrega confirmada",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    latitude: -39.3578, // Curarrehue - east toward Argentina border
    longitude: -71.5874,
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

// =============================================================================
// CONSUMER-FACING OFFERS (Story 10-1)
// =============================================================================

// Secondary test provider for consumer-facing tests (multiple offers from different providers)
const SECONDARY_PROVIDER = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  email: "aguatero2@nitoagua.local",
  name: "Pedro Aguatero",
  phone: "+56912345002",
};

const TERTIARY_PROVIDER = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  email: "aguatero3@nitoagua.local",
  name: "María Cisterna",
  phone: "+56912345003",
};

// Consumer-facing offers for SEEDED_PENDING_REQUEST (id: 33333333-3333-3333-3333-333333333333)
// These are used by consumer-offers.spec.ts tests (Story 10-1)
const CONSUMER_FACING_OFFERS = [
  // Offer 1: Earliest delivery (should appear first in sorted list)
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccc01",
    request_id: "33333333-3333-3333-3333-333333333333", // SEEDED_PENDING_REQUEST.id
    provider_id: SECONDARY_PROVIDER.id,
    status: "active",
    delivery_window_start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    delivery_window_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 min from now
    message: "Puedo llegar muy pronto",
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
  },
  // Offer 2: Medium delivery time (should appear second)
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccc02",
    request_id: "33333333-3333-3333-3333-333333333333", // SEEDED_PENDING_REQUEST.id
    provider_id: TERTIARY_PROVIDER.id,
    status: "active",
    delivery_window_start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    delivery_window_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 min from now
    message: "Tengo disponibilidad esta tarde",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  // Offer 3: Latest delivery time (should appear last) - from dev provider
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccc03",
    request_id: "33333333-3333-3333-3333-333333333333", // SEEDED_PENDING_REQUEST.id
    provider_id: null, // Will be mapped to dev provider
    status: "active",
    delivery_window_start: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    delivery_window_end: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(), // 7 hours from now
    expires_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 90 min from now
    message: "Disponible en la tarde-noche",
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  },
];

// Service areas for the provider - using comuna IDs (not display names)
// These must match the comuna_id values used in OFFER_TEST_REQUESTS
// AND match the COMUNAS constant in src/lib/validations/provider-registration.ts
const PROVIDER_SERVICE_AREA_IDS = ["villarrica", "pucon", "lican-ray", "curarrehue"];

// =============================================================================
// PROVIDER NOTIFICATIONS (Story 11-3: P8 - Acceptance Notification)
// =============================================================================

// Notification for accepted offer - provider sees "¡Tu oferta fue aceptada!"
// Using valid UUIDs (n000... pattern for notifications)
const OFFER_TEST_NOTIFICATIONS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    user_id: null, // Will be mapped to dev provider
    type: "offer_accepted",
    title: "¡Tu oferta fue aceptada!",
    message: "Cliente Aceptado ha aceptado tu oferta para 1000L en Curarrehue",
    read: false,
    data: {
      request_id: "77777777-7777-7777-7777-777777777774",
      offer_id: "88888888-8888-8888-8888-888888888884",
      customer_name: "Cliente Aceptado",
      amount: 1000,
      address: "Camino Internacional, Curarrehue",
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  // Older read notification for history
  {
    id: "a0000000-0000-0000-0000-000000000002",
    user_id: null, // Will be mapped to dev provider
    type: "offer_accepted",
    title: "¡Tu oferta fue aceptada!",
    message: "Cliente Histórico ha aceptado tu oferta para 5000L en Villarrica",
    read: true,
    read_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Read 1 day ago
    data: {
      request_id: "77777777-7777-7777-7777-777777777770",
      offer_id: "88888888-8888-8888-8888-888888888880",
      customer_name: "Cliente Histórico",
      amount: 5000,
      address: "Av. Pedro de Valdivia 50, Villarrica",
    },
    created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
  },
];

// Map of id -> display name for creating comunas if needed
// These are the Villarrica-area comunas from the COMUNAS constant
const TEST_COMUNAS = [
  { id: "villarrica", name: "Villarrica", region: "Araucanía" },
  { id: "pucon", name: "Pucón", region: "Araucanía" },
  { id: "lican-ray", name: "Licán Ray", region: "Araucanía" },
  { id: "curarrehue", name: "Curarrehue", region: "Araucanía" },
  { id: "freire", name: "Freire", region: "Araucanía" },
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
      // Consumer-facing offers (Story 10-1)
      await ensureConsumerFacingProviders(supabase);
      await seedConsumerFacingOffers(supabase, providerId);
      // Provider notifications (Story 11-3: P8)
      await seedProviderNotifications(supabase, providerId);
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
async function ensureConsumerFacingProviders(supabase: any) {
  console.log("\n👥 Setting up consumer-facing test providers...");

  // Create secondary and tertiary providers for consumer-facing offers
  for (const provider of [SECONDARY_PROVIDER, TERTIARY_PROVIDER]) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = existingUsers?.users?.find((u: any) => u.email === provider.email);

    let userId = provider.id;

    if (!existingUser) {
      // Create auth user with specific ID
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: provider.email,
        password: "TestProvider123!",
        email_confirm: true,
        user_metadata: { name: provider.name },
      });

      if (createError) {
        console.warn(`  ⚠ Failed to create ${provider.email}: ${createError.message}`);
        continue;
      }

      userId = newUser.user.id;
      console.log(`  ✓ Created auth user: ${provider.email} (ID: ${userId})`);
    } else {
      userId = existingUser.id;
      console.log(`  ✓ Found existing user: ${provider.email} (ID: ${userId})`);
    }

    // Upsert profile as verified provider
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        name: provider.name,
        phone: provider.phone,
        role: "supplier",
        verification_status: "approved",
        is_available: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.warn(`  ⚠ Failed to update profile for ${provider.email}: ${profileError.message}`);
    } else {
      console.log(`  ✓ Provider profile verified: ${provider.name}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedConsumerFacingOffers(supabase: any, devProviderId: string) {
  console.log("\n🛒 Seeding consumer-facing offers (Story 10-1)...");

  // Get actual provider IDs (may differ from constants if users were created fresh)
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const secondaryUser = existingUsers?.users?.find((u: any) => u.email === SECONDARY_PROVIDER.email);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tertiaryUser = existingUsers?.users?.find((u: any) => u.email === TERTIARY_PROVIDER.email);

  const secondaryProviderId = secondaryUser?.id || SECONDARY_PROVIDER.id;
  const tertiaryProviderId = tertiaryUser?.id || TERTIARY_PROVIDER.id;

  // Map offers to actual provider IDs
  const offersToSeed = CONSUMER_FACING_OFFERS.map((offer) => {
    let providerId = offer.provider_id;
    if (providerId === SECONDARY_PROVIDER.id) {
      providerId = secondaryProviderId;
    } else if (providerId === TERTIARY_PROVIDER.id) {
      providerId = tertiaryProviderId;
    } else if (providerId === null) {
      providerId = devProviderId;
    }
    return {
      ...offer,
      provider_id: providerId,
    };
  });

  // Delete existing offers for the consumer-facing request
  await supabase
    .from("offers")
    .delete()
    .eq("request_id", "33333333-3333-3333-3333-333333333333");

  // Insert new offers
  const { error } = await supabase.from("offers").upsert(offersToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed consumer-facing offers: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${offersToSeed.length} consumer-facing offers for SEEDED_PENDING_REQUEST`);
  for (const offer of offersToSeed) {
    const providerName =
      offer.provider_id === devProviderId
        ? "Dev Provider"
        : offer.provider_id === secondaryProviderId
        ? SECONDARY_PROVIDER.name
        : TERTIARY_PROVIDER.name;
    console.log(`    - [${offer.status}] ${providerName}: ${offer.message}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedProviderNotifications(supabase: any, providerId: string) {
  console.log("\n🔔 Seeding provider notifications (Story 11-3: P8)...");

  // Map notifications to the actual provider ID
  const notificationsToSeed = OFFER_TEST_NOTIFICATIONS.map((notification) => ({
    ...notification,
    user_id: providerId,
  }));

  // Delete existing test notifications for this provider
  const notificationIds = OFFER_TEST_NOTIFICATIONS.map((n) => n.id);
  await supabase.from("notifications").delete().in("id", notificationIds);

  // Insert new notifications
  const { error } = await supabase.from("notifications").upsert(notificationsToSeed, { onConflict: "id" });

  if (error) {
    console.warn(`  ⚠ Failed to seed notifications: ${error.message}`);
    console.warn("  → Notifications table may not exist or RLS blocking. P8 tests may skip.");
  } else {
    console.log(`  ✓ Seeded ${notificationsToSeed.length} provider notifications`);
    for (const n of notificationsToSeed) {
      console.log(`    - [${n.read ? "read" : "unread"}] ${n.title}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanOfferTestData(supabase: any) {
  console.log("\n🗑️  Cleaning offer test data...");

  // Delete provider notifications (Story 11-3)
  const notificationIds = OFFER_TEST_NOTIFICATIONS.map((n) => n.id);
  const { error: notifError, count: notifCount } = await supabase
    .from("notifications")
    .delete({ count: "exact" })
    .in("id", notificationIds);

  if (notifError) {
    console.warn(`  ⚠ Failed to delete notifications: ${notifError.message}`);
  } else {
    console.log(`  ✓ Deleted ${notifCount || 0} provider notifications`);
  }

  // Delete consumer-facing offers (Story 10-1)
  const consumerOfferIds = CONSUMER_FACING_OFFERS.map((o) => o.id);
  const { error: consumerOfferError, count: consumerOfferCount } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .in("id", consumerOfferIds);

  if (consumerOfferError) {
    console.error(`  ✗ Failed to delete consumer-facing offers: ${consumerOfferError.message}`);
  } else {
    console.log(`  ✓ Deleted ${consumerOfferCount || 0} consumer-facing offers`);
  }

  // Delete provider-facing offers first (foreign key to water_requests)
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

  console.log(`  ✓ Provider-facing offers by status:`);
  console.log(`    - Active (can withdraw): ${activeOffers?.length || 0}`);
  console.log(`    - Cancelled (can re-submit): ${cancelledOffers?.length || 0}`);
  console.log(`    - Accepted (Ver Entrega): ${acceptedOffers?.length || 0}`);
  console.log(`    - Expired (history): ${expiredOffers?.length || 0}`);

  // Check consumer-facing offers (Story 10-1)
  const { data: consumerOffers } = await supabase
    .from("offers")
    .select("id, status, provider_id, profiles:provider_id(name)")
    .eq("request_id", "33333333-3333-3333-3333-333333333333")
    .eq("status", "active");

  console.log(`  ✓ Consumer-facing offers (SEEDED_PENDING_REQUEST): ${consumerOffers?.length || 0}`);
  for (const offer of consumerOffers || []) {
    const profile = offer.profiles as { name?: string } | null;
    console.log(`    - ${profile?.name || "Unknown"}`);
  }

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

    // Check provider notifications (Story 11-3: P8)
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, type, title, read")
      .eq("user_id", devProvider.id)
      .eq("type", "offer_accepted");

    console.log(`  ✓ Provider notifications (offer_accepted): ${notifications?.length || 0}`);
    for (const n of notifications || []) {
      console.log(`    - [${n.read ? "read" : "unread"}] ${n.title}`);
    }
  }
}

main();
