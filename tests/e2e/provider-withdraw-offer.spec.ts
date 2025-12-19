import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Withdraw Pending Offer - Story 8-4
 *
 * Tests the offer withdrawal functionality:
 * - AC8.4.1: Confirmation dialog with "¿Cancelar esta oferta?" and explanation
 * - AC8.4.2: Upon confirmation: offer status changes to 'cancelled'
 * - AC8.4.3: Provider sees "Oferta cancelada" toast
 * - AC8.4.4: Consumer's offer list updates (offer removed) - Via Realtime
 * - AC8.4.5: Provider can submit new offer on same request if still pending
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded test data
 *
 * IMPORTANT: Tests use explicit error detection to fail on DB issues.
 * See Story Testing-1 for reliability improvements.
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Helper to login as supplier
async function loginAsSupplier(page: import("@playwright/test").Page) {
  await page.goto("/login");

  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button in role selector (exact match to avoid "New Supplier")
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();

  // Wait a moment for the email/password to auto-fill
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
}

test.describe("Provider Withdraw Offer - Story 8-4", () => {
  test.describe("AC8.4.1: Confirmation Dialog", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("cancel button opens confirmation dialog with correct title", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      // Click cancel button
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();

      // AC8.4.1: Confirmation dialog should show correct title
      await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible({ timeout: 5000 });
    });

    test("confirmation dialog shows explanation text", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      // Click cancel button
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();

      // AC8.4.1: Should explain consequences and re-submission option
      await expect(page.getByText(/ya no estarás participando por esta solicitud/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Podrás enviar una nueva oferta/i)).toBeVisible({ timeout: 5000 });
    });

    test("confirmation dialog has correct action buttons", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      // Click cancel button
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();

      // AC8.4.1: Should have dismiss and confirm buttons
      await expect(page.getByRole("button", { name: /Volver/i })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("button", { name: /Sí, cancelar/i })).toBeVisible({ timeout: 5000 });
    });

    test("clicking 'Volver' dismisses the dialog", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      // Click cancel button to open dialog
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();
      await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible({ timeout: 5000 });

      // Click "Volver" to dismiss
      await page.getByRole("button", { name: /Volver/i }).click();

      // Dialog should close
      await expect(page.getByText("¿Cancelar esta oferta?")).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("AC8.4.2 & AC8.4.3: Offer Cancellation", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("confirming cancellation shows success toast", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      // Click cancel button to open dialog
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();
      await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible({ timeout: 5000 });

      // Click "Sí, cancelar" to confirm
      await page.getByRole("button", { name: /Sí, cancelar/i }).click();

      // AC8.4.3: Should show "Oferta cancelada" toast
      await expect(page.getByText("Oferta cancelada")).toBeVisible({ timeout: 5000 });
    });

    test("cancelled offer moves to history section", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (!hasPendingSection) {
        test.skip(true, "No pending section - need pending offers to test");
        return;
      }

      const initialPendingCount = await pendingSection.getByTestId("offer-card").count();
      if (initialPendingCount === 0) {
        test.skip(true, "No pending offers available to test withdrawal");
        return;
      }

      const historySection = page.getByTestId("section-history");
      const initialHistoryCount = await historySection.getByTestId("offer-card").count().catch(() => 0);

      // Click cancel button to open dialog
      await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();
      await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible({ timeout: 5000 });

      // Confirm cancellation
      await page.getByRole("button", { name: /Sí, cancelar/i }).click();

      // Wait for optimistic update
      await page.waitForTimeout(1000);

      // AC8.4.2: Pending count should decrease
      const newPendingCount = await pendingSection.getByTestId("offer-card").count();
      expect(newPendingCount).toBeLessThan(initialPendingCount);

      // History count should increase (offer moved there)
      const newHistoryCount = await historySection.getByTestId("offer-card").count();
      expect(newHistoryCount).toBeGreaterThan(initialHistoryCount);
    });
  });

  test.describe("AC8.4.5: Re-submission Flow", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("cancelled offer shows 'Enviar nueva oferta' button", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const hasHistorySection = await historySection.isVisible().catch(() => false);

      if (!hasHistorySection) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for cancelled offers (with "Cancelada" badge)
      const cancelledCards = historySection.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });
      const hasCancelledOffers = (await cancelledCards.count()) > 0;

      if (!hasCancelledOffers) {
        test.skip(true, "No cancelled offers in history to test re-submission flow");
        return;
      }

      // AC8.4.5: Should show "Enviar nueva oferta" button
      const resubmitButton = cancelledCards.first().getByTestId("resubmit-offer-button");
      await expect(resubmitButton).toBeVisible({ timeout: 5000 });
      await expect(resubmitButton).toHaveText(/Enviar nueva oferta/);
    });

    test("clicking 'Enviar nueva oferta' navigates to request detail", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const hasHistorySection = await historySection.isVisible().catch(() => false);

      if (!hasHistorySection) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for cancelled offers
      const cancelledCards = historySection.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });
      const hasCancelledOffers = (await cancelledCards.count()) > 0;

      if (!hasCancelledOffers) {
        test.skip(true, "No cancelled offers in history to test re-submission flow");
        return;
      }

      // Click "Enviar nueva oferta" button
      const resubmitButton = cancelledCards.first().getByTestId("resubmit-offer-button");
      await resubmitButton.click();

      // AC8.4.5: Should navigate to request detail page
      await expect(page).toHaveURL(/\/provider\/requests\/[a-f0-9-]+/, { timeout: 10000 });
    });
  });
});

test.describe("Provider Withdraw Offer - Integration", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("full withdrawal flow: cancel → toast → history", async ({ page }) => {
    await loginAsSupplier(page);

    await page.goto("/provider/offers");
    await page.waitForTimeout(2000);

    // FIRST: Check for error states - fail if any database errors present
    await assertNoErrorState(page);

    const pendingSection = page.getByTestId("section-pending");
    const hasPendingSection = await pendingSection.isVisible().catch(() => false);

    if (!hasPendingSection) {
      test.skip(true, "No pending section - need pending offers to test");
      return;
    }

    const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);
    if (!hasOffers) {
      test.skip(true, "No pending offers available to test");
      return;
    }

    // Step 1: Click cancel button
    await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();

    // Step 2: Verify dialog appears
    await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible({ timeout: 5000 });

    // Step 3: Confirm cancellation
    await page.getByRole("button", { name: /Sí, cancelar/i }).click();

    // Step 4: Verify toast appears
    await expect(page.getByText("Oferta cancelada")).toBeVisible({ timeout: 5000 });

    // Step 5: Verify page updates (dialog closes)
    await expect(page.getByText("¿Cancelar esta oferta?")).not.toBeVisible({ timeout: 3000 });

    // Step 6: Verify offer is in history section (might need page refresh for server state)
    await page.waitForTimeout(1000);
    const historySection = page.getByTestId("section-history");
    await expect(historySection).toBeVisible();
  });
});
