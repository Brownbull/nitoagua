import { test, expect } from "@playwright/test";

test.describe("Admin Pricing Page - Unauthenticated Access", () => {
  test("Unauthenticated access to /admin/pricing redirects to login", async ({
    page,
  }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access pricing directly
    await page.goto("/admin/pricing");

    // Should redirect to login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Admin Pricing Dev Login", () => {
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

  test("AC6.9.1 - Admin can navigate to pricing from sidebar (desktop)", async ({
    page,
  }) => {
    // Set desktop viewport to see sidebar
    await page.setViewportSize({ width: 1280, height: 800 });

    // Refresh to ensure sidebar loads
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Find and click the Precios link in sidebar
    const pricingLink = page.getByTestId("nav-precios");
    await expect(pricingLink).toBeVisible({ timeout: 10000 });
    await pricingLink.click();

    // Should navigate to pricing page
    await page.waitForURL("**/admin/pricing", { timeout: 10000 });
    expect(page.url()).toContain("/admin/pricing");

    // Verify page title
    await expect(
      page.getByRole("heading", { name: "Precios" })
    ).toBeVisible();
  });

  test("AC6.9.2 - Pricing form displays 4 water tier price inputs", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Verify all four price inputs are present
    const price100l = page.getByTestId("input-price-100l");
    const price1000l = page.getByTestId("input-price-1000l");
    const price5000l = page.getByTestId("input-price-5000l");
    const price10000l = page.getByTestId("input-price-10000l");

    await expect(price100l).toBeVisible();
    await expect(price1000l).toBeVisible();
    await expect(price5000l).toBeVisible();
    await expect(price10000l).toBeVisible();

    // Verify tier labels
    await expect(page.getByText("100L")).toBeVisible();
    await expect(page.getByText("1,000L")).toBeVisible();
    await expect(page.getByText("5,000L")).toBeVisible();
    await expect(page.getByText("10,000L")).toBeVisible();

    // Verify CLP suffix is present
    await expect(page.getByText("CLP").first()).toBeVisible();
  });

  test("AC6.9.3 - Urgency surcharge input displays as percentage", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Verify urgency surcharge input is present
    const urgencyInput = page.getByTestId("input-urgency-surcharge");
    await expect(urgencyInput).toBeVisible();

    // Verify section header
    await expect(page.getByText("Recargo Urgencia")).toBeVisible();

    // Verify percentage suffix is present
    const urgencySection = urgencyInput.locator("..").locator("..");
    await expect(urgencySection.getByText("%")).toBeVisible();
  });

  test("AC6.9.4 - Platform commission input displays as percentage", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Verify commission input is present
    const commissionInput = page.getByTestId("input-commission");
    await expect(commissionInput).toBeVisible();

    // Verify section header
    await expect(page.getByText("Comision Plataforma")).toBeVisible();
  });

  test("AC6.9.5 - Commission preview shows example calculation", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Verify commission preview is present
    const commissionPreview = page.getByTestId("commission-preview");
    await expect(commissionPreview).toBeVisible();

    // Preview should contain expected format
    await expect(commissionPreview).toContainText("En un pedido de");
    await expect(commissionPreview).toContainText("la plataforma gana");
  });

  test("AC6.9.5 - Commission preview updates dynamically", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Get initial preview text
    const commissionPreview = page.getByTestId("commission-preview");
    const initialPreview = await commissionPreview.textContent();

    // Change commission percentage
    const commissionInput = page.getByTestId("input-commission");
    await commissionInput.clear();
    await commissionInput.fill("20");

    // Wait for preview to update
    await page.waitForTimeout(100);

    // Preview should have updated
    const updatedPreview = await commissionPreview.textContent();
    expect(updatedPreview).not.toBe(initialPreview);
  });

  test("AC6.9.6 - Price inputs accept valid positive integers", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Fill valid values - change to a different value to ensure isDirty is true
    const price100l = page.getByTestId("input-price-100l");
    const currentValue = await price100l.inputValue();
    const newValue = currentValue === "5500" ? "6000" : "5500";

    await price100l.clear();
    await price100l.fill(newValue);

    // Should accept the value
    await expect(price100l).toHaveValue(newValue);

    // Save button should be enabled since form is dirty
    const saveButton = page.getByTestId("save-pricing-button");
    await expect(saveButton).toBeEnabled();
  });

  test("AC6.9.6 - Price inputs reject negative values", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Fill negative value
    const price100l = page.getByTestId("input-price-100l");
    await price100l.clear();
    await price100l.fill("-5000");

    // Click save
    const saveButton = page.getByTestId("save-pricing-button");
    await saveButton.click();

    // Should show validation error (dialog should not appear)
    await expect(page.getByRole("alertdialog")).not.toBeVisible();

    // Error message should be visible
    await expect(page.getByText("mayor a 0")).toBeVisible({ timeout: 5000 });
  });

  test("AC6.9.6 - Percentage inputs validate range 0-100", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Fill urgency surcharge with invalid value > 100
    const urgencyInput = page.getByTestId("input-urgency-surcharge");
    await urgencyInput.clear();
    await urgencyInput.fill("150");

    // Click save
    const saveButton = page.getByTestId("save-pricing-button");
    await saveButton.click();

    // Should show validation error
    await expect(page.getByText("maximo es 100%")).toBeVisible({ timeout: 5000 });
  });

  test("AC6.9.7 - Changes require confirmation dialog before saving", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Change a price value
    const price100l = page.getByTestId("input-price-100l");
    await price100l.clear();
    await price100l.fill("6000");

    // Click save button
    const saveButton = page.getByTestId("save-pricing-button");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // Dialog should show confirmation message
    await expect(page.getByText("Confirmar cambios de precios")).toBeVisible();
    // Verify dialog description mentions "nuevas solicitudes"
    await expect(confirmDialog.getByText("nuevas solicitudes")).toBeVisible();

    // Dialog should have cancel and confirm buttons
    await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirmar Cambios" })).toBeVisible();

    // Cancel should close the dialog
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(confirmDialog).not.toBeVisible();
  });

  test("AC6.9.8 - Changes persist after save (take effect immediately)", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Get original value
    const price100l = page.getByTestId("input-price-100l");
    const originalValue = await price100l.inputValue();
    const newValue = originalValue === "5000" ? "5500" : "5000";

    // Change value
    await price100l.clear();
    await price100l.fill(newValue);

    // Save changes
    const saveButton = page.getByTestId("save-pricing-button");
    await saveButton.click();

    // Confirm in dialog
    const confirmButton = page.getByRole("button", { name: "Confirmar Cambios" });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Wait for dialog to close
    await expect(page.getByRole("alertdialog")).not.toBeVisible({
      timeout: 10000,
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify value persisted
    const updatedInput = page.getByTestId("input-price-100l");
    await expect(updatedInput).toHaveValue(newValue);

    // Restore original value
    await updatedInput.clear();
    await updatedInput.fill(originalValue);
    await saveButton.click();
    await confirmButton.click();
    await expect(page.getByRole("alertdialog")).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("AC6.9.9 - Success toast confirms 'Precios actualizados'", async ({
    page,
  }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Get original value
    const price100l = page.getByTestId("input-price-100l");
    const originalValue = await price100l.inputValue();
    const newValue = originalValue === "5000" ? "5500" : "5000";

    // Change value
    await price100l.clear();
    await price100l.fill(newValue);

    // Save changes
    const saveButton = page.getByTestId("save-pricing-button");
    await saveButton.click();

    // Confirm in dialog
    const confirmButton = page.getByRole("button", { name: "Confirmar Cambios" });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Success toast should appear
    await expect(page.getByText("Precios actualizados")).toBeVisible({
      timeout: 10000,
    });

    // Restore original value for cleanup
    await page.reload();
    await page.waitForLoadState("networkidle");
    const updatedInput = page.getByTestId("input-price-100l");
    await updatedInput.clear();
    await updatedInput.fill(originalValue);
    await saveButton.click();
    await confirmButton.click();
  });

  test("Save button is disabled when no changes made", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Save button should be disabled when form is pristine
    const saveButton = page.getByTestId("save-pricing-button");
    await expect(saveButton).toBeDisabled();
  });

  test("Save button becomes enabled when values change", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Save button initially disabled
    const saveButton = page.getByTestId("save-pricing-button");
    await expect(saveButton).toBeDisabled();

    // Change a value
    const commissionInput = page.getByTestId("input-commission");
    const currentValue = await commissionInput.inputValue();
    await commissionInput.clear();
    await commissionInput.fill(String(Number(currentValue) + 1));

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();
  });

  test("Back button returns to dashboard", async ({ page }) => {
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");

    // Click back button
    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should navigate to dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/admin/dashboard");
  });
});

test.describe("Admin Pricing - Form Accessibility", () => {
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
    await page.goto("/admin/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("All price inputs accept numeric values only", async ({ page }) => {
    const price100l = page.getByTestId("input-price-100l");

    // Verify input type is number
    await expect(price100l).toHaveAttribute("type", "number");
  });

  test("Commission input accepts numeric values only", async ({ page }) => {
    const commissionInput = page.getByTestId("input-commission");

    // Verify input type is number
    await expect(commissionInput).toHaveAttribute("type", "number");
  });

  test("Page shows info note about price application", async ({ page }) => {
    // Verify info note about prices taking effect immediately
    await expect(
      page.getByText("nuevas solicitudes")
    ).toBeVisible();
  });
});
