import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Story 12.8-4: Admin Orders Mobile UX
 *
 * Test coverage for acceptance criteria:
 * - AC12.8.4.1: Status cards collapsible on mobile
 * - AC12.8.4.2: Compact header layout on mobile
 * - AC12.8.4.3: Filter dropdown width fixed
 * - AC12.8.4.4: Efficient filter row
 * - AC12.8.4.5: Order detail status prominent
 * - AC12.8.4.6: Desktop layout preserved
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Mobile viewport configuration per Atlas testing patterns
const MOBILE_VIEWPORT = { width: 360, height: 780 };
const DESKTOP_VIEWPORT = { width: 1024, height: 768 };

test.describe("Admin Orders Mobile UX - AC12.8.4.1: Collapsible Status Cards", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Mobile: Status cards are collapsed by default", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Mobile status toggle should be visible
    const statusToggle = page.getByTestId("mobile-status-toggle");
    await expect(statusToggle).toBeVisible();

    // Desktop stats cards should be hidden on mobile
    const desktopCards = page.locator(".hidden.md\\:grid");
    await expect(desktopCards).not.toBeVisible();

    // Collapsible cards should NOT be visible by default
    const collapsibleCards = page.getByTestId("stats-card-pend");
    await expect(collapsibleCards).not.toBeVisible();
  });

  test("Mobile: Tapping toggle expands status cards", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Click toggle to expand
    const statusToggle = page.getByTestId("mobile-status-toggle");
    await statusToggle.click();

    // Status cards should now be visible in 3x2 grid
    await expect(page.getByTestId("stats-card-pend")).toBeVisible();
    await expect(page.getByTestId("stats-card-acept")).toBeVisible();
    await expect(page.getByTestId("stats-card-camino")).toBeVisible();
    await expect(page.getByTestId("stats-card-entreg")).toBeVisible();
    await expect(page.getByTestId("stats-card-canc")).toBeVisible();
    await expect(page.getByTestId("stats-card-disp")).toBeVisible();
  });

  test("Mobile: Selecting a filter auto-collapses cards", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Expand cards
    const statusToggle = page.getByTestId("mobile-status-toggle");
    await statusToggle.click();

    // Click on a status card
    const pendingCard = page.getByTestId("stats-card-pend");
    await expect(pendingCard).toBeVisible();
    await pendingCard.click();

    // Cards should auto-collapse
    await expect(pendingCard).not.toBeVisible();

    // Toggle should still be visible
    await expect(statusToggle).toBeVisible();
  });

  test("Mobile: Toggle shows current filter label and count", async ({
    page,
  }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const statusToggle = page.getByTestId("mobile-status-toggle");

    // Should show "Todos" by default
    await expect(statusToggle).toContainText("Todos");

    // Should show count badge
    await expect(statusToggle).toContainText("pedidos");
  });

  test("Mobile: Toggle has aria-expanded attribute", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const statusToggle = page.getByTestId("mobile-status-toggle");

    // Should have aria-expanded="false" when collapsed
    await expect(statusToggle).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await statusToggle.click();

    // Should have aria-expanded="true" when expanded
    await expect(statusToggle).toHaveAttribute("aria-expanded", "true");
  });
});

test.describe("Admin Orders Mobile UX - AC12.8.4.2: Compact Header", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Mobile: Header shows compact layout", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Mobile title should be visible
    const mobileTitle = page.getByTestId("orders-title");
    await expect(mobileTitle).toBeVisible();
    await expect(mobileTitle).toHaveText("Pedidos");

    // Count badge should be visible
    const header = page.locator("header");
    await expect(header).toContainText(/\d+/); // Should contain a number

    // Back button should be visible
    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
  });

  test("Mobile: Header fits in single row", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // The mobile header container should use flexbox
    const mobileHeader = page.locator("header .md\\:hidden");
    await expect(mobileHeader).toBeVisible();

    // Check it uses flex layout (single row)
    await expect(mobileHeader).toHaveCSS("display", "flex");
  });
});

