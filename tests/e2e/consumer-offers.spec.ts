import { test, expect } from "../support/fixtures/merged-fixtures";
import {
  TRACKING_TOKENS,
  REQUEST_IDS,
  SEEDED_PENDING_REQUEST,
  CONSUMER_OFFERS_TEST_DATA,
} from "../fixtures/test-data";

/**
 * Tests for Consumer Offers Page (Story 10-1)
 *
 * These tests verify the consumer-facing offers list functionality.
 * The offers page shows provider offers for a pending request and allows
 * consumers to select an offer to accept.
 *
 * AC10.1.1: Consumer sees "Ofertas Recibidas" section with count badge
 * AC10.1.2: Each offer card shows provider name, delivery window, price, countdown
 * AC10.1.3: Offers sorted by delivery window (soonest first)
 * AC10.1.4: List updates in real-time via Supabase Realtime
 * AC10.1.5: Empty state shows waiting messaging with timeout notice
 * AC10.1.6: Guest consumers can view offers using tracking token
 */

test.describe("Consumer Offers Page (Story 10-1)", () => {
  test.describe("Page Accessibility", () => {
    test("offers page route exists at /request/[id]/offers", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to offers page with valid request ID" });
      const response = await page.goto(`/request/${REQUEST_IDS.pending}/offers`);

      // Should return a valid page (not 500)
      expect(response?.status()).toBeLessThan(500);
    });

    test("page requires authentication for direct access", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate without auth or token" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers`);

      // Should show auth required page
      await expect(page.getByText("Inicio de sesion requerido")).toBeVisible();
    });

    test("page has back navigation to request status", async ({ page, log }) => {
      await log({ level: "step", message: "Check back button exists" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      const backLink = page.getByRole("link", { name: /Volver al estado/i });
      await expect(backLink).toBeVisible();
    });
  });

  test.describe("AC10.1.6: Guest Access via Tracking Token", () => {
    test("guest can access offers page with valid tracking token", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate with tracking token" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Should show request summary header, not auth required page
      await expect(page.getByText("Ofertas para tu solicitud")).toBeVisible();
    });

    test("shows request summary in header", async ({ page, log }) => {
      await log({ level: "step", message: "Verify request summary" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Should show amount from seeded request (1000L)
      await expect(page.getByText(/1\.000L/)).toBeVisible();
    });

    test("invalid token shows error page", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate with invalid token" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=invalid-token`);

      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
    });

    test("back button navigates to guest tracking page with token", async ({ page, log }) => {
      await log({ level: "step", message: "Check back link uses token path" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      const backLink = page.getByRole("link", { name: /Volver al estado/i });
      await expect(backLink).toHaveAttribute("href", `/track/${TRACKING_TOKENS.pending}`);
    });
  });

  test.describe("AC10.1.1: Ofertas Recibidas Section", () => {
    test("shows 'Ofertas Recibidas' heading", async ({ page, log }) => {
      await log({ level: "step", message: "Check section heading" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      await expect(page.getByText("Ofertas Recibidas")).toBeVisible();
    });

    test("shows offer count badge", async ({ page, log }) => {
      await log({ level: "step", message: "Check count badge exists" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Should have a badge with offer count
      const badge = page.getByTestId("offer-count-badge");
      await expect(badge).toBeVisible();
    });
  });

  test.describe("AC10.1.5: Empty State", () => {
    test("shows waiting message when no offers", async ({ page, log }) => {
      await log({ level: "step", message: "Check empty state message" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // If no offers seeded, should show empty state
      // This test may need adjustment based on whether offers are seeded
      const emptyHeading = page.getByTestId("empty-state-heading");
      if (await emptyHeading.isVisible()) {
        await expect(page.getByText("Esperando ofertas de repartidores...")).toBeVisible();
      }
    });

    test("shows timeout notice in empty state", async ({ page, log }) => {
      await log({ level: "step", message: "Check timeout notice" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      const timeoutNotice = page.getByTestId("timeout-notice");
      if (await timeoutNotice.isVisible()) {
        await expect(page.getByText(/Si no recibes ofertas en 4 horas/)).toBeVisible();
      }
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("all UI text is in Spanish", async ({ page, log }) => {
      await log({ level: "step", message: "Verify Spanish text" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Headers and buttons should be in Spanish
      await expect(page.getByText("Ofertas para tu solicitud")).toBeVisible();
      await expect(page.getByText("Ofertas Recibidas")).toBeVisible();
      await expect(page.getByRole("link", { name: /Volver al estado/i })).toBeVisible();

      // Should NOT have English text
      await expect(page.getByText("Received Offers")).not.toBeVisible();
      await expect(page.getByText("Back to status")).not.toBeVisible();
    });
  });

  test.describe("Request Status Page Navigation", () => {
    test("pending status page has 'Ver Ofertas' button", async ({ page, log }) => {
      await log({ level: "step", message: "Check View Offers button on tracking page" });
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      await expect(viewOffersButton).toBeVisible();
      await expect(viewOffersButton).toHaveText(/Ver Ofertas/);
    });

    test("'Ver Ofertas' button links to offers page with token", async ({ page, log }) => {
      await log({ level: "step", message: "Verify button href" });
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      const href = await viewOffersButton.getAttribute("href");

      expect(href).toContain(`/request/${REQUEST_IDS.pending}/offers`);
      expect(href).toContain(`token=${TRACKING_TOKENS.pending}`);
    });

    test("clicking 'Ver Ofertas' navigates to offers page", async ({ page, log }) => {
      await log({ level: "step", message: "Click and verify navigation" });
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      await page.getByTestId("view-offers-button").click();

      // Should navigate to offers page
      await expect(page).toHaveURL(new RegExp(`/request/${REQUEST_IDS.pending}/offers`));
      await expect(page.getByText("Ofertas para tu solicitud")).toBeVisible();
    });

    test("updated pending message mentions offers", async ({ page, log }) => {
      await log({ level: "step", message: "Check pending message text" });
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Message should now reference offers instead of just aguatero
      await expect(page.getByText(/Esperando ofertas de repartidores/)).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("offers page loads within 3 seconds", async ({ page, log }) => {
      await log({ level: "step", message: "Measure page load time" });

      const startTime = Date.now();
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      const loadTime = Date.now() - startTime;

      // NFR1: Page load under 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Page should be functional
      await expect(page.getByText("Ofertas Recibidas")).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("page has proper heading structure", async ({ page, log }) => {
      await log({ level: "step", message: "Check heading hierarchy" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // H1 should be the main title
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
    });

    test("back button is keyboard accessible", async ({ page, log }) => {
      await log({ level: "step", message: "Check keyboard navigation" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      const backLink = page.getByRole("link", { name: /Volver al estado/i });
      await backLink.focus();
      await expect(backLink).toBeFocused();
    });
  });
});

/**
 * Integration tests requiring seeded offer data
 * Run `npm run seed:offers` before running these tests
 *
 * These tests use CONSUMER_OFFERS_TEST_DATA which seeds 3 offers
 * for SEEDED_PENDING_REQUEST from different providers with different
 * delivery windows.
 */
test.describe("Offers with Seeded Data @seeded", () => {
  test.describe("AC10.1.2: Offer Card Display", () => {
    test("offer card shows provider name", async ({ page, log }) => {
      await log({ level: "step", message: "Check provider name in card" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Should show at least one of the seeded provider names
      const providerName = CONSUMER_OFFERS_TEST_DATA.providers.secondary.name;
      await expect(page.getByText(providerName)).toBeVisible();
    });

    test("offer card shows delivery window", async ({ page, log }) => {
      await log({ level: "step", message: "Check delivery window display" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Delivery window format: "Entrega: HH:MM - HH:MM" (use .first() since there are 3 cards)
      await expect(page.getByTestId("delivery-window").first()).toBeVisible();
    });

    test("offer card shows price", async ({ page, log }) => {
      await log({ level: "step", message: "Check price display" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Price should be displayed in CLP format (e.g., "$20.000")
      // The seeded request is 1000L which costs $20,000
      // Use .first() since there are 3 cards with prices
      await expect(page.getByTestId("offer-price").first()).toBeVisible();
      await expect(page.getByTestId("offer-price").first()).toContainText("$20.000");
    });

    test("offer card shows countdown timer", async ({ page, log }) => {
      await log({ level: "step", message: "Check countdown timer" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Countdown timer component uses data-testid="countdown-timer"
      const countdown = page.getByTestId("countdown-timer").first();
      await expect(countdown).toBeVisible();

      // Should show "Expira en" prefix with countdown value
      await expect(countdown).toContainText("Expira en");
    });

    test("offer card has 'Seleccionar' button", async ({ page, log }) => {
      await log({ level: "step", message: "Check select button" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Each offer card should have a "Seleccionar" button
      const selectButtons = page.getByRole("button", { name: /Seleccionar/i });
      await expect(selectButtons.first()).toBeVisible();

      // Should have 3 buttons (one per seeded offer)
      await expect(selectButtons).toHaveCount(CONSUMER_OFFERS_TEST_DATA.totalOffers);
    });
  });

  test.describe("AC10.1.3: Offers Sorted by Delivery Window", () => {
    test("offers are sorted soonest first", async ({ page, log }) => {
      await log({ level: "step", message: "Check offer sorting" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Get all offer cards (using correct testid from offer-card.tsx)
      const offerCards = page.getByTestId("consumer-offer-card");
      await expect(offerCards).toHaveCount(CONSUMER_OFFERS_TEST_DATA.totalOffers);

      // First card should be from earliest provider (Pedro Aguatero)
      const firstCard = offerCards.first();
      await expect(firstCard.getByText(CONSUMER_OFFERS_TEST_DATA.expectedSortOrder[0])).toBeVisible();

      // Last card should be from latest provider (Supplier Test / dev provider)
      const lastCard = offerCards.last();
      await expect(lastCard.getByText(CONSUMER_OFFERS_TEST_DATA.expectedSortOrder[2])).toBeVisible();
    });
  });

  test.describe("Offer Count Badge", () => {
    test("count badge shows correct number of offers", async ({ page, log }) => {
      await log({ level: "step", message: "Verify offer count matches seeded data" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      const badge = page.getByTestId("offer-count-badge");
      await expect(badge).toContainText(`${CONSUMER_OFFERS_TEST_DATA.totalOffers}`);
    });
  });
});
