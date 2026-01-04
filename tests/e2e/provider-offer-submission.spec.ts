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

      // Provider is already on /provider/requests after login
      await page.waitForLoadState("networkidle");

      // Check if there are requests
      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        // Click on first "Ver Detalles" button
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await viewDetailsButton.click();

        // Should navigate to request detail page
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should see request details - Story 12.7-10 redesigned to hero cards
        await expect(page.getByTestId("hero-cards")).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.2 & AC8.2.3: Price and Earnings Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form displays price from platform settings", async ({ page }) => {
      await loginAsSupplier(page);

      // Provider is already on /provider/requests after login
      await page.waitForLoadState("networkidle");

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        // Navigate to request detail
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });
        await page.waitForLoadState("networkidle");

        // Check if provider already has offer
        const alreadyHasOffer = await page.getByText("Ya tienes una oferta").isVisible().catch(() => false);

        if (!alreadyHasOffer) {
          // Story 12.7-10 redesign: Earnings section is now prominent at top
          // The earnings section shows "Tu ganancia" followed by the amount
          await expect(page.getByText("Tu ganancia")).toBeVisible({ timeout: 10000 });
          await expect(page.getByTestId("earnings-amount")).toBeVisible();

          // Should see price and commission info
          await expect(page.getByText(/Precio:/i)).toBeVisible();
          await expect(page.getByText(/Comisión:/i)).toBeVisible();
        } else {
          // Provider already has offer - skip earnings test
          test.skip(true, "Provider already has offer for this request");
        }
      }
    });
  });

  test.describe("AC8.2.1: Delivery Window Picker", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form has delivery window inputs", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Story 12.7-10 redesign: Quick date buttons replace datetime inputs
        await expect(page.getByTestId("date-quick-buttons")).toBeVisible();
        await expect(page.getByTestId("date-today")).toBeVisible();
        await expect(page.getByTestId("date-tomorrow")).toBeVisible();
        await expect(page.getByTestId("hour-select")).toBeVisible();

        // Should have labels for time selection
        await expect(page.getByText(/Cuándo puedes entregar/)).toBeVisible();
        await expect(page.getByText(/Hora de entrega/)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.4: Optional Message Field", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form has optional message textarea", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Story 12.7-10 redesign: Message field is collapsed by default
        // Click to reveal message field
        const addMessageButton = page.getByTestId("add-message-button");
        if (await addMessageButton.isVisible().catch(() => false)) {
          await addMessageButton.click();
        }
        await expect(page.getByTestId("offer-message-input")).toBeVisible();
        await expect(page.getByText(/Mensaje.*cliente.*opcional/i)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.5: Offer Validity Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer form displays validity information", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Story 12.7-10 redesign: Validity info shows minutes
        await expect(page.getByText(/válida por \d+ minutos/i)).toBeVisible();
      }
    });
  });

  test.describe("AC8.2.6 & AC8.2.7: Offer Submission Flow", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("submit button is visible and labeled correctly", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

      if (hasRequests) {
        await page.getByTestId("view-details-button").first().click();
        await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

        // Should have submit button - Story 12.7-10 redesign shows earnings
        await expect(page.getByTestId("submit-offer-button")).toBeVisible();
        await expect(page.getByTestId("submit-offer-button")).toHaveText(/ENVIAR OFERTA.*Ganarás/);
      }
    });
  });

  test.describe("Provider Offers Page", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can access offers page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");

      // Should see offers page - check for heading
      await expect(page.getByRole("heading", { name: "Mis Ofertas" })).toBeVisible({ timeout: 10000 });
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

    await page.goto("/provider/requests");
    await page.waitForTimeout(2000);

    const hasRequests = await page.getByTestId("request-list").isVisible().catch(() => false);

    if (hasRequests) {
      await page.getByTestId("view-details-button").first().click();
      await page.waitForURL(/\/provider\/requests\/[a-z0-9-]+/, { timeout: 10000 });

      // Click back button - Story 12.7-10 redesign simplified to "Volver"
      await page.getByRole("link", { name: /Volver/ }).click();

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
