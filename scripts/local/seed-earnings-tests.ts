#!/usr/bin/env npx ts-node

/**
 * Earnings Dashboard E2E Test Data Seeding Script
 *
 * Seeds the database with data specifically for testing earnings dashboard (Story 8-6):
 * - Completed deliveries (status='delivered') for the test provider
 * - Commission ledger entries for pending commission display
 * - Mix of cash and transfer payments for display testing
 *
 * Usage:
 *   npm run seed:earnings         # Seed earnings test data
 *   npm run seed:earnings:clean   # Remove earnings test data
 *
 * Or directly:
 *   npx ts-node scripts/local/seed-earnings-tests.ts [--clean]
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
// EARNINGS TEST DATA CONSTANTS
// =============================================================================

// The dev login test provider - use this for E2E tests
const DEV_PROVIDER_EMAIL = "supplier@nitoagua.cl";

// Helper to create dates relative to now
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Completed water requests for earnings calculations
 * These represent delivered orders that show up in the earnings dashboard
 *
 * Price tiers (from getPrice function):
 * - 100L  -> $5,000 CLP
 * - 1000L -> $20,000 CLP
 * - 5000L -> $75,000 CLP
 * - 10000L -> $140,000 CLP
 */
const EARNINGS_TEST_REQUESTS = [
  // TODAY - 3 deliveries
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0001",
    tracking_token: "earnings-test-today-1",
    status: "delivered",
    guest_phone: "+56987650001",
    guest_name: "María García",
    guest_email: "maria@test.local",
    address: "Av. Providencia 1234, Santiago",
    amount: 1000, // $20,000
    special_instructions: "Entrega hoy - efectivo",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null, // Will be set to provider ID
    delivery_window: "10:00 - 12:00",
    accepted_at: hoursAgo(4),
    delivered_at: hoursAgo(2), // 2 hours ago (today)
    created_at: hoursAgo(5),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0002",
    tracking_token: "earnings-test-today-2",
    status: "delivered",
    guest_phone: "+56987650002",
    guest_name: "Carlos Ruiz",
    guest_email: "carlos@test.local",
    address: "Los Leones 2500, Las Condes",
    amount: 100, // $5,000
    special_instructions: "Entrega hoy - transferencia",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "14:00 - 16:00",
    accepted_at: hoursAgo(3),
    delivered_at: hoursAgo(1), // 1 hour ago (today)
    created_at: hoursAgo(4),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0003",
    tracking_token: "earnings-test-today-3",
    status: "delivered",
    guest_phone: "+56987650003",
    guest_name: "Ana Martínez",
    guest_email: "ana@test.local",
    address: "Tobalaba 800, Providencia",
    amount: 5000, // $75,000
    special_instructions: "Entrega hoy - efectivo grande",
    is_urgent: true,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "08:00 - 10:00",
    accepted_at: hoursAgo(6),
    delivered_at: hoursAgo(5), // 5 hours ago (today)
    created_at: hoursAgo(7),
  },

  // THIS WEEK (not today) - 4 deliveries
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0004",
    tracking_token: "earnings-test-week-1",
    status: "delivered",
    guest_phone: "+56987650004",
    guest_name: "Pedro Soto",
    guest_email: "pedro@test.local",
    address: "Manuel Montt 456, Ñuñoa",
    amount: 1000, // $20,000
    special_instructions: "Entrega ayer",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "18:00 - 20:00",
    accepted_at: daysAgo(1),
    delivered_at: daysAgo(1), // Yesterday
    created_at: daysAgo(1),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0005",
    tracking_token: "earnings-test-week-2",
    status: "delivered",
    guest_phone: "+56987650005",
    guest_name: "Laura Vega",
    guest_email: "laura@test.local",
    address: "Irarrázaval 3000, Ñuñoa",
    amount: 100, // $5,000
    special_instructions: "Entrega hace 2 días",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "16:00 - 18:00",
    accepted_at: daysAgo(2),
    delivered_at: daysAgo(2), // 2 days ago
    created_at: daysAgo(2),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0006",
    tracking_token: "earnings-test-week-3",
    status: "delivered",
    guest_phone: "+56987650006",
    guest_name: "Diego Fernández",
    guest_email: "diego@test.local",
    address: "Apoquindo 4500, Las Condes",
    amount: 10000, // $140,000
    special_instructions: "Entrega hace 3 días - grande",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "09:00 - 11:00",
    accepted_at: daysAgo(3),
    delivered_at: daysAgo(3), // 3 days ago
    created_at: daysAgo(3),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0007",
    tracking_token: "earnings-test-week-4",
    status: "delivered",
    guest_phone: "+56987650007",
    guest_name: "Sofía Muñoz",
    guest_email: "sofia@test.local",
    address: "Vitacura 5000, Vitacura",
    amount: 5000, // $75,000
    special_instructions: "Entrega hace 4 días",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "11:00 - 13:00",
    accepted_at: daysAgo(4),
    delivered_at: daysAgo(4), // 4 days ago
    created_at: daysAgo(4),
  },

  // THIS MONTH (older, but within month) - 3 more deliveries
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0008",
    tracking_token: "earnings-test-month-1",
    status: "delivered",
    guest_phone: "+56987650008",
    guest_name: "Roberto Díaz",
    guest_email: "roberto@test.local",
    address: "Av. Kennedy 7000, Vitacura",
    amount: 1000, // $20,000
    special_instructions: "Entrega hace 10 días",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "15:00 - 17:00",
    accepted_at: daysAgo(10),
    delivered_at: daysAgo(10), // 10 days ago
    created_at: daysAgo(10),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0009",
    tracking_token: "earnings-test-month-2",
    status: "delivered",
    guest_phone: "+56987650009",
    guest_name: "Carmen López",
    guest_email: "carmen@test.local",
    address: "Pedro de Valdivia 1500, Providencia",
    amount: 5000, // $75,000
    special_instructions: "Entrega hace 15 días",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "10:00 - 12:00",
    accepted_at: daysAgo(15),
    delivered_at: daysAgo(15), // 15 days ago
    created_at: daysAgo(15),
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0010",
    tracking_token: "earnings-test-month-3",
    status: "delivered",
    guest_phone: "+56987650010",
    guest_name: "Felipe Rojas",
    guest_email: "felipe@test.local",
    address: "Av. Colón 3000, Las Condes",
    amount: 1000, // $20,000
    special_instructions: "Entrega hace 20 días",
    is_urgent: false,
    consumer_id: null,
    supplier_id: null,
    delivery_window: "14:00 - 16:00",
    accepted_at: daysAgo(20),
    delivered_at: daysAgo(20), // 20 days ago
    created_at: daysAgo(20),
  },
];

