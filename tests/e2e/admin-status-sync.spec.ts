import { test, expect } from "../support/fixtures/merged-fixtures";

/**
 * E2E Tests for Story 12.7-4: Admin Status Sync
 *
 * Bug Reference: BUG-011 - Admin panel shows incorrect delivery status
 *
 * Test coverage for acceptance criteria:
 * - AC12.7.4.1: Correct Status Display - Admin sees correct status matching Provider
 * - AC12.7.4.2: Real-time Updates - Status changes appear without refresh
 * - AC12.7.4.3: Status Filtering - Admin can filter by status correctly
 * - AC12.7.4.4: Visual Distinction - Active deliveries have different visual treatment
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("12.7-4 Admin Status Sync - Status Display", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.7.4.1 - Admin orders page shows correct status labels", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Verify stats cards show correct labels (not "Asignados")
    const statsLabels = await page.locator("[data-testid^='stats-card-']").allTextContents();

    // Should contain "Aceptados" (not "Asignados")
    expect(statsLabels.join(" ")).toContain("Aceptados");
    expect(statsLabels.join(" ")).not.toContain("Asignados");

    // All expected status labels should be present
    expect(statsLabels.join(" ")).toContain("Pendientes");
    expect(statsLabels.join(" ")).toContain("Entregados");
    expect(statsLabels.join(" ")).toContain("Cancelados");
    expect(statsLabels.join(" ")).toContain("Total");
  });

  test("AC12.7.4.1 - Status filter dropdown has correct options", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Open filters
    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    // Check status dropdown options
    const statusFilter = page.getByTestId("filter-status");
    await expect(statusFilter).toBeVisible();

    const options = await statusFilter.locator("option").allTextContents();

    // Should have "Aceptados" option (not "Asignados")
    expect(options).toContain("Aceptados");
    expect(options).not.toContain("Asignados");

    // Should also have other options
    expect(options).toContain("Todos");
    expect(options).toContain("Pendientes");
    expect(options).toContain("Entregados");
    expect(options).toContain("Cancelados");
    expect(options).toContain("Sin Ofertas");
  });

  test("AC12.7.4.3 - Filter by accepted status works", async ({ page }) => {
    await page.goto("/admin/orders");

    // Open filters
    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    // Select accepted status
    const statusFilter = page.getByTestId("filter-status");
    await statusFilter.selectOption("accepted");

    // Apply filters
    const applyButton = page.getByTestId("apply-filters");
    await applyButton.click();

    // URL should contain status=accepted
    await page.waitForURL("**/admin/orders?status=accepted", { timeout: 10000 });
    expect(page.url()).toContain("status=accepted");
  });

  test("AC12.7.4.4 - Order cards display correct status badges", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Look for order cards
    const orderCards = page.locator("[data-testid^='order-card-']");
    const cardCount = await orderCards.count();

    if (cardCount > 0) {
      // Get all visible status badges
      const statusBadges = page.locator("[data-testid^='order-card-'] .rounded-lg");
      const badgeCount = await statusBadges.count();

      // At least some orders should have visible status badges
      expect(badgeCount).toBeGreaterThan(0);
    }
  });
});

test.describe("12.7-4 Admin Status Sync - Real-time Indicator", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.7.4.2 - Real-time indicator shows connection status", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Look for real-time indicator (should show "En vivo" or "Conectando...")
    const realtimeIndicator = page.getByText(/En vivo|Conectando/);
    await expect(realtimeIndicator).toBeVisible({ timeout: 10000 });
  });
});

test.describe("12.7-4 Admin Status Sync - Stats Card Filtering", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.7.4.3 - Clicking Aceptados stats card filters orders", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Click on Aceptados stats card
    const aceptadosCard = page.getByTestId("stats-card-aceptados");
    await expect(aceptadosCard).toBeVisible();
    await aceptadosCard.click();

    // URL should contain status=accepted
    await page.waitForURL("**/admin/orders?status=accepted", { timeout: 10000 });
    expect(page.url()).toContain("status=accepted");
  });

  test("AC12.7.4.3 - Clicking Total stats card clears filters", async ({
    page,
  }) => {
    // Start with a filter applied
    await page.goto("/admin/orders?status=accepted");

    // Verify we're on the filtered page
    await expect(page.url()).toContain("status=accepted");

    // Click on Total stats card
    const totalCard = page.getByTestId("stats-card-total");
    await expect(totalCard).toBeVisible();
    await totalCard.click();

    // Should navigate to orders page without status filter
    // The navigation removes the status param
    await page.waitForURL((url) => !url.toString().includes("status="), { timeout: 10000 });
  });
});