test.describe("Admin Orders Mobile UX - AC12.8.4.3 & AC12.8.4.4: Filter Layout", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Mobile: Status dropdown is visible and usable", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const statusDropdown = page.getByTestId("mobile-filter-status");
    await expect(statusDropdown).toBeVisible();

    // Should have all status options
    const options = await statusDropdown.locator("option").allTextContents();
    expect(options).toContain("Todos");
    expect(options).toContain("Pendientes");
    expect(options).toContain("Entregados");
  });

  test("Mobile: Date sort button is visible", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const dateSortButton = page.getByTestId("mobile-date-sort");
    await expect(dateSortButton).toBeVisible();
  });

  test("Mobile: Search bar is full-width on second row", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const searchInput = page.getByTestId("mobile-orders-search");
    await expect(searchInput).toBeVisible();

    // Search should be full width (check it has w-full class)
    await expect(searchInput).toHaveClass(/w-full/);
  });

  test("Mobile: Filter toggle is compact", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const filterToggle = page.getByTestId("toggle-filters");
    await expect(filterToggle).toBeVisible();

    // Should not have text "Filtros" on mobile (compact)
    const text = await filterToggle.textContent();
    expect(text).not.toContain("Filtros");
  });
});

test.describe("Admin Orders Mobile UX - AC12.8.4.5: Order Detail Status", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Mobile: Order detail shows status on own row", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Click first order
    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Mobile header should be visible
      const mobileHeader = page.locator("header .md\\:hidden");
      await expect(mobileHeader).toBeVisible();

      // Status badge should be visible and prominent
      const statusBadge = page.getByTestId("order-status");
      await expect(statusBadge).toBeVisible();

      // Order ID should be visible
      const orderId = page.getByTestId("order-id");
      await expect(orderId).toBeVisible();
    }
  });

  test("Mobile: Status visible without scrolling", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Status should be in viewport without scrolling
      const statusBadge = page.getByTestId("order-status");
      await expect(statusBadge).toBeInViewport();
    }
  });
});

test.describe("Admin Orders Mobile UX - AC12.8.4.6: Desktop Layout Preserved", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Use DESKTOP viewport
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Desktop: All 6 status cards visible", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Desktop stats cards should be visible
    await expect(page.getByText("Pendientes")).toBeVisible();
    await expect(page.getByText("Aceptados")).toBeVisible();
    await expect(page.getByText("En Camino")).toBeVisible();
    await expect(page.getByText("Entregados")).toBeVisible();
    await expect(page.getByText("Cancelados")).toBeVisible();
    await expect(page.getByText("Disputas")).toBeVisible();
  });

  test("Desktop: Mobile toggle is hidden", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Mobile status toggle should NOT be visible on desktop
    const mobileToggle = page.getByTestId("mobile-status-toggle");
    await expect(mobileToggle).not.toBeVisible();
  });

  test("Desktop: Full filter controls visible", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Desktop search should be visible
    const desktopSearch = page.getByTestId("orders-search");
    await expect(desktopSearch).toBeVisible();

    // Desktop filter toggle with "Filtros" text
    const filterToggle = page.getByTestId("desktop-toggle-filters");
    await expect(filterToggle).toBeVisible();
    await expect(filterToggle).toContainText("Filtros");
  });

  test("Desktop: Original header layout preserved", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Desktop header should show nitoagua logo text
    const desktopHeader = page.locator("header .hidden.md\\:block");
    await expect(desktopHeader).toBeVisible();
    await expect(desktopHeader).toContainText("nitoagua");

    // Full title visible
    const desktopTitle = page.getByTestId("desktop-orders-title");
    await expect(desktopTitle).toBeVisible();
  });

  test("Desktop: Order detail preserves original layout", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Desktop header should be visible
      const desktopHeader = page.locator("header .hidden.md\\:block");
      await expect(desktopHeader).toBeVisible();

      // Desktop order ID
      const desktopOrderId = page.getByTestId("desktop-order-id");
      await expect(desktopOrderId).toBeVisible();

      // Desktop status badge
      const desktopStatus = page.getByTestId("desktop-order-status");
      await expect(desktopStatus).toBeVisible();
    }
  });
});
