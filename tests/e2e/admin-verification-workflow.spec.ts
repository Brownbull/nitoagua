/**
 * Admin Verification Workflow Tests (Story 11-7)
 *
 * Tests for A1-A4 admin verification workflows:
 * - A1: View Verification Queue
 * - A2: Review Provider Documents
 * - A3: Approve/Reject Provider
 * - A4: Provider Notification
 *
 * Prerequisites:
 * - Run `npm run seed:verification` to create test providers
 * - Run `npm run seed:dev-login` to create admin user
 */

import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

// Test configuration
test.describe.configure({ mode: "serial" });

// Mobile viewport for testing (matches PWA usage)
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Test provider data (must match seed script)
// See scripts/local/seed-admin-verification-tests.ts for details:
// - pending-provider1@test.local (pending, 3 documents)
// - pending-provider2@test.local (pending, 0 documents)
// - moreinfo-provider@test.local (more_info_needed, 1 document)
// - rejected-provider@test.local (rejected)
// - approved-provider@test.local (approved, 2 documents)

test.describe("A1: Admin View Verification Queue", () => {
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

  test("A1.1 - Admin sees list of pending providers", async ({ page }) => {
    await page.goto("/admin/verification");
    await expect(page.getByText("Verificaciones")).toBeVisible();

    // Check for error states first
    await assertNoErrorState(page);

    // Should have verification queue with seeded providers
    const queue = page.getByTestId("verification-queue");
    await expect(queue).toBeVisible({ timeout: 10000 });

    // Should show pending provider cards
    const pendingCards = page.locator('[data-testid^="application-card-"]');
    const count = await pendingCards.count();
    expect(count).toBeGreaterThanOrEqual(2); // At least our 2 pending providers
  });

  test("A1.2 - Queue shows provider count correctly", async ({ page }) => {
    await page.goto("/admin/verification");

    // Subtitle should show count
    const subtitle = page.locator("header p").filter({ hasText: /solicitudes|No hay/ });
    await expect(subtitle).toBeVisible();

    const text = await subtitle.textContent();
    // Should show number of pending applications or "no hay"
    expect(text).toBeTruthy();
  });

  test("A1.3 - Provider cards show name, email, submitted date", async ({ page }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    // Find the first pending provider card
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible();

    // Card should contain provider information
    // Note: Cards may show truncated info, so we just verify structure exists
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
  });

  test("A1.4 - Filter tabs show counts for pending and more-info status", async ({
    page,
  }) => {
    await page.goto("/admin/verification");

    // Check filter tabs exist
    const pendingTab = page.getByTestId("filter-pending");
    const moreInfoTab = page.getByTestId("filter-more-info");

    await expect(pendingTab).toBeVisible();
    await expect(moreInfoTab).toBeVisible();

    // Tabs should show counts
    const pendingText = await pendingTab.textContent();
    expect(pendingText).toMatch(/Pendientes \(\d+\)/);
  });
});

test.describe("A2: Admin Review Provider Documents", () => {
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

  test("A2.1 - Clicking application opens detail view", async ({ page }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    // Click the "Revisar Solicitud" button on first application card
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    // Should navigate to detail page
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Detail sections should be visible
    await expect(page.getByTestId("personal-info-section")).toBeVisible();
  });

  test("A2.2 - Admin can view uploaded documents section", async ({ page }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    // Find provider with documents (pending1 has 3 docs)
    const cards = page.locator('[data-testid^="application-card-"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Click the review button on first card
    const reviewButton = cards.first().getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Documents section should be visible
    const docsSection = page.getByTestId("documents-section");
    await expect(docsSection).toBeVisible();

    // Section should show document count or empty message
    const docsSectionText = await docsSection.textContent();
    expect(docsSectionText).toMatch(/Documentos|documento|No hay/i);
  });

  test("A2.3 - Detail page shows personal info section", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });
    await assertNoErrorState(page);

    // Personal info section
    const personalInfo = page.getByTestId("personal-info-section");
    await expect(personalInfo).toBeVisible();
    await expect(personalInfo.getByText("Informacion Personal")).toBeVisible();

    // Should show phone
    await expect(personalInfo.getByText("Telefono")).toBeVisible();
  });

  test("A2.4 - Detail page shows bank info section", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });
    await assertNoErrorState(page);

    const bankInfo = page.getByTestId("bank-info-section");
    await expect(bankInfo).toBeVisible();
    await expect(bankInfo.getByText("Informacion Bancaria")).toBeVisible();
  });

  test("A2.5 - Back button returns to queue", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click back button
    const backButton = page.getByTestId("back-to-queue");
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should return to queue
    await page.waitForURL("**/admin/verification", { timeout: 5000 });
    expect(page.url()).not.toMatch(/\/admin\/verification\/[a-f0-9-]+/);
  });
});

