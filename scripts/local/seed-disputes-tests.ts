#!/usr/bin/env npx ts-node

/**
 * Admin Disputes E2E Test Data Seeding Script
 *
 * Seeds the database with data specifically for testing admin dispute resolution (Story 12.7-6):
 * - Water requests that have been delivered (prerequisites for disputes)
 * - Disputes in various states (open, under_review, resolved_consumer, resolved_provider)
 *
 * Workflows tested:
 * - AC12.7.6.1: Dispute list view with navigation and filters
 * - AC12.7.6.2: Dispute detail view with order info and timeline
 * - AC12.7.6.3: Resolution actions with confirmation
 * - AC12.7.6.4: Notifications on resolution
 *
 * Usage:
 *   npm run seed:disputes         # Seed disputes test data
 *   npm run seed:disputes:clean   # Remove disputes test data
 *
 * Or directly:
 *   npx ts-node scripts/local/seed-disputes-tests.ts [--clean]
 *
 * NOTE: Requires local Supabase running (npx supabase start)
 *       Uses the dev login test users: consumer@nitoagua.cl, supplier@nitoagua.cl
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
// DISPUTES TEST DATA CONSTANTS
// =============================================================================

// The dev login test users
const DEV_PROVIDER_EMAIL = "supplier@nitoagua.cl";
const DEV_CONSUMER_EMAIL = "consumer@nitoagua.cl";

// Helper to create dates relative to now
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Water requests for dispute testing - all delivered status
 * These are the orders that disputes will be filed against
 */
const DISPUTES_TEST_REQUESTS = [
  // Request for OPEN dispute
  {
    id: "d1sp0000-0000-4000-a000-000000000001",
    tracking_token: "dispute-test-delivered-1",
    status: "delivered",
    guest_phone: "+56912340101",
    guest_name: "Cliente Disputa Abierta",
    guest_email: "disputa1@test.local",
    address: "Av. Providencia 1234, Providencia",
    amount: 1000, // $20,000
    special_instructions: "Entrega problemática",
    is_urgent: false,
    consumer_id: null, // Will be set to consumer ID
    supplier_id: null, // Will be set to provider ID
    delivery_window: "10:00 - 12:00",
    accepted_at: daysAgo(3),
    delivered_at: daysAgo(2),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(4),
  },
  // Request for UNDER_REVIEW dispute
  {
    id: "d1sp0000-0000-4000-a000-000000000002",
    tracking_token: "dispute-test-delivered-2",
    status: "delivered",
    guest_phone: "+56912340102",
    guest_name: "Cliente En Revisión",
    guest_email: "disputa2@test.local",
    address: "Los Leones 2500, Las Condes",
    amount: 5000, // $75,000
    special_instructions: "Cantidad incorrecta reportada",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "14:00 - 16:00",
    accepted_at: daysAgo(5),
    delivered_at: daysAgo(4),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(6),
  },
  // Request for RESOLVED_CONSUMER dispute
  {
    id: "d1sp0000-0000-4000-a000-000000000003",
    tracking_token: "dispute-test-delivered-3",
    status: "delivered",
    guest_phone: "+56912340103",
    guest_name: "Cliente Resuelto Favor",
    guest_email: "disputa3@test.local",
    address: "Manuel Montt 456, Ñuñoa",
    amount: 1000, // $20,000
    special_instructions: "Disputa resuelta a favor",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "08:00 - 10:00",
    accepted_at: daysAgo(10),
    delivered_at: daysAgo(9),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(11),
  },
  // Request for RESOLVED_PROVIDER dispute
  {
    id: "d1sp0000-0000-4000-a000-000000000004",
    tracking_token: "dispute-test-delivered-4",
    status: "delivered",
    guest_phone: "+56912340104",
    guest_name: "Cliente Proveedor Razón",
    guest_email: "disputa4@test.local",
    address: "Tobalaba 800, Providencia",
    amount: 100, // $5,000
    special_instructions: "Proveedor tenía razón",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "16:00 - 18:00",
    accepted_at: daysAgo(8),
    delivered_at: daysAgo(7),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(9),
  },
  // Extra OPEN dispute for testing resolution flow
  {
    id: "d1sp0000-0000-4000-a000-000000000005",
    tracking_token: "dispute-test-delivered-5",
    status: "delivered",
    guest_phone: "+56912340105",
    guest_name: "Cliente Para Resolver",
    guest_email: "disputa5@test.local",
    address: "Av. Apoquindo 4500, Las Condes",
    amount: 5000, // $75,000
    special_instructions: "Para prueba de resolución",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "12:00 - 14:00",
    accepted_at: daysAgo(2),
    delivered_at: daysAgo(1),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(3),
  },
];

