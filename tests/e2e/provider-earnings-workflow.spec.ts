/**
 * Provider Earnings Workflow E2E Tests - Story 11-11
 *
 * Validates P11 (View Earnings Dashboard) and P12 (Request Settlement) workflows.
 * This file focuses on WORKFLOW validation (user journeys) rather than specific data values.
 * For data-specific tests, see provider-earnings-seeded.spec.ts.
 *
 * Workflows Covered:
 * - P11: View Earnings Dashboard - See earnings summary, completed deliveries
 * - P12: Request Settlement - Request payout of accumulated earnings
 *
 * PREREQUISITE: Run `npm run seed:earnings` before running these tests.
 *
 * IMPORTANT: Tests use explicit error detection to fail on DB issues.
 * See Story Testing-1 for reliability improvements.
 */

import { test, expect, Page } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * Wait for earnings page to be fully loaded
 * Uses specific element waits instead of arbitrary timeouts
 */
async function waitForEarningsPageLoad(page: Page): Promise<void> {
  // Wait for page heading to be visible (indicates page rendered)
  await page.getByRole("heading", { name: "Mis Ganancias" }).waitFor({ state: "visible", timeout: 10000 });
  // Wait for hero card or loading to complete
  await page.waitForLoadState("networkidle", { timeout: 10000 });
}

/**
 * Wait for withdraw page to be fully loaded
 */
async function waitForWithdrawPageLoad(page: Page): Promise<void> {
  await page.getByRole("heading", { name: "Pagar Comisión" }).waitFor({ state: "visible", timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 10000 });
}

// Check if dev login is enabled
const devLoginEnabled = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";
const skipIfNoDevLogin = !devLoginEnabled;

/**
 * Login helper for provider
 */
async function loginAsSupplier(page: Page) {
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

/**
 * Check if seeded data exists by looking for expected elements
 */
async function isSeededDataPresent(page: Page): Promise<boolean> {
  // Check for non-zero delivery count
  const hasDeliveries = await page
    .locator("text=/[1-9][0-9]*/")
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  // Check for non-zero earnings
  const hasEarnings = await page
    .locator("text=/\\$[1-9]/")
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);

  return hasDeliveries || hasEarnings;
}