/**
 * Commission ledger entries for pending commission display
 * These show up in the "Comisión pendiente" section
 */
const EARNINGS_TEST_LEDGER = [
  // Commission owed for recent cash deliveries (not yet paid)
  {
    id: "eeee0001-0001-0001-0001-000000000001",
    provider_id: null, // Will be set
    request_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0001", // Today's first delivery
    type: "commission_owed",
    amount: 3000, // 15% of $20,000
    description: "Comisión por entrega - María García",
    created_at: hoursAgo(2),
  },
  {
    id: "eeee0001-0001-0001-0001-000000000002",
    provider_id: null,
    request_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0003", // Today's third delivery
    type: "commission_owed",
    amount: 11250, // 15% of $75,000
    description: "Comisión por entrega - Ana Martínez",
    created_at: hoursAgo(5),
  },
  {
    id: "eeee0001-0001-0001-0001-000000000003",
    provider_id: null,
    request_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeee0004", // Yesterday's delivery
    type: "commission_owed",
    amount: 3000, // 15% of $20,000
    description: "Comisión por entrega - Pedro Soto",
    created_at: daysAgo(1),
  },
  // Partial payment already made (to show net pending)
  {
    id: "eeee0001-0001-0001-0001-000000000004",
    provider_id: null,
    type: "commission_paid",
    amount: 5000, // Partial payment
    description: "Pago parcial de comisión",
    bank_reference: "TRF-12345",
    created_at: daysAgo(1),
  },
];

// =============================================================================
// SCRIPT LOGIC
// =============================================================================

const isClean = process.argv.includes("--clean");

