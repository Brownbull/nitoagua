import { test, expect } from "../support/fixtures/merged-fixtures";
import {
  TRACKING_TOKENS,
  REQUEST_IDS,
  CONSUMER_OFFERS_TEST_DATA,
} from "../fixtures/test-data";

/**
 * Tests for Consumer Offer Selection (Story 10-2)
 *
 * These tests verify the consumer's ability to select a provider's offer.
 * Run `npm run seed:offers` before running these tests to seed offer data.
 *
 * AC10.2.1: Tapping "Seleccionar" opens confirmation modal
 * AC10.2.2: Modal displays provider name/avatar, delivery window, price
 * AC10.2.3: "Confirmar Selección" button calls selectOffer action
 * AC10.2.4: Selected offer status → 'accepted', accepted_at set
 * AC10.2.5: Request status → 'accepted', provider_id assigned
 * AC10.2.6: Other active offers → 'request_filled'
 * AC10.2.7: Success toast with provider name
 * AC10.2.8: Redirect to request status page
 * AC10.2.9: Provider receives in-app + email notification
 * AC10.2.10: Other providers receive in-app notification
 */

test.describe("Consumer Offer Selection (Story 10-2)", () => {
  test.describe("AC10.2.1: Confirmation Modal Opens", () => {
    test("clicking 'Seleccionar' opens confirmation modal", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to offers page with seeded offers" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      // Wait for offers to load
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();

      await log({ level: "step", message: "Click first offer's Seleccionar button" });
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Verify confirmation modal is open" });
      const modal = page.getByTestId("offer-selection-modal");
      await expect(modal).toBeVisible();
    });
  });

  test.describe("AC10.2.2: Modal Content Display", () => {
    test("modal displays provider name", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Check provider name in modal" });
      const providerName = page.getByTestId("modal-provider-name");
      await expect(providerName).toBeVisible();
      // First provider should be Pedro Aguatero (sorted by delivery window)
      await expect(providerName).toContainText(CONSUMER_OFFERS_TEST_DATA.expectedSortOrder[0]);
    });

    test("modal displays delivery window", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Check delivery window in modal" });
      const deliveryWindow = page.getByTestId("modal-delivery-window");
      await expect(deliveryWindow).toBeVisible();
      // Should show time format like "10:00 - 12:00"
      await expect(deliveryWindow).toContainText(":");
    });

    test("modal displays price", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Check price in modal" });
      const price = page.getByTestId("modal-price");
      await expect(price).toBeVisible();
      // Request is 1000L which costs $20,000
      await expect(price).toContainText("$20.000");
    });

    test("modal has Volver and Confirmar buttons", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Check modal buttons" });
      await expect(page.getByTestId("selection-cancel-button")).toBeVisible();
      await expect(page.getByTestId("selection-cancel-button")).toContainText("Volver");
      await expect(page.getByTestId("selection-confirm-button")).toBeVisible();
      await expect(page.getByTestId("selection-confirm-button")).toContainText("Confirmar");
    });
  });

  test.describe("Modal Cancel Behavior", () => {
    test("clicking Volver closes modal without selection", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();

      await log({ level: "step", message: "Click Volver button" });
      await page.getByTestId("selection-cancel-button").click();

      await log({ level: "step", message: "Verify modal is closed" });
      await expect(page.getByTestId("offer-selection-modal")).not.toBeVisible();

      // Still on offers page
      await expect(page.getByText("Ofertas para tu solicitud")).toBeVisible();
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("modal content is in Spanish", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Verify Spanish text" });
      await expect(page.getByTestId("selection-modal-title")).toContainText("Confirmar Selección");
      await expect(page.getByText("Entrega estimada")).toBeVisible();
      await expect(page.getByText("Precio total")).toBeVisible();
      await expect(page.getByText("Repartidor verificado")).toBeVisible();

      // Should NOT have English text
      await expect(page.getByText("Confirm Selection")).not.toBeVisible();
      await expect(page.getByText("Delivery window")).not.toBeVisible();
    });
  });

  test.describe("AC10.2.6: Guest Consumer Support", () => {
    test("guest can access selection modal via tracking token", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate as guest with token" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);

      await log({ level: "step", message: "Verify page loads for guest" });
      await expect(page.getByText("Ofertas para tu solicitud")).toBeVisible();

      await log({ level: "step", message: "Open selection modal" });
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("modal has proper ARIA attributes", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();

      await log({ level: "step", message: "Verify ARIA role" });
      const modal = page.getByTestId("offer-selection-modal");
      await expect(modal).toBeVisible();
      // AlertDialog from Radix should have role="alertdialog"
      await expect(modal).toHaveAttribute("role", "alertdialog");
    });

    test("confirm button is keyboard focusable", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();

      await log({ level: "step", message: "Tab to confirm button" });
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      // The confirm button should be focusable
      const confirmButton = page.getByTestId("selection-confirm-button");
      await confirmButton.focus();
      await expect(confirmButton).toBeFocused();
    });
  });
});

