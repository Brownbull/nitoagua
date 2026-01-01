#!/usr/bin/env npx ts-node

/**
 * Admin Orders & Settlement E2E Test Data Seeding Script
 *
 * Seeds the database with data specifically for testing admin orders and settlement workflows (Story 11-19):
 * - Water requests in various states (pending, accepted, delivered, cancelled)
 * - Commission ledger entries for settlement tracking
 * - Withdrawal requests (pending, completed, rejected)
 *
 * Workflows tested:
 * - A5: View All Orders - See orders dashboard with filters
 * - A6: Order Details - View full order information
 * - A7: Settlement Queue - See pending settlement requests
 * - A8: Approve Settlement - Process provider payout
 * - A9: Reject Settlement - Reject with reason
 *
 * Usage:
 *   npm run seed:admin-orders         # Seed admin orders test data
 *   npm run seed:admin-orders:clean   # Remove admin orders test data
 *
 * Or directly:
 *   npx ts-node scripts/local/seed-admin-orders-tests.ts [--clean]
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
// ADMIN ORDERS TEST DATA CONSTANTS
// =============================================================================

// The dev login test provider - use this for E2E tests
const DEV_PROVIDER_EMAIL = "supplier@nitoagua.cl";
const DEV_CONSUMER_EMAIL = "consumer@nitoagua.cl";

// Helper to create dates relative to now
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Water requests for orders management testing
 *
 * Valid DB statuses: 'pending', 'accepted', 'delivered', 'cancelled', 'no_offers'
 * (The UI may display derived statuses like "en_route" based on accepted_at/delivered_at times)
 */
const ORDERS_TEST_REQUESTS = [
  // PENDING ORDERS - waiting for offers
  {
    id: "00000000-0000-4000-a000-000000000001",
    tracking_token: "admin-test-pending-1",
    status: "pending",
    guest_phone: "+56912340001",
    guest_name: "Cliente Pendiente Uno",
    guest_email: "pendiente1@test.local",
    address: "Av. Providencia 1234, Providencia",
    amount: 1000, // $20,000
    special_instructions: "Portón negro al fondo",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: null,
    accepted_at: null,
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: hoursAgo(2),
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    tracking_token: "admin-test-pending-2",
    status: "pending", // Urgent pending order
    guest_phone: "+56912340002",
    guest_name: "Cliente Urgente",
    guest_email: "urgente@test.local",
    address: "Los Leones 2500, Las Condes",
    amount: 5000, // $75,000
    special_instructions: "Urgente - llamar al llegar",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    delivery_window: null,
    accepted_at: null,
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: hoursAgo(4),
  },

  // ACCEPTED ORDER - provider has been assigned
  {
    id: "00000000-0000-4000-a000-000000000003",
    tracking_token: "admin-test-accepted-1",
    status: "accepted",
    guest_phone: "+56912340003",
    guest_name: "Cliente Asignado",
    guest_email: "asignado@test.local",
    address: "Manuel Montt 456, Ñuñoa",
    amount: 1000, // $20,000
    special_instructions: "Sin instrucciones especiales",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "14:00 - 16:00",
    accepted_at: hoursAgo(1),
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: hoursAgo(3),
  },

  // DELIVERED ORDERS - for commission tracking
  {
    id: "00000000-0000-4000-a000-000000000004",
    tracking_token: "admin-test-delivered-1",
    status: "delivered",
    guest_phone: "+56912340004",
    guest_name: "Cliente Entregado Uno",
    guest_email: "entregado1@test.local",
    address: "Tobalaba 800, Providencia",
    amount: 1000, // $20,000
    special_instructions: "Entrega exitosa",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "10:00 - 12:00",
    accepted_at: daysAgo(2),
    delivered_at: daysAgo(2),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(2),
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    tracking_token: "admin-test-delivered-2",
    status: "delivered",
    guest_phone: "+56912340005",
    guest_name: "Cliente Entregado Dos",
    guest_email: "entregado2@test.local",
    address: "Av. Apoquindo 4500, Las Condes",
    amount: 5000, // $75,000
    special_instructions: "Pedido grande",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "08:00 - 10:00",
    accepted_at: daysAgo(5),
    delivered_at: daysAgo(5),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(5),
  },
  {
    id: "00000000-0000-4000-a000-000000000006",
    tracking_token: "admin-test-delivered-3",
    status: "delivered",
    guest_phone: "+56912340006",
    guest_name: "María García López",
    guest_email: "maria.garcia@test.local",
    address: "Pedro de Valdivia 1500, Providencia",
    amount: 100, // $5,000
    special_instructions: "Entrega regular",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "16:00 - 18:00",
    accepted_at: daysAgo(10),
    delivered_at: daysAgo(10),
    cancelled_at: null,
    cancellation_reason: null,
    created_at: daysAgo(10),
  },

  // CANCELLED ORDER
  {
    id: "00000000-0000-4000-a000-000000000007",
    tracking_token: "admin-test-cancelled-1",
    status: "cancelled",
    guest_phone: "+56912340007",
    guest_name: "Cliente Cancelado",
    guest_email: "cancelado@test.local",
    address: "Irarrázaval 3000, Ñuñoa",
    amount: 1000, // $20,000
    special_instructions: "Ya no necesito",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: null,
    accepted_at: null,
    delivered_at: null,
    cancelled_at: hoursAgo(6),
    cancellation_reason: "Cliente cambió de opinión",
    created_at: daysAgo(1),
  },
];

