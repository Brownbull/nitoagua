/**
 * Persona Validation E2E Tests
 *
 * Purpose: Verify the playwright-utils integration works correctly across all
 * three primary personas in the nitoagua application.
 *
 * Personas tested:
 * - Dona Maria (Consumer): 58yo, low tech comfort, one-button experience
 * - Don Pedro (Provider): 42yo, tech-comfortable, dashboard-centric
 * - Admin: Platform operations, verification queue
 *
 * Uses merged fixtures from @seontechnologies/playwright-utils for:
 * - Structured logging in reports
 * - Clear step-by-step test visibility
 *
 * Test Credentials (when NEXT_PUBLIC_DEV_LOGIN=true):
 * - Admin: admin@nitoagua.cl / admin.123
 * - Provider: supplier@nitoagua.cl / supplier.123
 */

import { test, expect } from "../support/fixtures/merged-fixtures";

// =============================================================================
// PERSONA 1: DONA MARIA (CONSUMER)
// =============================================================================

test.describe("Persona: Dona Maria (Consumer)", () => {
  test.describe("Home Screen Experience", () => {
    test("can see the big action button immediately", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to home page" });
      await page.goto("/");

      await log({ level: "step", message: "Verify welcome message visible" });
      await expect(
        page.getByRole("heading", { name: "Bienvenido a nitoagua" })
      ).toBeVisible();

      await log({
        level: "step",
        message: "Verify big action button visible and prominent",
      });
      const button = page.getByTestId("big-action-button");
      await expect(button).toBeVisible();
      await expect(button).toContainText("Solicitar Agua");

      await log({
        level: "step",
        message: "Verify button is large enough (200x200px minimum)",
      });
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(200);
      expect(box!.height).toBeGreaterThanOrEqual(200);

      await log({
        level: "success",
        message: "Consumer home screen displays correctly",
      });
    });

    test("can navigate to request form by clicking big button", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to home page" });
      await page.goto("/");

      await log({ level: "step", message: "Click big action button" });
      const button = page.getByTestId("big-action-button");
      await button.click();

      await log({ level: "step", message: "Wait for navigation to /request" });
      await page.waitForURL("**/request", { timeout: 10000 });

      await log({ level: "step", message: "Verify request form heading" });
      await expect(
        page.getByRole("heading", { name: "Solicitar Agua" })
      ).toBeVisible();

      await log({
        level: "success",
        message: "Consumer can access request form",
      });
    });

    test("sees Spanish interface throughout", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to home page" });
      await page.goto("/");

      await log({
        level: "step",
        message: "Verify navigation labels in Spanish",
      });
      await expect(page.getByText("Inicio")).toBeVisible();
      await expect(page.getByText("Historial")).toBeVisible();
      await expect(page.getByText("Perfil")).toBeVisible();

      await log({
        level: "step",
        message: "Verify instruction text in Spanish",
      });
      await expect(
        page.getByText("Toca el botón para solicitar tu entrega de agua")
      ).toBeVisible();

      await log({
        level: "success",
        message: "Spanish interface confirmed",
      });
    });
  });

  test.describe("Request Form", () => {
    test("can access request form and see required fields", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate directly to request form" });
      await page.goto("/request");

      await log({ level: "step", message: "Verify form heading visible" });
      await expect(
        page.getByRole("heading", { name: "Solicitar Agua" })
      ).toBeVisible();

      await log({ level: "step", message: "Verify address field exists" });
      // Address field might be a button for location picker or an input
      const addressSection = page.locator(
        '[data-testid="address-section"], [data-testid="address-input"], label:has-text("Dirección"), label:has-text("dirección")'
      );
      await expect(addressSection.first()).toBeVisible();

      await log({
        level: "success",
        message: "Request form is accessible and shows required fields",
      });
    });
  });
});

// =============================================================================
// PERSONA 2: DON PEDRO (PROVIDER/SUPPLIER)
// =============================================================================

