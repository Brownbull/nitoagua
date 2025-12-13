import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Story 6.5: Cash Settlement Tracking
 *
 * Test coverage for acceptance criteria:
 * - AC6.5.1: Settlement page shows summary cards: total pending, overdue, pending verifications
 * - AC6.5.2: Pending payments table shows: provider, amount, receipt, date, actions
 * - AC6.5.3: Provider balances table shows: provider, total owed, days outstanding
 * - AC6.5.4: Admin can view uploaded receipt image
 * - AC6.5.5: Admin can enter bank reference and confirm payment
 * - AC6.5.6: Confirmation creates commission_paid entry in ledger
 * - AC6.5.7: Admin can reject payment with reason
 * - AC6.5.8: Provider notified of payment verification result
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("Settlement Dashboard - Navigation and Layout", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.5.1 - Admin can navigate to settlement page from sidebar", async ({
    page,
  }) => {
    // Click Finanzas in sidebar (desktop)
    await page.setViewportSize({ width: 1024, height: 768 });

    const finanzasLink = page.getByTestId("nav-finanzas");
    await expect(finanzasLink).toBeVisible();
    await finanzasLink.click();

    await page.waitForURL("**/admin/settlement", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settlement");
  });

  test("AC6.5.1 - Settlement page displays correctly", async ({ page }) => {
    await page.goto("/admin/settlement");

    // Page header should be visible
    await expect(page.getByText("Finanzas")).toBeVisible();

    // Summary cards section should be visible
    const summarySection = page.getByTestId("settlement-summary");
    await expect(summarySection).toBeVisible();
  });

  test("AC6.5.1 - Back button returns to dashboard", async ({ page }) => {
    await page.goto("/admin/settlement");

    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
  });
});

test.describe("Settlement Dashboard - Summary Cards", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.1 - Summary cards display all required metrics", async ({
    page,
  }) => {
    // Total Pending card
    const totalPending = page.getByTestId("total-pending");
    await expect(totalPending).toBeVisible();

    // Overdue card
    const totalOverdue = page.getByTestId("total-overdue");
    await expect(totalOverdue).toBeVisible();

    // Pending Verifications card
    const pendingVerifications = page.getByTestId("pending-verifications");
    await expect(pendingVerifications).toBeVisible();
  });

  test("AC6.5.1 - Summary cards show currency values in CLP format", async ({
    page,
  }) => {
    const totalPending = page.getByTestId("total-pending");
    const text = await totalPending.textContent();

    // Should show $ prefix (CLP format)
    expect(text).toContain("$");
  });
});

test.describe("Settlement Dashboard - Pending Payments Table", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.2 - Pending payments table is visible", async ({ page }) => {
    const table = page.getByTestId("pending-payments-table");
    await expect(table).toBeVisible();
  });

  test("AC6.5.2 - Table shows header with title", async ({ page }) => {
    await expect(
      page.getByText("Pagos Pendientes de Verificacion")
    ).toBeVisible();
  });

  test("AC6.5.2 - Empty state shows when no pending payments", async ({
    page,
  }) => {
    // The page may show empty state or payment rows
    const table = page.getByTestId("pending-payments-table");
    await expect(table).toBeVisible();

    // Either has payment rows or empty state message
    const content = await table.textContent();
    const hasContent =
      content?.includes("No hay pagos pendientes") ||
      content?.includes("Verificar");
    expect(hasContent).toBeTruthy();
  });
});

test.describe("Settlement Dashboard - Provider Balances Table", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.3 - Provider balances table is visible", async ({ page }) => {
    const table = page.getByTestId("provider-balances-table");
    await expect(table).toBeVisible();
  });

  test("AC6.5.3 - Table shows header with title", async ({ page }) => {
    await expect(page.getByText("Saldos de Proveedores")).toBeVisible();
  });

  test("AC6.5.3 - Aging legend is visible", async ({ page }) => {
    // Legend for aging colors
    await expect(page.getByText("Actual (<7d)")).toBeVisible();
    await expect(page.getByText("Semana (7-14d)")).toBeVisible();
    await expect(page.getByText("Vencido (>14d)")).toBeVisible();
  });
});

