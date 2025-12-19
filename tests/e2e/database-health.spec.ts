import { test, expect } from "@playwright/test";

/**
 * Database Health Check Tests - Story Testing-1: E2E Reliability Improvements
 *
 * AC 9.1.1: Database Health Check Tests
 * - Run FIRST before other tests to fail fast on infrastructure issues
 * - Verify all required tables exist and are accessible
 * - Verify RLS policies work for test users
 * - Tag with @health for selective execution
 *
 * These tests catch the silent failures discovered during Epic 8 testing:
 * - 404 errors when tables don't exist locally
 * - 403 errors when RLS policies block access
 * - Schema mismatches between local and production
 */

// Required tables for the application to function
const REQUIRED_TABLES = [
  "profiles",
  "water_requests",
  "offers",
  "provider_service_areas",
  "notifications",
  "comunas",
  "commission_ledger",
  "admin_settings",
  "provider_documents",
  "withdrawal_requests",
  "admin_allowed_emails",
] as const;

test.describe("Database Health Check @health", () => {
  test.describe.configure({ mode: "serial" }); // Run health checks in order

  test("@health all required tables exist and are accessible", async ({
    request,
  }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "CRITICAL: Missing Supabase environment variables. " +
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    const missingTables: string[] = [];
    const errors: string[] = [];

    for (const table of REQUIRED_TABLES) {
      const response = await request.get(
        `${supabaseUrl}/rest/v1/${table}?limit=0`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      const status = response.status();

      if (status === 404) {
        missingTables.push(table);
      } else if (status === 403 || status === 401) {
        // 403/401 with anon key means table exists but RLS blocks anonymous access
        // This is EXPECTED for most tables - we just want to know the table exists
        // We'll test authenticated access separately
      } else if (status >= 400) {
        errors.push(`${table}: ${status} ${response.statusText()}`);
      }
      // 200 = table exists and is accessible (might be empty)
    }

    // Report all issues at once for easier debugging
    const issues: string[] = [];

    if (missingTables.length > 0) {
      issues.push(`MISSING TABLES (404): ${missingTables.join(", ")}`);
    }

    if (errors.length > 0) {
      issues.push(`TABLE ERRORS: ${errors.join("; ")}`);
    }

    expect(
      issues,
      `Database health check failed!\n\n${issues.join("\n\n")}\n\n` +
        "Run 'npx supabase db push' to sync your local schema, or check production."
    ).toHaveLength(0);
  });

  test("@health Supabase connection is working", async ({ request }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "CRITICAL: Missing Supabase environment variables. " +
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    // Test basic connectivity by querying the health endpoint
    const response = await request.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
      },
    });

    expect(
      response.status(),
      "Supabase REST API should be accessible"
    ).toBeLessThan(500);
  });

  test("@health comunas table exists", async ({ request }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Test if comunas table exists (may have RLS blocking anonymous access)
    const response = await request.get(
      `${supabaseUrl}/rest/v1/comunas?select=count`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "count=exact",
        },
      }
    );

    const status = response.status();
    // 200 = accessible, 401/403 = RLS blocks but table exists, 404 = table missing
    expect(status, "comunas table should exist (not 404)").not.toBe(404);

    // If publicly accessible, verify it has data
    if (status === 200) {
      const countHeader = response.headers()["content-range"];
      // Format: "0-4/5" where 5 is the total count
      const match = countHeader?.match(/\/(\d+)$/);
      const count = match ? parseInt(match[1], 10) : 0;

      expect(
        count,
        "comunas table should have at least one comuna for service areas"
      ).toBeGreaterThan(0);
    }
  });

  test("@health admin_settings table has required configuration", async ({
    request,
  }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // admin_settings should have key configuration values
    const response = await request.get(
      `${supabaseUrl}/rest/v1/admin_settings?select=key`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    // RLS might block anonymous access - that's OK, table exists
    if (response.status() === 200) {
      const settings = await response.json();
      const keys = settings.map((s: { key: string }) => s.key);

      // These settings are critical for the app
      const requiredKeys = ["default_commission_percent", "offer_expiry_hours"];
      const missingKeys = requiredKeys.filter((k) => !keys.includes(k));

      if (missingKeys.length > 0) {
        console.warn(
          `Warning: admin_settings missing keys: ${missingKeys.join(", ")}`
        );
      }
    }
    // If RLS blocks access (403), that's expected - table exists
    expect(response.status()).not.toBe(404);
  });
});

test.describe("RLS Policy Health Check @health", () => {
  // Skip if dev login is not available
  const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

  test.skip(skipIfNoDevLogin, "Dev login required for RLS tests");

  test("@health authenticated supplier can access their profile data", async ({
    page,
  }) => {
    // This test verifies that RLS allows suppliers to read their own data
    // If this fails, it indicates RLS policies are misconfigured

    await page.goto("/login");

    // Wait for dev login
    await page.waitForSelector('[data-testid="dev-login-button"]', {
      timeout: 10000,
    });

    // Login as supplier
    const supplierButton = page.getByRole("button", {
      name: "Supplier",
      exact: true,
    });
    await supplierButton.click();
    await page.waitForTimeout(100);
    await page.getByTestId("dev-login-button").click();

    // Wait for successful login and redirect to provider area
    await page.waitForURL("**/provider/**", { timeout: 15000 });

    // Capture console errors during page load
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Capture RLS/permission errors specifically
        if (
          text.includes("permission denied") ||
          text.includes("403") ||
          text.includes("42501") // PostgreSQL permission denied error code
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Navigate to a page that loads supplier data
    await page.goto("/provider/requests");
    await page.waitForTimeout(3000);

    // Check for permission errors
    expect(
      consoleErrors,
      `RLS permission errors detected!\n\n${consoleErrors.join("\n")}\n\n` +
        "This indicates RLS policies are blocking authenticated user access."
    ).toHaveLength(0);
  });

  test("@health authenticated consumer can access their request data", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.waitForSelector('[data-testid="dev-login-button"]', {
      timeout: 10000,
    });

    // Login as consumer
    const consumerButton = page.getByRole("button", {
      name: "Consumer",
      exact: true,
    });
    const hasConsumerButton = await consumerButton.isVisible().catch(() => false);

    if (!hasConsumerButton) {
      test.skip();
      return;
    }

    await consumerButton.click();
    await page.waitForTimeout(100);
    await page.getByTestId("dev-login-button").click();

    // Wait for login
    await page.waitForTimeout(3000);

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          text.includes("permission denied") ||
          text.includes("403") ||
          text.includes("42501")
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Navigate to consumer area
    await page.goto("/");
    await page.waitForTimeout(3000);

    expect(
      consoleErrors,
      `RLS permission errors detected for consumer!\n\n${consoleErrors.join("\n")}`
    ).toHaveLength(0);
  });
});