/**
 * Disputes for admin testing
 * Covers all status types for filter testing
 */
const DISPUTES_TEST_DATA = [
  // OPEN dispute - not_delivered type
  {
    id: "d1spt001-0000-4000-a000-000000000001",
    request_id: "d1sp0000-0000-4000-a000-000000000001",
    consumer_id: null, // Will be set
    provider_id: null, // Will be set
    dispute_type: "not_delivered",
    description: "El proveedor marcó como entregado pero nunca llegó el agua. Estuve esperando todo el día.",
    evidence_url: null,
    status: "open",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  // UNDER_REVIEW dispute - wrong_quantity type
  {
    id: "d1spt001-0000-4000-a000-000000000002",
    request_id: "d1sp0000-0000-4000-a000-000000000002",
    consumer_id: null,
    provider_id: null,
    dispute_type: "wrong_quantity",
    description: "Pedí 5000 litros pero solo llegaron aproximadamente 3000. El camión se veía medio vacío.",
    evidence_url: null,
    status: "under_review",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(2),
  },
  // RESOLVED_CONSUMER dispute - late_delivery type
  {
    id: "d1spt001-0000-4000-a000-000000000003",
    request_id: "d1sp0000-0000-4000-a000-000000000003",
    consumer_id: null,
    provider_id: null,
    dispute_type: "late_delivery",
    description: "La entrega estaba programada para las 10am pero llegó a las 6pm. Tuve que cancelar mis planes.",
    evidence_url: null,
    status: "resolved_consumer",
    resolution_notes: "Se verificó que la entrega llegó 8 horas tarde. El proveedor no notificó del retraso. Se resuelve a favor del consumidor.",
    resolved_by: null, // Will be set to admin ID
    resolved_at: daysAgo(5),
    created_at: daysAgo(7),
    updated_at: daysAgo(5),
  },
  // RESOLVED_PROVIDER dispute - quality_issue type
  {
    id: "d1spt001-0000-4000-a000-000000000004",
    request_id: "d1sp0000-0000-4000-a000-000000000004",
    consumer_id: null,
    provider_id: null,
    dispute_type: "quality_issue",
    description: "El agua llegó con un color extraño y mal olor.",
    evidence_url: null,
    status: "resolved_provider",
    resolution_notes: "Se revisaron las certificaciones del proveedor y están al día. El consumidor no proporcionó evidencia fotográfica. Se resuelve a favor del proveedor.",
    resolved_by: null, // Will be set to admin ID
    resolved_at: daysAgo(4),
    created_at: daysAgo(6),
    updated_at: daysAgo(4),
  },
  // Another OPEN dispute - other type (for resolution test)
  {
    id: "d1spt001-0000-4000-a000-000000000005",
    request_id: "d1sp0000-0000-4000-a000-000000000005",
    consumer_id: null,
    provider_id: null,
    dispute_type: "other",
    description: "El conductor fue muy grosero y dejó el lugar sucio después de la entrega.",
    evidence_url: null,
    status: "open",
    resolution_notes: null,
    resolved_by: null,
    resolved_at: null,
    created_at: hoursAgo(12),
    updated_at: hoursAgo(12),
  },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");

async function main() {
  console.log("⚠️  Admin Disputes E2E Test Data Seed Script");
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
      await cleanDisputesTestData(supabase);
    } else {
      const { providerId, consumerId, adminId } = await getTestUsers(supabase);
      await seedDisputesTestRequests(supabase, providerId, consumerId);
      await seedDisputesTestData(supabase, providerId, consumerId, adminId);
      await verifyDisputesTestData(supabase);
    }

    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

interface TestUsers {
  providerId: string;
  consumerId: string;
  adminId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTestUsers(supabase: any): Promise<TestUsers> {
  console.log("\n👤 Finding test users...");

  // Find the dev login users
  const { data: existingUsers } = await supabase.auth.admin.listUsers();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devProvider = existingUsers?.users?.find(
    (u: any) => u.email === DEV_PROVIDER_EMAIL
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devConsumer = existingUsers?.users?.find(
    (u: any) => u.email === DEV_CONSUMER_EMAIL
  );

  if (!devProvider) {
    throw new Error(
      `Dev provider ${DEV_PROVIDER_EMAIL} not found. Run 'npm run seed:local' first to create test users.`
    );
  }

  if (!devConsumer) {
    throw new Error(
      `Dev consumer ${DEV_CONSUMER_EMAIL} not found. Run 'npm run seed:local' first to create test users.`
    );
  }

  console.log(`  ✓ Found dev provider: ${DEV_PROVIDER_EMAIL}`);
  console.log(`  ✓ Found dev consumer: ${DEV_CONSUMER_EMAIL}`);

  // Ensure provider is verified
  await supabase
    .from("profiles")
    .update({
      verification_status: "approved",
      is_available: true,
      role: "supplier",
    })
    .eq("id", devProvider.id);

  // Find an admin user for resolved_by field
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_admin", true)
    .limit(1)
    .single();

  const adminId = adminProfile?.id || devProvider.id; // fallback to provider if no admin
  console.log(`  ✓ Admin user ID: ${adminId.slice(0, 8)}...`);

  return {
    providerId: devProvider.id,
    consumerId: devConsumer.id,
    adminId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedDisputesTestRequests(supabase: any, providerId: string, consumerId: string) {
  console.log("\n📝 Seeding disputes test water requests...");

  // Map requests with user IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsToSeed = DISPUTES_TEST_REQUESTS.map((req): any => ({
    ...req,
    supplier_id: providerId,
    consumer_id: consumerId,
  }));

  // Use upsert for idempotency
  const { error } = await supabase
    .from("water_requests")
    .upsert(requestsToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed requests: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${requestsToSeed.length} water requests for disputes`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedDisputesTestData(
  supabase: any,
  providerId: string,
  consumerId: string,
  adminId: string
) {
  console.log("\n⚠️  Seeding disputes...");

  // Map disputes with user IDs
  const disputesToSeed = DISPUTES_TEST_DATA.map((dispute) => ({
    ...dispute,
    consumer_id: consumerId,
    provider_id: providerId,
    resolved_by: dispute.resolved_by === null && dispute.resolved_at ? adminId : null,
  }));

  // Fix resolved_by for resolved disputes
  disputesToSeed.forEach((d) => {
    if (d.status === "resolved_consumer" || d.status === "resolved_provider") {
      d.resolved_by = adminId;
    }
  });

  // Delete existing disputes for these IDs first (for idempotency)
  const disputeIds = DISPUTES_TEST_DATA.map((d) => d.id);
  await supabase.from("disputes").delete().in("id", disputeIds);

  // Insert new disputes
  const { error } = await supabase.from("disputes").insert(disputesToSeed);

  if (error) {
    throw new Error(`Failed to seed disputes: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${disputesToSeed.length} disputes`);

  // Show breakdown by status
  const statusCounts = disputesToSeed.reduce((acc: Record<string, number>, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  console.log("    Status breakdown:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    - ${status}: ${count}`);
  });

  // Show breakdown by type
  const typeCounts = disputesToSeed.reduce((acc: Record<string, number>, d) => {
    acc[d.dispute_type] = (acc[d.dispute_type] || 0) + 1;
    return acc;
  }, {});

  console.log("    Type breakdown:");
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count}`);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanDisputesTestData(supabase: any) {
  console.log("\n🗑️  Cleaning disputes test data...");

  // Delete disputes first
  const disputeIds = DISPUTES_TEST_DATA.map((d) => d.id);
  const { error: disputeError, count: disputeCount } = await supabase
    .from("disputes")
    .delete({ count: "exact" })
    .in("id", disputeIds);

  if (disputeError) {
    console.error(`  ✗ Failed to delete disputes: ${disputeError.message}`);
  } else {
    console.log(`  ✓ Deleted ${disputeCount || 0} disputes`);
  }

  // Delete water requests
  const requestIds = DISPUTES_TEST_REQUESTS.map((r) => r.id);
  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} water requests`);
  }

  console.log("\n  Note: User profiles are preserved.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyDisputesTestData(supabase: any) {
  console.log("\n🔍 Verifying disputes test data...");

  // Check disputes by status
  const { data: allDisputes } = await supabase
    .from("disputes")
    .select("id, status, dispute_type")
    .in("id", DISPUTES_TEST_DATA.map((d) => d.id));

  console.log(`  ✓ Found ${allDisputes?.length || 0} seeded disputes`);

  if (allDisputes && allDisputes.length > 0) {
    const statusCounts = allDisputes.reduce((acc: Record<string, number>, d: { status: string }) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    console.log("    Status breakdown:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`    - ${status}: ${count}`);
    });
  }

  // Check open disputes specifically (for resolution tests)
  const openDisputes = allDisputes?.filter((d: { status: string }) => d.status === "open") || [];
  console.log(`  ✓ Open disputes available for resolution tests: ${openDisputes.length}`);

  if (openDisputes.length > 0) {
    console.log("    Open dispute IDs:");
    openDisputes.forEach((d: { id: string }) => {
      console.log(`    - ${d.id}`);
    });
  }
}

main();
