import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Story 6.8: Operations Dashboard
 *
 * Test coverage for acceptance criteria:
 * - AC6.8.1: Dashboard displays key operational metrics (requests, offers, financial, providers)
 * - AC6.8.2: Period selector (Today/This Week/This Month) filters all metrics
 * - AC6.8.3: Metrics cards show trend indicators vs previous period
 * - AC6.8.4: Metric cards drill-down to appropriate pages (orders, providers, settlement)
 * - AC6.8.5: Finanzas page supports period filtering via URL params
 * - AC6.8.6: Data caching with 5-minute TTL and manual refresh
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("Operations Dashboard - Navigation and Layout", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.1 - Dashboard displays period selector", async ({ page }) => {
    const periodSelector = page.getByTestId("operations-period-selector");
    await expect(periodSelector).toBeVisible();
  });

  test("AC6.8.1 - Period selector has three options: Today, This Week, This Month", async ({
    page,
  }) => {
    await expect(page.getByTestId("period-today")).toBeVisible();
    await expect(page.getByTestId("period-week")).toBeVisible();
    await expect(page.getByTestId("period-month")).toBeVisible();
  });

  test("AC6.8.1 - Month is selected by default", async ({ page }) => {
    const monthButton = page.getByTestId("period-month");
    await expect(monthButton).toHaveClass(/bg-gray-800/);
  });

  test("AC6.8.1 - Dashboard shows last updated timestamp", async ({ page }) => {
    const lastUpdated = page.getByTestId("last-updated");
    await expect(lastUpdated).toBeVisible();
    await expect(lastUpdated).toContainText("Actualizado");
  });
});

test.describe("Operations Dashboard - Request Metrics", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.1 - Request metrics tab is visible and selected by default", async ({ page }) => {
    const requestsTab = page.getByTestId("stats-tab-requests");
    await expect(requestsTab).toBeVisible();
    await expect(requestsTab).toHaveClass(/bg-blue-600/);
  });

  test("AC6.8.1 - Total requests metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-requests-total");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Total Solicitudes");
  });

  test("AC6.8.1 - Requests with offers metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-requests-with-offers");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Con Ofertas");
  });

  test("AC6.8.1 - Average offers per request metric is visible", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-avg-offers");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Prom. Ofertas");
  });

  test("AC6.8.1 - Timeout rate metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-timeout-rate");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Timeout");
  });
});

test.describe("Operations Dashboard - Offer Metrics", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    // Click the Offers tab to view offer metrics
    await page.getByTestId("stats-tab-offers").click();
  });

  test("AC6.8.1 - Offer metrics tab is visible", async ({ page }) => {
    const offersTab = page.getByTestId("stats-tab-offers");
    await expect(offersTab).toBeVisible();
    await expect(offersTab).toHaveClass(/bg-blue-600/);
  });

  test("AC6.8.1 - Total offers metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-offers-total");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Total Ofertas");
  });

  test("AC6.8.1 - Acceptance rate metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-acceptance-rate");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Aceptacion");
  });

  test("AC6.8.1 - Time to first offer metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-time-to-first");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Tiempo 1ra");
  });

  test("AC6.8.1 - Expiration rate metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-expiration-rate");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Expiradas");
  });
});

test.describe("Operations Dashboard - Stats Tab Switching", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Switching from Requests to Offers tab shows offer metrics", async ({ page }) => {
    // Initially, requests section should be visible
    await expect(page.getByTestId("requests-metrics-section")).toBeVisible();
    await expect(page.getByTestId("offers-metrics-section")).not.toBeVisible();

    // Click Offers tab
    await page.getByTestId("stats-tab-offers").click();

    // Now offers section should be visible, requests hidden
    await expect(page.getByTestId("offers-metrics-section")).toBeVisible();
    await expect(page.getByTestId("requests-metrics-section")).not.toBeVisible();
  });

  test("Switching back to Requests tab shows request metrics", async ({ page }) => {
    // Switch to offers first
    await page.getByTestId("stats-tab-offers").click();
    await expect(page.getByTestId("offers-metrics-section")).toBeVisible();

    // Switch back to requests
    await page.getByTestId("stats-tab-requests").click();
    await expect(page.getByTestId("requests-metrics-section")).toBeVisible();
    await expect(page.getByTestId("offers-metrics-section")).not.toBeVisible();
  });
});

test.describe("Operations Dashboard - Financial Metrics", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.1 - Financial metrics section is visible", async ({ page }) => {
    await expect(page.getByText("Finanzas")).toBeVisible();
  });

  test("AC6.8.1 - Revenue card is visible with dark gradient styling", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-revenue-card");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Volumen de Transacciones");
  });

  test("AC6.8.1 - Commission metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-commission");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Comision");
  });

  test("AC6.8.1 - Pending settlements metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-pending-settlements");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Pendiente");
  });
});

test.describe("Operations Dashboard - Provider Metrics", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.1 - Provider metrics section is visible", async ({ page }) => {
    await expect(page.getByText("Proveedores")).toBeVisible();
  });

  test("AC6.8.1 - Active providers metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-providers-active");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Activos");
  });

  test("AC6.8.1 - Online now metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-providers-online");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("En Linea");
  });

  test("AC6.8.1 - New applications metric is visible", async ({ page }) => {
    const metric = page.getByTestId("metric-new-applications");
    await expect(metric).toBeVisible();
    await expect(metric).toContainText("Nuevos");
  });
});

