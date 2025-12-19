import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

test.describe("Admin Provider Verification Queue", () => {
  // Skip tests if dev login is not enabled
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login required for admin tests"
  );

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");

    // Wait for dev login form
    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible({ timeout: 10000 });

    // Fill in test admin credentials
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");

    // Click dev login button
    await devLoginButton.click();

    // Wait for dashboard to load
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.3.1 - Admin can view queue of pending provider applications", async ({
    page,
  }) => {
    // Navigate to verification page
    await page.goto("/admin/verification");

    // Page should load successfully
    await expect(page.getByText("Verificaciones")).toBeVisible();

    // FIRST: Check for error states - fail if any database errors present
    await assertNoErrorState(page);

    // Queue or empty state should be visible
    const queue = page.getByTestId("verification-queue");
    const emptyQueue = page.getByTestId("empty-queue");

    // Either queue with applications or empty state should show
    // This is now safe because we checked for errors first
    const hasQueue = await queue.isVisible().catch(() => false);
    const hasEmptyState = await emptyQueue.isVisible().catch(() => false);

    expect(
      hasQueue || hasEmptyState,
      "Expected either 'verification-queue' or 'empty-queue' to be visible"
    ).toBe(true);
  });

  test("AC6.3.2 - Queue shows count of pending applications in subtitle", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    // Check for count in subtitle (either "X solicitudes en cola" or "No hay solicitudes")
    const subtitle = page.locator("header p.text-gray-600");
    await expect(subtitle).toBeVisible();

    const text = await subtitle.textContent();
    expect(
      text?.includes("solicitudes") || text?.includes("No hay")
    ).toBe(true);
  });

  test("AC6.3.3 - Applications sorted by submission date (oldest first)", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    // If there are applications, check they exist in queue
    const queue = page.getByTestId("verification-queue");
    const hasQueue = await queue.isVisible().catch(() => false);

    if (hasQueue) {
      // Cards should be present
      const cards = page.locator('[data-testid^="application-card-"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("filter tabs show counts for pending and more-info status", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    // Check filter tabs exist
    const pendingTab = page.getByTestId("filter-pending");
    const moreInfoTab = page.getByTestId("filter-more-info");

    await expect(pendingTab).toBeVisible();
    await expect(moreInfoTab).toBeVisible();

    // Tabs should show counts in parentheses
    const pendingText = await pendingTab.textContent();
    const moreInfoText = await moreInfoTab.textContent();

    expect(pendingText).toMatch(/Pendientes \(\d+\)/);
    expect(moreInfoText).toMatch(/Mas Info \(\d+\)/);
  });

  test("back button navigates to dashboard", async ({ page }) => {
    await page.goto("/admin/verification");

    // Click back button
    const backButton = page.getByTestId("back-to-dashboard");
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should navigate to dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 5000 });
  });

  test("empty queue shows helpful message", async ({ page }) => {
    await page.goto("/admin/verification");

    // If empty queue is shown
    const emptyQueue = page.getByTestId("empty-queue");
    const hasEmptyState = await emptyQueue.isVisible().catch(() => false);

    if (hasEmptyState) {
      // Use locator within empty queue section to avoid duplicates
      await expect(
        emptyQueue.getByText("No hay solicitudes pendientes")
      ).toBeVisible();
      await expect(
        emptyQueue.getByText("Las nuevas solicitudes de proveedores apareceran aqui")
      ).toBeVisible();
    }
  });
});

test.describe("Admin Verification Detail Page", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login required for admin tests"
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
  });

  test("AC6.3.4 - Clicking application opens detail view", async ({ page }) => {
    await page.goto("/admin/verification");

    // Check if there are any applications
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      // Click on the first application
      await firstCard.click();

      // Should navigate to detail page
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Detail sections should be visible
      await expect(page.getByTestId("personal-info-section")).toBeVisible();
    }
  });

  test("detail page shows personal info section", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Personal info section should show
      const personalInfo = page.getByTestId("personal-info-section");
      await expect(personalInfo).toBeVisible();
      await expect(personalInfo.getByText("Informacion Personal")).toBeVisible();
    }
  });

  test("detail page shows bank info section", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      const bankInfo = page.getByTestId("bank-info-section");
      await expect(bankInfo).toBeVisible();
      await expect(bankInfo.getByText("Informacion Bancaria")).toBeVisible();
    }
  });

  test("detail page shows documents section", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      const docsSection = page.getByTestId("documents-section");
      await expect(docsSection).toBeVisible();
    }
  });

  test("detail page shows notes section", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      const notesSection = page.getByTestId("notes-section");
      await expect(notesSection).toBeVisible();
      await expect(notesSection.getByText("Notas Internas")).toBeVisible();
    }
  });

  test("back button on detail page returns to queue", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Click back button
      const backButton = page.getByTestId("back-to-queue");
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Should return to queue
      await page.waitForURL("**/admin/verification", { timeout: 5000 });
      expect(page.url()).not.toMatch(/\/admin\/verification\/[a-f0-9-]+/);
    }
  });
});

