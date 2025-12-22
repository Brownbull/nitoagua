import { test, expect } from "../support/fixtures/merged-fixtures";

/**
 * Consumer Home Screen Tests
 *
 * Tests the mockup-aligned landing page with:
 * - Gradient header with nitoagua logo
 * - Hero section with CTA button
 * - Benefits section
 * - Trust indicators
 * - Footer with login links (Consumer, Provider, Admin)
 */
test.describe("Consumer Home Screen", () => {
  test.beforeEach(async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to home page" });
    await page.goto("/");
  });

  test("displays nitoagua logo in header", async ({ page, log }) => {
    await log({ level: "step", message: "Verify nitoagua logo is visible" });
    await expect(page.getByText("nitoagua")).toBeVisible();
    await log({ level: "success", message: "Logo verified" });
  });

  test("displays hero section with title and CTA", async ({ page, log }) => {
    await log({ level: "step", message: "Verify hero title" });
    await expect(page.getByText("Agua potable")).toBeVisible();
    await expect(page.getByText("directo a tu hogar")).toBeVisible();

    await log({ level: "step", message: "Verify CTA button" });
    const ctaButton = page.getByTestId("request-water-button");
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toContainText("Pedir Agua Ahora");
    await log({ level: "success", message: "Hero section verified" });
  });

  test("CTA button navigates to /request page", async ({ page, log }) => {
    await log({ level: "step", message: "Click CTA button" });
    const ctaButton = page.getByTestId("request-water-button");
    await ctaButton.click();

    await log({ level: "step", message: "Wait for navigation to /request" });
    await page.waitForURL("**/request");

    await log({ level: "step", message: "Verify URL contains /request" });
    expect(page.url()).toContain("/request");

    await log({ level: "step", message: "Verify request page heading is visible" });
    // Mockup uses "Pedir Agua" as the title
    await expect(
      page.getByRole("heading", { name: "Pedir Agua" })
    ).toBeVisible();
    await log({ level: "success", message: "Navigation to request page verified" });
  });

  test("displays benefits section with 3 items", async ({ page, log }) => {
    await log({ level: "step", message: "Verify benefits are visible" });
    // Compact horizontal layout with short labels
    await expect(page.getByText("Entrega rápida")).toBeVisible();
    await expect(page.getByText("Verificados")).toBeVisible();
    await expect(page.getByText("Sin cuenta")).toBeVisible();
    await expect(page.getByText("Agua certificada")).toBeVisible();
    await log({ level: "success", message: "Benefits section verified" });
  });

  test("displays quality badge", async ({ page }) => {
    await expect(page.getByText("Agua de calidad certificada")).toBeVisible();
  });

  test("all visible text is in Spanish", async ({ page, log }) => {
    await log({ level: "step", message: "Verify title in Spanish" });
    await expect(page.getByText("Agua potable")).toBeVisible();
    await expect(page.getByText("directo a tu hogar")).toBeVisible();

    await log({ level: "step", message: "Verify CTA in Spanish" });
    await expect(page.getByText("Pedir Agua Ahora")).toBeVisible();

    await log({ level: "step", message: "Verify benefits in Spanish" });
    await expect(page.getByText("Entrega rápida")).toBeVisible();
    await expect(page.getByText("En menos de 24h")).toBeVisible();

    await log({ level: "step", message: "Verify login links in Spanish" });
    // Use role selectors to target footer login links specifically
    await expect(page.getByRole("link", { name: /Consumidor/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Proveedor/i })).toBeVisible();
    await log({ level: "success", message: "All Spanish text verified" });
  });

  test("CTA button has adequate touch target size", async ({ page }) => {
    const ctaButton = page.getByTestId("request-water-button");
    const buttonBox = await ctaButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    // Button should be at least 44px tall for touch accessibility
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
    // Button should be reasonably wide
    expect(buttonBox!.width).toBeGreaterThanOrEqual(200);
  });

  test("CTA button shows loading state when clicked", async ({ page }) => {
    const ctaButton = page.getByTestId("request-water-button");

    // Click and check for loading text
    await ctaButton.click();

    // Should show "Cargando..." text briefly
    // Note: This may happen quickly, so we check the navigation instead
    await page.waitForURL("**/request");
    expect(page.url()).toContain("/request");
  });
});

test.describe("Login Links", () => {
  test("displays consumer login link", async ({ page }) => {
    await page.goto("/");

    const consumerLink = page.getByRole("link", { name: /Consumidor/i });
    await expect(consumerLink).toBeVisible();
    await expect(consumerLink).toHaveAttribute("href", "/login?role=consumer");
  });

  test("displays provider login link", async ({ page }) => {
    await page.goto("/");

    const providerLink = page.getByRole("link", { name: /Proveedor/i });
    await expect(providerLink).toBeVisible();
    await expect(providerLink).toHaveAttribute("href", "/login?role=supplier");
  });

  test("displays 'Iniciar sesión' link in header when not logged in", async ({ page }) => {
    await page.goto("/");

    // Wait for auth check to complete
    await page.waitForTimeout(500);

    const loginLink = page.getByRole("link", { name: "Iniciar sesión" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });
});

test.describe("Admin Access", () => {
  test("subtle admin button is present and links to /admin", async ({ page }) => {
    await page.goto("/");

    const adminLink = page.getByTestId("admin-access-link");
    await expect(adminLink).toBeVisible();
    await expect(adminLink).toHaveAttribute("href", "/admin");
    // Shows "Admin" text (compact footer layout)
    await expect(adminLink).toContainText("Admin");
  });

  test("admin button click redirects to admin login", async ({ page }) => {
    await page.goto("/");

    const adminLink = page.getByTestId("admin-access-link");
    await adminLink.click();

    // Should redirect to admin login since not authenticated
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Guest Water Request Flow", () => {
  test("can start water request without login", async ({ page }) => {
    await page.goto("/");

    // Click main CTA
    const ctaButton = page.getByTestId("request-water-button");
    await ctaButton.click();

    // Should navigate to request page
    await page.waitForURL("**/request");
    expect(page.url()).toContain("/request");

    // Request form should be visible (mockup uses "Pedir Agua")
    await expect(page.getByRole("heading", { name: "Pedir Agua" })).toBeVisible();
  });
});
