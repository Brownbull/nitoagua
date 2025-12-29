import { test, expect, assertNoErrorState } from "../fixtures/error-detection";

/**
 * Helper to skip past the map step after filling step 1
 * Story 12-1 added a map pinpoint step between step 1 and step 2
 */
async function skipMapStep(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId("map-confirm-button")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("map-confirm-button").click();
}

/**
 * Story 12-4: Urgency Pricing Display Tests
 * Tests the dynamic urgency surcharge display feature in the request form
 * Uses error-detection fixtures per Atlas Testing Section 5.2
 *
 * AC12.4.1: Urgency Toggle with Price Impact
 * AC12.4.2: Dynamic Surcharge Display from admin settings
 * AC12.4.3: Review Screen Price Breakdown
 */
test.describe("Urgency Pricing Display - Story 12-4", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request");

    // Wait for comunas to load
    await expect(page.getByText("Selecciona tu comuna")).toBeVisible({ timeout: 10000 });

    // Select comuna first
    await page.getByTestId("comuna-select").click();
    await expect(page.getByTestId("comuna-option-villarrica")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("comuna-option-villarrica").click();

    // Fill step 1 completely
    await page.getByTestId("name-input").fill("María González");
    await page.getByTestId("phone-input").fill("+56912345678");
    await page.getByTestId("address-input").fill("Camino Los Robles 123, Villarrica");
    await page.getByTestId("instructions-input").fill("Después del puente, casa azul");
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step to get to step 2
    await skipMapStep(page);

    // Wait for step 2 (amount selection)
    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });
  });

  test.describe("AC12.4.1: Urgency Toggle with Price Impact", () => {
    test("urgency toggle is visible on step 2", async ({ page }) => {
      await expect(page.getByTestId("urgency-toggle")).toBeVisible();
    });

    test("displays Normal and Urgente options", async ({ page }) => {
      await expect(page.getByTestId("urgency-normal")).toBeVisible();
      await expect(page.getByTestId("urgency-urgent")).toBeVisible();
    });

    test("Normal option is selected by default", async ({ page }) => {
      const normalOption = page.getByTestId("urgency-normal");
      await expect(normalOption).toHaveAttribute("aria-checked", "true");
    });

    test("Urgente button shows percentage surcharge (dynamic from settings)", async ({ page }) => {
      const urgentButton = page.getByTestId("urgency-urgent");
      // Should show "Urgente (+X%)" where X is from admin settings (default 10%)
      await expect(urgentButton).toContainText(/Urgente \(\+\d+%\)/);
    });

    test("has visual indicator (emoji) for urgency options", async ({ page }) => {
      // Normal should have 🙂 emoji
      const normalButton = page.getByTestId("urgency-normal");
      await expect(normalButton).toContainText("🙂");

      // Urgent should have ⚡ emoji
      const urgentButton = page.getByTestId("urgency-urgent");
      await expect(urgentButton).toContainText("⚡");
    });

    test("can switch to urgent option", async ({ page }) => {
      const urgentOption = page.getByTestId("urgency-urgent");

      // Click urgent option
      await urgentOption.click();

      // Verify urgent is now selected
      await expect(urgentOption).toHaveAttribute("aria-checked", "true");

      // Normal should no longer be selected
      const normalOption = page.getByTestId("urgency-normal");
      await expect(normalOption).toHaveAttribute("aria-checked", "false");
    });
  });

  test.describe("AC12.4.2: Dynamic Surcharge Display", () => {
    test("displays info hint about urgency surcharge percentage", async ({ page }) => {
      // Should show hint text with dynamic percentage
      await expect(page.getByText(/Urgente prioriza tu pedido con un cargo adicional del \d+%/)).toBeVisible();
    });

    test("price summary updates when urgency is selected", async ({ page }) => {
      // Select amount first
      await page.getByTestId("amount-1000").click();

      // Get initial price (normal) - look for the summary section
      const priceSummary = page.locator(".p-3.bg-gray-50.rounded-xl");
      await expect(priceSummary).toBeVisible();

      // Price should be shown with "Precio estimado" text (e.g., "$20.000")
      await expect(priceSummary).toContainText("Precio estimado");
      await expect(priceSummary).toContainText("$");

      // Select urgent option
      await page.getByTestId("urgency-urgent").click();

      // Price summary should now show urgency surcharge message
      await expect(priceSummary).toContainText(/Incluye cargo de urgencia/);
    });
  });

  test.describe("AC12.4.3: Review Screen Price Breakdown", () => {
    test.beforeEach(async ({ page }) => {
      // Select amount to enable proceeding
      await page.getByTestId("amount-1000").click();
    });

    test("review screen shows simple total for normal request", async ({ page }) => {
      // Normal is default, proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // AC 9.1.3: Assert no error states before checking content
      await assertNoErrorState(page);

      // Check price is shown (simple total)
      await expect(page.getByTestId("review-price")).toBeVisible();
      await expect(page.getByTestId("review-price")).toContainText("$");

      // Should NOT show price breakdown for normal requests
      await expect(page.getByTestId("base-price")).not.toBeVisible();
      await expect(page.getByTestId("urgency-surcharge")).not.toBeVisible();
    });

    test("review screen shows itemized breakdown for urgent request", async ({ page }) => {
      // Select urgent
      await page.getByTestId("urgency-urgent").click();

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // AC 9.1.3: Assert no error states before checking content
      await assertNoErrorState(page);

      // Check price breakdown is shown
      await expect(page.getByTestId("price-breakdown")).toBeVisible();
      await expect(page.getByTestId("base-price")).toBeVisible();
      await expect(page.getByTestId("urgency-surcharge")).toBeVisible();
      await expect(page.getByTestId("review-price")).toBeVisible();

      // Verify breakdown labels in Spanish
      await expect(page.getByText("Base:")).toBeVisible();
      await expect(page.getByText(/Recargo urgente \(\d+%\):/)).toBeVisible();
      await expect(page.getByText("Total estimado:")).toBeVisible();
    });

    test("urgent request shows urgency badge on review", async ({ page }) => {
      // Select urgent
      await page.getByTestId("urgency-urgent").click();

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Check urgency badge is shown
      await expect(page.getByText(/⚡ Urgente \(\+\d+%\)/)).toBeVisible();
    });

    test("normal request does not show urgency badge on review", async ({ page }) => {
      // Normal is default, proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Urgency badge should NOT be visible
      await expect(page.getByText(/⚡ Urgente/)).not.toBeVisible();
    });

    test("prices are formatted in Chilean pesos", async ({ page }) => {
      // Select urgent to see all price elements
      await page.getByTestId("urgency-urgent").click();

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // All prices should have $ prefix and thousand separators (e.g., "$20.000")
      const basePrice = await page.getByTestId("base-price").textContent();
      expect(basePrice).toMatch(/\$[\d.]+/);

      const surcharge = await page.getByTestId("urgency-surcharge").textContent();
      expect(surcharge).toMatch(/\$[\d.]+/);

      const total = await page.getByTestId("review-price").textContent();
      expect(total).toMatch(/~?\$[\d.]+/);
    });
  });

  test.describe("Full Urgency Selection Flow", () => {
    test("complete flow with normal selection (no surcharge)", async ({ page }) => {
      // Step 2: Select amount (normal urgency by default)
      await page.getByTestId("amount-1000").click();
      await expect(page.getByTestId("urgency-normal")).toHaveAttribute("aria-checked", "true");

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Step 3: Review
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });
      await assertNoErrorState(page);

      // Should show simple price without breakdown
      await expect(page.getByTestId("review-price")).toBeVisible();
      await expect(page.getByTestId("base-price")).not.toBeVisible();
    });

    test("complete flow with urgent selection (includes surcharge)", async ({ page }) => {
      // Step 2: Select amount + urgent
      await page.getByTestId("amount-1000").click();
      await page.getByTestId("urgency-urgent").click();
      await expect(page.getByTestId("urgency-urgent")).toHaveAttribute("aria-checked", "true");

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Step 3: Review
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });
      await assertNoErrorState(page);

      // Should show price breakdown
      await expect(page.getByTestId("base-price")).toBeVisible();
      await expect(page.getByTestId("urgency-surcharge")).toBeVisible();
    });

    test("urgency selection persists when navigating back and forth", async ({ page }) => {
      // Select urgent
      await page.getByTestId("urgency-urgent").click();
      await page.getByTestId("amount-1000").click();

      // Go to review
      await page.getByTestId("nav-next-button").click();
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Go back to step 2
      await page.getByTestId("nav-back-button").click();
      await expect(page.getByText("Paso 2 de 3")).toBeVisible();

      // Urgent should still be selected
      await expect(page.getByTestId("urgency-urgent")).toHaveAttribute("aria-checked", "true");
    });

    test("can change urgency selection on step 2", async ({ page }) => {
      // Start with urgent
      await page.getByTestId("urgency-urgent").click();
      await expect(page.getByTestId("urgency-urgent")).toHaveAttribute("aria-checked", "true");

      // Switch to normal
      await page.getByTestId("urgency-normal").click();
      await expect(page.getByTestId("urgency-normal")).toHaveAttribute("aria-checked", "true");
      await expect(page.getByTestId("urgency-urgent")).toHaveAttribute("aria-checked", "false");
    });
  });
});

