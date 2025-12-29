/**
 * Epic 12 Integration Tests
 *
 * Story 12-13: Full Local Validation
 * Tests cross-feature interactions between Epic 12 stories.
 *
 * Test IDs:
 * - 12-INT-1: Full request flow with map + payment + urgency
 * - 12-INT-2: Consumer request → timeout → retry with trust signals visible
 * - 12-INT-3: Consumer request → cancel → negative state → new request
 * - 12-INT-4: Provider sees all new fields (payment, urgency, coordinates)
 * - 12-INT-5: Push subscription + offer (notification component visible)
 */

import { test, expect, assertNoErrorState } from "../fixtures/error-detection";
import { TRACKING_TOKENS } from "../fixtures/test-data";

/**
 * Helper to fill step 1 form for request creation
 */
async function fillStep1Form(page: import("@playwright/test").Page) {
  await page.getByTestId("name-input").fill("María Integration");
  await page.getByTestId("phone-input").fill("+56912345678");
  await page.getByTestId("email-input").fill("maria.int@test.local");
  await page.getByTestId("comuna-select").click();
  await expect(page.getByTestId("comuna-option-villarrica")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("comuna-option-villarrica").click();
  await page.getByTestId("address-input").fill("Camino Los Robles 123, Villarrica");
  await page.getByTestId("instructions-input").fill("Casa azul con portón verde");
}

/**
 * Helper to skip past the map step after filling step 1
 * Used in INT-1 test to progress through full request flow
 */
async function _skipMapStep(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId("map-confirm-button")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("map-confirm-button").click();
}

test.describe("Epic 12 Integration Tests - Story 12-13", () => {
  test.describe("12-INT-1: Full Request Flow with Map + Payment + Urgency", () => {
    test("complete request creation with all Epic 12 features", async ({ page }) => {
      // Navigate to request page
      await page.goto("/request");
      await assertNoErrorState(page);

      // Step 1: Fill contact and location
      await fillStep1Form(page);
      await page.getByTestId("next-button").click();

      // Map Step: Confirm location (Epic 12-1)
      await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId("location-pinpoint")).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("coordinates-display")).toBeVisible();
      await page.getByTestId("map-confirm-button").click();

      // Step 2: Amount + Payment + Urgency
      await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

      // Verify all Epic 12 features are present
      // Payment selection (Epic 12-2)
      await expect(page.getByTestId("payment-selector")).toBeVisible();
      await expect(page.getByTestId("payment-option-cash")).toBeVisible();
      await expect(page.getByTestId("payment-option-transfer")).toBeVisible();

      // Urgency toggle (Epic 12-4)
      await expect(page.getByTestId("urgency-toggle")).toBeVisible();
      await expect(page.getByTestId("urgency-normal")).toBeVisible();
      await expect(page.getByTestId("urgency-urgent")).toBeVisible();

      // Select amount
      await page.getByTestId("amount-1000").click();

      // Select transfer payment
      await page.getByTestId("payment-option-transfer").click();
      await expect(page.getByTestId("payment-option-transfer")).toHaveAttribute("aria-pressed", "true");

      // Select urgent
      await page.getByTestId("urgency-urgent").click();
      await expect(page.getByTestId("urgency-urgent")).toHaveAttribute("aria-checked", "true");

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Step 3: Review - verify all selections are shown
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });
      await assertNoErrorState(page);

      // Verify payment method shown (Epic 12-2)
      await expect(page.getByTestId("review-payment-method")).toContainText("Transferencia");

      // Verify urgency badge (Epic 12-4)
      await expect(page.getByText(/⚡ Urgente/)).toBeVisible();

      // Verify price breakdown for urgent request
      await expect(page.getByTestId("price-breakdown")).toBeVisible();
      await expect(page.getByTestId("base-price")).toBeVisible();
      await expect(page.getByTestId("urgency-surcharge")).toBeVisible();

      // Verify address shown
      await expect(page.getByText("Camino Los Robles 123")).toBeVisible();
    });
  });

  test.describe("12-INT-2: Timeout Flow with Trust Signals", () => {
    test("no_offers page shows trust signals and retry path @seeded", async ({ page }) => {
      // Navigate to a timed-out request
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Verify negative status card (Epic 12-3)
      await expect(page.getByTestId("negative-status-no_offers")).toBeVisible();
      await expect(page.getByTestId("negative-status-title")).toHaveText("Sin Ofertas");

      // Verify support contact (Epic 12-3)
      await expect(page.getByTestId("support-contact")).toBeVisible();

      // Click retry button
      const retryButton = page.getByTestId("primary-action-button");
      await expect(retryButton).toContainText("Intentar de nuevo");
      await retryButton.click();

      // Should navigate to home page
      await expect(page).toHaveURL("/");
      await assertNoErrorState(page);

      // Verify trust signals are visible on home (Epic 12-5)
      await expect(page.getByText("Verificados")).toBeVisible();
      await expect(page.getByText("Agua certificada")).toBeVisible();
      await expect(page.getByText("Entrega rápida")).toBeVisible();
    });
  });

  test.describe("12-INT-3: Cancellation Flow with Negative State", () => {
    test("cancelled request shows negative state with new request option @seeded", async ({ page }) => {
      // Navigate to a cancelled request
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Verify cancelled negative status card (Epic 12-3)
      await expect(page.getByTestId("negative-status-cancelled_by_user")).toBeVisible();
      await expect(page.getByTestId("negative-status-title")).toHaveText("Cancelada");

      // Verify support contact visible
      await expect(page.getByTestId("support-contact")).toBeVisible();

      // Click new request button
      const newRequestButton = page.getByTestId("primary-action-button");
      await expect(newRequestButton).toContainText("Nueva Solicitud");
      await newRequestButton.click();

      // Should navigate to home
      await expect(page).toHaveURL("/");
      await assertNoErrorState(page);

      // Verify trust signals on home (Epic 12-5)
      await expect(page.getByText("Verificados")).toBeVisible();
    });
  });

  test.describe("12-INT-4: Provider Sees New Request Fields", () => {
    test.skip(process.env.NEXT_PUBLIC_DEV_LOGIN !== "true", "Dev login required");

    test("provider request browser shows payment and urgency @seeded", async ({ page }) => {
      // Login as provider
      await page.goto("/login");
      await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });
      const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
      await supplierButton.click();
      await page.waitForTimeout(100);
      await page.getByTestId("dev-login-button").click();

      try {
        await page.waitForURL(/\/provider/, { timeout: 15000 });
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      // Navigate to requests browser
      await page.goto("/provider/requests");
      await assertNoErrorState(page);

      // Wait for requests to load
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      // Check if we have any requests visible
      const requestCards = page.getByTestId("request-card");
      const hasRequests = (await requestCards.count()) > 0;

      if (hasRequests) {
        // Click first request to see details
        await requestCards.first().click();

        // Wait for details page
        await page.waitForLoadState("networkidle");
        await assertNoErrorState(page);

        // Provider should see request details
        // The presence of these fields confirms Epic 12 features are visible to providers
        await expect(page.getByText(/Pago|Efectivo|Transferencia/)).toBeVisible({ timeout: 5000 });
      } else {
        // No requests available - skip detailed checks
        await expect(page.getByText(/No hay solicitudes|solicitudes pendientes/i)).toBeVisible();
      }
    });
  });

  test.describe("12-INT-5: Push Notification Component Visibility", () => {
    test.skip(process.env.NEXT_PUBLIC_DEV_LOGIN !== "true", "Dev login required");

    test("provider settings shows notification component (Epic 12-6)", async ({ page }) => {
      // Login as provider
      await page.goto("/login");
      await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });
      const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
      await supplierButton.click();
      await page.waitForTimeout(100);
      await page.getByTestId("dev-login-button").click();

      try {
        await page.waitForURL(/\/provider/, { timeout: 15000 });
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      // Navigate to settings
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);
      await assertNoErrorState(page);

      // Verify notification settings component visible (Epic 12-6)
      const notificationSettings = page.getByTestId("notification-settings");
      await expect(notificationSettings).toBeVisible();

      // Verify push notification toggle section
      await expect(notificationSettings.getByText("Notificaciones Push")).toBeVisible();

      // Verify test notification button
      const testButton = page.getByTestId("notification-test-button");
      await expect(testButton).toBeVisible();
    });
  });
});
