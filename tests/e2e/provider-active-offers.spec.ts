import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider's Active Offers List - Story 8-3
 *
 * Tests the offers list page functionality:
 * - AC8.3.1: Provider sees offers grouped: Pendientes, Aceptadas, Expiradas/Rechazadas
 * - AC8.3.2: Pending offers show: request summary, delivery window, time remaining countdown
 * - AC8.3.3: Countdown displays "Expira en 25:30" format
 * - AC8.3.4: "Cancelar Oferta" button available on pending offers
 * - AC8.3.5: Offers update in real-time (acceptance, expiration)
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

test.describe("Provider Active Offers List - Story 8-3", () => {
  test.describe("AC8.3.1: Offers Page Structure", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can access offers page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");

      // Should see offers page header
      await expect(page.getByRole("heading", { name: "Mis Ofertas" })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("Gestiona tus ofertas enviadas")).toBeVisible();
    });

    test("offers page shows grouped sections", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Check for section headers (they should exist even if empty)
      const hasPendingSection = await page.getByTestId("section-pending").isVisible().catch(() => false);
      const hasAcceptedSection = await page.getByTestId("section-accepted").isVisible().catch(() => false);
      const hasHistorySection = await page.getByTestId("section-history").isVisible().catch(() => false);
      const hasEmptyState = await page.getByTestId("empty-state-global").isVisible().catch(() => false);

      // Should have either sections or global empty state
      if (hasEmptyState) {
        // Empty state should have link to requests
        await expect(page.getByRole("link", { name: /Ver Solicitudes/ })).toBeVisible();
      } else {
        // All three sections should be visible
        expect(hasPendingSection).toBe(true);
        expect(hasAcceptedSection).toBe(true);
        expect(hasHistorySection).toBe(true);
      }
    });

    test("pending section shows badge count", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const pendingSection = page.getByTestId("section-pending");
      const hasPending = await pendingSection.isVisible().catch(() => false);

      if (hasPending) {
        // Section should show "Pendientes" label
        await expect(pendingSection.getByText("Pendientes")).toBeVisible();
      }
    });
  });

  test.describe("AC8.3.2 & AC8.3.3: Offer Card Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer cards display request summary", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Check if there are any offer cards
      const hasOfferCards = await page.getByTestId("offer-card").first().isVisible().catch(() => false);

      if (hasOfferCards) {
        const firstCard = page.getByTestId("offer-card").first();

        // Should show location (comuna name)
        await expect(firstCard.locator("text=/Ubicación|Santiago|Providencia|Las Condes|Vitacura|Maipu/i")).toBeVisible();

        // Should show amount in liters
        await expect(firstCard.locator("text=/litros/i")).toBeVisible();

        // Should show delivery window info
        await expect(firstCard.locator("text=/Entrega propuesta/i")).toBeVisible();
      }
    });

    test("pending offers show countdown timer", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Look for pending offers specifically
      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (hasPendingSection) {
        const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);

        if (hasOffers) {
          // Pending offer cards should have countdown
          const countdown = pendingSection.getByTestId("countdown-timer").first();
          const hasCountdown = await countdown.isVisible().catch(() => false);

          if (hasCountdown) {
            // AC8.3.3: Countdown displays "Expira en XX:XX" format
            await expect(countdown).toHaveText(/Expira en \d{1,2}:\d{2}/);
          }
        }
      }
    });
  });

  test.describe("AC8.3.4: Cancel Offer Button", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("pending offers show cancel button", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (hasPendingSection) {
        const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);

        if (hasOffers) {
          // Should have "Cancelar Oferta" button
          const cancelButton = pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first();
          await expect(cancelButton).toBeVisible();
        }
      }
    });

    test("cancel button opens confirmation dialog", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (hasPendingSection) {
        const hasOffers = await pendingSection.getByTestId("offer-card").first().isVisible().catch(() => false);

        if (hasOffers) {
          // Click cancel button
          await pendingSection.getByRole("button", { name: /Cancelar Oferta/ }).first().click();

          // AC8.4.1: Confirmation dialog should appear
          await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible();
          await expect(page.getByRole("button", { name: /Volver/ })).toBeVisible();
          await expect(page.getByRole("button", { name: /Sí, cancelar/ })).toBeVisible();
        }
      }
    });
  });

  test.describe("AC8.3.5: Realtime Connection", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offers page shows connection status", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(3000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // Should show either "En vivo" (connected) or "Offline" (polling fallback)
      const hasLiveIndicator = await page.getByText("En vivo").isVisible().catch(() => false);
      const hasOfflineIndicator = await page.getByText("Offline").isVisible().catch(() => false);

      // One of the indicators should be visible
      // This is now safe because we checked for errors first
      expect(
        hasLiveIndicator || hasOfflineIndicator,
        "Expected either 'En vivo' or 'Offline' connection indicator to be visible"
      ).toBe(true);
    });

    test("refresh button is available", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Should have a refresh button
      await expect(page.getByRole("button", { name: /Actualizar/ })).toBeVisible();
    });
  });

  test.describe("Empty States", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("empty pending section shows appropriate message", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const pendingSection = page.getByTestId("section-pending");
      const hasPendingSection = await pendingSection.isVisible().catch(() => false);

      if (hasPendingSection) {
        const hasEmptyPending = await page.getByTestId("empty-state-pending").isVisible().catch(() => false);

        if (hasEmptyPending) {
          // Should show empty state message and link
          await expect(page.getByText("No tienes ofertas pendientes")).toBeVisible();
          await expect(page.getByRole("link", { name: /Ver solicitudes disponibles/ })).toBeVisible();
        }
      }
    });

    test("empty accepted section shows appropriate message", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const acceptedSection = page.getByTestId("section-accepted");
      const hasAcceptedSection = await acceptedSection.isVisible().catch(() => false);

      if (hasAcceptedSection) {
        const hasEmptyAccepted = await page.getByTestId("empty-state-accepted").isVisible().catch(() => false);

        if (hasEmptyAccepted) {
          await expect(page.getByText("Aún no tienes entregas activas")).toBeVisible();
        }
      }
    });

    test("global empty state links to request browser", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      const hasEmptyState = await page.getByTestId("empty-state-global").isVisible().catch(() => false);

      if (hasEmptyState) {
        // Click "Ver Solicitudes" link
        await page.getByRole("link", { name: /Ver Solicitudes/ }).click();

        // Should navigate to request browser
        await expect(page).toHaveURL(/\/provider\/requests/);
      }
    });
  });
});

test.describe("Provider Active Offers - Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("unauthenticated user redirected to login", async ({ page }) => {
    await page.goto("/provider/offers");

    // Should redirect to login
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
  });
});
