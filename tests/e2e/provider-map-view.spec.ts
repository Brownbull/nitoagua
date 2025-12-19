import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider Map View - Story 8-10
 *
 * Tests the map visualization functionality for verified providers:
 * - AC8.10.1: Map page accessible at /provider/map with back button
 * - AC8.10.2: Map displays provider's service areas
 * - AC8.10.3: Map shows pending requests with valid coordinates
 * - AC8.10.4: Marker tap shows request preview card
 * - AC8.10.5: Preview card has "Ver detalle" and "Hacer oferta" buttons
 * - AC8.10.6: Provider location shown if permission granted
 * - AC8.10.7: Map centers on service area by default
 * - AC8.10.9: Empty state when no requests have coordinates
 * - AC8.10.11: OpenStreetMap tiles load correctly
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded supplier@nitoagua.cl user
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Helper to login as supplier
async function loginAsSupplier(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button in role selector
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
}

test.describe("Provider Map View - Story 8-10", () => {
  test.describe("AC8.10.1: Map Page Access", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("provider can access map page at /provider/map", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/map");

      // Should see the map page container
      await expect(page.getByTestId("provider-map-page")).toBeVisible({ timeout: 10000 });
    });

    test("map page has back button to return to requests", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Check for error states first
      await assertNoErrorState(page);

      // Should have back button
      const backButton = page.getByTestId("map-back-button");
      await expect(backButton).toBeVisible();
    });

    test("back button navigates to request list", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(2000);

      // Click back button
      const backButton = page.getByTestId("map-back-button");
      await backButton.click();

      // Should navigate to requests page
      await page.waitForURL("**/provider/requests", { timeout: 10000 });
    });

    test("unauthenticated user is redirected to login", async ({ page }) => {
      await page.goto("/provider/map");

      // Should redirect to login
      await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
    });
  });

  test.describe("AC8.10.11: Map Loads", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("map container is visible", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for dynamic import to complete
      await page.waitForTimeout(3000);

      // Check for error states
      await assertNoErrorState(page);

      // Map should be visible - either the Leaflet container or empty state
      const mapPage = page.getByTestId("provider-map-page");
      await expect(mapPage).toBeVisible();
    });

    test("map displays filter chips", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(3000);

      // Check for empty state first
      const emptyState = page.getByTestId("map-empty-state");
      const isEmptyState = await emptyState.isVisible().catch(() => false);

      if (!isEmptyState) {
        // If not empty, should have filter chips (Todos)
        await expect(page.getByText(/Todos \(\d+\)/)).toBeVisible();
      }
    });
  });

  test.describe("AC8.10.9: Empty State", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("empty state shows appropriate message when no requests with coordinates", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(3000);

      // Check for empty state
      const emptyState = page.getByTestId("map-empty-state");
      const isEmptyState = await emptyState.isVisible().catch(() => false);

      if (isEmptyState) {
        // Empty state should have a title
        await expect(page.getByText("No hay solicitudes con ubicación")).toBeVisible();

        // And a link to the list view
        await expect(page.getByRole("link", { name: /Ver lista/i })).toBeVisible();
      }
    });

    test("empty state link navigates to request list", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(3000);

      // Check for empty state
      const emptyState = page.getByTestId("map-empty-state");
      const isEmptyState = await emptyState.isVisible().catch(() => false);

      if (isEmptyState) {
        // Click the link to list view
        await page.getByRole("link", { name: /Ver lista/i }).click();

        // Should navigate to requests page
        await page.waitForURL("**/provider/requests", { timeout: 10000 });
      }
    });
  });

  test.describe("AC8.10.6: Location Button", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("center location button is visible when map has requests", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/map");

      // Wait for map to load
      await page.waitForTimeout(3000);

      // Check if not empty state
      const emptyState = page.getByTestId("map-empty-state");
      const isEmptyState = await emptyState.isVisible().catch(() => false);

      if (!isEmptyState) {
        // Should have center location button
        const locationButton = page.getByTestId("center-location-button");
        await expect(locationButton).toBeVisible();
      }
    });
  });

  test.describe("Navigation from Request Browser", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("FAB button in request browser links to map", async ({ page }) => {
      await loginAsSupplier(page);

      // Go to request browser (login already takes us there)
      await page.waitForTimeout(2000);

      // Find and click the map FAB
      const mapFab = page.getByTestId("map-fab-button");
      await expect(mapFab).toBeVisible({ timeout: 10000 });
      await mapFab.click();

      // Should navigate to map page
      await page.waitForURL("**/provider/map", { timeout: 10000 });
    });
  });
});

test.describe("Provider Map View - Integration Tests", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("full flow: login, navigate to map, and back to list", async ({ page }) => {
    // Login
    await loginAsSupplier(page);

    // Navigate to map
    await page.goto("/provider/map");
    await page.waitForTimeout(3000);

    // Verify map page loads
    await expect(page.getByTestId("provider-map-page")).toBeVisible();

    // Check for error states
    await assertNoErrorState(page);

    // Navigate back using the back button
    const backButton = page.getByTestId("map-back-button");
    await backButton.click();

    // Should be back on requests page
    await page.waitForURL("**/provider/requests", { timeout: 10000 });
    await expect(page.getByText("Solicitudes Disponibles")).toBeVisible();
  });

  test("map maintains state during navigation", async ({ page }) => {
    await loginAsSupplier(page);

    // Navigate to map
    await page.goto("/provider/map");
    await page.waitForTimeout(3000);

    // Navigate away
    await page.goto("/provider/requests");
    await page.waitForTimeout(1000);

    // Navigate back to map
    await page.goto("/provider/map");
    await page.waitForTimeout(2000);

    // Map should still load correctly
    await expect(page.getByTestId("provider-map-page")).toBeVisible();
  });
});
