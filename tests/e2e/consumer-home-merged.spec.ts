/**
 * Consumer Home Screen Tests - Using Merged Fixtures
 *
 * This is a migration of consumer-home.spec.ts to demonstrate
 * @seontechnologies/playwright-utils integration.
 *
 * Changes from original:
 * - Import from merged-fixtures instead of @playwright/test
 * - Added log() calls for better report visibility
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

  test("AC2-1-1 - displays big action button with correct dimensions", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Locate big action button" });
    const button = page.getByTestId("big-action-button");
    await expect(button).toBeVisible();

    await log({ level: "step", message: "Verify button dimensions (200x200px)" });
    const boundingBox = await button.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBe(200);
    expect(boundingBox!.height).toBe(200);

    await log({ level: "success", message: "Button text verified" });
    await expect(button).toContainText("Solicitar Agua");
  });

  test("AC2-1-4 - clicking button navigates to /request page", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Click big action button" });
    const button = page.getByTestId("big-action-button");
    await button.click();

    await log({ level: "step", message: "Wait for navigation to /request" });
    await page.waitForURL("**/request");

    await log({ level: "success", message: "Verify request page content" });
    expect(page.url()).toContain("/request");
    await expect(
      page.getByRole("heading", { name: "Solicitar Agua" })
    ).toBeVisible();
  });

  test("AC2-1-5 - bottom navigation displays 3 items", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Locate consumer navigation" });
    const nav = page.getByTestId("consumer-nav");
    await expect(nav).toBeVisible();

    await log({ level: "step", message: "Verify navigation has 3 links" });
    const navLinks = nav.locator("a");
    await expect(navLinks).toHaveCount(3);

    await log({ level: "success", message: "Spanish labels verified" });
    await expect(nav.getByText("Inicio")).toBeVisible();
    await expect(nav.getByText("Historial")).toBeVisible();
    await expect(nav.getByText("Perfil")).toBeVisible();
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
    await expect(page.getByTestId("big-action-button")).toBeVisible();

    // If any API call returned 4xx/5xx, test would have failed automatically
    await log({ level: "success", message: "No API errors detected - test passes" });
  });
});
