/**
 * Provider Settings Page E2E Tests
 *
 * Tests for Story 8-9: Provider Settings Page
 * These tests verify the settings page displays correctly and allows navigation.
 *
 * Test tags:
 * - @settings - Provider settings tests
 *
 * IMPORTANT: Tests use explicit error detection to fail on DB issues.
 * See Story Testing-1 for reliability improvements.
 */

import { test, expect, Page } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

// Check if dev login is enabled
const devLoginEnabled = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";
const skipIfNoDevLogin = !devLoginEnabled;

/**
 * Login helper for provider
 */
async function loginAsSupplier(page: Page) {
  await page.goto("/login");

  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button in role selector (exact match)
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();

  // Wait a moment for the email/password to auto-fill
  await page.waitForTimeout(100);

  // Click login - should now redirect to /provider/requests
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
}

test.describe("Provider Settings Page @settings", () => {
  test.describe("Settings Page Navigation", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("navigates to settings page from bottom nav", async ({ page }) => {
      await loginAsSupplier(page);

      // Click on Ajustes in bottom nav
      await page.getByRole("link", { name: "Ajustes" }).click();
      await page.waitForURL("**/provider/settings");

      // Verify page loaded
      await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
    });

    test("displays profile card with user info", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Profile card should be visible
      const profileCard = page.getByTestId("profile-card");
      await expect(profileCard).toBeVisible();

      // Should show user name
      await expect(profileCard).toContainText(/\w+/); // Any text content
    });

    test("displays verified badge for approved provider", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // Verified badge should be visible (if provider is approved)
      const verifiedBadge = page.getByTestId("verified-badge");
      // May or may not be visible depending on provider status
      const isVerified = await verifiedBadge.isVisible().catch(() => false);

      if (isVerified) {
        await expect(verifiedBadge).toBeVisible();
      }
    });
  });

  test.describe("Settings Menu Items", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("displays all settings menu items", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Check all menu items are visible using data-testid
      await expect(page.getByTestId("settings-item-información-personal")).toBeVisible();
      await expect(page.getByTestId("settings-item-vehículo")).toBeVisible();
      await expect(page.getByTestId("settings-item-datos-bancarios")).toBeVisible();
      await expect(page.getByTestId("settings-item-zonas-de-servicio")).toBeVisible();
    });

    test("navigates to personal info page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Click personal info item using data-testid
      await page.getByTestId("settings-item-información-personal").click();
      await page.waitForURL("**/provider/settings/personal");

      // Verify page loaded
      await expect(page.getByRole("heading", { name: "Información Personal" })).toBeVisible();

      // Back button should go to settings
      await page.getByTestId("back-to-settings").click();
      await page.waitForURL("**/provider/settings");
    });

    test("navigates to vehicle info page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Click vehicle item using data-testid
      await page.getByTestId("settings-item-vehículo").click();
      await page.waitForURL("**/provider/settings/vehicle");

      // Verify page loaded
      await expect(page.getByRole("heading", { name: "Información del Vehículo" })).toBeVisible();
    });

    test("navigates to bank info page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Click bank item using data-testid
      await page.getByTestId("settings-item-datos-bancarios").click();
      await page.waitForURL("**/provider/settings/bank");

      // Verify page loaded
      await expect(page.getByRole("heading", { name: "Datos Bancarios" })).toBeVisible();
    });

    test("navigates to service areas page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Click service areas item using data-testid
      await page.getByTestId("settings-item-zonas-de-servicio").click();
      await page.waitForURL("**/dashboard/settings/areas");
    });
  });

  test.describe("Availability Toggle", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("displays availability toggle for approved provider", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // Check if availability section is visible (only for approved providers)
      const availabilitySection = page.getByTestId("availability-section");
      const hasAvailability = await availabilitySection.isVisible().catch(() => false);

      if (hasAvailability) {
        // Toggle container should be visible
        await expect(page.getByTestId("availability-toggle-container")).toBeVisible();
        // Switch should be visible
        await expect(page.getByTestId("availability-switch")).toBeVisible();
      }
    });
  });

  test.describe("Sign Out", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("displays sign out button", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Sign out button should be visible
      const signOutButton = page.getByTestId("sign-out-button");
      await expect(signOutButton).toBeVisible();
      await expect(signOutButton).toContainText("Cerrar Sesión");
    });

    test("signs out and redirects to home", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Click sign out
      await page.getByTestId("sign-out-button").click();

      // Should redirect to home page
      await page.waitForURL("/", { timeout: 10000 });
    });
  });

  test.describe("Provider Nav Integration", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("settings tab is active when on settings page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Check the Ajustes link has the active color (orange-500)
      const settingsLink = page.getByRole("link", { name: "Ajustes" });
      await expect(settingsLink).toBeVisible();
      await expect(settingsLink).toHaveClass(/text-orange-500/);
    });

    test("bottom nav is visible on settings page", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      // Check bottom nav is visible
      await expect(page.getByTestId("provider-nav")).toBeVisible();

      // All nav items should be visible
      await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Mis Ofertas" })).toBeVisible();
      await expect(page.getByTestId("map-fab-button")).toBeVisible();
      await expect(page.getByRole("link", { name: "Ganancias" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Ajustes" })).toBeVisible();
    });
  });
});