/**
 * Commission ledger entries for settlement tracking
 * These show pending commissions for the provider
 */
const ORDERS_TEST_LEDGER = [
  // Commission owed for delivered orders
  {
    id: "11110001-0001-4000-a000-000000000001",
    provider_id: null, // Will be set
    request_id: "00000000-0000-4000-a000-000000000004",
    type: "commission_owed",
    amount: 2000, // 10% of $20,000
    description: "Comisión por entrega - Cliente Entregado Uno",
    created_at: daysAgo(2),
  },
  {
    id: "11110001-0001-4000-a000-000000000002",
    provider_id: null,
    request_id: "00000000-0000-4000-a000-000000000005",
    type: "commission_owed",
    amount: 7500, // 10% of $75,000
    description: "Comisión por entrega - Cliente Entregado Dos",
    created_at: daysAgo(5),
  },
  {
    id: "11110001-0001-4000-a000-000000000003",
    provider_id: null,
    request_id: "00000000-0000-4000-a000-000000000006",
    type: "commission_owed",
    amount: 500, // 10% of $5,000
    description: "Comisión por entrega - María García López",
    created_at: daysAgo(10),
  },
  // Partial payment already made - to show balance calculation
  {
    id: "11110001-0001-4000-a000-000000000004",
    provider_id: null,
    type: "commission_paid",
    amount: 2000, // Paid for first delivery
    description: "Pago de comisión verificado",
    bank_reference: "TRF-ADMIN-TEST-001",
    created_at: daysAgo(1),
  },
];

/**
 * Withdrawal requests for settlement queue testing
 * Includes pending, completed, and rejected states
 */
