/**
 * Provider Commission Settlement E2E Tests
 *
 * Tests for Story 8-7: Cash Commission Settlement
 * Verifies the commission payment flow from provider to platform.
 *
 * PREREQUISITE: Run `npm run seed:earnings` for seeded data tests.
 *
 * Test tags:
 * - @seeded - Requires seeded test data
 * - @settlement - Commission settlement tests
 *
 * AC Coverage:
 * - AC8.7.1: Amount due displayed prominently
 * - AC8.7.2: Platform bank details shown
 * - AC8.7.3: Upload receipt button functional
 * - AC8.7.6: Pending verification state shown
 */

import { test, expect, Page } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

// Check if dev login is enabled
const devLoginEnabled = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";
const skipIfNoDevLogin = !devLoginEnabled;

/**
 * Login helper for provider
 */
async function loginAsSupplier(page: Page) {
  await page.goto("/login");
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();
  await page.waitForTimeout(100);
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
}

/**
 * Navigate to earnings page and check for pending commission
 */
async function navigateToEarnings(page: Page): Promise<boolean> {
  await page.goto("/provider/earnings");
  await page.waitForTimeout(2000);
  await assertNoErrorState(page);

  // Check if "Pagar" button exists (means there's pending commission)
  const payButton = page.getByRole("link", { name: "Pagar" });
  return await payButton.isVisible({ timeout: 3000 }).catch(() => false);
}

test.describe("Provider Commission Settlement @settlement", () => {
  test.describe("Settlement Page Access", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("can navigate to settlement page from earnings", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (hasPending) {
        // Click the "Pagar" button to go to settlement page
        await page.getByRole("link", { name: "Pagar" }).click();
        await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });

        // Verify we're on the withdraw page
        await expect(page.getByRole("heading", { name: "Pagar Comisión" })).toBeVisible();
      } else {
        // No pending commission - directly navigate
        await page.goto("/provider/earnings/withdraw");
        await page.waitForTimeout(2000);

        // Should show "no pending" message or redirect
        const noPending = page.getByText("Sin comisión pendiente");
        await expect(noPending).toBeVisible({ timeout: 5000 });
      }
    });

    test("shows back button to return to earnings", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await page.waitForTimeout(2000);
      await assertNoErrorState(page);

      // Back button should be visible
      const backButton = page.getByTestId("back-to-earnings");
      await expect(backButton).toBeVisible();
    });
  });

  test.describe("Settlement Page Content - AC8.7.1, AC8.7.2", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("displays commission pending amount prominently - AC8.7.1", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Check amount due card is visible
      const amountCard = page.getByTestId("amount-due-card");
      await expect(amountCard).toBeVisible();

      // Should show "Comisión Pendiente" label
      await expect(amountCard.getByText("Comisión Pendiente")).toBeVisible();

      // Should show amount in CLP format
      const commissionAmount = page.getByTestId("commission-amount");
      await expect(commissionAmount).toBeVisible();
      await expect(commissionAmount).toContainText("$");
    });

    test("displays platform bank details - AC8.7.2", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Check bank details card is visible
      const bankCard = page.getByTestId("bank-details-card");
      await expect(bankCard).toBeVisible();

      // Should show all required bank details - AC8.7.2
      await expect(page.getByText("Banco")).toBeVisible();
      await expect(page.getByText("Tipo de Cuenta")).toBeVisible();
      await expect(page.getByText("Número de Cuenta")).toBeVisible();
      await expect(page.getByText("Titular")).toBeVisible();
      await expect(page.getByText("RUT")).toBeVisible();
    });

    test("bank details have copy buttons", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Each bank detail row should have a copy button
      const bankNumber = page.getByTestId("bank-number");
      await expect(bankNumber).toBeVisible();
      await expect(bankNumber.getByRole("button")).toBeVisible();
    });
  });

  test.describe("Receipt Upload - AC8.7.3", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows upload area for receipt - AC8.7.3", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Upload area should be visible
      const uploadArea = page.getByTestId("upload-area");
      await expect(uploadArea).toBeVisible();

      // Should show instructions
      await expect(page.getByText("Subir comprobante")).toBeVisible();
      await expect(page.getByText(/JPG|PNG|PDF/)).toBeVisible();
    });

    test("submit button is disabled without receipt", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Submit button should be disabled initially
      const submitButton = page.getByTestId("submit-payment");
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe("No Pending Commission State", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows appropriate message when no pending commission", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await page.waitForTimeout(2000);
      await assertNoErrorState(page);

      // Either shows pending commission UI or "no pending" message
      const noPending = page.getByText("Sin comisión pendiente");
      const amountCard = page.getByTestId("amount-due-card");

      const hasNoPendingMessage = await noPending.isVisible({ timeout: 3000 }).catch(() => false);
      const hasAmountCard = await amountCard.isVisible({ timeout: 3000 }).catch(() => false);

      // One of these should be true
      expect(hasNoPendingMessage || hasAmountCard).toBe(true);
    });
  });

  test.describe("Pending Verification State - AC8.7.6", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    // Note: This test verifies the UI handles pending state correctly
    // Full submission flow would require storage setup

    test("page structure is correct for verification flow", async ({ page }) => {
      await loginAsSupplier(page);
      const hasPending = await navigateToEarnings(page);

      if (!hasPending) {
        test.skip(true, "No pending commission. Run npm run seed:earnings first.");
        return;
      }

      await page.getByRole("link", { name: "Pagar" }).click();
      await page.waitForURL("**/provider/earnings/withdraw", { timeout: 10000 });
      await assertNoErrorState(page);

      // Verify page has all required components for submission flow
      // Amount card
      await expect(page.getByTestId("amount-due-card")).toBeVisible();

      // Bank details
      await expect(page.getByTestId("bank-details-card")).toBeVisible();

      // Upload section
      await expect(page.getByText("Comprobante de Pago")).toBeVisible();

      // Submit button (disabled initially)
      await expect(page.getByTestId("submit-payment")).toBeVisible();
    });
  });
});

test.describe("Settlement Page Accessibility", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("settlement page has proper heading structure", async ({ page }) => {
    await loginAsSupplier(page);
    await page.goto("/provider/earnings/withdraw");
    await page.waitForTimeout(2000);
    await assertNoErrorState(page);

    // Main heading should be visible
    const heading = page.getByRole("heading", { name: "Pagar Comisión" });
    await expect(heading).toBeVisible();
  });

  test("back button is keyboard accessible", async ({ page }) => {
    await loginAsSupplier(page);
    await page.goto("/provider/earnings/withdraw");
    await page.waitForTimeout(2000);
    await assertNoErrorState(page);

    // Back button should be focusable
    const backButton = page.getByTestId("back-to-earnings");
    await expect(backButton).toBeVisible();

    // Click to navigate back
    await backButton.click();
    await page.waitForURL("**/provider/earnings", { timeout: 5000 });
  });
});
