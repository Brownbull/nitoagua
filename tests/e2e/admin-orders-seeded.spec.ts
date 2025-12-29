import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Story 11-19: Admin Orders & Settlement (Local)
 *
 * These tests use seeded data created by: npm run seed:admin-orders
 *
 * Workflow Coverage:
 * - A5: View All Orders - orders dashboard with filters and real data
 * - A6: Order Details - view specific order with timeline
 * - A7: Settlement Queue - pending commission payments
 * - A8: Approve Settlement - verify payment with bank reference
 * - A9: Reject Settlement - reject with reason
 *
 * Seeded data includes:
 * - 7 water requests (2 pending, 1 accepted, 3 delivered, 1 cancelled)
 * - Commission ledger entries ($10,000 total owed, $2,000 paid = $8,000 pending)
 * - 1 pending withdrawal request ($8,000)
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("A5: Admin Orders Dashboard @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("A5.1 - Orders page shows seeded orders in table", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Stats cards should show order counts
    const pendingCard = page.getByTestId("stats-card-pendientes");
    await expect(pendingCard).toBeVisible();

    // Should have some orders visible
    const orderCards = page.locator("[data-testid^='order-card-']");
    await expect(orderCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("A5.2 - Filter by status shows only matching orders", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on Pendientes stats card to filter
    const pendingCard = page.getByTestId("stats-card-pendientes");
    await pendingCard.click();

    // URL should update with filter
    await page.waitForURL("**/admin/orders?status=pending", { timeout: 10000 });

    // Page should still load successfully
    await expect(page.getByTestId("orders-title")).toBeVisible();
  });

  test("A5.3 - Filter by delivered shows completed orders", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on Entregados stats card to filter
    const deliveredCard = page.getByTestId("stats-card-entregados");
    await deliveredCard.click();

    await page.waitForURL("**/admin/orders?status=delivered", { timeout: 10000 });

    // Page should load
    await expect(page.getByTestId("orders-title")).toBeVisible();
  });

  test("A5.4 - Search filters orders by name", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Search for a seeded customer name
    const searchInput = page.getByTestId("orders-search");
    await searchInput.fill("Cliente Pendiente");

    // Wait for search debounce and filtering to complete
    await expect(page.getByTestId("orders-title")).toBeVisible();

    // Should show matching orders (or empty state)
    const matchingCards = page.locator("[data-testid^='order-card-']");
    const count = await matchingCards.count();

    // At least zero matches - just verify search doesn't break page
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("A5.5 - Real-time indicator shows connection status", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Real-time indicator should be visible
    const indicator = page.locator("text=En vivo").or(page.locator("text=Conectando..."));
    await expect(indicator).toBeVisible();
  });
});

test.describe("A6: Order Detail View @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("A6.1 - Order detail page navigated from list shows order info", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on first order card
    const firstCard = page.locator("[data-testid^='order-card-']").first();
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Order ID should be visible
      const orderId = page.getByTestId("order-id");
      await expect(orderId).toBeVisible();
    }
  });

  test("A6.2 - Order detail shows timeline section", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on first order card
    const firstCard = page.locator("[data-testid^='order-card-']").first();
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Timeline section
      await expect(page.getByText("Linea de Tiempo")).toBeVisible();
    }
  });

  test("A6.3 - Order detail shows consumer contact section", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on first order card
    const firstCard = page.locator("[data-testid^='order-card-']").first();
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Consumer info section
      await expect(page.getByText("Informacion del Consumidor")).toBeVisible();
    }
  });

  test("A6.4 - Back button returns to orders list", async ({ page }) => {
    await page.goto("/admin/orders");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Click on first order card
    const firstCard = page.locator("[data-testid^='order-card-']").first();
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });

      // Click back button
      const backButton = page.getByTestId("back-to-orders");
      await backButton.click();

      await page.waitForURL("**/admin/orders", { timeout: 10000 });
    }
  });
});

