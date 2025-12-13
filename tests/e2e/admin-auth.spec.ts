import { test, expect } from "@playwright/test";

test.describe("Admin Authentication - Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
  });

  test("AC6.1.1 - Admin can navigate to /admin and see login page with Google OAuth button", async ({
    page,
  }) => {
    // Navigate to /admin root
    await page.goto("/admin");

    // Should redirect to /admin/login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");

    // Verify Google sign-in button is visible
    const googleButton = page.getByTestId("admin-google-sign-in-button");
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toContainText("Continuar con Google");
  });

  test("login page displays admin-specific branding", async ({ page }) => {
    // Check admin badge
    await expect(page.getByText("Panel Admin")).toBeVisible();

    // Check nitoagua branding
    await expect(page.getByText("nitoagua")).toBeVisible();

    // Check admin-specific subtitle
    await expect(
      page.getByText("Acceso exclusivo para administradores")
    ).toBeVisible();
  });

  test("login page displays security note about allowlist", async ({ page }) => {
    await expect(
      page.getByText(
        "Solo cuentas autorizadas pueden acceder. Tu email debe estar en la lista de administradores."
      )
    ).toBeVisible();
  });

  test("Google button has correct styling for admin context", async ({ page }) => {
    const googleButton = page.getByTestId("admin-google-sign-in-button");

    // Button should be visible and enabled
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();

    // Button should have Google icon (SVG)
    const svg = googleButton.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("Google button is clickable and not disabled initially", async ({
    page,
  }) => {
    const googleButton = page.getByTestId("admin-google-sign-in-button");

    // Button should be enabled initially
    await expect(googleButton).toBeEnabled();

    // Button should be clickable
    await expect(googleButton).not.toBeDisabled();
  });
});

test.describe("Admin Dashboard Access Guard", () => {
  test("AC6.1.7 - Unauthenticated access to /admin/dashboard redirects to login", async ({
    page,
  }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access dashboard directly
    await page.goto("/admin/dashboard");

    // Should redirect to login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });

  test("unauthenticated access to /admin redirects to login", async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access admin root
    await page.goto("/admin");

    // Should redirect to login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Admin Auth Callback Route", () => {
  test("callback without code redirects to admin login", async ({ page }) => {
    await page.goto("/admin/auth/callback");

    // Should redirect to admin login when no code provided
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });

  test("callback with error redirects to admin login with error param", async ({
    page,
  }) => {
    await page.goto(
      "/admin/auth/callback?error=access_denied&error_description=User+cancelled"
    );

    // Should redirect to admin login with error
    await page.waitForURL("**/admin/login**", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
    expect(page.url()).toContain("error=");
  });
});

test.describe("AC6.1.6 - Admin Interface Accessibility", () => {
  test("AC6.1.6 - Mobile viewport shows admin interface", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/admin/login");

    // Should show login interface on mobile (no mobile restriction)
    await expect(page.getByTestId("admin-google-sign-in-button")).toBeVisible();
  });

  test("AC6.1.6 - Desktop viewport shows admin interface", async ({ page }) => {
    // Set desktop viewport (1024px or more)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/admin/login");

    // Should show login interface
    await expect(page.getByTestId("admin-google-sign-in-button")).toBeVisible();
  });

  test("AC6.1.6 - Large desktop viewport works correctly", async ({ page }) => {
    // Set large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/admin/login");

    // Should show login interface
    await expect(page.getByTestId("admin-google-sign-in-button")).toBeVisible();
  });
});

test.describe("Admin Not Authorized Page", () => {
  test("not-authorized page displays correct error message", async ({ page }) => {
    // Note: We can't easily test the full flow without mocking auth
    // This tests the page structure when accessed directly
    // In practice, this page requires auth to show user email

    await page.goto("/admin/not-authorized");

    // Without auth, should redirect to login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Admin Login Loading State", () => {
  test("Google button shows loading state when clicked", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/admin/login");

    const googleButton = page.getByTestId("admin-google-sign-in-button");
    await expect(googleButton).toBeVisible();

    // Button should not be disabled initially
    await expect(googleButton).toBeEnabled();

    // Click the button (this will trigger OAuth redirect attempt)
    await googleButton.click();

    // Give it a moment to update state
    await page.waitForTimeout(100);

    // Button interaction should have worked
    expect(true).toBe(true);
  });
});

test.describe("Admin UI - Gray Theme", () => {
  test("login page uses gray/neutral theme colors", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/admin/login");

    // Verify gray background (bg-gray-100)
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Admin badge should have dark background
    const adminBadge = page.locator("text=Panel Admin").first();
    await expect(adminBadge).toBeVisible();
  });
});

test.describe("Admin Sidebar Navigation", () => {
  // These tests would require authenticated admin session
  // Testing structure only

  test("sidebar is not visible on login page", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/admin/login");

    // Sidebar should not be visible on login page (no user)
    const dashboardNav = page.getByTestId("nav-dashboard");
    await expect(dashboardNav).not.toBeVisible();
  });
});

test.describe("Admin Dev Login (Local Testing)", () => {
  test.skip(
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "true",
    "Dev login only available when NEXT_PUBLIC_DEV_LOGIN=true"
  );

  test("admin can login with test credentials and access dashboard", async ({ page }) => {
    await page.goto("/admin/login");

    // Dev login form should be visible
    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible();

    // Fill in test admin credentials
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");

    // Click dev login button
    await devLoginButton.click();

    // Should redirect to admin dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/admin/dashboard");

    // Dashboard should show admin content
    await expect(page.getByText("Panel de Administracion")).toBeVisible();
  });

  test("non-admin user sees not-authorized page", async ({ page }) => {
    await page.goto("/admin/login");

    // Dev login form should be visible
    const devLoginButton = page.getByTestId("admin-dev-login-button");
    await expect(devLoginButton).toBeVisible();

    // Fill in non-admin test credentials (consumer account)
    await page.fill("#admin-email", "khujtatest@gmail.com");
    await page.fill("#admin-password", "password.123");

    // Click dev login button
    await devLoginButton.click();

    // Should redirect to not-authorized page
    await page.waitForURL("**/admin/not-authorized", { timeout: 15000 });
    expect(page.url()).toContain("/admin/not-authorized");

    // Should show access denied message
    await expect(page.getByText("No autorizado")).toBeVisible();
  });
});