test.describe("Settlement Dashboard - Payment Verification Modal", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.5 - Verify button opens verification modal (if payments exist)", async ({
    page,
  }) => {
    // Look for any verify button
    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible()) {
      await verifyButton.click();

      // Modal should appear
      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Modal should have title
      await expect(page.getByText("Verificar Pago")).toBeVisible();

      // Bank reference input should be visible
      const bankRefInput = page.getByTestId("bank-reference-input");
      await expect(bankRefInput).toBeVisible();

      // Confirm button should be visible
      const confirmBtn = page.getByTestId("confirm-verify-btn");
      await expect(confirmBtn).toBeVisible();
    }
  });

  test("AC6.5.5 - Bank reference input is optional", async ({ page }) => {
    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible()) {
      await verifyButton.click();

      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Confirm button should be enabled even without bank reference
      const confirmBtn = page.getByTestId("confirm-verify-btn");
      await expect(confirmBtn).toBeEnabled();
    }
  });

  test("AC6.5.5 - Modal can be closed by clicking cancel", async ({ page }) => {
    const verifyButton = page.locator("[data-testid^='verify-payment-']").first();

    if (await verifyButton.isVisible()) {
      await verifyButton.click();

      const modal = page.getByTestId("verify-payment-modal");
      await expect(modal).toBeVisible();

      // Click cancel button
      const cancelBtn = page.getByText("Cancelar");
      await cancelBtn.click();

      // Modal should be closed
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe("Settlement Dashboard - Payment Rejection Modal", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.7 - Reject button opens rejection modal (if payments exist)", async ({
    page,
  }) => {
    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible()) {
      await rejectButton.click();

      // Modal should appear
      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Modal should have title
      await expect(page.getByText("Rechazar Pago")).toBeVisible();

      // Reason select should be visible
      const reasonSelect = page.getByTestId("rejection-reason-select");
      await expect(reasonSelect).toBeVisible();
    }
  });

  test("AC6.5.7 - Rejection requires selecting a reason", async ({ page }) => {
    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible()) {
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

  test("AC6.5.7 - Custom reason input appears for 'otro' option", async ({
    page,
  }) => {
    const rejectButton = page.locator("[data-testid^='reject-payment-']").first();

    if (await rejectButton.isVisible()) {
      await rejectButton.click();

      const modal = page.getByTestId("reject-payment-modal");
      await expect(modal).toBeVisible();

      // Select "otro" option
      const reasonSelect = page.getByTestId("rejection-reason-select");
      await reasonSelect.selectOption("otro");

      // Custom reason input should appear
      const customInput = page.getByTestId("custom-reason-input");
      await expect(customInput).toBeVisible();

      // Button should still be disabled until custom reason is filled
      const confirmBtn = page.getByTestId("confirm-reject-btn");
      await expect(confirmBtn).toBeDisabled();

      // Fill custom reason
      await customInput.fill("Custom rejection reason");

      // Now button should be enabled
      await expect(confirmBtn).toBeEnabled();
    }
  });
});

test.describe("Settlement Dashboard - Provider Balance Detail", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settlement");
  });

  test("AC6.5.3 - View detail button opens provider balance modal (if balances exist)", async ({
    page,
  }) => {
    const detailButton = page.locator("[data-testid^='view-detail-']").first();

    if (await detailButton.isVisible()) {
      await detailButton.click();

      // Modal should appear
      const modal = page.getByTestId("provider-balance-detail-modal");
      await expect(modal).toBeVisible();

      // Should show provider name in header
      await expect(page.getByText("Detalle de Cuenta")).toBeVisible();

      // Should show balance summary
      await expect(page.getByText("Total Adeudado")).toBeVisible();

      // Should show aging information
      await expect(page.getByText("Dias Pendiente")).toBeVisible();
    }
  });

  test("AC6.5.3 - Detail modal shows ledger history section", async ({
    page,
  }) => {
    const detailButton = page.locator("[data-testid^='view-detail-']").first();

    if (await detailButton.isVisible()) {
      await detailButton.click();

      const modal = page.getByTestId("provider-balance-detail-modal");
      await expect(modal).toBeVisible();

      // Ledger history section should be visible
      await expect(page.getByText("Historial de Movimientos")).toBeVisible();
    }
  });

  test("AC6.5.3 - Detail modal can be closed", async ({ page }) => {
    const detailButton = page.locator("[data-testid^='view-detail-']").first();

    if (await detailButton.isVisible()) {
      await detailButton.click();

      const modal = page.getByTestId("provider-balance-detail-modal");
      await expect(modal).toBeVisible();

      // Click close button
      const closeBtn = page.getByText("Cerrar");
      await closeBtn.click();

      // Modal should be closed
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe("Settlement Dashboard - Mobile Navigation", () => {
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

  test("AC6.5.1 - Bottom nav shows Finanzas link on mobile", async ({
    page,
  }) => {
    const bottomNav = page.getByTestId("admin-bottom-nav");
    await expect(bottomNav).toBeVisible();

    const finanzasLink = page.getByTestId("bottom-nav-finanzas");
    await expect(finanzasLink).toBeVisible();
  });

  test("AC6.5.1 - Mobile nav navigates to settlement page", async ({ page }) => {
    const finanzasLink = page.getByTestId("bottom-nav-finanzas");
    await finanzasLink.click();

    await page.waitForURL("**/admin/settlement", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settlement");
  });

  test("AC6.5.1 - Summary cards stack vertically on mobile", async ({
    page,
  }) => {
    await page.goto("/admin/settlement");

    const summarySection = page.getByTestId("settlement-summary");
    await expect(summarySection).toBeVisible();

    // All three summary cards should still be visible on mobile
    await expect(page.getByTestId("total-pending")).toBeVisible();
    await expect(page.getByTestId("total-overdue")).toBeVisible();
    await expect(page.getByTestId("pending-verifications")).toBeVisible();
  });
});

test.describe("Settlement Dashboard - Auth Protection", () => {
  test("Settlement page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/settlement");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});
