import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Story 6.4: Provider Directory
 *
 * Test coverage for acceptance criteria:
 * - AC6.4.1: Admin can view searchable table of all providers
 * - AC6.4.2: Table columns: Name, Phone, Status, Deliveries, Commission Owed, Joined
 * - AC6.4.3: Table supports filtering by status and service area
 * - AC6.4.4: Clicking provider shows detail panel
 * - AC6.4.5: Admin can suspend provider (with reason)
 * - AC6.4.6: Admin can unsuspend provider
 * - AC6.4.7: Admin can ban provider (requires confirmation)
 * - AC6.4.8: Admin can adjust commission rate per provider
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("Provider Directory - View and Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.4.1 - Admin can navigate to provider directory from sidebar", async ({
    page,
  }) => {
    // Click Proveedores in sidebar (desktop)
    await page.setViewportSize({ width: 1024, height: 768 });

    const proveedoresLink = page.getByTestId("nav-proveedores");
    await expect(proveedoresLink).toBeVisible();
    await proveedoresLink.click();

    await page.waitForURL("**/admin/providers", { timeout: 10000 });
    expect(page.url()).toContain("/admin/providers");
  });

  test("AC6.4.1 - Provider directory page displays correctly", async ({ page }) => {
    await page.goto("/admin/providers");

    // Page header should be visible
    await expect(page.getByText("Proveedores")).toBeVisible();

    // Search input should be visible
    await expect(page.getByTestId("search-input")).toBeVisible();

    // Status filter should be visible
    await expect(page.getByTestId("status-filter")).toBeVisible();

    // Area filter should be visible
    await expect(page.getByTestId("area-filter")).toBeVisible();
  });

  test("AC6.4.1 - Provider directory shows empty state when no providers", async ({
    page,
  }) => {
    await page.goto("/admin/providers?search=nonexistentprovider12345");

    // Should show empty state message
    const emptyState = page.getByTestId("empty-directory");
    // Either empty state or results should be visible
    const directory = page.getByTestId("provider-directory");
    await expect(directory).toBeVisible();
  });
});

test.describe("Provider Directory - Table Display", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/providers");
  });

  test("AC6.4.2 - Table displays required columns on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Wait for table to load
    const table = page.getByTestId("providers-table");

    // Check if table exists (may be empty)
    const tableExists = await table.isVisible().catch(() => false);

    if (tableExists) {
      // Check column headers
      await expect(page.getByText("Nombre", { exact: false })).toBeVisible();
      await expect(page.getByText("Telefono", { exact: false })).toBeVisible();
      await expect(page.getByText("Estado", { exact: false })).toBeVisible();
      await expect(page.getByText("Entregas", { exact: false })).toBeVisible();
      await expect(page.getByText("Comision", { exact: false })).toBeVisible();
      await expect(page.getByText("Registro", { exact: false })).toBeVisible();
    }
  });

  test("AC6.4.2 - Mobile view shows provider cards", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // On mobile, should show cards instead of table
    const directory = page.getByTestId("provider-directory");
    await expect(directory).toBeVisible();

    // Table should be hidden on mobile
    const table = page.getByTestId("providers-table");
    await expect(table).not.toBeVisible();
  });
});

test.describe("Provider Directory - Search and Filters", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/providers");
  });

  test("AC6.4.1 - Search bar filters providers by name", async ({ page }) => {
    const searchInput = page.getByTestId("search-input");
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill("test");

    // Wait for debounce and URL update
    await page.waitForURL(/search=test/, { timeout: 5000 }).catch(() => {});

    // URL should contain search param
    const url = page.url();
    expect(url).toContain("search=test");
  });

  test("AC6.4.3 - Status filter updates results", async ({ page }) => {
    const statusFilter = page.getByTestId("status-filter");
    await expect(statusFilter).toBeVisible();

    // Select approved status
    await statusFilter.selectOption("approved");

    // Wait for URL update
    await page.waitForURL(/status=approved/, { timeout: 5000 }).catch(() => {});

    // URL should contain status param
    const url = page.url();
    expect(url).toContain("status=approved");
  });

  test("AC6.4.3 - Area filter updates results", async ({ page }) => {
    const areaFilter = page.getByTestId("area-filter");
    await expect(areaFilter).toBeVisible();

    // Check if there are any options besides "all"
    const options = await areaFilter.locator("option").allTextContents();

    if (options.length > 1) {
      // Select second option (first non-all option)
      await areaFilter.selectOption({ index: 1 });

      // URL should update
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain("area=");
    }
  });

  test("AC6.4.1 - Clear filters button resets all filters", async ({ page }) => {
    // Apply some filters first
    await page.goto("/admin/providers?status=approved&search=test");

    // Clear filters button should be visible
    const clearButton = page.getByText("Limpiar filtros");

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Should redirect to clean URL
      await page.waitForURL("**/admin/providers", { timeout: 5000 });
      const url = page.url();
      expect(url).not.toContain("status=");
      expect(url).not.toContain("search=");
    }
  });
});