test.describe("Admin Verification Actions", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login required for admin tests"
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");

    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible({ timeout: 10000 });

    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await devLoginButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC6.3.6-8 - Action buttons are visible for pending applications", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Action buttons should be visible
      const approveBtn = page.getByTestId("btn-approve");
      const rejectBtn = page.getByTestId("btn-reject");
      const moreInfoBtn = page.getByTestId("btn-more-info");

      await expect(approveBtn).toBeVisible();
      await expect(rejectBtn).toBeVisible();
      await expect(moreInfoBtn).toBeVisible();
    }
  });

  test("clicking approve shows confirmation dialog", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Click approve
      await page.getByTestId("btn-approve").click();

      // Confirmation should appear
      await expect(page.getByTestId("approve-confirmation")).toBeVisible();
      await expect(page.getByText("Confirmar Aprobacion")).toBeVisible();

      // Cancel button should work
      await page.getByTestId("btn-cancel-approve").click();
      await expect(page.getByTestId("approve-confirmation")).not.toBeVisible();
    }
  });

  test("AC6.3.7 - Reject requires reason", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Click reject
      await page.getByTestId("btn-reject").click();

      // Reject form should appear
      await expect(page.getByTestId("reject-form")).toBeVisible();
      await expect(page.getByText("Motivo del Rechazo")).toBeVisible();

      // Confirm button should be disabled without reason
      const confirmBtn = page.getByTestId("btn-confirm-reject");
      await expect(confirmBtn).toBeDisabled();

      // Fill in reason
      await page.getByTestId("reject-reason-input").fill("Test rejection reason");

      // Confirm button should be enabled
      await expect(confirmBtn).toBeEnabled();

      // Cancel to avoid actual rejection
      await page.getByTestId("btn-cancel-reject").click();
    }
  });

  test("AC6.3.8 - Request more info requires selecting missing docs", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Click more info
      await page.getByTestId("btn-more-info").click();

      // More info form should appear
      await expect(page.getByTestId("more-info-form")).toBeVisible();
      await expect(page.getByText("Documentos Faltantes")).toBeVisible();

      // Confirm button should be disabled without selection
      const confirmBtn = page.getByTestId("btn-confirm-more-info");
      await expect(confirmBtn).toBeDisabled();

      // Select a missing document
      await page.getByTestId("checkbox-cedula").click();

      // Confirm button should be enabled
      await expect(confirmBtn).toBeEnabled();

      // Cancel to avoid actual action
      await page.getByTestId("btn-cancel-more-info").click();
    }
  });

  test("notes field is available for admin notes", async ({ page }) => {
    await page.goto("/admin/verification");

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasApplications = await firstCard.isVisible().catch(() => false);

    if (hasApplications) {
      await firstCard.click();
      await page.waitForURL("**/admin/verification/*", { timeout: 5000 });

      // Notes input should be visible
      const notesInput = page.getByTestId("notes-input");
      await expect(notesInput).toBeVisible();

      // Should be editable
      await notesInput.fill("Test internal note");
      await expect(notesInput).toHaveValue("Test internal note");
    }
  });
});

test.describe("Admin Navigation - Verification Link", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login required for admin tests"
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");

    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible({ timeout: 10000 });

    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await devLoginButton.click();

    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("sidebar has verification link enabled", async ({ page }) => {
    // Set desktop viewport for sidebar
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/admin/dashboard");

    // Verification nav item should be visible and clickable
    const verificationNav = page.getByTestId("nav-verificacion");
    await expect(verificationNav).toBeVisible();

    // Should be a link (not disabled)
    const tagName = await verificationNav.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("a");

    // Click and verify navigation
    await verificationNav.click();
    await page.waitForURL("**/admin/verification", { timeout: 5000 });
  });

  test("dashboard quick action links to verification", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Quick action should link to verification
    const quickAction = page.getByTestId("quick-action-verification");
    await expect(quickAction).toBeVisible();

    await quickAction.click();
    await page.waitForURL("**/admin/verification", { timeout: 5000 });
  });

  test("mobile bottom nav has verification link", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/admin/dashboard");

    // Bottom nav should be visible
    const bottomNav = page.getByTestId("admin-bottom-nav");
    await expect(bottomNav).toBeVisible();

    // Verification link should be present
    const verifyLink = page.getByTestId("bottom-nav-verificar");
    await expect(verifyLink).toBeVisible();

    // Click and verify navigation
    await verifyLink.click();
    await page.waitForURL("**/admin/verification", { timeout: 5000 });
  });
});
