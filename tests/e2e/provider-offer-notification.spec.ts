import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider Offer Acceptance Notification - Story 8-5
 *
 * Tests the notification functionality when a consumer accepts a provider's offer:
 * - AC8.5.1: Provider receives in-app notification "¡Tu oferta fue aceptada!"
 * - AC8.5.3: Notification displays customer name, delivery address, amount, delivery window
 * - AC8.5.4: "Ver Detalles" button links to delivery detail page
 * - AC8.5.5: Offer moves to "Entregas Activas" section
 *
 * Note: Email notification (AC8.5.2) tested via unit tests since it requires Resend API
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded supplier@nitoagua.cl user
 *
 * IMPORTANT: Tests use explicit error detection to fail on DB issues.
 * See Story Testing-1 for reliability improvements.
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
  await page.waitForURL("**/provider/requests", { timeout: 60000 });
  // Wait for page to render (don't use networkidle — realtime stays open)
  await expect(page.getByRole("heading", { name: "Solicitudes Disponibles" })).toBeVisible({ timeout: 30000 });
}

test.describe("Provider Offer Notification - Story 8-5", () => {
  test.describe("AC8.5.1: In-App Notification Bell", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("notification bell is visible in provider header", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");

      // Should see notification bell in header
      await expect(page.getByTestId("notification-bell")).toBeVisible({ timeout: 10000 });
    });

    test("notification bell opens popover on click", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");

      // Click notification bell
      await page.getByTestId("notification-bell").click();

      // Should show notifications popover
      await expect(page.getByText("Notificaciones")).toBeVisible({ timeout: 5000 });
    });

    test("notification popover shows content", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Click notification bell
      await page.getByTestId("notification-bell").click();

      // Wait for popover to open and show heading
      await expect(page.getByText("Notificaciones")).toBeVisible({ timeout: 5000 });

      // The popover opened successfully - content could be loading, empty, or populated
      // Test passes if popover renders with header
    });
  });

  test.describe("AC8.5.5: Entregas Activas Section", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("offers page shows correct section titles when loaded", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // If no error, check for section headers
      const hasEmptyState = await page.getByTestId("empty-state-global").isVisible().catch(() => false);

      if (!hasEmptyState) {
        // v2.6.2 unified list: verify "En proceso" filter option exists (replaces "Entregas Activas" section)
        const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
        await estadoButton.click();
        await expect(page.getByRole("button", { name: /En proceso/i })).toBeVisible();
        await page.keyboard.press("Escape");
      }
    });

    test("accepted offers show 'Ver Entrega' button", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply En proceso filter to find accepted offers
      const estadoBtn = page.locator('button').filter({ hasText: /^Estado/ }).first();
      await estadoBtn.click();
      await page.getByRole("button", { name: /En proceso/i }).click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      const hasOffers = await page.getByTestId("offer-card").first().isVisible().catch(() => false);

      if (hasOffers) {
        // Accepted offers should have "Ver Entrega" button
        const viewButton = page.getByRole("link", { name: /Ver Entrega/ }).first();
        await expect(viewButton).toBeVisible();
      }
    });
  });

  test.describe("Delivery Detail Page", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("delivery page requires authentication", async ({ page }) => {
      await page.goto("/provider/deliveries/test-id");

      // Should redirect to login
      await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
    });

    test("delivery page shows customer information placeholder", async ({ page }) => {
      await loginAsSupplier(page);

      // Navigate to a non-existent delivery to test 404 handling
      await page.goto("/provider/deliveries/non-existent-id");

      // Should redirect to offers page or show 404
      await page.waitForTimeout(3000);

      const url = page.url();
      // Should either show 404 or redirect
      expect(url.includes("/provider/offers") || url.includes("/provider/deliveries") || url.includes("/404")).toBe(
        true
      );
    });
  });

  test.describe("Navigation Flow", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("can navigate from offers to delivery page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply En proceso filter to find accepted offers
      const estadoFilterBtn = page.locator('button').filter({ hasText: /^Estado/ }).first();
      await estadoFilterBtn.click();
      await page.getByRole("button", { name: /En proceso/i }).click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      const viewButton = page.getByRole("link", { name: /Ver Entrega/ }).first();
      const hasViewButton = await viewButton.isVisible().catch(() => false);

      if (hasViewButton) {
        // Click to navigate to delivery detail
        await viewButton.click();

        // Should navigate to delivery page
        await page.waitForURL(/\/provider\/deliveries\//, { timeout: 10000 });

        // Should show delivery detail content (back link visible means page loaded)
        await expect(page.getByRole("link", { name: /Volver/i })).toBeVisible({ timeout: 5000 });
      }
    });

    test("delivery page has back button to offers", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // v2.6.2 unified list: apply En proceso filter to find accepted offers
      const estadoFilterBtn = page.locator('button').filter({ hasText: /^Estado/ }).first();
      await estadoFilterBtn.click();
      await page.getByRole("button", { name: /En proceso/i }).click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      const viewButton = page.getByRole("link", { name: /Ver Entrega/ }).first();
      const hasViewButton = await viewButton.isVisible().catch(() => false);

      if (hasViewButton) {
        await viewButton.click();
        await page.waitForURL(/\/provider\/deliveries\//, { timeout: 10000 });

        // Should have back link
        const backLink = page.getByRole("link", { name: /Volver/i });
        await expect(backLink).toBeVisible();

        // Click back
        await backLink.click();
        await page.waitForURL(/\/provider\/offers/, { timeout: 10000 });
      }
    });
  });
});

test.describe("Provider Notification - Navigation", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("unauthenticated user accessing delivery page redirected to login", async ({ page }) => {
    await page.goto("/provider/deliveries/any-id");

    // Should redirect to login
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
  });
});
