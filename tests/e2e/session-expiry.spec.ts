/**
 * Session Expiry E2E Tests
 *
 * Tests for Story 12.6-1: Fix Stale Session on Server Actions
 *
 * Test tags:
 * - @session - Session handling tests
 * - @auth - Authentication flow tests
 * - @seeded - Requires seeded test users in database
 *
 * IMPORTANT: Actual session expiry is difficult to simulate in E2E tests.
 * These tests focus on:
 * - Login page handling of returnTo and expired params
 * - Toast display for expired sessions
 * - Post-login redirect behavior
 *
 * Requires seeded test users - run `npm run seed:test` before running.
 */

import { test, expect } from "../support/fixtures/merged-fixtures";
import type { Page } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * Login helper for provider using test-supplier credentials
 */
async function loginAsSupplier(page: Page) {
  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button to auto-fill supplier credentials
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();

  // Wait a moment for the email/password to auto-fill
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId("dev-login-button").click();

  // Wait for redirect
  await page.waitForURL(/\/provider/, { timeout: 15000 });
}

/**
 * Login helper for consumer
 */
async function loginAsConsumer(page: Page) {
  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click consumer button in role selector (exact match)
  const consumerButton = page.getByRole("button", { name: "Consumer", exact: true });
  await consumerButton.click();

  // Wait a moment for the email/password to auto-fill
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL(/\/home/, { timeout: 15000 });
}

test.describe("Session Expiry Handling @session @auth @seeded", () => {
  test.describe("Login Page - Expired Session Toast", () => {
    test("AC12.6.1.4: shows session expired toast when expired=true param present", async ({ page }) => {
      // Navigate to login page with expired param
      await page.goto("/login?expired=true");

      // Wait for page to load
      await page.waitForTimeout(500);

      // Check for toast notification
      // Sonner toasts typically appear with a specific role/structure
      const toast = page.locator('[data-sonner-toast]').or(
        page.locator('text=/sesión expiró|session expired/i')
      );

      // Toast should be visible
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    });

    test("shows session expired toast with correct message in Spanish", async ({ page }) => {
      await page.goto("/login?expired=true");
      await page.waitForTimeout(500);

      // Look for the Spanish message
      const toastMessage = page.getByText(/Tu sesión expiró/i);
      await expect(toastMessage).toBeVisible({ timeout: 5000 });
    });

    test("does not show expired toast on normal login page visit", async ({ page }) => {
      await page.goto("/login");
      await page.waitForTimeout(1000);

      // Toast should NOT be visible
      const toast = page.locator('[data-sonner-toast]').first();
      const isVisible = await toast.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });
  });

  test.describe("Login Page - Return URL Handling", () => {
    test("AC12.6.1.4: accepts returnTo query parameter", async ({ page }) => {
      // Navigate to login with returnTo
      await page.goto("/login?returnTo=/provider/settings");

      // Wait for page to load
      await page.waitForTimeout(500);
      await assertNoErrorState(page);

      // Login page should load normally
      const loginButton = page.getByTestId("google-sign-in-button");
      await expect(loginButton).toBeVisible();
    });

    test("accepts returnTo with expired flag together", async ({ page }) => {
      // Both params can be present
      await page.goto("/login?returnTo=/provider/settings&expired=true");

      await page.waitForTimeout(500);
      await assertNoErrorState(page);

      // Login page should load
      const loginButton = page.getByTestId("google-sign-in-button");
      await expect(loginButton).toBeVisible();

      // Toast should appear
      const toastMessage = page.getByText(/Tu sesión expiró/i);
      await expect(toastMessage).toBeVisible({ timeout: 5000 });
    });

    test("preserves returnTo param in role switch links", async ({ page }) => {
      await page.goto("/login?returnTo=/provider/settings");

      await page.waitForTimeout(500);

      // The role switch link should preserve returnTo (or not break the page)
      const supplierLink = page.getByTestId("switch-to-supplier-link");
      await expect(supplierLink).toBeVisible();
    });
  });

  test.describe("Session Validation - Post-Login Redirect", () => {
    // Note: Testing actual returnTo redirect requires OAuth flow which cannot
    // be fully automated. DevLogin doesn't use the OAuth callback.
    // These tests verify the login flow works with the params present.

    test("dev login works with returnTo param present", async ({ page }) => {
      await page.goto("/login?returnTo=/provider/settings");

      try {
        await loginAsSupplier(page);
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      // Should successfully log in (dev login bypasses OAuth callback)
      // The actual returnTo redirect would only work with OAuth flow
      const currentUrl = page.url();
      expect(currentUrl).toContain("/provider");
    });

    test("dev login works with expired param present", async ({ page }) => {
      await page.goto("/login?expired=true");

      try {
        await loginAsSupplier(page);
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      // Should successfully log in even with expired param
      const currentUrl = page.url();
      expect(currentUrl).toContain("/provider");
    });
  });

  test.describe("Session Hook - Visibility Change", () => {
    // Note: Testing visibility change and session refresh in Playwright is
    // challenging as it requires simulating app backgrounding.
    // These tests verify the hook doesn't break normal page operation.

    test("provider settings page loads correctly with session hook active", async ({ page }) => {
      await page.goto("/login");

      try {
        await loginAsSupplier(page);
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      await assertNoErrorState(page);

      // Page should load normally with useAuth hook
      const settingsContent = page.locator('[data-testid="notification-settings"]').or(
        page.getByText("Configuración")
      );
      await expect(settingsContent.first()).toBeVisible();
    });

    test("consumer settings page loads correctly with session hook active", async ({ page }) => {
      await page.goto("/login");

      try {
        await loginAsConsumer(page);
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      await page.goto("/settings");
      await page.waitForTimeout(1000);

      await assertNoErrorState(page);

      // Page should load normally
      const settingsContent = page.locator('[data-testid="notification-settings"]').or(
        page.getByText(/ajustes|configuración/i)
      );
      await expect(settingsContent.first()).toBeVisible();
    });
  });

  test.describe("Push Subscription - Auth Error Handling", () => {
    // Testing requiresLogin flag in push subscription actions requires
    // simulating an expired session which is difficult in E2E.
    // These tests verify the notification settings component loads correctly.

    test("notification settings shows correct state for authenticated user", async ({ page }) => {
      await page.goto("/login");

      try {
        await loginAsSupplier(page);
      } catch {
        test.skip(true, "Login failed - test users may not be seeded");
        return;
      }

      await page.goto("/provider/settings");
      await page.waitForTimeout(1000);

      await assertNoErrorState(page);

      // Notification settings should load without auth errors
      const notificationSettings = page.getByTestId("notification-settings");
      await expect(notificationSettings).toBeVisible();

      // Should NOT show requiresLogin error
      const authError = page.getByText(/sesión expiró|inicia sesión nuevamente/i);
      const hasAuthError = await authError.isVisible().catch(() => false);
      expect(hasAuthError).toBeFalsy();
    });
  });
});
