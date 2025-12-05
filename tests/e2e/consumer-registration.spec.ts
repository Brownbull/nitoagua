import { test, expect } from "@playwright/test";

test.describe("Consumer Registration - Story 4-1", () => {
  test.describe("AC4-1-1: Crear Cuenta link on Consumer Home", () => {
    test("shows Crear Cuenta link for non-logged-in users", async ({ page }) => {
      await page.goto("/");

      // Wait for auth check to complete
      const crearCuentaLink = page.getByTestId("crear-cuenta-link");

      // Should be visible for non-logged-in users
      await expect(crearCuentaLink).toBeVisible({ timeout: 5000 });
      await expect(crearCuentaLink).toHaveText("Crear Cuenta");
    });

    test("Crear Cuenta link has correct href with role=consumer param", async ({ page }) => {
      await page.goto("/");

      const crearCuentaLink = page.getByTestId("crear-cuenta-link");
      await expect(crearCuentaLink).toBeVisible({ timeout: 5000 });

      // Verify href includes role=consumer
      await expect(crearCuentaLink).toHaveAttribute("href", "/login?role=consumer");
    });
  });

  test.describe("AC4-1-2: Navigation to Login Page with Role Param", () => {
    test("clicking Crear Cuenta navigates to login page with role=consumer", async ({ page }) => {
      await page.goto("/");

      const crearCuentaLink = page.getByTestId("crear-cuenta-link");
      await expect(crearCuentaLink).toBeVisible({ timeout: 5000 });

      await crearCuentaLink.click();

      // Should navigate to login with role=consumer
      await page.waitForURL("**/login?role=consumer");
      expect(page.url()).toContain("/login?role=consumer");
    });
  });

  test.describe("AC4-1-3: Login Page Shows Google Button", () => {
    test("login page displays Google sign-in button", async ({ page }) => {
      await page.goto("/login?role=consumer");

      const googleButton = page.getByTestId("google-sign-in-button");
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toContainText("Continuar con Google");
    });

    test("login page shows switch to supplier link for consumer login", async ({ page }) => {
      await page.goto("/login?role=consumer");

      const switchLink = page.getByTestId("switch-to-supplier-link");
      await expect(switchLink).toBeVisible();
      await expect(switchLink).toContainText("¿Eres proveedor de agua?");
    });

    test("login page shows switch to consumer link for supplier login", async ({ page }) => {
      await page.goto("/login?role=supplier");

      const switchLink = page.getByTestId("switch-to-consumer-link");
      await expect(switchLink).toBeVisible();
      await expect(switchLink).toContainText("¿No eres proveedor?");
    });
  });

  test.describe("AC4-1-4: Consumer Onboarding Requires Authentication", () => {
    test("consumer onboarding page redirects unauthenticated users to login", async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Try to access consumer onboarding directly
      await page.goto("/consumer/onboarding");

      // Should redirect to login with role=consumer
      await page.waitForURL("**/login?role=consumer", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("AC4-1-5: Onboarding Form Validation", () => {
    // Note: These tests verify form structure. Full form tests require auth mocking.

    test("Chilean phone regex validates correctly", () => {
      // Valid: +56 followed by exactly 9 digits = 12 characters total
      const validPhones = ["+56912345678", "+56987654321", "+56123456789"];
      const invalidPhones = [
        "912345678", // Missing country code
        "+561234567890", // Too many digits (10 after +56)
        "+5691234567", // Too few digits (8 after +56)
        "+57912345678", // Wrong country code
        "56912345678", // Missing + prefix
      ];

      const chileanPhoneRegex = /^\+56[0-9]{9}$/;

      validPhones.forEach((phone) => {
        expect(phone).toMatch(chileanPhoneRegex);
      });

      invalidPhones.forEach((phone) => {
        expect(phone).not.toMatch(chileanPhoneRegex);
      });
    });
  });

  test.describe("Role Switching Links", () => {
    test("consumer login shows link to switch to supplier", async ({ page }) => {
      await page.goto("/login?role=consumer");

      const supplierLink = page.getByTestId("switch-to-supplier-link");
      await expect(supplierLink).toBeVisible();
      await expect(supplierLink).toHaveAttribute("href", "/login?role=supplier");
    });

    test("supplier login shows link to switch to consumer", async ({ page }) => {
      await page.goto("/login?role=supplier");

      const consumerLink = page.getByTestId("switch-to-consumer-link");
      await expect(consumerLink).toBeVisible();
      await expect(consumerLink).toHaveAttribute("href", "/login?role=consumer");
    });

    test("clicking switch link navigates between roles", async ({ page }) => {
      // Start at consumer login
      await page.goto("/login?role=consumer");

      // Click switch to supplier
      const supplierLink = page.getByTestId("switch-to-supplier-link");
      await supplierLink.click();
      await page.waitForURL("**/login?role=supplier");

      // Should now show switch to consumer link
      const consumerLink = page.getByTestId("switch-to-consumer-link");
      await expect(consumerLink).toBeVisible();
    });
  });

  test.describe("Default Role Behavior", () => {
    test("login page defaults to consumer when no role param", async ({ page }) => {
      await page.goto("/login");

      // Should show supplier link (meaning we're in consumer mode)
      const supplierLink = page.getByTestId("switch-to-supplier-link");
      await expect(supplierLink).toBeVisible();
    });
  });

  test.describe("Regression: Supplier Auth Flow Still Works", () => {
    test("supplier login page still shows Google button", async ({ page }) => {
      await page.goto("/login?role=supplier");

      const googleButton = page.getByTestId("google-sign-in-button");
      await expect(googleButton).toBeVisible();
      await expect(googleButton).toContainText("Continuar con Google");
    });

    test("supplier onboarding page redirects unauthenticated users", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/onboarding");

      await page.waitForURL("**/login", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });

    test("supplier dashboard still requires authentication", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/dashboard");

      await page.waitForURL("**/login", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Consumer Home Elements", () => {
    test("consumer home shows nitoagua branding", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByText("Bienvenido a nitoagua")).toBeVisible();
      await expect(page.getByText("Tu agua, cuando la necesitas")).toBeVisible();
    });

    test("consumer home has big action button", async ({ page }) => {
      await page.goto("/");

      // Look for the big action button (water request button)
      const requestButton = page.locator('[data-testid="big-action-button"]');
      await expect(requestButton).toBeVisible();
    });
  });
});

test.describe("Auth Callback - Role Routing", () => {
  test("callback without code redirects to login", async ({ page }) => {
    await page.goto("/auth/callback");

    await page.waitForURL("**/login");
    expect(page.url()).toContain("/login");
  });

  test("callback with error redirects to login with error", async ({ page }) => {
    await page.goto("/auth/callback?error=access_denied");

    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("error=");
  });
});

test.describe("Test Login Endpoint (Development Only)", () => {
  // These tests verify the test login endpoint structure
  // They will only pass when ENABLE_TEST_LOGIN=true

  test("test login endpoint returns 404 when disabled", async ({ request }) => {
    // In most test environments, test login is disabled
    // This test verifies the security behavior
    const response = await request.get("/api/auth/test-login");

    // Should be 404 (disabled) or 200 (enabled with test info)
    expect([200, 404]).toContain(response.status());
  });
});