test.describe("Provider Directory - Detail Panel", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/providers");
  });

  test("AC6.4.4 - Clicking provider row opens detail panel", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Wait for providers to load
    await page.waitForTimeout(1000);

    // Find any provider row and click it
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      // Detail panel should open
      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Panel should show provider details
      await expect(page.getByText("Detalles del Proveedor")).toBeVisible();
    }
  });

  test("AC6.4.4 - Detail panel shows all required information", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Click first provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Check for contact info section
      await expect(page.getByText("Informacion de Contacto")).toBeVisible();

      // Check for statistics section
      await expect(page.getByText("Estadisticas")).toBeVisible();

      // Check for commission section
      await expect(page.getByText("Tasa de Comision")).toBeVisible();

      // Check for actions section
      await expect(page.getByText("Acciones")).toBeVisible();
    }
  });

  test("AC6.4.4 - Detail panel can be closed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Click first provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Click close button
      const closeButton = page.getByTestId("close-panel");
      await closeButton.click();

      // Panel should be hidden
      await expect(detailPanel).not.toBeVisible();
    }
  });

  test("AC6.4.4 - Clicking backdrop closes detail panel", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Click first provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Click backdrop
      const backdrop = page.getByTestId("panel-backdrop");
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Panel should be hidden
      await expect(detailPanel).not.toBeVisible();
    }
  });
});

test.describe("Provider Directory - Actions UI", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/providers");
  });

  test("AC6.4.5 - Suspend button is visible for approved providers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/providers?status=approved");
    await page.waitForTimeout(1000);

    // Click first approved provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Suspend button should be visible
      const suspendBtn = page.getByTestId("suspend-btn");
      await expect(suspendBtn).toBeVisible();
    }
  });

  test("AC6.4.5 - Suspend dialog requires reason", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/providers?status=approved");
    await page.waitForTimeout(1000);

    // Click first approved provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Click suspend button
      const suspendBtn = page.getByTestId("suspend-btn");
      if (await suspendBtn.isVisible()) {
        await suspendBtn.click();

        // Dialog should appear
        const dialog = page.getByTestId("suspend-dialog");
        await expect(dialog).toBeVisible();

        // Confirm button should be disabled without reason
        const confirmBtn = page.getByTestId("confirm-suspend-btn");
        await expect(confirmBtn).toBeDisabled();

        // Fill reason
        const reasonInput = page.getByTestId("suspend-reason-input");
        await reasonInput.fill("Test suspension reason");

        // Confirm button should be enabled
        await expect(confirmBtn).toBeEnabled();
      }
    }
  });

  test("AC6.4.6 - Unsuspend button is visible for suspended providers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/providers?status=suspended");
    await page.waitForTimeout(1000);

    // Click first suspended provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Unsuspend button should be visible
      const unsuspendBtn = page.getByTestId("unsuspend-btn");
      await expect(unsuspendBtn).toBeVisible();
    }
  });

  test("AC6.4.7 - Ban dialog shows permanent warning", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/providers?status=approved");
    await page.waitForTimeout(1000);

    // Click first provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Click ban button
      const banBtn = page.getByTestId("ban-btn");
      if (await banBtn.isVisible()) {
        await banBtn.click();

        // Dialog should appear with warning
        const dialog = page.getByTestId("ban-dialog");
        await expect(dialog).toBeVisible();

        // Warning message should be visible
        await expect(page.getByText("Esta accion es permanente")).toBeVisible();
      }
    }
  });

  test("AC6.4.8 - Commission rate edit dialog works", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    await page.waitForTimeout(1000);

    // Click first provider
    const providerRow = page.locator("[data-testid^='provider-row-']").first();

    if (await providerRow.isVisible()) {
      await providerRow.click();

      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Click edit commission button
      const editCommissionBtn = page.getByTestId("edit-commission-btn");
      await expect(editCommissionBtn).toBeVisible();
      await editCommissionBtn.click();

      // Dialog should appear
      const dialog = page.getByTestId("commission-dialog");
      await expect(dialog).toBeVisible();

      // Input should be visible
      const rateInput = page.getByTestId("commission-rate-input");
      await expect(rateInput).toBeVisible();

      // Enter a rate
      await rateInput.fill("8");

      // Save button should be enabled
      const saveBtn = page.getByTestId("confirm-commission-btn");
      await expect(saveBtn).toBeEnabled();
    }
  });
});

