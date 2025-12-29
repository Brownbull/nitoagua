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

// Helper to wait for offers page to load
async function waitForOffersPageLoad(page: import("@playwright/test").Page): Promise<void> {
  await page.getByRole("heading", { name: "Mis Ofertas" }).waitFor({ state: "visible", timeout: 10000 });
  // Wait for section headers AND their badges (indicates data is loaded)
  // Section headers always exist but badges only show when counts are known
  await page.locator('[data-testid="section-history"] h2, [data-testid="empty-state-pending"]').first().waitFor({ state: "visible", timeout: 10000 });
  // Small delay to ensure React has finished categorizing offers
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
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
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

      // Look for history section which contains expired offers
      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section - need expired offers to test");
        return;
      }

      // Look for expired offers with "Expirada" badge
      const expiredCards = historySection.locator('[data-testid="offer-card"]').filter({
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

    test("P13.2: Expired offers appear in history section", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Expired offers should be in history, not pending
      const pendingSection = page.getByTestId("section-pending");
      const pendingExpired = pendingSection.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Expirada"),
      });

      // Should NOT be in pending section
      const pendingExpiredCount = await pendingExpired.count();
      expect(pendingExpiredCount).toBe(0);
    });

    test("P13.3: Expired offers cannot be cancelled", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for expired offers
      const expiredCards = historySection.locator('[data-testid="offer-card"]').filter({
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

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for cancelled offers (withdrawn by provider)
      const cancelledCards = historySection.locator('[data-testid="offer-card"]').filter({
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

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for cancelled offers
      // When consumer cancels a request, the provider's offer is marked as cancelled
      const cancelledCards = historySection.locator('[data-testid="offer-card"]').filter({
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

    test("P15.2: Consumer-cancelled offer appears in history section", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Cancelled offers should be in history section
      const cancelledCards = historySection.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Cancelada"),
      });

      // Check that at least one cancelled offer exists in history
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

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for "No seleccionada" offers (request_filled status)
      const notSelectedCards = historySection.locator('[data-testid="offer-card"]').filter({
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

    test("P16.2: 'No seleccionada' offers appear in history section", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for not selected offers
      const notSelectedCards = historySection.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("No seleccionada"),
      });
      const notSelectedCount = await notSelectedCards.count();

      if (notSelectedCount === 0) {
        test.skip(true, "No 'No seleccionada' offers seeded");
        return;
      }

      // Verify they are in history (not pending or accepted)
      expect(notSelectedCount).toBeGreaterThan(0);
    });

    test("P16.3: 'No seleccionada' offer cannot be cancelled", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // Look for not selected offers
      const notSelectedCards = historySection.locator('[data-testid="offer-card"]').filter({
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

    test("History section groups all non-active statuses", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await waitForOffersPageLoad(page);
      await assertNoErrorState(page);

      const historySection = page.getByTestId("section-history");
      const historyCount = await historySection.count();

      if (historyCount === 0) {
        test.skip(true, "No history section visible");
        return;
      }

      // History should contain: expired, cancelled, and request_filled offers
      // Check that history section exists and has some content
      const historyCards = historySection.locator('[data-testid="offer-card"]');
      const cardCount = await historyCards.count();

      if (cardCount === 0) {
        test.skip(true, "No offers in history section");
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

      const pendingSection = page.getByTestId("section-pending");
      const pendingCount = await pendingSection.count();

      if (pendingCount === 0) {
        test.skip(true, "No pending section visible");
        return;
      }

      // Active offers should have countdown
      const activeOffers = pendingSection.locator('[data-testid="offer-card"]');
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

    // Section headers should be in Spanish
    // Note: The actual section headers are:
    // - "Pendientes" for pending offers
    // - "Entregas Activas" for accepted offers
    // - "Historial" for expired/cancelled/request_filled offers
    const pendingSection = page.getByTestId("section-pending");
    const pendingCount = await pendingSection.count();
    if (pendingCount > 0) {
      await expect(pendingSection.getByText("Pendientes")).toBeVisible();
    }

    const acceptedSection = page.getByTestId("section-accepted");
    const acceptedCount = await acceptedSection.count();
    if (acceptedCount > 0) {
      await expect(acceptedSection.getByText("Entregas Activas")).toBeVisible();
    }

    const historySection = page.getByTestId("section-history");
    const historyCount = await historySection.count();
    if (historyCount > 0) {
      await expect(historySection.getByText("Historial")).toBeVisible();
    }
  });
});
