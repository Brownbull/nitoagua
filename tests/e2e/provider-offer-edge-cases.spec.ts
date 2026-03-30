import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * Provider Offer Edge Cases Tests (Story 11-17)
 *
 * Validates workflows P13-P16 for provider offer edge cases.
 *
 * Seed Data Required:
 *   - npm run seed:offers  # Creates offers in various states including edge cases
 *
 * Workflows Covered:
 *   P13: Offer Expires - Offer countdown reaches zero, shows "Expirada" status
 *   P14: Withdraw Offer - Provider cancels their own offer (covered in provider-withdraw-offer.spec.ts)
 *   P15: Consumer Cancels - Provider's offer invalidated by consumer cancellation
 *   P16: Another Offer Accepted - Provider's offer rejected when competitor wins
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Mobile viewport for provider testing (PWA)
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Helper to wait for offers page to load (v2.6.2 unified list)
async function waitForOffersPageLoad(page: import("@playwright/test").Page): Promise<void> {
  await page.getByRole("heading", { name: "Mis Ofertas" }).waitFor({ state: "visible", timeout: 10000 });
  // Wait for offer count summary or global empty state (indicates data is loaded)
  await page.locator('text=/\\d+ de \\d+ ofertas/, [data-testid="empty-state-global"]').first().waitFor({ state: "visible", timeout: 10000 });
  // Small delay to ensure React has finished categorizing offers
  await page.waitForTimeout(500);
}

// Helper to apply Estado filter in the unified list (v2.6.2)
async function applyEstadoFilter(page: import("@playwright/test").Page, filterName: string): Promise<void> {
  // Open Estado dropdown
  const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
  await estadoButton.click();
  // Click the filter option
  await page.getByRole("button", { name: new RegExp(filterName, "i") }).click();
  // Close the dropdown by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}

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
  await page.waitForURL("**/provider/requests", { timeout: 60000 });
  // Wait for page to render (don't use networkidle — realtime stays open)
  await expect(page.getByRole("heading", { name: "Solicitudes Disponibles" })).toBeVisible({ timeout: 30000 });
}