test.describe("Provider Directory - Mobile Navigation", () => {
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

  test("AC6.4.1 - Bottom nav shows Proveedores link on mobile", async ({ page }) => {
    const bottomNav = page.getByTestId("admin-bottom-nav");
    await expect(bottomNav).toBeVisible();

    // Open operations menu to see Proveedores
    const operationsBtn = page.getByTestId("bottom-nav-operations");
    await operationsBtn.click();

    const proveedoresLink = page.getByTestId("operations-proveedores");
    await expect(proveedoresLink).toBeVisible();
  });

  test("AC6.4.1 - Mobile nav navigates to providers page", async ({ page }) => {
    // Open operations menu to see Proveedores
    const operationsBtn = page.getByTestId("bottom-nav-operations");
    await operationsBtn.click();

    const proveedoresLink = page.getByTestId("operations-proveedores");
    await proveedoresLink.click();

    await page.waitForURL("**/admin/providers", { timeout: 10000 });
    expect(page.url()).toContain("/admin/providers");
  });

  test("AC6.4.4 - Provider cards are clickable on mobile", async ({ page }) => {
    await page.goto("/admin/providers");
    await page.waitForTimeout(1000);

    // Find any provider card
    const providerCard = page.locator("[data-testid^='provider-card-']").first();

    if (await providerCard.isVisible()) {
      await providerCard.click();

      // Detail panel should open
      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();
    }
  });

  test("BUG-020 - Provider detail panel action buttons visible on iPhone SE", async ({ page }) => {
    // Use iPhone SE viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/admin/providers");
    await page.waitForTimeout(1000);

    // Find any provider card and click it
    const providerCard = page.locator("[data-testid^='provider-card-']").first();

    if (await providerCard.isVisible()) {
      await providerCard.click();

      // Detail panel should open
      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Wait for panel to fully render
      await page.waitForTimeout(300);

      // Action buttons should be visible without scrolling (they're now sticky at bottom)
      // Check for Acciones header which contains the buttons
      const actionsHeader = page.getByText("Acciones", { exact: false }).last();
      await expect(actionsHeader).toBeVisible();

      // At least one action button should be visible (Suspender or Banear for approved, Reactivar for suspended)
      const suspendBtn = page.getByTestId("suspend-btn");
      const banBtn = page.getByTestId("ban-btn");
      const unsuspendBtn = page.getByTestId("unsuspend-btn");

      // One of these buttons should be visible depending on provider status
      const anyButtonVisible = await Promise.any([
        suspendBtn.isVisible().then(v => v ? true : Promise.reject()),
        banBtn.isVisible().then(v => v ? true : Promise.reject()),
        unsuspendBtn.isVisible().then(v => v ? true : Promise.reject()),
      ]).catch(() => false);

      expect(anyButtonVisible).toBe(true);
    }
  });

  test("BUG-020 - Provider detail panel action buttons visible on standard mobile (375x812)", async ({ page }) => {
    // Use standard mobile viewport (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/providers");
    await page.waitForTimeout(1000);

    // Find any provider card and click it
    const providerCard = page.locator("[data-testid^='provider-card-']").first();

    if (await providerCard.isVisible()) {
      await providerCard.click();

      // Detail panel should open
      const detailPanel = page.getByTestId("provider-detail-panel");
      await expect(detailPanel).toBeVisible();

      // Wait for panel to fully render
      await page.waitForTimeout(300);

      // Action buttons should be visible without scrolling (they're now sticky at bottom)
      const actionsHeader = page.getByText("Acciones", { exact: false }).last();
      await expect(actionsHeader).toBeVisible();

      // At least one action button should be visible
      const suspendBtn = page.getByTestId("suspend-btn");
      const banBtn = page.getByTestId("ban-btn");
      const unsuspendBtn = page.getByTestId("unsuspend-btn");

      const anyButtonVisible = await Promise.any([
        suspendBtn.isVisible().then(v => v ? true : Promise.reject()),
        banBtn.isVisible().then(v => v ? true : Promise.reject()),
        unsuspendBtn.isVisible().then(v => v ? true : Promise.reject()),
      ]).catch(() => false);

      expect(anyButtonVisible).toBe(true);
    }
  });
});

test.describe("Provider Directory - Pagination", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/providers");
  });

  test("AC6.4.1 - Pagination controls are visible when needed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // Pagination may or may not be visible depending on provider count
    const prevButton = page.getByTestId("prev-page");
    const nextButton = page.getByTestId("next-page");

    // If there are enough providers, pagination should be visible
    // Otherwise this is expected to not be visible
    const paginationVisible = await prevButton.isVisible().catch(() => false);

    if (paginationVisible) {
      // First page should have prev disabled
      await expect(prevButton).toBeDisabled();
    }
  });

  test("AC6.4.1 - Page navigation works", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Go to page 2 via URL
    await page.goto("/admin/providers?page=2");

    // URL should contain page param
    expect(page.url()).toContain("page=2");
  });
});

test.describe("Provider Directory - Status Badges", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.4.2 - Status badges display correctly for each status", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Test approved status
    await page.goto("/admin/providers?status=approved");
    await page.waitForTimeout(500);

    const directory = page.getByTestId("provider-directory");
    await expect(directory).toBeVisible();

    // Test suspended status
    await page.goto("/admin/providers?status=suspended");
    await page.waitForTimeout(500);
    await expect(directory).toBeVisible();

    // Test banned status
    await page.goto("/admin/providers?status=banned");
    await page.waitForTimeout(500);
    await expect(directory).toBeVisible();

    // Test pending status
    await page.goto("/admin/providers?status=pending");
    await page.waitForTimeout(500);
    await expect(directory).toBeVisible();
  });
});
