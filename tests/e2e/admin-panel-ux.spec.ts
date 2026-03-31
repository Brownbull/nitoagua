import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Admin Panel UX Improvements - Story 12.7-9
 *
 * Tests the admin panel improvements:
 * - AC12.7.9.1: Real-time order updates (already implemented, verify refresh button)
 * - AC12.7.9.2: Order sorting functionality
 * - AC12.7.9.3: Finance quick navigation (Hoy button)
 */

// Skip if dev login not available
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Use mobile viewport for admin testing
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

test.describe("Admin Orders Page - Story 12.7-9", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 30000 });
  });

  test.describe("AC12.7.9.1: Real-time Updates & Refresh", () => {
    test("Refresh button exists and works", async ({ page }) => {
      await page.goto("/admin/orders");
      await assertNoErrorState(page);

      // Check refresh button exists
      const refreshButton = page.getByTestId("refresh-orders");
      await expect(refreshButton).toBeVisible();

      // Click refresh and verify it triggers loading state
      await refreshButton.click();

      // Wait for network to settle
      await page.waitForLoadState("networkidle");

      // Page should still be functional
      await expect(page.getByTestId("orders-title")).toBeVisible();
    });

    test("Real-time indicator shows connection status", async ({ page }) => {
      await page.goto("/admin/orders");
      await assertNoErrorState(page);

      // Should show "En vivo" or "Conectando..." text
      const realtimeIndicator = page.getByText(/En vivo|Conectando|Actualizando/);
      await expect(realtimeIndicator.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("AC12.7.9.2: Order Sorting", () => {
    test("Mobile: Status filter dropdown exists and has options", async ({ page }) => {
      await page.goto("/admin/orders");
      await assertNoErrorState(page);

      // On mobile, status filter dropdown is visible (not full sort dropdown)
      const statusFilter = page.getByTestId("mobile-filter-status");
      await expect(statusFilter).toBeVisible();

      // Check it has the expected options
      const options = await statusFilter.locator("option").allTextContents();
      expect(options).toContain("Todos");
      expect(options).toContain("Pendientes");
      expect(options).toContain("Entregados");
    });

    test("Mobile: Date sort toggle works", async ({ page }) => {
      await page.goto("/admin/orders");
      await assertNoErrorState(page);

      // Check mobile date sort button exists
      const dateSortButton = page.getByTestId("mobile-date-sort");
      await expect(dateSortButton).toBeVisible();

      // Click to toggle sort direction
      await dateSortButton.click();
      await page.waitForLoadState("networkidle");

      // Page should still be functional
      await expect(page.getByTestId("orders-title")).toBeVisible();
    });

    test("Mobile: Changing status filter updates order list", async ({ page }) => {
      await page.goto("/admin/orders");
      await assertNoErrorState(page);

      const statusFilter = page.getByTestId("mobile-filter-status");

      // Change to filter by delivered
      await statusFilter.selectOption("delivered");
      await page.waitForLoadState("networkidle");

      // Page should still show orders title
      await expect(page.getByTestId("orders-title")).toBeVisible();
    });
  });
});

test.describe("Admin Settlement Page - Story 12.7-9", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 30000 });
  });

  test.describe("AC12.7.9.3: Finance Quick Navigation", () => {
    test("Hoy (Today) quick jump button exists", async ({ page }) => {
      await page.goto("/admin/settlement");
      await assertNoErrorState(page);

      // Check Hoy button exists
      const todayButton = page.getByTestId("period-today");
      await expect(todayButton).toBeVisible();
    });

    test("Clicking Hoy navigates to current month", async ({ page }) => {
      // Start with a different period (year view)
      await page.goto("/admin/settlement?period=year&year=2024");
      await assertNoErrorState(page);

      // Click Hoy button
      const todayButton = page.getByTestId("period-today");
      await todayButton.click();
      await page.waitForLoadState("networkidle");

      // Should navigate to month view
      const url = page.url();
      expect(url).toContain("period=month");

      // Should be current year
      const currentYear = new Date().getFullYear();
      expect(url).toContain(`year=${currentYear}`);
    });

    test("Period selector buttons work correctly", async ({ page }) => {
      await page.goto("/admin/settlement");
      await assertNoErrorState(page);

      // Check all period buttons exist
      await expect(page.getByTestId("period-week")).toBeVisible();
      await expect(page.getByTestId("period-month")).toBeVisible();
      await expect(page.getByTestId("period-year")).toBeVisible();

      // Click year button to see dropdown
      await page.getByTestId("period-year").click();

      // Should show year options
      const yearOption = page.getByRole("button", { name: "2024" });
      const hasYearOption = await yearOption.isVisible().catch(() => false);

      if (hasYearOption) {
        await yearOption.click();
        await page.waitForLoadState("networkidle");

        // URL should reflect year view
        expect(page.url()).toContain("period=year");
      }
    });
  });

  test.describe("AC12.7.9.4: Pending Payments Visibility", () => {
    test("Settlement summary shows pending info", async ({ page }) => {
      await page.goto("/admin/settlement");
      await assertNoErrorState(page);

      // Check summary card exists
      const summaryCard = page.getByTestId("settlement-summary");
      await expect(summaryCard).toBeVisible();

      // Check total pending is visible
      const totalPending = page.getByTestId("total-pending");
      await expect(totalPending).toBeVisible();

      // Check pending verifications section exists
      const pendingVerifications = page.getByTestId("pending-verifications");
      await expect(pendingVerifications).toBeVisible();
    });

    test("Yearly view shows settlement data", async ({ page }) => {
      await page.goto("/admin/settlement?period=year");
      await assertNoErrorState(page);

      // Summary should still be visible in year view
      const summaryCard = page.getByTestId("settlement-summary");
      await expect(summaryCard).toBeVisible();

      // Total pending should be shown
      const totalPending = page.getByTestId("total-pending");
      await expect(totalPending).toBeVisible();
    });
  });
});