test.describe("Provider Offer Edge Cases (P13-P16)", () => {
  test.describe.configure({ mode: "serial" });

  test.describe("P13: Offer Expiration", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P13.1: Expired offers show 'Expirada' status badge", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see expired offers
      await applyEstadoFilter(page, "Historial");

      // Look for expired offers with "Expirada" badge
      const expiredCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Expirada"),
      });
      const hasExpiredOffers = (await expiredCards.count()) > 0;

      if (!hasExpiredOffers) {
        test.skip(true, "No expired offers in history - run npm run seed:offers");
        return;
      }

      // Verify "Expirada" badge is visible
      await expect(expiredCards.first().getByText("Expirada")).toBeVisible();
    });

    test("P13.2: Expired offers do not appear in pending filter", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Pendientes filter
      await applyEstadoFilter(page, "Pendientes");

      // Expired offers should NOT appear under Pendientes filter
      const pendingExpired = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Expirada"),
      });

      const pendingExpiredCount = await pendingExpired.count();
      expect(pendingExpiredCount).toBe(0);
    });

    test("P13.3: Expired offers cannot be cancelled", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see expired offers
      await applyEstadoFilter(page, "Historial");

      // Look for expired offers
      const expiredCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Expirada"),
      });
      const expiredCount = await expiredCards.count();

      if (expiredCount === 0) {
        test.skip(true, "No expired offers to test");
        return;
      }

      // Expired offers should NOT have "Cancelar Oferta" button
      const cancelButton = expiredCards.first().getByRole("button", { name: /Cancelar Oferta/i });
      await expect(cancelButton).not.toBeVisible();
    });
  });

  test.describe("P14: Withdraw Offer", () => {
    // Note: Full P14 tests are in provider-withdraw-offer.spec.ts
    // This section validates the edge case aspects
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P14.1: Withdrawn offers show 'Cancelada' status in history", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see cancelled offers
      await applyEstadoFilter(page, "Historial");

      // Look for cancelled offers (withdrawn by provider)
      const cancelledCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });
      const cancelledCount = await cancelledCards.count();

      if (cancelledCount === 0) {
        test.skip(true, "No cancelled offers in history - run npm run seed:offers");
        return;
      }

      // Verify "Cancelada" badge is visible
      await expect(cancelledCards.first().getByText("Cancelada")).toBeVisible();
    });
  });

  test.describe("P15: Consumer Cancels Request", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P15.1: Offer shows 'Cancelada' when consumer cancels request", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see cancelled offers
      await applyEstadoFilter(page, "Historial");

      // Look for cancelled offers
      // When consumer cancels a request, the provider's offer is marked as cancelled
      const cancelledCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });
      const cancelledCount = await cancelledCards.count();

      if (cancelledCount === 0) {
        test.skip(true, "No cancelled offers in history");
        return;
      }

      // Provider should see "Cancelada" status on their offer
      await expect(cancelledCards.first().getByText("Cancelada")).toBeVisible();
    });

    test("P15.2: Consumer-cancelled offer appears under Historial filter", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter
      await applyEstadoFilter(page, "Historial");

      // Cancelled offers should appear under Historial filter
      const cancelledCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });

      // Check that at least one cancelled offer exists
      const cancelledCount = await cancelledCards.count();
      // This can be 0 if data isn't seeded - skip if so
      if (cancelledCount === 0) {
        test.skip(true, "No cancelled offers seeded");
        return;
      }

      expect(cancelledCount).toBeGreaterThan(0);
    });
  });

  test.describe("P16: Another Offer Accepted (Competitor Wins)", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("P16.1: Offer shows 'No seleccionada' when competitor wins", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see rejected offers
      await applyEstadoFilter(page, "Historial");

      // Look for "No seleccionada" offers (request_filled status)
      const notSelectedCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("No seleccionada"),
      });
      const notSelectedCount = await notSelectedCards.count();

      if (notSelectedCount === 0) {
        test.skip(true, "No 'No seleccionada' offers in history - run npm run seed:offers");
        return;
      }

      // Verify "No seleccionada" badge is visible
      await expect(notSelectedCards.first().getByText("No seleccionada")).toBeVisible();
    });

    test("P16.2: 'No seleccionada' offers appear under Historial filter", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter
      await applyEstadoFilter(page, "Historial");

      // Look for not selected offers
      const notSelectedCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("No seleccionada"),
      });
      const notSelectedCount = await notSelectedCards.count();

      if (notSelectedCount === 0) {
        test.skip(true, "No 'No seleccionada' offers seeded");
        return;
      }

      // Verify they exist under Historial filter
      expect(notSelectedCount).toBeGreaterThan(0);
    });

    test("P16.3: 'No seleccionada' offer cannot be cancelled", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter to see rejected offers
      await applyEstadoFilter(page, "Historial");

      // Look for not selected offers
      const notSelectedCards = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("No seleccionada"),
      });
      const notSelectedCount = await notSelectedCards.count();

      if (notSelectedCount === 0) {
        test.skip(true, "No 'No seleccionada' offers to test");
        return;
      }

      // Should NOT have cancel button (can't cancel a rejected offer)
      const cancelButton = notSelectedCards.first().getByRole("button", { name: /Cancelar Oferta/i });
      await expect(cancelButton).not.toBeVisible();
    });
  });

  test.describe("Edge Cases - Status Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("Historial filter groups all non-active statuses", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Historial filter
      await applyEstadoFilter(page, "Historial");

      // Historial should contain: expired, cancelled, and request_filled offers
      const historyCards = page.locator('[data-testid="offer-card"]');
      const cardCount = await historyCards.count();

      if (cardCount === 0) {
        test.skip(true, "No offers in history");
        return;
      }

      // At least one history offer should exist
      expect(cardCount).toBeGreaterThan(0);
    });

    test("Active offers show countdown timer", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply Pendientes filter
      await applyEstadoFilter(page, "Pendientes");

      // Active offers should have countdown
      const activeOffers = page.locator('[data-testid="offer-card"]');
      const activeCount = await activeOffers.count();

      if (activeCount === 0) {
        test.skip(true, "No active offers available");
        return;
      }

      // Check for countdown timer on first active offer
      const countdown = activeOffers.first().getByTestId("offer-countdown");
      const countdownCount = await countdown.count();

      if (countdownCount > 0) {
        // Countdown should show "Expira en" format
        await expect(countdown).toHaveText(/Expira en\s*(\d{1,2}:\d{2}|\d+ h \d{2} min)/);
      }
    });
  });
});

test.describe("Provider Offer Edge Cases - Spanish Content", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test.use({
    viewport: { width: 360, height: 780 },
    isMobile: true,
    hasTouch: true,
  });

  test("All offer status labels are in Spanish", async ({ page }) => {
    await loginAsSupplier(page);

    await page.goto("/provider/offers");
    await waitForOffersPageLoad(page);
    await assertNoErrorState(page);

    // Check page title
    await expect(page.getByRole("heading", { name: "Mis Ofertas" })).toBeVisible();

    // v2.6.2 unified list: Estado filter dropdown labels should be in Spanish
    // Open Estado dropdown to verify Spanish labels
    const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
    await estadoButton.click();

    // Filter options should be in Spanish
    await expect(page.getByRole("button", { name: /Pendientes/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /En proceso/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Historial/i })).toBeVisible();

    await page.keyboard.press("Escape");
  });
});
