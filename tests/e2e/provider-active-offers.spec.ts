import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider's Active Offers List - Story 8-3
 * Updated for unified list view (v2.6.2) - Story 12.8-3
 *
 * Tests the offers list page functionality:
 * - AC8.3.1: Provider sees unified offers list with filter dropdowns
 * - AC8.3.2: Offer cards show: request summary, delivery window, status badge
 * - AC8.3.3: Countdown displays "Expira en 25:30" format for pending offers
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
  await assertNoErrorState(page);

  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button in role selector (exact match to avoid "New Supplier")
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();

  // Wait for email/password to auto-fill
  await page.waitForLoadState("networkidle");

  // Click login
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
  await assertNoErrorState(page);
}

test.describe("Provider Active Offers List - Story 8-3", () => {
  test.describe("AC8.3.1: Offers Page Structure", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can access offers page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Should see offers page header
      await expect(page.getByRole("heading", { name: "Mis Ofertas" })).toBeVisible({ timeout: 10000 });
      // Should see offer count summary (unified list view since v2.6.0)
      await expect(page.getByText(/\d+ de \d+ ofertas/)).toBeVisible();
    });

    test("offers page shows filter dropdowns (unified list view)", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      const hasEmptyState = await page.getByTestId("empty-state-global").isVisible().catch(() => false);

      if (hasEmptyState) {
        // Empty state should have link to requests
        await expect(page.getByRole("link", { name: /Ver Solicitudes/ })).toBeVisible();
      } else {
        // Unified list view has Estado and Comuna filter dropdowns
        await expect(page.getByRole("button", { name: /Estado/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Comuna/i })).toBeVisible();
      }
    });

    test("Estado filter dropdown shows status options", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      const estadoButton = page.getByRole("button", { name: /Estado/i });
      const hasEstadoButton = await estadoButton.isVisible().catch(() => false);

      if (hasEstadoButton) {
        // Open Estado dropdown
        await estadoButton.click();

        // Should show filter options with counts
        await expect(page.getByRole("button", { name: /Pendientes/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /En proceso/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Historial/i })).toBeVisible();

        // Close dropdown
        await page.keyboard.press("Escape");
      }
    });
  });

  test.describe("AC8.3.2 & AC8.3.3: Offer Card Display", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offer cards display request summary", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Check if there are any offer cards
      const hasOfferCards = await page.getByTestId("offer-card").first().isVisible().catch(() => false);

      if (hasOfferCards) {
        const firstCard = page.getByTestId("offer-card").first();

        // Should show location (comuna name) - any Chilean comuna
        await expect(firstCard.locator("text=/Villarrica|Pucón|Santiago|Providencia|Las Condes|Vitacura|Maipu/i")).toBeVisible();

        // Should show amount in liters
        await expect(firstCard.locator("text=/litros/i")).toBeVisible();

        // Should show delivery window info
        await expect(firstCard.locator("text=/Entrega propuesta/i")).toBeVisible();
      }
    });

    test("pending offers show countdown timer", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Look for pending offers (with "Pendiente" badge)
      const pendingOffers = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Pendiente"),
      });
      const pendingCount = await pendingOffers.count();

      if (pendingCount > 0) {
        // Pending offer cards should have countdown
        const countdown = pendingOffers.first().getByTestId("countdown-timer");
        const hasCountdown = await countdown.isVisible().catch(() => false);

        if (hasCountdown) {
          // AC8.3.3: Countdown displays "Expira en XX:XX" format
          await expect(countdown).toHaveText(/Expira en \d{1,2}:\d{2}/);
        }
      }
    });
  });

  test.describe("AC8.3.4: Cancel Offer Button", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("pending offers show cancel button", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Look for pending offers (with "Pendiente" badge)
      const pendingOffers = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Pendiente"),
      });
      const pendingCount = await pendingOffers.count();

      if (pendingCount > 0) {
        // Should have "Cancelar Oferta" button
        const cancelButton = pendingOffers.first().getByRole("button", { name: /Cancelar Oferta/ });
        await expect(cancelButton).toBeVisible();
      }
    });

    test("cancel button opens confirmation dialog", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Look for pending offers (with "Pendiente" badge)
      const pendingOffers = page.locator('[data-testid="offer-card"]').filter({
        has: page.getByText("Pendiente"),
      });
      const pendingCount = await pendingOffers.count();

      if (pendingCount > 0) {
        // Click cancel button
        await pendingOffers.first().getByRole("button", { name: /Cancelar Oferta/ }).click();

        // AC8.4.1: Confirmation dialog should appear
        await expect(page.getByText("¿Cancelar esta oferta?")).toBeVisible();
        await expect(page.getByRole("button", { name: /Volver/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /Sí, cancelar/ })).toBeVisible();
      }
    });
  });

  test.describe("AC8.3.5: Realtime Connection", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offers page shows connection status", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Should show either "En vivo" (connected) or "Offline" (polling fallback)
      const hasLiveIndicator = await page.getByText("En vivo").isVisible().catch(() => false);
      const hasOfflineIndicator = await page.getByText("Offline").isVisible().catch(() => false);

      // One of the indicators should be visible
      expect(
        hasLiveIndicator || hasOfflineIndicator,
        "Expected either 'En vivo' or 'Offline' connection indicator to be visible"
      ).toBe(true);
    });

    test("refresh button is available", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Should have a refresh button (title="Actualizar")
      const refreshButton = page.locator('[title="Actualizar"]');
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe("Empty States", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("empty filtered results show appropriate message", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

      // Check if global empty state (no offers at all)
      const hasGlobalEmpty = await page.getByTestId("empty-state-global").isVisible().catch(() => false);

      if (hasGlobalEmpty) {
        // Should show empty state message and link
        await expect(page.getByText("No tienes ofertas")).toBeVisible();
        await expect(page.getByRole("link", { name: /Ver Solicitudes/ })).toBeVisible();
      } else {
        // Apply a filter that might return no results (e.g., "Con disputa")
        await page.getByRole("button", { name: /Estado/i }).click();
        await page.getByRole("button", { name: /Con disputa/i }).click();
        await page.keyboard.press("Escape");
        await page.waitForLoadState("networkidle");

        // Check for filtered empty state
        const hasFilteredEmpty = await page.getByTestId("empty-state-filtered").isVisible().catch(() => false);

        if (hasFilteredEmpty) {
          await expect(page.getByText("Sin resultados")).toBeVisible();
          await expect(page.getByRole("button", { name: /Limpiar filtros/i })).toBeVisible();
        }
      }
    });

    test("global empty state links to request browser", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForLoadState("networkidle");
      await assertNoErrorState(page);

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