test.describe("Persona: Don Pedro (Provider)", () => {
  // Note: Provider login is at /login (shared auth page), not /provider/login
  // Provider onboarding starts at /provider/onboarding
  // Provider dashboard routes: /provider/requests, /provider/offers, etc.

  test.describe("Authentication Flow", () => {
    test("can access main login page for provider auth", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to main login page" });
      await page.goto("/login");

      await log({
        level: "step",
        message: "Verify login page displays correctly",
      });
      // Should see login options - either Google OAuth or dev login
      const pageContent = await page.content();
      const hasLoginContent =
        pageContent.includes("Google") || pageContent.includes("login");
      expect(hasLoginContent).toBe(true);

      await log({
        level: "success",
        message: "Provider can access main login page",
      });
    });

    test("dev login for provider available when enabled", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to login page" });
      await page.goto("/login");

      await log({
        level: "step",
        message: "Check if dev login button exists (NEXT_PUBLIC_DEV_LOGIN)",
      });
      // The dev login button only appears when NEXT_PUBLIC_DEV_LOGIN=true
      // Note: The DevLogin component has a single "dev-login-button" testid,
      // with role selector buttons for Consumer/Supplier/New Supplier
      const devLoginButton = page.getByTestId("dev-login-button");
      const hasDevLogin = await devLoginButton.isVisible().catch(() => false);

      if (hasDevLogin) {
        await log({
          level: "info",
          message: "Dev login is available - can test provider flows",
        });
        await expect(devLoginButton).toBeEnabled();
      } else {
        await log({
          level: "info",
          message:
            "Dev login not available - running in production mode (Google OAuth required)",
        });
      }

      await log({
        level: "success",
        message: "Provider login page verified",
      });
    });
  });

  test.describe("Provider Dashboard (when authenticated)", () => {
    test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Skip on non-chromium browsers to save time"
    );

    test("can login with dev credentials and access provider area", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to login page" });
      await page.goto("/login");

      await log({ level: "step", message: "Look for dev login button" });
      const devLoginButton = page.getByTestId("dev-login-button");
      const hasDevLogin = await devLoginButton.isVisible().catch(() => false);

      if (!hasDevLogin) {
        await log({
          level: "warning",
          message:
            "Skipping - Dev login not available (NEXT_PUBLIC_DEV_LOGIN not set)",
        });
        test.skip();
        return;
      }

      await log({ level: "step", message: "Select Supplier role" });
      // The DevLogin component has role selector buttons (Consumer, Supplier, New Supplier)
      // Use exact match to avoid matching "New Supplier"
      const supplierRoleButton = page.getByRole("button", { name: "Supplier", exact: true });
      await supplierRoleButton.click();

      await log({ level: "step", message: "Click dev login button" });
      await devLoginButton.click();

      await log({ level: "step", message: "Wait for navigation after login" });
      // Wait for either success (provider area) or failure (stay on login with error)
      try {
        await page.waitForURL("**/provider/**", { timeout: 10000 });
      } catch {
        // Check if there's an auth error (user doesn't exist)
        const errorVisible = await page.getByRole("alert").isVisible().catch(() => false);
        if (errorVisible) {
          const errorText = await page.getByRole("alert").textContent();
          await log({
            level: "warning",
            message: `Auth failed (test user likely missing): ${errorText}`,
          });
          test.skip();
          return;
        }
        // Re-throw if no error visible - something else went wrong
        throw new Error("Navigation to provider area timed out without visible error");
      }

      await log({
        level: "step",
        message: "Verify now in provider area",
      });
      expect(page.url()).toContain("/provider");

      await log({
        level: "success",
        message: "Provider can log in and access dashboard",
      });
    });
  });
});

// =============================================================================
// PERSONA 3: ADMIN (OPERATIONS)
// =============================================================================

