import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider UX Redesign - Story 12.7-10
 *
 * Tests the driver-friendly UX improvements:
 * - AC12.7.10.1: Request Detail redesign with hero cards, prominent earnings, simplified time selection
 * - AC12.7.10.2: Delivery Details redesign with single screen, quick actions, countdown
 * - AC12.7.10.3: Mobile-first layout works on small screens
 *
 * BUG-003: Request detail UX overload - VERIFIED FIXED
 * BUG-010: Delivery details not driver-friendly - VERIFIED FIXED
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded test data
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Mobile viewport for testing - AC12.7.10.3
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Helper to login as supplier
async function loginAsSupplier(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await assertNoErrorState(page);
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();
  // Wait for email/password to auto-fill
  await page.waitForLoadState("networkidle");
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
  await assertNoErrorState(page);
}

test.describe("Provider UX Redesign - Story 12.7-10", () => {
  test.describe("AC12.7.10.1: Request Detail Page Redesign", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("Request detail page shows hero cards section", async ({ page }) => {
      await loginAsSupplier(page);

      // Provider should already be on /provider/requests after login
      await page.waitForLoadState("networkidle");

      // Check if there are requests
      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        // Click on first "Ver Detalles" button
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        // AC12.7.10.1 - Hero cards should be visible
        await expect(page.getByTestId("hero-cards")).toBeVisible();
        await expect(page.getByTestId("amount-card")).toBeVisible();
        await expect(page.getByTestId("location-card")).toBeVisible();

        // Details row should be visible
        await expect(page.getByTestId("details-row")).toBeVisible();
        await expect(page.getByTestId("payment-badge")).toBeVisible();
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });

    test("Request detail page shows prominent earnings section", async ({ page }) => {
      await loginAsSupplier(page);

      // Navigate directly to requests
      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        // Check for offer form with prominent earnings
        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // AC12.7.10.1 - Earnings section should be visible and prominent
          await expect(page.getByTestId("earnings-section")).toBeVisible();
          await expect(page.getByTestId("earnings-amount")).toBeVisible();

          // Earnings amount should contain currency format
          const earningsText = await page.getByTestId("earnings-amount").textContent();
          expect(earningsText).toMatch(/\$/);
        }
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });

    test("Request detail page shows simplified date selection buttons", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // AC12.7.10.1 - Quick date buttons should be visible
          await expect(page.getByTestId("date-quick-buttons")).toBeVisible();
          await expect(page.getByTestId("date-today")).toBeVisible();
          await expect(page.getByTestId("date-tomorrow")).toBeVisible();
          await expect(page.getByTestId("date-other")).toBeVisible();

          // Hour select should be visible
          await expect(page.getByTestId("hour-select")).toBeVisible();
        }
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });

    test("Date quick buttons switch selection correctly", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // Click "Mañana" button
          await page.getByTestId("date-tomorrow").click();
          // Tomorrow button should now be selected (have orange background)
          await expect(page.getByTestId("date-tomorrow")).toHaveClass(/bg-orange-500/);

          // Click "Otro" button
          await page.getByTestId("date-other").click();
          // Other button should be selected
          await expect(page.getByTestId("date-other")).toHaveClass(/bg-orange-500/);
          // Date picker should appear
          await expect(page.getByTestId("date-other-input")).toBeVisible();
        }
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });

    test("Submit button is visible and centered", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // AC12.7.10.1 - Submit button should be visible with clear text
          const submitButton = page.getByTestId("submit-offer-button");
          await expect(submitButton).toBeVisible();
          const buttonText = await submitButton.textContent();
          expect(buttonText).toContain("ENVIAR OFERTA");
        }
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });
  });

  test.describe("AC12.7.10.2: Delivery Details Page Redesign", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("Delivery detail page shows address section with quick actions", async ({ page }) => {
      await loginAsSupplier(page);

      // Navigate to offers page to find accepted deliveries
      await page.goto("/provider/offers");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      // Look for accepted/active delivery
      const deliveryCard = page.locator('[data-testid="offer-card"]').filter({
        hasText: /Aceptado|Entrega/i,
      }).first();

      const hasDelivery = await deliveryCard.isVisible().catch(() => false);

      if (hasDelivery) {
        // Click to view delivery details
        const viewButton = deliveryCard.getByRole("link", { name: /Ver Detalles/i });
        if (await viewButton.isVisible().catch(() => false)) {
          await viewButton.click();
          await page.waitForURL(/\/provider\/deliveries\/[a-z0-9-]+/, { timeout: 10000 });
          await assertNoErrorState(page);

          // AC12.7.10.2 - Address section should be visible
          await expect(page.getByTestId("address-section")).toBeVisible();
          await expect(page.getByTestId("delivery-address")).toBeVisible();

          // Quick action buttons should be visible
          await expect(page.getByTestId("quick-actions")).toBeVisible();
          await expect(page.getByTestId("call-button")).toBeVisible();
          await expect(page.getByTestId("navigate-button")).toBeVisible();
        }
      } else {
        test.skip(true, "No active deliveries available for testing");
      }
    });

    test("Delivery detail page shows time remaining countdown", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const deliveryCard = page.locator('[data-testid="offer-card"]').filter({
        hasText: /Aceptado|Entrega/i,
      }).first();

      const hasDelivery = await deliveryCard.isVisible().catch(() => false);

      if (hasDelivery) {
        const viewButton = deliveryCard.getByRole("link", { name: /Ver Detalles/i });
        if (await viewButton.isVisible().catch(() => false)) {
          await viewButton.click();
          await page.waitForURL(/\/provider\/deliveries\/[a-z0-9-]+/, { timeout: 10000 });
          await assertNoErrorState(page);

          // AC12.7.10.2 - Time remaining should be visible
          await expect(page.getByTestId("time-remaining")).toBeVisible();
          await expect(page.getByTestId("countdown")).toBeVisible();
        }
      } else {
        test.skip(true, "No active deliveries available for testing");
      }
    });

    test("Delivery detail page has always-visible complete button", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const deliveryCard = page.locator('[data-testid="offer-card"]').filter({
        hasText: /Aceptado|Entrega/i,
      }).first();

      const hasDelivery = await deliveryCard.isVisible().catch(() => false);

      if (hasDelivery) {
        const viewButton = deliveryCard.getByRole("link", { name: /Ver Detalles/i });
        if (await viewButton.isVisible().catch(() => false)) {
          await viewButton.click();
          await page.waitForURL(/\/provider\/deliveries\/[a-z0-9-]+/, { timeout: 10000 });
          await assertNoErrorState(page);

          // AC12.7.10.2 - Complete button or status should be visible
          const completeButton = page.getByTestId("complete-delivery-button");
          const completedMessage = page.getByText("Esta entrega ya fue completada");

          // One of these should be visible (either can complete or already completed)
          const canComplete = await completeButton.isVisible().catch(() => false);
          const isCompleted = await completedMessage.isVisible().catch(() => false);
          expect(canComplete || isCompleted).toBe(true);
        }
      } else {
        test.skip(true, "No active deliveries available for testing");
      }
    });

    test("Delivery detail page shows order details compactly", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const deliveryCard = page.locator('[data-testid="offer-card"]').filter({
        hasText: /Aceptado|Entrega/i,
      }).first();

      const hasDelivery = await deliveryCard.isVisible().catch(() => false);

      if (hasDelivery) {
        const viewButton = deliveryCard.getByRole("link", { name: /Ver Detalles/i });
        if (await viewButton.isVisible().catch(() => false)) {
          await viewButton.click();
          await page.waitForURL(/\/provider\/deliveries\/[a-z0-9-]+/, { timeout: 10000 });
          await assertNoErrorState(page);

          // AC12.7.10.2 - Order details should be visible
          await expect(page.getByTestId("order-details")).toBeVisible();
          await expect(page.getByTestId("customer-name")).toBeVisible();
          await expect(page.getByTestId("delivery-amount")).toBeVisible();
        }
      } else {
        test.skip(true, "No active deliveries available for testing");
      }
    });
  });

  test.describe("AC12.7.10.3: Mobile-First Layout", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("Request detail page has no horizontal scroll on 360px viewport", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        // Check for horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = 360;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });

    test("Buttons have large tap targets (minimum 44px height)", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await assertNoErrorState(page);
      await page.waitForLoadState("networkidle");

      const requestList = page.getByTestId("request-list");
      const hasRequests = await requestList.isVisible().catch(() => false);

      if (hasRequests) {
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await assertNoErrorState(page);

        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // Check submit button height (should be h-14 = 56px)
          const submitButton = page.getByTestId("submit-offer-button");
          const buttonBox = await submitButton.boundingBox();
          expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

          // Check date buttons height (should be h-11 = 44px)
          const todayButton = page.getByTestId("date-today");
          const dateButtonBox = await todayButton.boundingBox();
          expect(dateButtonBox?.height).toBeGreaterThanOrEqual(44);
        }
      } else {
        test.skip(true, "No pending requests available for testing");
      }
    });
  });
});
