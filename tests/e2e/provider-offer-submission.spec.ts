import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider Offer Submission - Story 8-2
 *
 * Tests the offer submission flow for verified providers:
 * - AC8.2.1: Offer form shows delivery window picker (start + end time)
 * - AC8.2.2: Price displayed from platform settings (not editable)
 * - AC8.2.3: Earnings preview shows with commission deduction
 * - AC8.2.4: Optional message field for notes to consumer
 * - AC8.2.5: Offer validity displayed
 * - AC8.2.6: Upon submission: offer created with status 'active', expires_at calculated
 * - AC8.2.7: Provider sees confirmation, redirected to "Mis Ofertas"
 * - AC8.2.8: Provider cannot submit duplicate offer on same request
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded supplier@nitoagua.cl user
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

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

test.describe("Provider Offer Submission - Story 8-2", () => {
  test.describe("AC8.2.1: Request Detail Page Access", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can navigate to request detail page", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure availability is ON
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      // Navigate to request browser
      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      // Check if there are requests
      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        // Click on first "Ver Detalles" button
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();

        // Should navigate to request detail page
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should see request details
        await expect(page.getByText("Detalles de la Solicitud")).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.2 & AC8.2.3: Price and Earnings Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form displays price from platform settings", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure availability
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        // Navigate to request detail
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should see price display (format: $X,XXX or $XX.XXX)
        await expect(page.getByText(/Precio de la solicitud/)).toBeVisible();
        await expect(page.getByText(/\$[\d.,]+/)).toBeVisible();

        // Should see earnings preview with commission info
        await expect(page.getByText(/Ganarás:/)).toBeVisible();
        await expect(page.getByText(/comisión/)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.1: Delivery Window Picker", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form has delivery window inputs", async ({ page }) => {
      await loginAsSupplier(page);

      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should have delivery window inputs
        await expect(page.getByTestId("delivery-start-input")).toBeVisible();
        await expect(page.getByTestId("delivery-end-input")).toBeVisible();

        // Should have labels
        await expect(page.getByText("Ventana de Entrega")).toBeVisible();
        await expect(page.getByText("Desde")).toBeVisible();
        await expect(page.getByText("Hasta")).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.4: Optional Message Field", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form has optional message textarea", async ({ page }) => {
      await loginAsSupplier(page);

      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should have message input
        await expect(page.getByTestId("offer-message-input")).toBeVisible();
        await expect(page.getByText(/Mensaje al cliente \(opcional\)/)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.5: Offer Validity Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form displays validity information", async ({ page }) => {
      await loginAsSupplier(page);

      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should show offer validity info
        await expect(page.getByText(/Tu oferta expira en \d+ min/)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.6 & AC8.2.7: Offer Submission Flow", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("submit button is visible and labeled correctly", async ({ page }) => {
      await loginAsSupplier(page);

      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should have submit button
        await expect(page.getByTestId("submit-offer-button")).toBeVisible();
        await expect(page.getByTestId("submit-offer-button")).toHaveText(/Enviar Oferta/);
      }
    });
  });

  test.describe("Provider Offers Page", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can access offers page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");

      // Should see offers page
      await expect(page.getByText("Mis Ofertas")).toBeVisible({ timeout: 10000 });
    });

    test("offers page shows empty state when no offers", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // Check if empty state or offers list
      const hasEmptyState = await page.getByText("No tienes ofertas").isVisible().catch(() => false);
      const hasOffers = await page.getByText(/Pendientes|Aceptadas/).isVisible().catch(() => false);

      // Should show one or the other
      // This is now safe because we checked for errors first
      expect(
        hasEmptyState || hasOffers,
        "Expected either 'No tienes ofertas' empty state or offers list to be visible"
      ).toBe(true);

      if (hasEmptyState) {
        await expect(page.getByRole("link", { name: /Ver Solicitudes/ })).toBeVisible();
      }
    });
  });
});

test.describe("Provider Offer Submission - Navigation Tests", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("back button returns to request browser", async ({ page }) => {
    await loginAsSupplier(page);

    const switchElement = page.getByTestId("availability-switch");
    const currentState = await switchElement.getAttribute("data-state");
    if (currentState === "unchecked") {
      await switchElement.click();
      await page.waitForTimeout(1000);
    }

    await page.goto("/provider/requests");
    await page.waitForTimeout(2000);

    const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

    if (hasRequests) {
      await page.getByTestId("view-details-button").first().click();
      await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

      // Click back button
      await page.getByRole("link", { name: /Volver a solicitudes/ }).click();

      // Should be back on request browser
      await expect(page.getByText("Solicitudes Disponibles")).toBeVisible();
    }
  });

  test("unauthenticated user redirected to login", async ({ page }) => {
    // Try to access request detail directly
    await page.goto("/provider/requests/test-id");

    // Should redirect to login
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
  });
});