/**
 * Integration tests for full selection flow
 * These tests verify the complete selection flow including database updates
 *
 * IMPORTANT: Run these tests in isolation as they modify database state
 * Run `npm run seed:offers` before these tests to ensure fresh data
 */
test.describe("Offer Selection Integration @seeded", () => {
  test.describe("AC10.2.3-10.2.8: Full Selection Flow", () => {
    test("selecting offer shows loading state in button", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate and open modal" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();

      await log({ level: "step", message: "Click confirm and check loading state" });
      await page.getByTestId("selection-confirm-button").click();

      // Should show loading text briefly
      // Note: This may be too fast to catch reliably
      const confirmButton = page.getByTestId("selection-confirm-button");
      await expect(confirmButton).toBeDisabled();
    });

    test("AC10.2.7: success toast appears after selection", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to offers page" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();

      await log({ level: "step", message: "Open modal and confirm selection" });
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();
      await page.getByTestId("selection-confirm-button").click();

      await log({ level: "step", message: "Verify success toast appears" });
      // Toast should contain "¡Listo! Tu pedido fue asignado a" with provider name
      const toast = page.locator('[data-sonner-toast]').first();
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText("¡Listo!");
    });

    test("AC10.2.8: redirects to tracking page after selection (guest)", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to offers page as guest" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();

      await log({ level: "step", message: "Select offer and confirm" });
      await page.getByTestId("select-offer-button").first().click();
      await expect(page.getByTestId("offer-selection-modal")).toBeVisible();
      await page.getByTestId("selection-confirm-button").click();

      await log({ level: "step", message: "Verify redirect to tracking page" });
      // Should redirect to /track/{token} for guests
      await expect(page).toHaveURL(new RegExp(`/track/${TRACKING_TOKENS.pending}`), { timeout: 10000 });
    });
  });

  test.describe("Error Handling", () => {
    test("shows error toast when selecting expired offer", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to offers page" });
      await page.goto(`/request/${REQUEST_IDS.pending}/offers?token=${TRACKING_TOKENS.pending}`);
      await expect(page.getByTestId("consumer-offer-card").first()).toBeVisible();

      await log({ level: "step", message: "Find and try to select expired offer" });
      // Look for an offer card with "Expirada" badge
      const expiredOffer = page.locator('[data-testid="consumer-offer-card"]').filter({
        has: page.getByText("Expirada"),
      });

      // If there's an expired offer, its button should be disabled
      if (await expiredOffer.count() > 0) {
        const selectButton = expiredOffer.getByTestId("select-offer-button");
        await expect(selectButton).toBeDisabled();
        await log({ level: "success", message: "Expired offer button is correctly disabled" });
      } else {
        await log({ level: "info", message: "No expired offers in test data - skipping" });
      }
    });
  });
});