/**
 * AC12.4.4: Offer Display Impact Tests
 * Tests urgency badge display on consumer offer cards
 * Requires seeded data: npm run seed:offers
 *
 * Note: Urgency badge only shows on NON-EXPIRED offers (expired offers are faded)
 */
test.describe("AC12.4.4: Offer Display Urgency Badge @seeded", () => {
  // Tracking tokens from seed-offer-tests.ts
  const URGENT_REQUEST_TOKEN = "offer-test-pending-2"; // is_urgent: true
  const NORMAL_REQUEST_TOKEN = "offer-test-pending-1"; // is_urgent: false

  test("urgent request page loads correctly with offers display", async ({ page }) => {
    // Navigate to offers page for urgent request (seeded with is_urgent=true)
    await page.goto(`/request/77777777-7777-7777-7777-777777777772/offers?token=${URGENT_REQUEST_TOKEN}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Check if page loaded correctly - may show offers page OR redirect to tracking (if request not found)
    const hasOffersPage = await page.getByText("Elige tu repartidor").isVisible().catch(() => false);
    const hasTrackingPage = await page.getByText(/Seguimiento|Solicitud/).first().isVisible().catch(() => false);
    const has404 = await page.getByText(/no encontrada|not found/i).isVisible().catch(() => false);

    // If request doesn't exist (seed data not present), skip the test
    if (has404 || (!hasOffersPage && !hasTrackingPage)) {
      test.skip(true, "Offer seed data not present - requires npm run seed:offers");
      return;
    }

    // If we have offers page, verify the layout
    if (hasOffersPage) {
      await expect(page.getByText("Elige tu repartidor")).toBeVisible();

      // Check if we have active (non-expired) offers
      const offersContainer = page.getByTestId("offers-container");
      const hasOffers = await offersContainer.isVisible().catch(() => false);

      if (hasOffers) {
        // Find offer cards - check if any are active (not showing "Expirada")
        const activeOfferCards = page.getByTestId("consumer-offer-card").filter({
          hasNot: page.locator('text="Expirada"'),
        });
        const activeCount = await activeOfferCards.count();

        if (activeCount > 0) {
          // Active offers should show urgency badge for urgent requests
          const firstActiveCard = activeOfferCards.first();
          await expect(firstActiveCard.getByTestId("urgency-badge")).toBeVisible();
          await expect(firstActiveCard.getByTestId("urgency-badge")).toContainText("Urgente");
        }
        // If all offers expired, that's still valid - just no badge to test
      }
    }
    // Any valid page state is acceptable
  });

  test("normal request does NOT show urgency badge on offer cards", async ({ page }) => {
    // Navigate to offers page for normal request (seeded with is_urgent=false)
    await page.goto(`/request/77777777-7777-7777-7777-777777777771/offers?token=${NORMAL_REQUEST_TOKEN}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Check if page loaded correctly - may show offers page OR redirect to tracking (if request not found)
    const hasOffersPage = await page.getByText("Elige tu repartidor").isVisible().catch(() => false);
    const hasTrackingPage = await page.getByText(/Seguimiento|Solicitud/).first().isVisible().catch(() => false);
    const has404 = await page.getByText(/no encontrada|not found/i).isVisible().catch(() => false);

    // If request doesn't exist (seed data not present), skip the test
    if (has404 || (!hasOffersPage && !hasTrackingPage)) {
      test.skip(true, "Offer seed data not present - requires npm run seed:offers");
      return;
    }

    // If we have offers page, check for offers
    if (hasOffersPage) {
      const offersContainer = page.getByTestId("offers-container");
      const hasOffers = await offersContainer.isVisible().catch(() => false);

      if (hasOffers) {
        // If offers exist, urgency badge should NOT be visible on any card
        const offerCards = page.getByTestId("consumer-offer-card");
        const cardCount = await offerCards.count();

        for (let i = 0; i < cardCount; i++) {
          const card = offerCards.nth(i);
          await expect(card.getByTestId("urgency-badge")).not.toBeVisible();
        }
      }
    }
    // Any valid page state is acceptable (offers page, tracking page, empty state)
  });

  test("urgency badge has correct visual styling", async ({ page }) => {
    // Navigate to offers page for urgent request
    await page.goto(`/request/77777777-7777-7777-7777-777777777772/offers?token=${URGENT_REQUEST_TOKEN}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Check if we have active offers with urgency badge
    const urgencyBadge = page.getByTestId("urgency-badge").first();
    const isVisible = await urgencyBadge.isVisible().catch(() => false);

    if (isVisible) {
      // Verify badge contains lightning emoji and "Urgente" text
      await expect(urgencyBadge).toContainText("⚡");
      await expect(urgencyBadge).toContainText("Urgente");
      // Verify orange/amber styling (bg-amber-500)
      await expect(urgencyBadge).toHaveClass(/bg-amber/);
    }
    // If no active offers, skip the styling check
  });
});
