import { test, expect } from "@playwright/test";

test.describe("Consumer Home Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC2-1-1 - displays big action button with correct dimensions", async ({
    page,
  }) => {
    const button = page.getByTestId("big-action-button");
    await expect(button).toBeVisible();

    // Verify the button has 200x200px dimensions
    const boundingBox = await button.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBe(200);
    expect(boundingBox!.height).toBe(200);

    // Verify it contains "Solicitar Agua" text
    await expect(button).toContainText("Solicitar Agua");
  });

  test("AC2-1-2 - button has correct gradient and shadow styling", async ({
    page,
  }) => {
    const button = page.getByTestId("big-action-button");

    // Verify button has rounded-full class for circular shape
    const hasRoundedFull = await button.evaluate((el) =>
      el.className.includes("rounded-full")
    );
    expect(hasRoundedFull).toBe(true);

    // Verify shadow is applied (shadow-lg class)
    const hasShadow = await button.evaluate((el) =>
      el.className.includes("shadow-lg")
    );
    expect(hasShadow).toBe(true);

    // Verify gradient background classes
    const hasGradient = await button.evaluate((el) =>
      el.className.includes("bg-gradient-to-br")
    );
    expect(hasGradient).toBe(true);

    // Verify the primary colors are in the gradient
    const hasFromColor = await button.evaluate((el) =>
      el.className.includes("from-[#0077B6]")
    );
    expect(hasFromColor).toBe(true);

    const hasToColor = await button.evaluate((el) =>
      el.className.includes("to-[#00A8E8]")
    );
    expect(hasToColor).toBe(true);
  });

  test("AC2-1-3 - button responds to hover state", async ({ page }) => {
    const button = page.getByTestId("big-action-button");

    // Verify the button has hover scale classes
    const hasHoverClass = await button.evaluate((el) =>
      el.className.includes("hover:scale-105")
    );
    expect(hasHoverClass).toBe(true);

    // Verify the button has active scale classes
    const hasActiveClass = await button.evaluate((el) =>
      el.className.includes("active:scale-")
    );
    expect(hasActiveClass).toBe(true);

    // Verify transition is applied for smooth animation
    const hasTransition = await button.evaluate((el) =>
      el.className.includes("transition")
    );
    expect(hasTransition).toBe(true);
  });

  test("AC2-1-4 - clicking button navigates to /request page", async ({
    page,
  }) => {
    const button = page.getByTestId("big-action-button");
    await button.click();

    // Wait for navigation
    await page.waitForURL("**/request");

    // Verify we're on the request page
    expect(page.url()).toContain("/request");

    // Verify request page content is displayed
    await expect(
      page.getByRole("heading", { name: "Solicitar Agua" })
    ).toBeVisible();
  });

  test("AC2-1-5 - bottom navigation displays 3 items with correct labels", async ({
    page,
  }) => {
    const nav = page.getByTestId("consumer-nav");
    await expect(nav).toBeVisible();

    // Verify 3 navigation links exist
    const navLinks = nav.locator("a");
    await expect(navLinks).toHaveCount(3);

    // Verify Spanish labels
    await expect(nav.getByText("Inicio")).toBeVisible();
    await expect(nav.getByText("Historial")).toBeVisible();
    await expect(nav.getByText("Perfil")).toBeVisible();
  });

  test("AC2-1-6 - all visible text is in Spanish", async ({ page }) => {
    // Verify welcome message is in Spanish
    await expect(
      page.getByRole("heading", { name: "Bienvenido a nitoagua" })
    ).toBeVisible();

    // Verify button text is in Spanish
    await expect(page.getByText("Solicitar Agua")).toBeVisible();

    // Verify instruction text is in Spanish
    await expect(
      page.getByText("Toca el botón para solicitar tu entrega de agua")
    ).toBeVisible();

    // Verify nav labels are in Spanish
    await expect(page.getByText("Inicio")).toBeVisible();
    await expect(page.getByText("Historial")).toBeVisible();
    await expect(page.getByText("Perfil")).toBeVisible();
  });

  test("AC2-1-7 - touch targets are minimum 44x44px", async ({ page }) => {
    // Check big action button (200x200 exceeds 44x44)
    const button = page.getByTestId("big-action-button");
    const buttonBox = await button.boundingBox();
    expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);

    // Check navigation links
    const nav = page.getByTestId("consumer-nav");
    const navLinks = nav.locator("a");
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const linkBox = await link.boundingBox();
      expect(linkBox).not.toBeNull();
      expect(linkBox!.width).toBeGreaterThanOrEqual(44);
      expect(linkBox!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("button shows loading state when clicked", async ({ page }) => {
    const button = page.getByTestId("big-action-button");

    // Click and quickly check for pulse animation class
    await button.click();

    // The button should have animate-pulse while loading
    const hasAnimation = await button.evaluate((el) =>
      el.classList.contains("animate-pulse")
    );
    expect(hasAnimation).toBe(true);
  });
});

test.describe("Consumer Navigation", () => {
  test("navigation links have correct href attributes", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByTestId("consumer-nav");

    // Verify Home link href
    const homeLink = nav.getByRole("link", { name: "Inicio" });
    await expect(homeLink).toHaveAttribute("href", "/");

    // Verify History link href
    const historyLink = nav.getByRole("link", { name: "Historial" });
    await expect(historyLink).toHaveAttribute("href", "/history");

    // Verify Profile link href
    const profileLink = nav.getByRole("link", { name: "Perfil" });
    await expect(profileLink).toHaveAttribute("href", "/profile");
  });

  test("active navigation item is styled differently", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByTestId("consumer-nav");
    const homeLink = nav.getByText("Inicio").locator("..");

    // Home should be active (primary color)
    const homeColor = await homeLink.evaluate((el) =>
      getComputedStyle(el).color
    );
    // Primary color #0077B6 in RGB
    expect(homeColor).toContain("0, 119, 182");
  });
});
