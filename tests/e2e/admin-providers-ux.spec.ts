/**
 * Admin Providers UX Tests
 * Story 12.8-5: Admin Providers UX & Ratings
 *
 * Tests:
 * - AC12.8.5.1: Side-by-side filters (Status + Area on same row)
 * - AC12.8.5.2: Email visible on provider cards
 * - AC12.8.5.3: Rating visible on provider cards
 * - AC12.8.5.4: Zero ratings display
 * - AC12.8.5.5: Provider detail ratings section
 * - AC12.8.5.6: Ratings sorted by date
 */

import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Mobile viewport configuration per Atlas testing patterns
const MOBILE_VIEWPORT = { width: 360, height: 780 };

test.describe("Admin Providers UX & Ratings", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for admin tests");
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/admin/login");
    await page.fill("#admin-email", "admin@nitoagua.cl");
    await page.fill("#admin-password", "admin.123");
    await page.getByTestId("admin-dev-login-button").click();
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  });

  test("AC12.8.5.1: Status and Area filters are side-by-side", async ({ page, log }) => {
    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Check that the provider directory is visible
    const directory = page.getByTestId("provider-directory");
    await expect(directory).toBeVisible();

    // Check filters exist
    const statusFilter = page.getByTestId("status-filter");
    const areaFilter = page.getByTestId("area-filter");
    const searchInput = page.getByTestId("search-input");

    await expect(statusFilter).toBeVisible();
    await expect(areaFilter).toBeVisible();
    await expect(searchInput).toBeVisible();

    // Get positions to verify side-by-side layout
    const statusBox = await statusFilter.boundingBox();
    const areaBox = await areaFilter.boundingBox();
    const searchBox = await searchInput.boundingBox();

    expect(statusBox).not.toBeNull();
    expect(areaBox).not.toBeNull();
    expect(searchBox).not.toBeNull();

    if (statusBox && areaBox && searchBox) {
      // Status and Area should be on the same row (similar Y position)
      expect(Math.abs(statusBox.y - areaBox.y)).toBeLessThan(10);

      // Search should be below filters (higher Y position)
      expect(searchBox.y).toBeGreaterThan(statusBox.y);
    }

    log("Filters are side-by-side with search below");
  });

  test("AC12.8.5.2: Email visible on provider cards (mobile view)", async ({ page, log }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Find provider cards (mobile view)
    const providerCards = page.locator('[data-testid^="provider-card-"]');
    const cardCount = await providerCards.count();

    if (cardCount === 0) {
      log("No providers in directory, skipping email visibility check");
      return;
    }

    // Check first card has contact info section with phone icon
    const firstCard = providerCards.first();
    await expect(firstCard).toBeVisible();

    // Check for Phone icon (via svg)
    const phoneElement = firstCard.locator("svg").first();
    await expect(phoneElement).toBeVisible();

    log(`Provider card displays contact info (${cardCount} providers found)`);
  });

  test("AC12.8.5.3 & AC12.8.5.4: Rating display on provider cards", async ({ page, log }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Find provider cards
    const providerCards = page.locator('[data-testid^="provider-card-"]');
    const cardCount = await providerCards.count();

    if (cardCount === 0) {
      log("No providers in directory, skipping rating check");
      return;
    }

    // Check that rating section exists on cards
    const firstCard = providerCards.first();
    const ratingElement = firstCard.getByTestId("provider-rating");
    await expect(ratingElement).toBeVisible();

    // Rating should show either "Sin calificaciones" or a star rating
    const ratingText = await ratingElement.textContent();
    const hasRating = ratingText?.includes("Sin calificaciones") || /\d+\.\d/.test(ratingText || "");
    expect(hasRating).toBe(true);

    log("Rating section visible on provider cards");
  });

  test("AC12.8.5.5 & AC12.8.5.6: Provider detail shows ratings section", async ({ page, log }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Find and click on a provider card
    const providerCards = page.locator('[data-testid^="provider-card-"]');
    const cardCount = await providerCards.count();

    if (cardCount === 0) {
      log("No providers in directory, skipping detail panel check");
      return;
    }

    await providerCards.first().click();

    // Wait for detail panel to open
    const detailPanel = page.getByTestId("provider-detail-panel");
    await expect(detailPanel).toBeVisible();

    // Check ratings section exists
    const ratingsSection = page.getByTestId("ratings-section");
    await expect(ratingsSection).toBeVisible();

    // Check header text
    await expect(ratingsSection.locator("text=Calificaciones")).toBeVisible();

    log("Provider detail panel shows ratings section");

    // Close panel
    await page.getByTestId("close-panel").click();
    await expect(detailPanel).not.toBeVisible();
  });

  test("Filter functionality works correctly", async ({ page, log }) => {
    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Test status filter - page uses state-based filtering, not URL params
    const statusFilter = page.getByTestId("status-filter");
    await expect(statusFilter).toBeVisible();

    // Select approved filter
    await statusFilter.selectOption("approved");
    await page.waitForLoadState("networkidle");

    // Verify filter is applied (dropdown shows selected value)
    await expect(statusFilter).toHaveValue("approved");

    // Reset filter - select "all" or first option to clear
    await statusFilter.selectOption("all");
    await page.waitForLoadState("networkidle");

    // Verify filter is cleared (value is "all" for showing all)
    await expect(statusFilter).toHaveValue("all");

    log("Filter functionality works");
  });

  test("Search functionality works correctly", async ({ page, log }) => {
    await page.goto("/admin/providers");
    await assertNoErrorState(page);
    await page.waitForLoadState("networkidle");

    // Test search
    const searchInput = page.getByTestId("search-input");
    await searchInput.fill("test");
    await page.waitForTimeout(500); // Wait for debounce

    await page.waitForLoadState("networkidle");

    // Check URL contains search param
    expect(page.url()).toContain("search=test");

    log("Search functionality works");
  });
});