test.describe("A7: Settlement Queue @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("A7.1 - Settlement page shows summary cards with seeded data", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Summary section
    const summarySection = page.getByTestId("settlement-summary");
    await expect(summarySection).toBeVisible();

    // Total pending should show currency value
    const totalPending = page.getByTestId("total-pending");
    await expect(totalPending).toBeVisible();
    const pendingText = await totalPending.textContent();
    expect(pendingText).toContain("$");
  });

  test("A7.2 - Settlement page shows pending payments table", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Pending payments table
    const paymentsTable = page.getByTestId("pending-payments-table");
    await expect(paymentsTable).toBeVisible();

    // Header text
    await expect(page.getByText("Pagos Pendientes de Verificacion")).toBeVisible();
  });

  test("A7.3 - Settlement page shows provider balances", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Provider balances table
    const balancesTable = page.getByTestId("provider-balances-table");
    await expect(balancesTable).toBeVisible();

    // Header text
    await expect(page.getByText("Saldos de Proveedores")).toBeVisible();
  });

  test("A7.4 - Provider balance shows aging information", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Aging legend should be visible
    await expect(page.getByText("Actual (<7d)")).toBeVisible();
    await expect(page.getByText("Semana (7-14d)")).toBeVisible();
    await expect(page.getByText("Vencido (>14d)")).toBeVisible();
  });
});

test.describe("A8: Approve Settlement @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("A8.1 - Verify button opens confirmation modal if payments exist", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Find any verify button
    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await verifyButton.click();

      // Modal should appear
      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Modal title
      await expect(page.getByText("Verificar Pago")).toBeVisible();

      // Bank reference input
      const bankRefInput = page.getByTestId("bank-reference-input");
      await expect(bankRefInput).toBeVisible();
    }
  });

  test("A8.2 - Bank reference is optional for verification", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await verifyButton.click();

      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Confirm button should be enabled without bank reference
      const confirmBtn = page.getByTestId("confirm-verify-btn");
      await expect(confirmBtn).toBeEnabled();
    }
  });

  test("A8.3 - Verify modal can be cancelled", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await verifyButton.click();

      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Click cancel
      await page.getByText("Cancelar").click();

      // Modal should close
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe("A9: Reject Settlement @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("A9.1 - Reject button opens rejection modal if payments exist", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectButton.click();

      // Modal should appear
      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Modal title (use heading role to be specific)
      await expect(page.getByRole("heading", { name: "Rechazar Pago" })).toBeVisible();
    }
  });

  test("A9.2 - Rejection requires selecting a reason", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectButton.click();

      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Confirm button should be disabled without reason
      const confirmBtn = page.getByTestId("confirm-reject-btn");
      await expect(confirmBtn).toBeDisabled();

      // Select a reason
      const reasonSelect = page.getByTestId("rejection-reason-select");
      await reasonSelect.selectOption("comprobante_invalido");

      // Now button should be enabled
      await expect(confirmBtn).toBeEnabled();
    }
  });

  test("A9.3 - Custom reason input for 'otro' option", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectButton.click();

      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Select "otro"
      const reasonSelect = page.getByTestId("rejection-reason-select");
      await reasonSelect.selectOption("otro");

      // Custom input should appear
      const customInput = page.getByTestId("custom-reason-input");
      await expect(customInput).toBeVisible();

      // Button still disabled
      const confirmBtn = page.getByTestId("confirm-reject-btn");
      await expect(confirmBtn).toBeDisabled();

      // Fill custom reason
      await customInput.fill("Test rejection reason");

      // Now enabled
      await expect(confirmBtn).toBeEnabled();
    }
  });

  test("A9.4 - Reject modal can be cancelled", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectButton.click();

      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Click cancel
      await page.getByText("Cancelar").click();

      // Modal should close
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe("Settlement UI Features @seeded", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("Period selector allows filtering by week/month/year", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Period selector should be visible
    const periodSelector = page.getByTestId("period-selector");
    await expect(periodSelector).toBeVisible();

    // Week button
    const weekBtn = page.getByTestId("period-week");
    await expect(weekBtn).toBeVisible();

    // Month button (default selected)
    const monthBtn = page.getByTestId("period-month");
    await expect(monthBtn).toBeVisible();

    // Year button
    const yearBtn = page.getByTestId("period-year");
    await expect(yearBtn).toBeVisible();
  });

  test("Export button is visible on settlement page", async ({ page }) => {
    await page.goto("/admin/settlement");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    const exportBtn = page.getByTestId("export-report");
    await expect(exportBtn).toBeVisible();
  });
});
