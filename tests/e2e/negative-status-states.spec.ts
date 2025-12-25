import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";
import {
  TRACKING_TOKENS,
  SEEDED_CANCELLED_BY_PROVIDER_REQUEST,
} from "../fixtures/test-data";

/**
 * Story 12-3: Negative Status States
 *
 * Tests for negative status UI components that show when requests fail or are cancelled.
 * Uses seeded test data from `npm run seed:test`.
 *
 * Acceptance Criteria:
 * - AC12.3.1: No Offers / Timeout State - Shows orange/amber styling with time elapsed
 * - AC12.3.2: Cancelled by User State - Shows gray styling with user message
 * - AC12.3.3: Cancelled by Provider State - Shows provider reason prominently
 * - AC12.3.4: Support Contact Visibility - All negative states show contact options
 * - AC12.3.5: Visual Consistency - Icons, colors, and layout match design
 */
test.describe("Negative Status States (Story 12-3)", () => {
  test.describe("AC12.3.1: No Offers / Timeout State", () => {
    test("shows correct UI elements for no_offers status @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Should show the no-offers card
      await expect(page.getByTestId("no-offers-card")).toBeVisible();

      // Should show the negative status card with correct variant
      const statusCard = page.getByTestId("negative-status-no_offers");
      await expect(statusCard).toBeVisible();

      // Should show correct title
      await expect(page.getByTestId("negative-status-title")).toHaveText("Sin Ofertas");

      // Should show descriptive message
      await expect(page.getByTestId("negative-status-message")).toContainText(
        "No hay aguateros disponibles ahora"
      );

      // Should show additional help text
      await expect(page.getByTestId("no-offers-help")).toBeVisible();
    });

    test("shows time elapsed since request @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // AC12.3.1: Show time elapsed since request
      const timeElapsed = page.getByTestId("time-elapsed");
      await expect(timeElapsed).toBeVisible();
      await expect(timeElapsed).toContainText("Solicitado");
    });

    test("shows 'Intentar de nuevo' primary action @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      const primaryButton = page.getByTestId("primary-action-button");
      await expect(primaryButton).toBeVisible();
      await expect(primaryButton).toContainText("Intentar de nuevo");

      // Button should link to home page
      await expect(primaryButton).toHaveAttribute("href", "/");
    });

    test("shows support contact options @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // AC12.3.4: Support contact visibility
      const supportSection = page.getByTestId("support-contact");
      await expect(supportSection).toBeVisible();

      // Should show WhatsApp option
      await expect(page.getByTestId("whatsapp-support")).toBeVisible();
      await expect(page.getByTestId("whatsapp-support")).toContainText("WhatsApp");

      // Should show Email option
      await expect(page.getByTestId("email-support")).toBeVisible();
      await expect(page.getByTestId("email-support")).toContainText("Email");
    });

    test("timeline shows failed state @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Timeline should be visible
      const timeline = page.getByTestId("timeline");
      await expect(timeline).toBeVisible();

      // First step should be completed
      const step1 = page.getByTestId("timeline-step-1");
      await expect(step1).toBeVisible();
      await expect(step1).toHaveAttribute("data-status", "completed");

      // Second step should be failed (no offers received)
      const step2 = page.getByTestId("timeline-step-2");
      await expect(step2).toBeVisible();
      await expect(step2).toHaveAttribute("data-status", "failed");
    });
  });

  test.describe("AC12.3.2: Cancelled by User State", () => {
    test("shows correct UI for user cancellation @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Should show cancelled variant
      const statusCard = page.getByTestId("negative-status-cancelled_by_user");
      await expect(statusCard).toBeVisible();

      // Should show "Cancelada" title
      await expect(page.getByTestId("negative-status-title")).toHaveText("Cancelada");

      // Should show user-specific message
      await expect(page.getByTestId("negative-status-message")).toContainText(
        "Cancelaste esta solicitud"
      );
    });

    test("shows 'Nueva Solicitud' primary action @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      const primaryButton = page.getByTestId("primary-action-button");
      await expect(primaryButton).toBeVisible();
      await expect(primaryButton).toContainText("Nueva Solicitud");
    });

    test("shows cancellation timestamp @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Should show when it was cancelled
      const cancellationTime = page.getByTestId("cancellation-time");
      await expect(cancellationTime).toBeVisible();
      await expect(cancellationTime).toContainText("Cancelado el");
    });

    test("shows support contact options @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // AC12.3.4: Support contact on cancelled state too
      await expect(page.getByTestId("support-contact")).toBeVisible();
      await expect(page.getByTestId("whatsapp-support")).toBeVisible();
      await expect(page.getByTestId("email-support")).toBeVisible();
    });

    test("timeline shows cancelled state @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      const timeline = page.getByTestId("timeline");
      await expect(timeline).toBeVisible();

      // Should have cancelled step - use specific test ID instead of text
      const cancelledStep = page.locator('[data-status="cancelled"]');
      await expect(cancelledStep).toBeVisible();
    });
  });

  test.describe("AC12.3.3: Cancelled by Provider State", () => {
    test("shows correct UI for provider cancellation @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelledByProvider}`);
      await assertNoErrorState(page);

      // Should show provider cancelled variant
      const statusCard = page.getByTestId("negative-status-cancelled_by_provider");
      await expect(statusCard).toBeVisible();

      // Should show provider-specific title
      await expect(page.getByTestId("negative-status-title")).toHaveText(
        "Cancelada por Proveedor"
      );

      // Should show provider-specific message
      await expect(page.getByTestId("negative-status-message")).toContainText(
        "El proveedor canceló tu solicitud"
      );
    });

    test("shows provider cancellation reason prominently @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelledByProvider}`);
      await assertNoErrorState(page);

      // Should show the reason from the database
      const reasonSection = page.getByTestId("cancellation-reason");
      await expect(reasonSection).toBeVisible();
      await expect(reasonSection).toContainText("Motivo del proveedor:");
      await expect(reasonSection).toContainText(
        SEEDED_CANCELLED_BY_PROVIDER_REQUEST.cancellation_reason || ""
      );
    });

    test("shows 'Intentar de nuevo' primary action @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelledByProvider}`);
      await assertNoErrorState(page);

      // Provider cancellation encourages retry
      const primaryButton = page.getByTestId("primary-action-button");
      await expect(primaryButton).toBeVisible();
      await expect(primaryButton).toContainText("Intentar de nuevo");
    });

    test("shows support contact options @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelledByProvider}`);
      await assertNoErrorState(page);

      // AC12.3.4: Support especially important for provider cancellations
      await expect(page.getByTestId("support-contact")).toBeVisible();
      await expect(page.getByTestId("whatsapp-support")).toBeVisible();
      await expect(page.getByTestId("email-support")).toBeVisible();
    });
  });

  test.describe("AC12.3.4: Support Contact Visibility", () => {
    test("WhatsApp link has correct format @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      const whatsappLink = page.getByTestId("whatsapp-support");
      await expect(whatsappLink).toBeVisible();

      const href = await whatsappLink.getAttribute("href");
      expect(href).toContain("wa.me/");
      expect(href).toContain("text=");
    });

    test("Email link has correct format @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      const emailLink = page.getByTestId("email-support");
      await expect(emailLink).toBeVisible();

      const href = await emailLink.getAttribute("href");
      expect(href).toContain("mailto:");
      expect(href).toContain("soporte@nitoagua.cl");
    });
  });

  test.describe("AC12.3.5: Visual Consistency", () => {
    test("no_offers has orange/amber styling @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      const statusCard = page.getByTestId("negative-status-no_offers");
      await expect(statusCard).toBeVisible();

      // Check orange styling class is applied
      await expect(statusCard).toHaveClass(/bg-\[#FFEDD5\]/);
    });

    test("cancelled_by_user has gray styling @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      const statusCard = page.getByTestId("negative-status-cancelled_by_user");
      await expect(statusCard).toBeVisible();

      // Check gray styling class is applied
      await expect(statusCard).toHaveClass(/bg-gray-100/);
    });

    test("cancelled_by_provider has red styling @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelledByProvider}`);
      await assertNoErrorState(page);

      const statusCard = page.getByTestId("negative-status-cancelled_by_provider");
      await expect(statusCard).toBeVisible();

      // Check red styling class is applied
      await expect(statusCard).toHaveClass(/bg-red-50/);
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("no_offers page is in Spanish @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Spanish text should be present - use specific testids to avoid strict mode
      await expect(page.getByTestId("negative-status-title")).toHaveText("Sin Ofertas");
      await expect(page.getByTestId("primary-action-button")).toContainText("Intentar de nuevo");
      await expect(page.getByText("¿Necesitas ayuda?")).toBeVisible();

      // English should not be present
      await expect(page.getByText("No Offers", { exact: true })).not.toBeVisible();
      await expect(page.getByText("Try Again", { exact: true })).not.toBeVisible();
    });

    test("cancelled page is in Spanish @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Spanish text - use specific testids to avoid strict mode
      await expect(page.getByTestId("negative-status-title")).toHaveText("Cancelada");
      await expect(page.getByTestId("primary-action-button")).toContainText("Nueva Solicitud");

      // English not present
      await expect(page.getByText("Cancelled", { exact: true })).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("primary action button navigates to home @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      const primaryButton = page.getByTestId("primary-action-button");
      await primaryButton.click();

      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Mobile Viewport", () => {
    test.use({
      viewport: { width: 360, height: 780 },
      isMobile: true,
      hasTouch: true,
    });

    test("negative status displays correctly on mobile @seeded", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Card should be visible and not overflow
      const statusCard = page.getByTestId("negative-status-no_offers");
      await expect(statusCard).toBeVisible();

      // Support buttons should be visible and tappable
      await expect(page.getByTestId("whatsapp-support")).toBeVisible();
      await expect(page.getByTestId("email-support")).toBeVisible();

      // Primary action should be full width
      const primaryButton = page.getByTestId("primary-action-button");
      await expect(primaryButton).toBeVisible();
    });
  });
});
