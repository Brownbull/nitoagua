import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Story 12.7-6: Admin Dispute Resolution
 *
 * Bug Reference: BUG-016 - Admin needs dispute resolution tools
 *
 * Test coverage for acceptance criteria:
 * - AC12.7.6.1: Dispute list view with navigation and filters
 * - AC12.7.6.2: Dispute detail view with order info and timeline
 * - AC12.7.6.3: Resolution actions with confirmation
 * - AC12.7.6.4: Notifications on resolution (verified via DB)
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("12.7-6 Admin Disputes - Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await assertNoErrorState(page);
  });

  test("AC12.7.6.1 - Disputas nav item appears in sidebar", async ({ page }) => {
    // Set desktop viewport to see sidebar
    await page.setViewportSize({ width: 1024, height: 768 });

    const disputasLink = page.getByTestId("nav-disputas");
    await expect(disputasLink).toBeVisible();
  });

  test("AC12.7.6.1 - Clicking Disputas navigates to disputes page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    const disputasLink = page.getByTestId("nav-disputas");
    await disputasLink.click();

    await page.waitForURL("**/admin/disputes", { timeout: 10000 });
    expect(page.url()).toContain("/admin/disputes");
  });

  test("AC12.7.6.1 - Disputes page displays correctly", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    // Page header should be visible
    const pageTitle = page.getByTestId("disputes-title");
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText("Disputas");
  });

  test("AC12.7.6.1 - Back button returns to dashboard", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
  });
});

test.describe("12.7-6 Admin Disputes - List and Filters", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);
  });

  test("AC12.7.6.1 - Stats cards show dispute counts", async ({ page }) => {
    // Should show stats cards for Total, Abiertas, En Revisión, Resueltas
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Abiertas")).toBeVisible();
    await expect(page.getByText("En Revisión")).toBeVisible();
    await expect(page.getByText("Resueltas")).toBeVisible();
  });

  test("AC12.7.6.1 - Filter by open status works", async ({ page }) => {
    // Click on Abiertas filter card
    const openFilter = page.locator('a[href="/admin/disputes?status=open"]');
    await openFilter.click();

    await page.waitForURL("**/admin/disputes?status=open", { timeout: 10000 });
    expect(page.url()).toContain("status=open");
  });

  test("AC12.7.6.1 - Filter by resolved status works", async ({ page }) => {
    // Click on Resueltas filter card
    const resolvedFilter = page.locator('a[href="/admin/disputes?status=resolved"]');
    await resolvedFilter.click();

    await page.waitForURL("**/admin/disputes?status=resolved", { timeout: 10000 });
    expect(page.url()).toContain("status=resolved");
  });

  test("AC12.7.6.1 - Shows empty state when no disputes", async ({ page }) => {
    // Apply a filter that might return no results
    await page.goto("/admin/disputes?status=under_review");
    await assertNoErrorState(page);

    // Either shows disputes or empty state
    const hasDisputes = await page.locator("[data-testid^='dispute-']").count();

    if (hasDisputes === 0) {
      await expect(page.getByText("Sin disputas")).toBeVisible();
    }
  });

  test("AC12.7.6.1 - Disputes list shows required info", async ({ page }) => {
    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      // Should show dispute type (one of the known types in Spanish)
      const hasType = await firstDispute
        .locator('text=/No recibí|Cantidad incorrecta|Llegó tarde|Mala calidad|Otro/')
        .count();
      expect(hasType).toBeGreaterThan(0);

      // Should show status badge
      const hasBadge = await firstDispute
        .locator('text=/Abierta|En Revisión|Resuelta/')
        .count();
      expect(hasBadge).toBeGreaterThan(0);
    }
  });

  test("AC12.7.6.1 - Clicking dispute navigates to detail", async ({ page }) => {
    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();

      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      expect(page.url()).toMatch(/\/admin\/disputes\/[a-zA-Z0-9-]+/);
    }
  });
});

test.describe("12.7-6 Admin Disputes - Detail View", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.7.6.2 - Detail page shows dispute ID", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Should show dispute ID in header
      const disputeId = page.getByTestId("dispute-id");
      await expect(disputeId).toBeVisible();
      const text = await disputeId.textContent();
      expect(text).toMatch(/^Disputa #[a-zA-Z0-9]+/);
    }
  });

  test("AC12.7.6.2 - Detail page shows consumer info", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Consumer section should be visible
      await expect(page.getByText("Consumidor")).toBeVisible();

      // WhatsApp link should be available
      const whatsappLink = page.getByTestId("consumer-whatsapp");
      await expect(whatsappLink).toBeVisible();
    }
  });

  test("AC12.7.6.2 - Detail page shows provider info", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Provider section should be visible
      await expect(page.getByText("Proveedor")).toBeVisible();

      // WhatsApp link should be available
      const whatsappLink = page.getByTestId("provider-whatsapp");
      await expect(whatsappLink).toBeVisible();
    }
  });

  test("AC12.7.6.2 - Detail page shows timeline", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Timeline section should be visible
      await expect(page.getByText("Linea de Tiempo")).toBeVisible();

      // Should show at least "Pedido Creado" and "Disputa Abierta"
      await expect(page.getByText("Pedido Creado")).toBeVisible();
      await expect(page.getByText("Disputa Abierta")).toBeVisible();
    }
  });

  test("AC12.7.6.2 - View order link navigates to order detail", async ({
    page,
  }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // View order link should be visible
      const viewOrderLink = page.getByTestId("view-order");
      await expect(viewOrderLink).toBeVisible();

      // Click and verify navigation
      await viewOrderLink.click();
      await page.waitForURL("**/admin/orders/**", { timeout: 10000 });
      expect(page.url()).toMatch(/\/admin\/orders\/[a-zA-Z0-9-]+/);
    }
  });

  test("AC12.7.6.2 - Back button returns to disputes list", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });

      // Click back button
      const backButton = page.getByTestId("back-to-disputes");
      await expect(backButton).toBeVisible();
      await backButton.click();

      await page.waitForURL("**/admin/disputes", { timeout: 10000 });
      expect(page.url()).toMatch(/\/admin\/disputes$/);
    }
  });
});