async function main() {
  console.log("💰 Earnings Dashboard E2E Test Data Seed Script");
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
      await cleanEarningsTestData(supabase);
    } else {
      const providerId = await getTestProvider(supabase);
      await seedEarningsTestRequests(supabase, providerId);
      await seedEarningsTestLedger(supabase, providerId);
      await verifyEarningsTestData(supabase, providerId);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
async function seedEarningsTestRequests(supabase: any, providerId: string) {
  console.log("\n📝 Seeding earnings test water requests (delivered)...");

  // Map requests - set supplier_id to provider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsToSeed = EARNINGS_TEST_REQUESTS.map((req): any => ({
    ...req,
    supplier_id: providerId,
  }));

  // Use upsert for idempotency
  const { error } = await supabase
    .from("water_requests")
    .upsert(requestsToSeed, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed requests: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${requestsToSeed.length} delivered water requests`);

  // Show breakdown by time period
  const today = requestsToSeed.filter((r) => {
    const deliveredAt = new Date(r.delivered_at);
    const now = new Date();
    return deliveredAt.toDateString() === now.toDateString();
  });

  const thisWeek = requestsToSeed.filter((r) => {
    const deliveredAt = new Date(r.delivered_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return deliveredAt >= weekAgo;
  });

  console.log(`    - Today: ${today.length} deliveries`);
  console.log(`    - This week (including today): ${thisWeek.length} deliveries`);
  console.log(`    - This month (all seeded): ${requestsToSeed.length} deliveries`);

  // Calculate expected earnings (15% commission)
  const getPrice = (amount: number): number => {
    if (amount <= 100) return 5000;
    if (amount <= 1000) return 20000;
    if (amount <= 5000) return 75000;
    return 140000;
  };

  const totalGross = requestsToSeed.reduce(
    (sum, r) => sum + getPrice(r.amount),
    0
  );
  const commission = Math.round(totalGross * 0.15);
  const netEarnings = totalGross - commission;

  console.log(`\n  💵 Expected totals (this month, 15% commission):`);
  console.log(
    `    - Gross income: $${totalGross.toLocaleString("es-CL")} CLP`
  );
  console.log(
    `    - Commission: -$${commission.toLocaleString("es-CL")} CLP`
  );
  console.log(
    `    - Net earnings: $${netEarnings.toLocaleString("es-CL")} CLP`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedEarningsTestLedger(supabase: any, providerId: string) {
  console.log("\n💳 Seeding commission ledger entries...");

  // Map ledger entries to provider
  const ledgerToSeed = EARNINGS_TEST_LEDGER.map((entry) => ({
    ...entry,
    provider_id: providerId,
  }));

  // Delete existing ledger entries for these IDs first
  const ledgerIds = EARNINGS_TEST_LEDGER.map((e) => e.id);
  await supabase.from("commission_ledger").delete().in("id", ledgerIds);

  // Insert new entries
  const { error } = await supabase.from("commission_ledger").insert(ledgerToSeed);

  if (error) {
    throw new Error(`Failed to seed ledger: ${error.message}`);
  }

  console.log(`  ✓ Seeded ${ledgerToSeed.length} ledger entries`);

  // Calculate pending
  const owed = ledgerToSeed
    .filter((e) => e.type === "commission_owed")
    .reduce((sum, e) => sum + e.amount, 0);
  const paid = ledgerToSeed
    .filter((e) => e.type === "commission_paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const pending = owed - paid;

  console.log(`    - Commission owed: $${owed.toLocaleString("es-CL")} CLP`);
  console.log(`    - Commission paid: $${paid.toLocaleString("es-CL")} CLP`);
  console.log(`    - Pending (shows "Pagar" button): $${pending.toLocaleString("es-CL")} CLP`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanEarningsTestData(supabase: any) {
  console.log("\n🗑️  Cleaning earnings test data...");

  // Delete ledger entries first (foreign key to water_requests)
  const ledgerIds = EARNINGS_TEST_LEDGER.map((e) => e.id);
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
  const requestIds = EARNINGS_TEST_REQUESTS.map((r) => r.id);
  const { error: requestError, count: requestCount } = await supabase
    .from("water_requests")
    .delete({ count: "exact" })
    .in("id", requestIds);

  if (requestError) {
    console.error(`  ✗ Failed to delete requests: ${requestError.message}`);
  } else {
    console.log(`  ✓ Deleted ${requestCount || 0} earnings test requests`);
  }

  console.log("\n  Note: Provider profile is preserved.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyEarningsTestData(supabase: any, providerId: string) {
  console.log("\n🔍 Verifying earnings test data...");

  // Check delivered requests
  const { data: deliveredRequests } = await supabase
    .from("water_requests")
    .select("id, guest_name, amount, delivered_at")
    .eq("supplier_id", providerId)
    .eq("status", "delivered")
    .like("tracking_token", "earnings-test-%")
    .order("delivered_at", { ascending: false });

  console.log(
    `  ✓ Found ${deliveredRequests?.length || 0} earnings test delivered requests`
  );

  if (deliveredRequests && deliveredRequests.length > 0) {
    console.log("    Recent deliveries:");
    for (const req of deliveredRequests.slice(0, 5)) {
      const date = new Date(req.delivered_at).toLocaleDateString("es-CL");
      console.log(`    - ${req.guest_name}: ${req.amount}L (${date})`);
    }
    if (deliveredRequests.length > 5) {
      console.log(`    ... and ${deliveredRequests.length - 5} more`);
    }
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
}

main();