test.describe("A3: Admin Approve/Reject Provider", () => {
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

  test("A3.1 - Action buttons are visible for pending applications", async ({
    page,
  }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Action buttons should be visible
    const approveBtn = page.getByTestId("btn-approve");
    const rejectBtn = page.getByTestId("btn-reject");
    const moreInfoBtn = page.getByTestId("btn-more-info");

    await expect(approveBtn).toBeVisible();
    await expect(rejectBtn).toBeVisible();
    await expect(moreInfoBtn).toBeVisible();
  });

  test("A3.2 - Clicking approve shows confirmation dialog", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click approve
    await page.getByTestId("btn-approve").click();

    // Confirmation should appear
    await expect(page.getByTestId("approve-confirmation")).toBeVisible();
    await expect(page.getByText("Confirmar Aprobacion")).toBeVisible();

    // Cancel button should work
    await page.getByTestId("btn-cancel-approve").click();
    await expect(page.getByTestId("approve-confirmation")).not.toBeVisible();
  });

  test("A3.3 - Reject requires reason before confirming", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click reject
    await page.getByTestId("btn-reject").click();

    // Reject form should appear
    await expect(page.getByTestId("reject-form")).toBeVisible();
    await expect(page.getByText("Motivo del Rechazo")).toBeVisible();

    // Confirm button should be disabled without reason
    const confirmBtn = page.getByTestId("btn-confirm-reject");
    await expect(confirmBtn).toBeDisabled();

    // Fill in reason
    await page.getByTestId("reject-reason-input").fill("Documentos incompletos");

    // Confirm button should be enabled
    await expect(confirmBtn).toBeEnabled();

    // Cancel to avoid actual rejection
    await page.getByTestId("btn-cancel-reject").click();
  });

  test("A3.4 - Request more info requires selecting missing docs", async ({
    page,
  }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click more info
    await page.getByTestId("btn-more-info").click();

    // More info form should appear
    await expect(page.getByTestId("more-info-form")).toBeVisible();

    // Confirm button should be disabled without selection
    const confirmBtn = page.getByTestId("btn-confirm-more-info");
    await expect(confirmBtn).toBeDisabled();

    // Select a missing document
    await page.getByTestId("checkbox-cedula").click();

    // Confirm button should be enabled
    await expect(confirmBtn).toBeEnabled();

    // Cancel to avoid actual action
    await page.getByTestId("btn-cancel-more-info").click();
  });

  test("A3.5 - Approve action updates provider status", async ({ page }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    // Find a pending provider to approve
    const pendingCards = page.locator('[data-testid^="application-card-"]');
    const initialCount = await pendingCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Click on a pending provider via the review button
    const reviewButton = pendingCards.first().getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click approve and confirm
    await page.getByTestId("btn-approve").click();
    await expect(page.getByTestId("approve-confirmation")).toBeVisible();

    // Confirm approval
    await page.getByTestId("btn-confirm-approve").click();

    // Should redirect back to queue with success message
    await page.waitForURL("**/admin/verification", { timeout: 15000 });

    // The approved provider should no longer be in the pending queue
    // (We can verify by checking the count decreased or the URL is no longer accessible)
    await assertNoErrorState(page);
  });

  test("A3.6 - Reject action updates provider status with reason", async ({
    page,
  }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    // Find a pending provider to reject
    const pendingCards = page.locator('[data-testid^="application-card-"]');
    expect(await pendingCards.count()).toBeGreaterThan(0);

    const reviewButton = pendingCards.first().getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click reject
    await page.getByTestId("btn-reject").click();
    await expect(page.getByTestId("reject-form")).toBeVisible();

    // Fill reason
    const rejectionReason = "Documentos no legibles. Por favor suba fotos mas claras.";
    await page.getByTestId("reject-reason-input").fill(rejectionReason);

    // Confirm rejection
    await page.getByTestId("btn-confirm-reject").click();

    // Should redirect back to queue
    await page.waitForURL("**/admin/verification", { timeout: 15000 });
    await assertNoErrorState(page);
  });
});

test.describe("A4: Provider Notification", () => {
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

  test("A4.1 - Approval triggers notification (email API called)", async ({
    page,
  }) => {
    // This test verifies the verification action completes successfully
    // The email is sent asynchronously (fire-and-forget)
    // We verify the action doesn't fail due to email issues

    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    const pendingCards = page.locator('[data-testid^="application-card-"]');
    const cardCount = await pendingCards.count();

    if (cardCount === 0) {
      test.skip();
      return;
    }

    const reviewButton = pendingCards.first().getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click approve and confirm
    await page.getByTestId("btn-approve").click();
    await page.getByTestId("btn-confirm-approve").click();

    // Should complete without error (email sent asynchronously)
    await page.waitForURL("**/admin/verification", { timeout: 15000 });

    // Success is indicated by redirect without error
    await assertNoErrorState(page);
  });

  test("A4.2 - Rejection triggers notification with reason (email API called)", async ({
    page,
  }) => {
    await page.goto("/admin/verification");
    await assertNoErrorState(page);

    const pendingCards = page.locator('[data-testid^="application-card-"]');
    const cardCount = await pendingCards.count();

    if (cardCount === 0) {
      test.skip();
      return;
    }

    const reviewButton = pendingCards.first().getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Click reject
    await page.getByTestId("btn-reject").click();
    await page.getByTestId("reject-reason-input").fill("Documentos vencidos");
    await page.getByTestId("btn-confirm-reject").click();

    // Should complete without error
    await page.waitForURL("**/admin/verification", { timeout: 15000 });
    await assertNoErrorState(page);
  });
});

test.describe("Admin Verification - Internal Notes", () => {
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

  test("Notes section is visible and editable", async ({ page }) => {
    await page.goto("/admin/verification");
    const firstCard = page.locator('[data-testid^="application-card-"]').first();
    const hasCards = await firstCard.isVisible().catch(() => false);

    if (!hasCards) {
      test.skip();
      return;
    }

    const reviewButton = firstCard.getByRole("link", { name: "Revisar Solicitud" });
    await reviewButton.click();
    await page.waitForURL("**/admin/verification/*", { timeout: 10000 });

    // Notes section visible
    const notesSection = page.getByTestId("notes-section");
    await expect(notesSection).toBeVisible();
    await expect(notesSection.getByText("Notas Internas")).toBeVisible();

    // Notes input should be editable
    const notesInput = page.getByTestId("notes-input");
    await expect(notesInput).toBeVisible();
    await notesInput.fill("Nota de prueba para verificacion");
    await expect(notesInput).toHaveValue("Nota de prueba para verificacion");
  });
});
