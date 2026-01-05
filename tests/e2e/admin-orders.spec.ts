import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Story 6.6: Orders Management
 *
 * Test coverage for acceptance criteria:
 * - AC6.6.1: Orders page shows filterable table of all orders
 * - AC6.6.2: Filters: status, date range, service area
 * - AC6.6.3: Clicking order shows detail view with offer history
 * - AC6.6.4: Detail shows timeline: Created → Offers → Selected → Delivered
 * - AC6.6.5: Admin can view consumer and provider contact info
 * - AC6.6.6: Admin can cancel order with reason
 * - AC6.6.7: Offer analytics shown: offers received, time to first offer
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("Orders Page - Navigation and Layout", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.6.1 - Admin can navigate to orders page from sidebar", async ({
    page,
  }) => {
    // Click Pedidos in sidebar (desktop)
    await page.setViewportSize({ width: 1024, height: 768 });

    const pedidosLink = page.getByTestId("nav-pedidos");
    await expect(pedidosLink).toBeVisible();
    await pedidosLink.click();

    await page.waitForURL("**/admin/orders", { timeout: 10000 });
    expect(page.url()).toContain("/admin/orders");
  });

  test("AC6.6.1 - Orders page displays correctly", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Page header should be visible
    const pageTitle = page.getByTestId("orders-title");
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText("Pedidos");
  });

  test("AC6.6.1 - Back button returns to dashboard", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
  });

  test("AC6.6.1 - Stats cards display all required metrics", async ({
    page,
  }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Stats cards should be visible - use testid to avoid strict mode violations
    await expect(page.getByTestId("stats-card-pendientes")).toBeVisible();
    await expect(page.getByTestId("stats-card-aceptados")).toBeVisible();
    await expect(page.getByTestId("stats-card-en-camino")).toBeVisible();
    await expect(page.getByTestId("stats-card-entregados")).toBeVisible();
    await expect(page.getByTestId("stats-card-cancelados")).toBeVisible();
    await expect(page.getByTestId("stats-card-disputas")).toBeVisible();
  });
});

test.describe("Orders Page - Search and Filters", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
  });

  test("AC6.6.1 - Search input is available", async ({ page }) => {
    const searchInput = page.getByTestId("orders-search");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute(
      "placeholder",
      /buscar|search/i
    );
  });

  test("AC6.6.2 - Filter toggle button is visible", async ({ page }) => {
    const filterToggle = page.getByTestId("toggle-filters");
    await expect(filterToggle).toBeVisible();
  });

  test("AC6.6.2 - Clicking filter toggle reveals filter panel", async ({
    page,
  }) => {
    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    // Filter controls should be visible
    await expect(page.getByTestId("filter-status")).toBeVisible();
    await expect(page.getByTestId("filter-date-from")).toBeVisible();
    await expect(page.getByTestId("filter-date-to")).toBeVisible();
    await expect(page.getByTestId("filter-comuna")).toBeVisible();
  });

  test("AC6.6.2 - Status filter has correct options", async ({ page }) => {
    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    const statusFilter = page.getByTestId("filter-status");
    await expect(statusFilter).toBeVisible();

    // Check that status options exist
    const options = await statusFilter.locator("option").allTextContents();
    expect(options).toContain("Todos");
    expect(options).toContain("Pendientes");
    expect(options).toContain("Entregados");
    expect(options).toContain("Cancelados");
  });

  test("AC6.6.2 - Apply filters button works", async ({ page }) => {
    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    // Select a status filter
    const statusFilter = page.getByTestId("filter-status");
    await statusFilter.selectOption("delivered");

    // Click apply filters
    const applyButton = page.getByTestId("apply-filters");
    await applyButton.click();

    // URL should contain the filter parameter
    await page.waitForURL("**/admin/orders?status=delivered", {
      timeout: 10000,
    });
    expect(page.url()).toContain("status=delivered");
  });

  test("AC6.6.2 - Clear filters button works", async ({ page }) => {
    // First apply a filter
    await page.goto("/admin/orders?status=delivered");

    const filterToggle = page.getByTestId("toggle-filters");
    await filterToggle.click();

    // Click clear filters
    const clearButton = page.getByTestId("clear-filters");
    await clearButton.click();

    // URL should no longer have filter parameters
    await page.waitForURL("**/admin/orders", { timeout: 10000 });
    expect(page.url()).not.toContain("status=");
  });
});

test.describe("Orders Page - Orders Table", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
  });

  test("AC6.6.1 - Orders table or empty state is displayed", async ({
    page,
  }) => {
    // Either show orders table or empty state
    const hasOrders = await page.locator("[data-testid^='order-card-']").count();

    if (hasOrders > 0) {
      // Orders exist - verify first row is clickable
      const firstOrder = page.locator("[data-testid^='order-card-']").first();
      await expect(firstOrder).toBeVisible();
    } else {
      // No orders - should show empty state
      await expect(page.getByText("No se encontraron pedidos")).toBeVisible();
    }
  });

  test("AC6.6.3 - Clicking order navigates to detail page", async ({
    page,
  }) => {
    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();

      // Should navigate to order detail page
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });
      expect(page.url()).toMatch(/\/admin\/orders\/[a-zA-Z0-9-]+/);
    }
  });
});