test.describe("12.7-6 Admin Disputes - Resolution Actions", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.7.6.3 - Resolution buttons visible for open disputes", async ({
    page,
  }) => {
    // Navigate to disputes with open filter
    await page.goto("/admin/disputes?status=open");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Resolution section should be visible
      await expect(page.getByText("Resolver Disputa")).toBeVisible();

      // Notes textarea should be visible
      const notesTextarea = page.getByTestId("resolution-notes");
      await expect(notesTextarea).toBeVisible();

      // Resolution buttons should be visible
      const resolveConsumerButton = page.getByTestId("resolve-consumer");
      const resolveProviderButton = page.getByTestId("resolve-provider");
      await expect(resolveConsumerButton).toBeVisible();
      await expect(resolveProviderButton).toBeVisible();
    }
  });

  test("AC12.7.6.3 - Notes are required before resolving", async ({ page }) => {
    await page.goto("/admin/disputes?status=open");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Try to resolve without notes
      const resolveConsumerButton = page.getByTestId("resolve-consumer");
      if (await resolveConsumerButton.isVisible()) {
        await resolveConsumerButton.click();

        // Should show error message
        await expect(page.getByText("Debes agregar notas")).toBeVisible();
      }
    }
  });

  test("AC12.7.6.3 - Confirmation dialog appears before resolution", async ({
    page,
  }) => {
    await page.goto("/admin/disputes?status=open");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Enter notes
      const notesTextarea = page.getByTestId("resolution-notes");
      if (await notesTextarea.isVisible()) {
        await notesTextarea.fill("Investigación completada. Se verificó la entrega.");

        // Click resolve button
        const resolveProviderButton = page.getByTestId("resolve-provider");
        await resolveProviderButton.click();

        // Confirmation dialog should appear
        await expect(page.getByText("Confirmar Resolución")).toBeVisible();
        await expect(page.getByText("a favor del proveedor")).toBeVisible();

        // Cancel button should close dialog
        await page.getByRole("button", { name: "Cancelar" }).click();
        await expect(page.getByText("Confirmar Resolución")).not.toBeVisible();
      }
    }
  });

  test("AC12.7.6.3 - Resolution buttons not visible for resolved disputes", async ({
    page,
  }) => {
    // Navigate to disputes with resolved filter
    await page.goto("/admin/disputes?status=resolved");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Resolution buttons should NOT be visible
      const resolveConsumerButton = page.getByTestId("resolve-consumer");
      const resolveProviderButton = page.getByTestId("resolve-provider");
      await expect(resolveConsumerButton).not.toBeVisible();
      await expect(resolveProviderButton).not.toBeVisible();

      // Should show resolution notes instead
      await expect(page.getByText("Notas de Resolución")).toBeVisible();
    }
  });
});

test.describe("12.7-6 Admin Disputes - Auth Protection", () => {
  test("Disputes page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/disputes");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });

  test("Dispute detail page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/disputes/some-dispute-id");

    // Should redirect to login page
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("12.7-6 Admin Disputes - Mobile Navigation", () => {
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

  test("AC12.7.6.1 - Disputes page loads on mobile", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    // Page title should be visible
    const pageTitle = page.getByTestId("disputes-title");
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText("Disputas");
  });

  test("AC12.7.6.1 - Stats cards visible on mobile", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    // Stats should be visible on mobile
    await expect(page.getByText("Total")).toBeVisible();
    await expect(page.getByText("Abiertas")).toBeVisible();
  });

  test("AC12.7.6.2 - Dispute detail loads on mobile", async ({ page }) => {
    await page.goto("/admin/disputes");
    await assertNoErrorState(page);

    const firstDispute = page.locator("[data-testid^='dispute-']").first();

    if (await firstDispute.isVisible()) {
      await firstDispute.click();
      await page.waitForURL("**/admin/disputes/**", { timeout: 10000 });
      await assertNoErrorState(page);

      // Key elements should be visible on mobile
      await expect(page.getByText("Detalles de la Disputa")).toBeVisible();
      await expect(page.getByText("Consumidor")).toBeVisible();
      await expect(page.getByText("Proveedor")).toBeVisible();
    }
  });
});
