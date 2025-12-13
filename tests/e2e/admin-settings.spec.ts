import { test, expect } from "@playwright/test";

test.describe("Admin Settings Page - Unauthenticated Access", () => {
  test("AC6.2.1 - Unauthenticated access to /admin/settings redirects to login", async ({
    page,
  }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access settings directly
    await page.goto("/admin/settings");

    // Should redirect to login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Admin Settings Dev Login", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login only available when NEXT_PUBLIC_DEV_LOGIN=true"
  );

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible({ timeout: 10000 });

    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await devLoginButton.click();

    // Wait for dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.2.1 - Admin can navigate to Configuracion from sidebar (desktop)", async ({
    page,
  }) => {
    // Set desktop viewport to see sidebar
    await page.setViewportSize({ width: 1280, height: 800 });

    // Refresh to ensure sidebar loads
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Find and click the Config link in sidebar
    const configLink = page.getByTestId("nav-config");
    await expect(configLink).toBeVisible({ timeout: 10000 });
    await configLink.click();

    // Should navigate to settings page
    await page.waitForURL("**/admin/settings", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settings");

    // Verify page title (use heading role to avoid multiple matches)
    await expect(
      page.getByRole("heading", { name: "Configuracion" })
    ).toBeVisible();
  });

  test("AC6.2.1 - Admin can navigate to Configuracion from bottom nav (mobile)", async ({
    page,
  }) => {
    // Set mobile viewport to see bottom nav
    await page.setViewportSize({ width: 375, height: 667 });

    // Refresh to ensure bottom nav loads
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify bottom nav is visible
    const bottomNav = page.getByTestId("admin-bottom-nav");
    await expect(bottomNav).toBeVisible({ timeout: 10000 });

    // Find and click the Config link in bottom nav
    const configLink = page.getByTestId("bottom-nav-config");
    await expect(configLink).toBeVisible();
    await configLink.click();

    // Should navigate to settings page
    await page.waitForURL("**/admin/settings", { timeout: 10000 });
    expect(page.url()).toContain("/admin/settings");

    // Verify page title
    await expect(
      page.getByRole("heading", { name: "Configuracion" })
    ).toBeVisible();
  });

  test("AC6.2.2 - Settings page shows offer validity fields with min, default, max", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Verify offer validity section exists
    const offerValiditySection = page.getByTestId("offer-validity-section");
    await expect(offerValiditySection).toBeVisible();

    // Verify all three inputs are present
    const minInput = page.getByTestId("input-offer-validity-min");
    const defaultInput = page.getByTestId("input-offer-validity-default");
    const maxInput = page.getByTestId("input-offer-validity-max");

    await expect(minInput).toBeVisible();
    await expect(defaultInput).toBeVisible();
    await expect(maxInput).toBeVisible();

    // Verify labels
    await expect(page.getByText("Validez minima")).toBeVisible();
    await expect(page.getByText("Validez por defecto")).toBeVisible();
    await expect(page.getByText("Validez maxima")).toBeVisible();

    // Verify unit indicators (min)
    await expect(offerValiditySection.getByText("min").first()).toBeVisible();
  });

  test("AC6.2.3 - Settings page shows request timeout field in hours", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Verify timeout section exists
    const timeoutSection = page.getByTestId("request-timeout-section");
    await expect(timeoutSection).toBeVisible();

    // Verify input is present
    const timeoutInput = page.getByTestId("input-request-timeout-hours");
    await expect(timeoutInput).toBeVisible();

    // Verify label
    await expect(page.getByText("Timeout de Pedidos")).toBeVisible();

    // Verify unit indicator (hrs)
    await expect(timeoutSection.getByText("hrs")).toBeVisible();
  });

  test("AC6.2.4 - Changes require confirmation before saving", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Get the default input and change its value
    const defaultInput = page.getByTestId("input-offer-validity-default");
    await defaultInput.clear();
    await defaultInput.fill("45");

    // Click save button
    const saveButton = page.getByTestId("save-settings-button");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByTestId("confirmation-dialog");
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Dialog should show what's changing
    await expect(page.getByText("Confirmar Cambios")).toBeVisible();
    // Use the dialog to scope the search for the change text
    await expect(
      confirmDialog.getByText("Validez por defecto")
    ).toBeVisible();

    // Dialog should have cancel and confirm buttons
    await expect(page.getByTestId("cancel-confirmation")).toBeVisible();
    await expect(page.getByTestId("confirm-save")).toBeVisible();

    // Cancel should close the dialog
    await page.getByTestId("cancel-confirmation").click();
    await expect(confirmDialog).not.toBeVisible();
  });

  test("AC6.2.5 - Changes take effect immediately (settings persist on reload)", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Change timeout value
    const timeoutInput = page.getByTestId("input-request-timeout-hours");
    const originalValue = await timeoutInput.inputValue();
    const newValue = originalValue === "5" ? "6" : "5";

    await timeoutInput.clear();
    await timeoutInput.fill(newValue);

    // Save changes
    const saveButton = page.getByTestId("save-settings-button");
    await saveButton.click();

    // Confirm in dialog
    const confirmButton = page.getByTestId("confirm-save");
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Wait for save to complete (dialog closes)
    await expect(page.getByTestId("confirmation-dialog")).not.toBeVisible({
      timeout: 10000,
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify value persisted
    const updatedInput = page.getByTestId("input-request-timeout-hours");
    await expect(updatedInput).toHaveValue(newValue);

    // Restore original value
    await updatedInput.clear();
    await updatedInput.fill(originalValue);
    await saveButton.click();
    await confirmButton.click();
    await expect(page.getByTestId("confirmation-dialog")).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("AC6.2.6 - Invalid values show validation error - min must be > 0", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Set min to 0
    const minInput = page.getByTestId("input-offer-validity-min");
    await minInput.clear();
    await minInput.fill("0");

    // Click save
    const saveButton = page.getByTestId("save-settings-button");
    await saveButton.click();

    // Should show validation error
    const errorMessage = page.getByTestId("error-offer-validity-min");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Confirmation dialog should NOT appear
    await expect(page.getByTestId("confirmation-dialog")).not.toBeVisible();
  });

  test("AC6.2.6 - Invalid values show validation error - max < default", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Set default to 60, max to 30 (invalid: max < default)
    const defaultInput = page.getByTestId("input-offer-validity-default");
    const maxInput = page.getByTestId("input-offer-validity-max");

    await defaultInput.clear();
    await defaultInput.fill("60");

    await maxInput.clear();
    await maxInput.fill("30");

    // Click save
    const saveButton = page.getByTestId("save-settings-button");
    await saveButton.click();

    // Should show validation error
    const errorMessage = page.getByTestId("error-offer-validity-max");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText("maximo");

    // Confirmation dialog should NOT appear
    await expect(page.getByTestId("confirmation-dialog")).not.toBeVisible();
  });

  test("AC6.2.6 - Invalid values show validation error - default < min", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Set min to 20, default to 10 (invalid: default < min)
    const minInput = page.getByTestId("input-offer-validity-min");
    const defaultInput = page.getByTestId("input-offer-validity-default");

    await minInput.clear();
    await minInput.fill("20");

    await defaultInput.clear();
    await defaultInput.fill("10");

    // Click save
    const saveButton = page.getByTestId("save-settings-button");
    await saveButton.click();

    // Should show validation error
    const errorMessage = page.getByTestId("error-offer-validity-default");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText("minimo");

    // Confirmation dialog should NOT appear
    await expect(page.getByTestId("confirmation-dialog")).not.toBeVisible();
  });

  test("Save button is disabled when no changes made", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Save button should be disabled when form is pristine
    const saveButton = page.getByTestId("save-settings-button");
    await expect(saveButton).toBeDisabled();
  });

  test("Save button becomes enabled when values change", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Save button initially disabled
    const saveButton = page.getByTestId("save-settings-button");
    await expect(saveButton).toBeDisabled();

    // Change a value
    const defaultInput = page.getByTestId("input-offer-validity-default");
    const currentValue = await defaultInput.inputValue();
    await defaultInput.clear();
    await defaultInput.fill(String(Number(currentValue) + 1));

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();
  });

  test("Back button returns to dashboard", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Click back button
    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should navigate to dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/admin/dashboard");
  });

  test("Settings page displays current admin session", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Should show admin email (scope to main content area)
    await expect(
      page.getByRole("main").getByText("admin@nitoagua.cl")
    ).toBeVisible();
    await expect(page.getByText("Sesion activa como:")).toBeVisible();
  });

  test("Preview text shows current configuration", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Check preview text exists
    await expect(page.getByText("Rango configurado:")).toBeVisible();
  });
});

test.describe("Admin Settings - Form Accessibility", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login only available when NEXT_PUBLIC_DEV_LOGIN=true"
  );

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible({ timeout: 10000 });

    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await devLoginButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");
  });

  test("All form inputs have labels", async ({ page }) => {
    // Check that inputs have associated labels
    await expect(page.locator("label[for='offer_validity_min']")).toBeVisible();
    await expect(
      page.locator("label[for='offer_validity_default']")
    ).toBeVisible();
    await expect(page.locator("label[for='offer_validity_max']")).toBeVisible();
    await expect(
      page.locator("label[for='request_timeout_hours']")
    ).toBeVisible();
  });

  test("Inputs accept numeric values only", async ({ page }) => {
    const minInput = page.getByTestId("input-offer-validity-min");

    // Verify input type is number
    await expect(minInput).toHaveAttribute("type", "number");
  });
});