test.describe("Order Detail Page", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.6.3 - Order detail page shows order ID", async ({ page }) => {
    // First go to orders list
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Order ID should be visible in header
      const orderId = page.getByTestId("order-id");
      await expect(orderId).toBeVisible();
      const text = await orderId.textContent();
      expect(text).toMatch(/^#[a-zA-Z0-9]+/);
    }
  });

  test("AC6.6.4 - Order detail shows timeline", async ({ page }) => {
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Timeline section should be visible
      await expect(page.getByText("Linea de Tiempo")).toBeVisible();

      // Should show at least "Pedido Creado" event
      await expect(page.getByText("Pedido Creado")).toBeVisible();
    }
  });

  test("AC6.6.5 - Order detail shows consumer contact info", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Consumer info section should be visible
      await expect(
        page.getByText("Informacion del Consumidor")
      ).toBeVisible();

      // WhatsApp link should be available
      const whatsappLink = page.getByTestId("consumer-whatsapp");
      await expect(whatsappLink).toBeVisible();
    }
  });

  test("AC6.6.7 - Order detail shows offer analytics", async ({ page }) => {
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Offer analytics section should be visible
      await expect(page.getByText("Analiticas de Ofertas")).toBeVisible();

      // Should show offer count
      await expect(page.getByText("Ofertas recibidas")).toBeVisible();

      // Should show time metrics
      await expect(page.getByText("Tiempo a primera oferta")).toBeVisible();
    }
  });

  test("AC6.6.3 - Order detail shows offer history section", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Offer history section should be visible
      await expect(page.getByText("Historial de Ofertas")).toBeVisible();
    }
  });

  test("AC6.6.3 - Back to orders button returns to list", async ({ page }) => {
    await page.goto("/admin/orders");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Click back button
      const backButton = page.getByTestId("back-to-orders");
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Should return to orders list
      await page.waitForURL("**/admin/orders", { timeout: 10000 });
      expect(page.url()).toMatch(/\/admin\/orders$/);
    }
  });
});

test.describe("Order Detail Page - Cancel Order", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.6.6 - Cancel button is visible for non-completed orders", async ({
    page,
  }) => {
    // Find a pending or in-progress order
    await page.goto("/admin/orders?status=pending");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Cancel button should be visible in Actions section
      const cancelButton = page.getByTestId("cancel-order-button");
      await expect(cancelButton).toBeVisible();
    }
  });

  test("AC6.6.6 - Cancel button opens reason modal", async ({ page }) => {
    await page.goto("/admin/orders?status=pending");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      const cancelButton = page.getByTestId("cancel-order-button");
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Modal should appear - use role selector to avoid matching button text
        await expect(page.getByRole("heading", { name: "Cancelar Pedido" })).toBeVisible();

        // Reason input should be visible
        const reasonInput = page.getByTestId("cancel-reason-input");
        await expect(reasonInput).toBeVisible();
      }
    }
  });

  test("AC6.6.6 - Cancel requires reason to be entered", async ({ page }) => {
    await page.goto("/admin/orders?status=pending");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      const cancelButton = page.getByTestId("cancel-order-button");
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Confirm button should be disabled without reason
        const confirmButton = page.getByTestId("confirm-cancel-button");
        await expect(confirmButton).toBeDisabled();

        // Enter reason
        const reasonInput = page.getByTestId("cancel-reason-input");
        await reasonInput.fill("Test cancellation reason");

        // Confirm button should now be enabled
        await expect(confirmButton).toBeEnabled();
      }
    }
  });

  test("AC6.6.6 - Cancel modal can be closed", async ({ page }) => {
    await page.goto("/admin/orders?status=pending");

    const firstOrder = page.locator("[data-testid^='order-card-']").first();

    if (await firstOrder.isVisible()) {
      await firstOrder.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      const cancelButton = page.getByTestId("cancel-order-button");
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Modal should be visible - use role selector to avoid matching button text
        await expect(page.getByRole("heading", { name: "Cancelar Pedido" })).toBeVisible();

        // Click close button
        const closeButton = page.getByTestId("cancel-modal-close");
        await closeButton.click();

        // Modal should be hidden
        await expect(
          page.getByTestId("cancel-reason-input")
        ).not.toBeVisible();
      }
    }
  });
});

test.describe("Orders Page - Mobile Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await assertNoErrorState(page);
  });

  test("AC6.6.1 - Bottom nav shows Operations menu on mobile", async ({
    page,
  }) => {
    const bottomNav = page.getByTestId("admin-bottom-nav");
    await expect(bottomNav).toBeVisible();

    // Pedidos is inside Operations menu, so we need to open it first
    const operationsButton = page.getByTestId("bottom-nav-operations");
    await expect(operationsButton).toBeVisible();
    await operationsButton.click();

    // Now Pedidos should be visible in the slide-up menu
    const pedidosLink = page.getByTestId("operations-pedidos");
    await expect(pedidosLink).toBeVisible();
  });

  test("AC6.6.1 - Mobile nav navigates to orders page", async ({ page }) => {
    // Click Operations menu first
    const operationsButton = page.getByTestId("bottom-nav-operations");
    await operationsButton.click();

    // Click Pedidos from the menu
    const pedidosLink = page.getByTestId("operations-pedidos");
    await pedidosLink.click();

    await page.waitForURL("**/admin/orders", { timeout: 10000 });
    expect(page.url()).toContain("/admin/orders");
  });

  test("AC6.6.1 - Mobile layout shows orders correctly", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Page title should be visible
    const pageTitle = page.getByTestId("orders-title");
    await expect(pageTitle).toBeVisible();

    // Stats cards should be visible on mobile - use testid for mobile toggle or first stat card
    const mobileToggle = page.getByTestId("mobile-status-toggle");
    const statsCard = page.getByTestId("stats-card-pendientes");
    // Either mobile toggle or stats card should be visible depending on viewport
    await expect(mobileToggle.or(statsCard)).toBeVisible();
  });
});

test.describe("Orders Page - Auth Protection", () => {
  test("Orders page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/orders");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });

  test("Order detail page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/orders/some-order-id");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});
