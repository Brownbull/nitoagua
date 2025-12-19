#!/usr/bin/env npx ts-node

/**
 * Local Database Verification Script
 *
 * Verifies that all required tables exist in the local Supabase database
 * and are accessible via the REST API.
 *
 * Usage:
 *   npm run verify:local-db
 *
 * Exit codes:
 *   0 - All tables exist and are accessible
 *   1 - One or more tables are missing or inaccessible
 *
 * CI Integration:
 *   Add this to your CI pipeline before running E2E tests:
 *   npm run verify:local-db || (echo "Database schema mismatch" && exit 1)
 */

// Required tables for the NitoAgua application
// These tables MUST exist for the application to function correctly
// NOTE: Keep in sync with tests/e2e/database-health.spec.ts REQUIRED_TABLES
const REQUIRED_TABLES = [
  // Core tables (001_initial_schema.sql)
  "profiles",
  "water_requests",

  // Offers (20251213141113_add_offers_table.sql)
  "offers",

  // Provider onboarding (20251215113330_provider_onboarding.sql)
  "provider_service_areas",

  // Notifications (20251213180000_add_notifications_table.sql)
  "notifications",

  // Provider onboarding (20251215113330_provider_onboarding.sql)
  "comunas",

  // Cash settlement (20251213010552_add_cash_settlement_tables.sql)
  "commission_ledger",

  // Admin tables (20251212171400_v2_admin_auth.sql)
  "admin_settings",

  // Provider verification (20251213002712_add_provider_verification.sql)
  "provider_documents",

  // Cash settlement (20251213010552_add_cash_settlement_tables.sql)
  "withdrawal_requests",

  // Admin tables (20251212171400_v2_admin_auth.sql)
  "admin_allowed_emails",
];

// Local Supabase configuration
const LOCAL_URL = "http://127.0.0.1:55326";
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

interface TableCheckResult {
  table: string;
  status: number;
  exists: boolean;
  error?: string;
}

async function checkTable(tableName: string): Promise<TableCheckResult> {
  try {
    const response = await fetch(`${LOCAL_URL}/rest/v1/${tableName}?limit=0`, {
      headers: {
        apikey: LOCAL_ANON_KEY,
        Authorization: `Bearer ${LOCAL_ANON_KEY}`,
      },
    });

    // 200 = table exists, 404 = table doesn't exist
    // 403 = RLS denied (but table exists), 401 = auth issue
    const exists = response.status !== 404;

    return {
      table: tableName,
      status: response.status,
      exists,
      error: response.status === 404 ? "Table not found" : undefined,
    };
  } catch (error) {
    return {
      table: tableName,
      status: 0,
      exists: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function main() {
  console.log("\n🔍 Local Database Verification");
  console.log(`   URL: ${LOCAL_URL}`);
  console.log(`   Tables to check: ${REQUIRED_TABLES.length}\n`);

  // First, check if Supabase is reachable
  try {
    const healthCheck = await fetch(`${LOCAL_URL}/rest/v1/`, {
      headers: { apikey: LOCAL_ANON_KEY },
    });
    if (!healthCheck.ok && healthCheck.status >= 500) {
      throw new Error(`Supabase returned ${healthCheck.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Cannot connect to local Supabase at ${LOCAL_URL}`);
    console.error(`   Error: ${message}\n`);
    console.error("To fix:");
    console.error("  1. Start local Supabase: npx supabase start");
    console.error("  2. Check status: npx supabase status");
    console.error("  3. Re-run: npm run verify:local-db\n");
    process.exit(1);
  }

  const results: TableCheckResult[] = [];
  const missingTables: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    results.push(result);

    if (result.exists) {
      if (result.status === 200) {
        console.log(`   ✅ ${table} (200 OK)`);
      } else if (result.status === 403) {
        // RLS denied but table exists - this is fine for verification
        console.log(`   ✅ ${table} (403 - RLS active, table exists)`);
      } else {
        console.log(`   ✅ ${table} (${result.status})`);
      }
    } else {
      console.log(`   ❌ ${table} - ${result.error || "MISSING"}`);
      missingTables.push(table);
    }
  }

  console.log("\n" + "=".repeat(50));

  if (missingTables.length === 0) {
    console.log("✅ All required tables exist!");
    console.log("   Local database schema is correctly synchronized.\n");
    process.exit(0);
  } else {
    console.log(`❌ Missing ${missingTables.length} required table(s):`);
    for (const table of missingTables) {
      console.log(`   - ${table}`);
    }
    console.log("\nTo fix:");
    console.log("  1. Ensure local Supabase is running: npx supabase status");
    console.log("  2. Reset and reapply migrations: npx supabase db reset");
    console.log("  3. Re-run verification: npm run verify:local-db\n");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Verification failed:", error.message);
  process.exit(1);
});