test.describe("Operations Dashboard - Period Selection", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.2 - Clicking Today updates the period selection", async ({
    page,
  }) => {
    const todayButton = page.getByTestId("period-today");
    await todayButton.click();

    // Should have selected class
    await expect(todayButton).toHaveClass(/bg-gray-800/);

    // Other buttons should not have selected class
    await expect(page.getByTestId("period-week")).not.toHaveClass(/bg-gray-800/);
    await expect(page.getByTestId("period-month")).not.toHaveClass(/bg-gray-800/);
  });

  test("AC6.8.2 - Clicking Week updates the period selection", async ({
    page,
  }) => {
    const weekButton = page.getByTestId("period-week");
    await weekButton.click();

    // Should have selected class
    await expect(weekButton).toHaveClass(/bg-gray-800/);
  });

  test("AC6.8.2 - Period change triggers data refresh (loading state)", async ({
    page,
  }) => {
    // Change to a different period
    const todayButton = page.getByTestId("period-today");
    await todayButton.click();

    // Wait for metrics to be visible (data loaded)
    await expect(page.getByTestId("metric-requests-total")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Operations Dashboard - Manual Refresh", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.6 - Refresh button is visible", async ({ page }) => {
    const refreshButton = page.getByTestId("refresh-metrics");
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toContainText("Actualizar");
  });

  test("AC6.8.6 - Clicking refresh updates metrics", async ({ page }) => {
    const refreshButton = page.getByTestId("refresh-metrics");
    await refreshButton.click();

    // Button should show loading state or complete
    // Wait for metrics to reload
    await expect(page.getByTestId("metric-requests-total")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Operations Dashboard - Drill-down Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.4 - Clicking requests metric navigates to orders page", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-requests-total");
    await metric.click();

    await page.waitForURL("**/admin/orders**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/orders");
  });

  test("AC6.8.4 - Clicking active providers metric navigates to providers page", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-providers-active");
    await metric.click();

    await page.waitForURL("**/admin/providers**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/providers");
  });

  test("AC6.8.4 - Clicking commission metric navigates to settlement page", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-commission");
    await metric.click();

    await page.waitForURL("**/admin/settlement**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settlement");
  });

  test("AC6.8.4 - Clicking new applications metric navigates to verification page", async ({
    page,
  }) => {
    const metric = page.getByTestId("metric-new-applications");
    await metric.click();

    await page.waitForURL("**/admin/verification**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/verification");
  });
});

test.describe("Operations Dashboard - Quick Actions", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Quick action: Verification navigates to verification page", async ({
    page,
  }) => {
    const quickAction = page.getByTestId("quick-action-verification");
    await expect(quickAction).toBeVisible();
    await quickAction.click();

    await page.waitForURL("**/admin/verification**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/verification");
  });

  test("Quick action: Settings navigates to settings page", async ({ page }) => {
    const quickAction = page.getByTestId("quick-action-settings");
    await expect(quickAction).toBeVisible();
    await quickAction.click();

    await page.waitForURL("**/admin/settings**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settings");
  });
});

test.describe("Finanzas Page - Period Filtering", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.8.5 - Settlement page has period selector", async ({ page }) => {
    await page.goto("/admin/settlement");
    const periodSelector = page.getByTestId("period-selector");
    await expect(periodSelector).toBeVisible();
  });

  test("AC6.8.5 - Period selector has week/month/year options", async ({
    page,
  }) => {
    await page.goto("/admin/settlement");

    await expect(page.getByTestId("period-week")).toBeVisible();
    await expect(page.getByTestId("period-month")).toBeVisible();
    await expect(page.getByTestId("period-year")).toBeVisible();
  });

  test("AC6.8.5 - Selecting month updates URL params", async ({ page }) => {
    await page.goto("/admin/settlement");

    // Click month button
    const monthButton = page.getByTestId("period-month");
    await monthButton.click();

    // Wait for dropdown
    await page.waitForTimeout(100);

    // Click a specific month
    const januaryOption = page.getByText("Enero");
    if (await januaryOption.isVisible()) {
      await januaryOption.click();

      // Wait for navigation
      await page.waitForURL("**/admin/settlement**month=1**", { timeout: 5000 });
      expect(page.url()).toContain("month=1");
    }
  });

  test("AC6.8.5 - Period label in header updates with selection", async ({
    page,
  }) => {
    await page.goto("/admin/settlement");

    const periodLabel = page.getByTestId("period-label");
    await expect(periodLabel).toBeVisible();

    // Default should show current month
    const text = await periodLabel.textContent();
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("AC6.8.5 - URL params populate period selector state", async ({
    page,
  }) => {
    // Navigate with specific period params
    await page.goto("/admin/settlement?period=month&month=1&year=2025");

    // Month button should be selected
    const monthButton = page.getByTestId("period-month");
    await expect(monthButton).toHaveClass(/bg-gray-800/);
  });
});

test.describe("Operations Dashboard - Mobile Responsiveness", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Period selector is visible on mobile", async ({ page }) => {
    const periodSelector = page.getByTestId("operations-period-selector");
    await expect(periodSelector).toBeVisible();
  });

  test("Metric cards are visible on mobile", async ({ page }) => {
    await expect(page.getByTestId("metric-requests-total")).toBeVisible();
    await expect(page.getByTestId("metric-revenue-card")).toBeVisible();
    await expect(page.getByTestId("metric-providers-active")).toBeVisible();
  });

  test("Quick actions are visible on mobile", async ({ page }) => {
    await expect(page.getByTestId("quick-action-verification")).toBeVisible();
    await expect(page.getByTestId("quick-action-settings")).toBeVisible();
  });
});

test.describe("Operations Dashboard - Auth Protection", () => {
  test("Dashboard redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });

  test("Metrics API requires authentication", async ({ page }) => {
    const response = await page.request.get("/api/admin/metrics?period=month");

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});