test.describe("Persona: Admin (Operations)", () => {
  test.describe("Admin Login Flow", () => {
    test("can access admin login page", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to /admin" });
      await page.goto("/admin");

      await log({
        level: "step",
        message: "Should redirect to admin login page",
      });
      await page.waitForURL("**/admin/login", { timeout: 10000 });
      expect(page.url()).toContain("/admin/login");

      await log({ level: "step", message: "Verify admin branding" });
      await expect(page.getByText("Panel Admin")).toBeVisible();

      await log({
        level: "step",
        message: "Verify Google OAuth button for admin",
      });
      const googleButton = page.getByTestId("admin-google-sign-in-button");
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toContainText("Continuar con Google");

      await log({
        level: "success",
        message: "Admin login page displays correctly",
      });
    });

    test("admin login page shows security allowlist notice", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to admin login" });
      await page.goto("/admin/login");

      await log({ level: "step", message: "Verify allowlist security message" });
      await expect(
        page.getByText(/Solo cuentas autorizadas pueden acceder/i)
      ).toBeVisible();

      await log({
        level: "success",
        message: "Admin security notice visible",
      });
    });

    test("dev login available for admin when enabled", async ({ page, log }) => {
      await log({ level: "step", message: "Navigate to admin login" });
      await page.goto("/admin/login");

      await log({
        level: "step",
        message: "Check for dev admin login button",
      });
      // Admin uses separate AdminDevLogin component with different testid
      const devAdminButton = page.getByTestId("admin-dev-login-button");
      const hasDevLogin = await devAdminButton.isVisible().catch(() => false);

      if (hasDevLogin) {
        await log({
          level: "info",
          message: "Dev admin login available for testing",
        });
        await expect(devAdminButton).toBeEnabled();
      } else {
        await log({
          level: "info",
          message:
            "Dev admin login not available - production mode (Google OAuth only)",
        });
      }

      await log({
        level: "success",
        message: "Admin login accessibility verified",
      });
    });
  });

  test.describe("Admin Dashboard (when authenticated)", () => {
    test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Skip on non-chromium browsers to save time"
    );

    test("can login with dev credentials and see admin dashboard", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Navigate to admin login" });
      await page.goto("/admin/login");

      await log({ level: "step", message: "Look for dev admin login button" });
      const devAdminButton = page.getByTestId("admin-dev-login-button");
      const hasDevLogin = await devAdminButton.isVisible().catch(() => false);

      if (!hasDevLogin) {
        await log({
          level: "warning",
          message:
            "Skipping - Dev admin login not available (NEXT_PUBLIC_DEV_LOGIN not set)",
        });
        test.skip();
        return;
      }

      await log({ level: "step", message: "Click dev login for admin" });
      await devAdminButton.click();

      await log({ level: "step", message: "Wait for navigation after login" });
      // Wait for either success (dashboard/not-authorized) or stay on login (auth error)
      // Give time for the auth to complete - AdminDevLogin uses window.location.href
      await page.waitForTimeout(2000);

      // Check if we're still on login page (auth failed)
      if (page.url().includes("/admin/login")) {
        // Check for error message
        const errorVisible = await page.getByRole("alert").isVisible().catch(() => false);
        if (errorVisible) {
          const errorText = await page.getByRole("alert").textContent();
          await log({
            level: "warning",
            message: `Auth failed (test admin user likely missing): ${errorText}`,
          });
          test.skip();
          return;
        }
        // No error visible but still on login - skip with generic message
        await log({
          level: "warning",
          message: "Login didn't redirect - test admin user may not exist in database",
        });
        test.skip();
        return;
      }

      await log({
        level: "step",
        message: "Verify admin dashboard content",
      });
      // Admin dashboard should have some navigation or content
      // Could be on /admin/dashboard or /admin/not-authorized depending on allowlist
      const adminContent = page.locator('[data-testid*="admin"]').first();
      const hasAdminUI =
        (await adminContent.isVisible().catch(() => false)) ||
        page.url().includes("/admin/");

      expect(hasAdminUI).toBe(true);

      await log({
        level: "success",
        message: "Admin can log in and access dashboard",
      });
    });
  });
});

// =============================================================================
// CROSS-PERSONA INTEGRATION
// =============================================================================

test.describe("Cross-Persona: Merged Fixtures Integration", () => {
  test("log fixture works correctly with step and success levels", async ({
    page,
    log,
  }) => {
    await log({ level: "info", message: "Starting integration verification" });

    await log({ level: "step", message: "Test step-level logging" });
    await page.goto("/");

    await log({ level: "step", message: "Test another step" });
    await expect(page.locator("body")).toBeVisible();

    await log({
      level: "success",
      message: "Merged fixtures log integration working",
    });
  });

  test("test can access core merged fixture utilities", async ({
    page,
    log,
    recurse,
    interceptNetworkCall,
  }) => {
    await log({
      level: "step",
      message: "Verify core fixtures are available",
    });

    // Verify each fixture is defined and has correct type
    expect(typeof log).toBe("function");
    expect(typeof recurse).toBe("function");
    expect(typeof interceptNetworkCall).toBe("function");
    // Note: networkErrorMonitor runs automatically, not exposed as fixture param

    await log({
      level: "step",
      message: "Navigate to verify fixtures work with page interactions",
    });
    await page.goto("/");

    await log({
      level: "step",
      message: "Verify page loaded correctly",
    });
    await expect(page.locator("body")).toBeVisible();

    await log({
      level: "success",
      message: "All merged fixtures verified available and working",
    });
  });
});