test.describe("Provider Earnings Workflow - Story 11-11", () => {
  // ==========================================================================
  // P11: View Earnings Dashboard
  // ==========================================================================
  test.describe("P11: View Earnings Dashboard", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P11.1: Earnings page loads with summary card", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Page should show earnings heading
      await expect(page.getByRole("heading", { name: "Mis Ganancias" })).toBeVisible();

      // Should show the hero card with earnings summary (dark gradient card)
      const heroCard = page.locator(".bg-gradient-to-br.from-gray-900");
      await expect(heroCard).toBeVisible();
    });

    test("P11.2: Earnings summary shows total, pending, settled amounts", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Check for key summary elements
      await expect(page.getByText("Entregas")).toBeVisible();
      await expect(page.getByText("Total pedidos")).toBeVisible();
      await expect(page.getByText(/Comisión plataforma/)).toBeVisible();
      await expect(page.getByText("Tu ganancia", { exact: true })).toBeVisible();
    });

    test("P11.3: Period selector filters data correctly", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Default should be Mes
      const monthTab = page.getByRole("tab", { name: "Mes" });
      await expect(monthTab).toHaveAttribute("aria-selected", "true");

      // Switch to Hoy
      await page.getByRole("tab", { name: "Hoy" }).click();
      // Wait for period label to update
      await expect(page.getByText(/ganancia neta hoy/i)).toBeVisible({ timeout: 5000 });

      // Hoy should now be selected
      await expect(page.getByRole("tab", { name: "Hoy" })).toHaveAttribute("aria-selected", "true");

      // Switch to Semana
      await page.getByRole("tab", { name: "Semana" }).click();
      // Wait for period label to update
      await expect(page.getByText(/ganancia neta esta semana/i)).toBeVisible({ timeout: 5000 });
    });

    test("P11.4: Delivery history shows completed deliveries", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      const isSeeded = await isSeededDataPresent(page);
      if (!isSeeded) {
        test.skip(true, "Seeded earnings data not present. Run npm run seed:earnings first.");
        return;
      }

      // Look for activity section
      const activityHeader = page.locator("text=Actividad reciente");
      const hasActivity = await activityHeader.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasActivity) {
        // Should show "Entrega completada" entries
        await expect(page.getByText("Entrega completada").first()).toBeVisible();
      }
    });

    test("P11.5: Commission calculations displayed correctly", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      const isSeeded = await isSeededDataPresent(page);
      if (!isSeeded) {
        test.skip(true, "Seeded earnings data not present. Run npm run seed:earnings first.");
        return;
      }

      // Commission should show percentage (10% default or custom)
      await expect(page.getByText(/Comisión plataforma \(\d+%\)/)).toBeVisible();

      // Commission amount should be negative (subtracted from gross)
      await expect(page.getByText(/-\$/)).toBeVisible();

      // Net earnings should be in green (checking for green text color class)
      const greenAmount = page.locator("[class*='text-green']");
      await expect(greenAmount.first()).toBeVisible();
    });
  });

  // ==========================================================================
  // P12: Request Settlement
  // ==========================================================================
  test.describe("P12: Request Settlement", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P12.1: Settlement button visible when balance > $0", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      const isSeeded = await isSeededDataPresent(page);
      if (!isSeeded) {
        test.skip(true, "Seeded earnings data not present. Run npm run seed:earnings first.");
        return;
      }

      // Check for pending commission section
      const pendingSection = page.getByText("Comisión pendiente");
      const hasPending = await pendingSection.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasPending) {
        // If there's pending commission, the "Pagar" button should be visible
        const pagarButton = page.getByRole("link", { name: "Pagar" });
        await expect(pagarButton).toBeVisible();
        await expect(pagarButton).toHaveAttribute("href", "/provider/earnings/withdraw");
      }
    });

    test("P12.2: Withdraw page shows commission amount and bank details", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings");
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      const isSeeded = await isSeededDataPresent(page);
      if (!isSeeded) {
        test.skip(true, "Seeded earnings data not present. Run npm run seed:earnings first.");
        return;
      }

      // Check if Pagar button is visible
      const pagarButton = page.getByRole("link", { name: "Pagar" });
      const hasPagarButton = await pagarButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (!hasPagarButton) {
        test.skip(true, "No pending commission to test withdrawal");
        return;
      }

      // Click Pagar to go to withdraw page
      await pagarButton.click();
      await page.waitForURL(/\/provider\/earnings\/withdraw/, { timeout: 10000 });
      await waitForWithdrawPageLoad(page);

      // FIRST: Check for error states on withdraw page
      await assertNoErrorState(page);

      // Check for amount due card (AC: 8.7.1)
      const amountCard = page.getByTestId("amount-due-card");
      const hasAmountCard = await amountCard.isVisible({ timeout: 3000 }).catch(() => false);

      // If no pending commission, should show "Sin comisión pendiente"
      if (!hasAmountCard) {
        await expect(page.getByText("Sin comisión pendiente")).toBeVisible();
        return;
      }

      // Should show commission amount
      await expect(page.getByTestId("commission-amount")).toBeVisible();

      // Check for bank details card (AC: 8.7.2)
      const bankCard = page.getByTestId("bank-details-card");
      const hasBankCard = await bankCard.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasBankCard) {
        // Should show bank details fields
        await expect(page.getByTestId("bank-bank")).toBeVisible();
        await expect(page.getByTestId("bank-number")).toBeVisible();
        await expect(page.getByTestId("bank-holder")).toBeVisible();
        await expect(page.getByTestId("bank-rut")).toBeVisible();
      }
    });

    test("P12.3: Withdraw page shows upload area for receipt", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await waitForWithdrawPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Check for amount due card - if not present, no pending commission
      const amountCard = page.getByTestId("amount-due-card");
      const hasAmountCard = await amountCard.isVisible({ timeout: 3000 }).catch(() => false);

      if (!hasAmountCard) {
        // Check if showing "no pending" or "pending verification" state
        const noPending = await page.getByText("Sin comisión pendiente").isVisible().catch(() => false);
        const pendingVerification = await page.getByTestId("pending-status-card").isVisible().catch(() => false);

        expect(
          noPending || pendingVerification,
          "Expected either 'no pending commission' or 'pending verification' state"
        ).toBe(true);
        return;
      }

      // Should show upload area (AC: 8.7.3)
      await expect(page.getByTestId("upload-area")).toBeVisible();

      // Upload area should indicate file types
      await expect(page.getByText(/JPG, PNG, WebP o PDF/)).toBeVisible();
    });

    test("P12.4: Submit button disabled without receipt upload", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await waitForWithdrawPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Check for amount due card
      const amountCard = page.getByTestId("amount-due-card");
      const hasAmountCard = await amountCard.isVisible({ timeout: 3000 }).catch(() => false);

      if (!hasAmountCard) {
        test.skip(true, "No pending commission to test submission");
        return;
      }

      // Submit button should be disabled (no file uploaded)
      const submitButton = page.getByTestId("submit-payment");
      await expect(submitButton).toBeDisabled();
    });

    test("P12.5: Pending verification state shows correctly", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await waitForWithdrawPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Check for pending status card (AC: 8.7.6)
      const pendingCard = page.getByTestId("pending-status-card");
      const hasPending = await pendingCard.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasPending) {
        // Should show "Pago enviado" and "En verificación"
        await expect(page.getByText("Pago enviado")).toBeVisible();
        await expect(page.getByText("En verificación")).toBeVisible();

        // Should show amount and date
        await expect(page.getByText("Monto:")).toBeVisible();
        await expect(page.getByText("Enviado:")).toBeVisible();
      }
      // If no pending card, that's also valid - test passes
    });

    test("P12.6: Navigation between earnings and withdraw pages", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/earnings/withdraw");
      await waitForWithdrawPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Back button should be visible
      const backButton = page.getByTestId("back-to-earnings");
      await expect(backButton.first()).toBeVisible();

      // Click back button
      await backButton.first().click();

      // Should navigate to earnings page
      await page.waitForURL(/\/provider\/earnings/, { timeout: 10000 });
      await waitForEarningsPageLoad(page);
    });
  });

  // ==========================================================================
  // Workflow Integration Tests
  // ==========================================================================
  test.describe("Workflow Integration", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P11+P12: Full earnings to settlement navigation flow", async ({ page }) => {
      await loginAsSupplier(page);

      // Step 1: Navigate to earnings via bottom nav
      await page.goto("/provider/requests");
      // Wait for provider dashboard to load
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const earningsNav = page.getByRole("link", { name: "Ganancias" });
      await expect(earningsNav).toBeVisible();
      await earningsNav.click();

      // Should navigate to earnings page
      await page.waitForURL(/\/provider\/earnings/, { timeout: 10000 });
      await waitForEarningsPageLoad(page);

      // FIRST: Check for error states
      await assertNoErrorState(page);

      // Step 2: Check earnings summary is visible
      await expect(page.getByText("Entregas")).toBeVisible();
      await expect(page.getByText(/Comisión plataforma/)).toBeVisible();

      // Step 3: Check for Pagar button (if pending > 0)
      const pagarButton = page.getByRole("link", { name: "Pagar" });
      const hasPagarButton = await pagarButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasPagarButton) {
        // Navigate to withdraw page
        await pagarButton.click();
        await page.waitForURL(/\/provider\/earnings\/withdraw/, { timeout: 10000 });
        await waitForWithdrawPageLoad(page);

        // Navigate back
        await page.getByTestId("back-to-earnings").first().click();
        await page.waitForURL(/\/provider\/earnings/, { timeout: 10000 });
        await waitForEarningsPageLoad(page);
      }

      // Step 4: Verify bottom nav highlights correctly (active state has orange color)
      const earningsNavActive = page.getByRole("link", { name: "Ganancias" });
      await expect(earningsNavActive).toHaveClass(/text-orange/);
    });
  });
});
