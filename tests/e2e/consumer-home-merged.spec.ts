/**
 * Consumer Home Screen Tests - Using Merged Fixtures
 *
 * This is a migration of consumer-home.spec.ts to demonstrate
 * @seontechnologies/playwright-utils integration.
 *
 * Tests the mockup-aligned landing page with:
 * - Gradient header with nitoagua logo
 * - Hero section with CTA button
 * - Benefits section
 * - Trust indicators
 * - Footer with login links
 *
 * Log fixture API: log({ level: 'step', message: 'text' })
 * Available levels: info, step, success, warning, error, debug
 */
import { test, expect } from "../support/fixtures/merged-fixtures";

test.describe("Consumer Home Screen (Merged Fixtures)", () => {
  test.beforeEach(async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to home page" });
    await page.goto("/");
  });

  test("displays CTA button and navigates to request page", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Locate CTA button" });
    const button = page.getByTestId("request-water-button");
    await expect(button).toBeVisible();

    await log({ level: "step", message: "Verify button text" });
    await expect(button).toContainText("Pedir Agua Ahora");

    await log({ level: "step", message: "Click CTA button" });
    await button.click();

    await log({ level: "step", message: "Wait for navigation to /request" });
    await page.waitForURL("**/request");

    await log({ level: "success", message: "Verify request page content" });
    expect(page.url()).toContain("/request");
    // Mockup uses "Pedir Agua" as the title
    await expect(
      page.getByRole("heading", { name: "Pedir Agua" })
    ).toBeVisible();
  });

  test("displays benefits section with 3 items", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Verify benefits section" });

    await log({ level: "step", message: "Check 'Entrega rápida' benefit" });
    await expect(page.getByText("Entrega rápida")).toBeVisible();
    await expect(page.getByText("En menos de 24 horas")).toBeVisible();

    await log({ level: "step", message: "Check 'Proveedores verificados' benefit" });
    await expect(page.getByText("Proveedores verificados")).toBeVisible();

    await log({ level: "step", message: "Check 'Sin cuenta requerida' benefit" });
    await expect(page.getByText("Sin cuenta requerida")).toBeVisible();

    await log({ level: "success", message: "All benefits verified" });
  });

  test("displays login links for Consumer and Provider", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Locate login links in footer" });

    await log({ level: "step", message: "Verify Consumer login link" });
    const consumerLink = page.getByRole("link", { name: /Consumidor/i });
    await expect(consumerLink).toBeVisible();
    await expect(consumerLink).toHaveAttribute("href", "/login?role=consumer");

    await log({ level: "step", message: "Verify Provider login link" });
    const providerLink = page.getByRole("link", { name: /Proveedor/i });
    await expect(providerLink).toBeVisible();
    await expect(providerLink).toHaveAttribute("href", "/login?role=supplier");

    await log({ level: "success", message: "Login links verified" });
  });

  test("displays admin access link", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Locate admin link" });
    const adminLink = page.getByTestId("admin-access-link");
    await expect(adminLink).toBeVisible();
    await expect(adminLink).toHaveAttribute("href", "/admin");
    await expect(adminLink).toContainText("Administración");

    await log({ level: "success", message: "Admin link verified" });
  });
});

test.describe("Network Monitoring Demo", () => {
  test("detects API errors automatically with networkErrorMonitor", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate with network error monitoring" });
    // networkErrorMonitor is active - any 4xx/5xx will fail the test
    await page.goto("/");

    await log({ level: "step", message: "Verify page loaded successfully" });
    await expect(page.getByTestId("request-water-button")).toBeVisible();

    // If any API call returned 4xx/5xx, test would have failed automatically
    await log({ level: "success", message: "No API errors detected - test passes" });
  });
});