const ORDERS_TEST_WITHDRAWALS = [
  // PENDING - waiting for admin approval (will be used for A8/A9 tests)
  {
    id: "22220001-0001-4000-a000-000000000001",
    provider_id: null, // Will be set
    amount: 8000, // Matches remaining commission (7500 + 500)
    receipt_path: null, // No receipt uploaded
    status: "pending",
    processed_by: null,
    processed_at: null,
    bank_reference: null,
    rejection_reason: null,
    created_at: hoursAgo(3),
  },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");

async function main() {
  console.log("🏛️  Admin Orders & Settlement E2E Test Data Seed Script");
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
      await cleanAdminOrdersTestData(supabase);
    } else {
      const providerId = await getTestProvider(supabase);
      await seedOrdersTestRequests(supabase, providerId);
      await seedOrdersTestLedger(supabase, providerId);
      await seedOrdersTestWithdrawals(supabase, providerId);
      await verifyAdminOrdersTestData(supabase, providerId);
    }

    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTestProvider(supabase: any): Promise<string> {
  console.log("\n👤 Finding test provider...");

  // Find the dev login provider
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
   
  const devProvider = existingUsers?.users?.find(
    (u: any) => u.email === DEV_PROVIDER_EMAIL
  );

  if (!devProvider) {
    throw new Error(
      `Dev provider ${DEV_PROVIDER_EMAIL} not found. Run 'npm run seed:local' first to create test users.`
    );
  }

  const providerId = devProvider.id;
  console.log(`  ✓ Found dev provider: ${DEV_PROVIDER_EMAIL}`);
  console.log(`    ID: ${providerId}`);

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
async function seedOrdersTestRequests(supabase: any, providerId: string) {
  console.log("\n📝 Seeding admin orders test water requests...");

  // Map requests - set supplier_id for accepted/delivered orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsToSeed = ORDERS_TEST_REQUESTS.map((req): any => ({
    ...req,
    supplier_id: ["accepted", "delivered"].includes(req.status) ? providerId : null,
  }));

  // Use upsert for idempotency
  const { error } = await supabase
    .from("water_requests")
    .upsert(requestsToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed requests: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${requestsToSeed.length} water requests`);

  // Show breakdown by status
  const statusCounts = requestsToSeed.reduce((acc: Record<string, number>, r: { status: string }) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  console.log("    Status breakdown:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    - ${status}: ${count}`);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedOrdersTestLedger(supabase: any, providerId: string) {
  console.log("\n💳 Seeding commission ledger entries...");

  // Map ledger entries to provider
  const ledgerToSeed = ORDERS_TEST_LEDGER.map((entry) => ({
    ...entry,
    provider_id: providerId,
  }));

  // Delete existing ledger entries for these IDs first
  const ledgerIds = ORDERS_TEST_LEDGER.map((e) => e.id);
  await supabase.from("commission_ledger").delete().in("id", ledgerIds);

  // Insert new entries
  const { error } = await supabase.from("commission_ledger").insert(ledgerToSeed);

  if (error) {
    throw new Error(`Failed to seed ledger: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${ledgerToSeed.length} ledger entries`);

  // Calculate pending balance
  const owed = ledgerToSeed
    .filter((e) => e.type === "commission_owed")
    .reduce((sum, e) => sum + e.amount, 0);
  const paid = ledgerToSeed
    .filter((e) => e.type === "commission_paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const pending = owed - paid;

  console.log(`    - Commission owed: $${owed.toLocaleString("es-CL")} CLP`);
  console.log(`    - Commission paid: $${paid.toLocaleString("es-CL")} CLP`);
  console.log(`    - Pending balance: $${pending.toLocaleString("es-CL")} CLP`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedOrdersTestWithdrawals(supabase: any, providerId: string) {
  console.log("\n💸 Seeding withdrawal requests...");

  // Map withdrawals to provider
  const withdrawalsToSeed = ORDERS_TEST_WITHDRAWALS.map((w) => ({
    ...w,
    provider_id: providerId,
  }));

  // Delete existing withdrawals for these IDs first
  const withdrawalIds = ORDERS_TEST_WITHDRAWALS.map((w) => w.id);
  await supabase.from("withdrawal_requests").delete().in("id", withdrawalIds);

  // Insert new entries
  const { error } = await supabase.from("withdrawal_requests").insert(withdrawalsToSeed);

  if (error) {
    throw new Error(`Failed to seed withdrawals: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${withdrawalsToSeed.length} withdrawal requests`);

  // Show breakdown
  withdrawalsToSeed.forEach((w) => {
    console.log(`    - ${w.status}: $${w.amount.toLocaleString("es-CL")} CLP`);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanAdminOrdersTestData(supabase: any) {
  console.log("\n🗑️  Cleaning admin orders test data...");

  // Delete withdrawals first (no foreign keys blocking)
  const withdrawalIds = ORDERS_TEST_WITHDRAWALS.map((w) => w.id);
  const { error: wrError, count: wrCount } = await supabase
    .from("withdrawal_requests")
    .delete({ count: "exact" })
    .in("id", withdrawalIds);

  if (wrError) {
    console.error(`  ✗ Failed to delete withdrawals: ${wrError.message}`);
  } else {
    console.log(`  ✓ Deleted ${wrCount || 0} withdrawal requests`);
  }

  // Delete ledger entries
  const ledgerIds = ORDERS_TEST_LEDGER.map((e) => e.id);
  const { error: ledgerError, count: ledgerCount } = await supabase
    .from("commission_ledger")
    .delete({ count: "exact" })
    .in("id", ledgerIds);

  if (ledgerError) {
    console.error(`  ✗ Failed to delete ledger entries: ${ledgerError.message}`);
  } else {
    console.log(`  ✓ Deleted ${ledgerCount || 0} ledger entries`);
  }

  // Delete water requests
  const requestIds = ORDERS_TEST_REQUESTS.map((r) => r.id);
  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} water requests`);
  }

  console.log("\n  Note: Provider profile is preserved.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyAdminOrdersTestData(supabase: any, providerId: string) {
  console.log("\n🔍 Verifying admin orders test data...");

  // Check orders by status
  const { data: allRequests } = await supabase
    .from("water_requests")
    .select("status")
    .like("tracking_token", "admin-test-%");

  console.log(`  ✓ Found ${allRequests?.length || 0} admin test water requests`);

  if (allRequests && allRequests.length > 0) {
    const statusCounts = allRequests.reduce((acc: Record<string, number>, r: { status: string }) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    console.log("    Status breakdown:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`    - ${status}: ${count}`);
    });
  }

  // Check ledger balance
  const { data: ledgerEntries } = await supabase
    .from("commission_ledger")
    .select("type, amount")
    .eq("provider_id", providerId);

  let owed = 0;
  let paid = 0;
  for (const entry of ledgerEntries || []) {
    if (entry.type === "commission_owed") owed += entry.amount;
    if (entry.type === "commission_paid") paid += entry.amount;
  }

  console.log(`  ✓ Ledger balance:`);
  console.log(`    - Owed: $${owed.toLocaleString("es-CL")} CLP`);
  console.log(`    - Paid: $${paid.toLocaleString("es-CL")} CLP`);
  console.log(`    - Pending: $${(owed - paid).toLocaleString("es-CL")} CLP`);

  // Check pending withdrawals
  const { data: pendingWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("id, amount, status")
    .eq("provider_id", providerId)
    .eq("status", "pending");

  console.log(`  ✓ Pending withdrawals: ${pendingWithdrawals?.length || 0}`);
  if (pendingWithdrawals && pendingWithdrawals.length > 0) {
    pendingWithdrawals.forEach((w: { id: string; amount: number }) => {
      console.log(`    - ID: ${w.id.slice(0, 8)}... Amount: $${w.amount.toLocaleString("es-CL")} CLP`);
    });
  }
}

main();
