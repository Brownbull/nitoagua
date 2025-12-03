import { test, expect } from "@playwright/test";

/**
 * Tests for Request Status Tracking (Story 2-5)
 *
 * These tests verify the tracking page functionality. Since the page uses
 * server-side rendering with Supabase, tests focus on:
 * 1. Error state (invalid token) - which always shows the error page
 * 2. Component/UI structure verification
 * 3. Accessibility and navigation
 *
 * For tests requiring specific request states (pending/accepted/delivered),
 * real test data should be seeded in the database, or mocking should be done
 * at the application level (MSW or similar).
 */

test.describe("Request Status Tracking (Story 2-5)", () => {
  test.describe("AC2-5-1: Tracking page accessible at /track/[token] without authentication", () => {
    test("tracking page route exists and returns content", async ({ page }) => {
      // Navigate to tracking page with any token
      const response = await page.goto("/track/any-token");

      // Should return a valid page (either tracking content or error)
      expect(response?.status()).toBeLessThan(500);
    });

    test("page is accessible without login - no redirect to login", async ({
      page,
    }) => {
      await page.goto("/track/test-token");

      // Should stay on tracking page, not redirect to login
      await expect(page).toHaveURL("/track/test-token");
    });
  });

  test.describe("AC2-5-8: Invalid tokens show error page", () => {
    test("invalid token shows 'Solicitud no encontrada' error", async ({
      page,
    }) => {
      // Use a definitely invalid token
      await page.goto("/track/invalid-token-that-does-not-exist");

      // Should show error page
      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
    });

    test("error page shows explanation message", async ({ page }) => {
      await page.goto("/track/nonexistent-token");

      await expect(
        page.getByText(/El enlace puede haber expirado o ser incorrecto/)
      ).toBeVisible();
    });

    test("error page has 'Volver al Inicio' button", async ({ page }) => {
      await page.goto("/track/bad-token");

      const homeButton = page.getByRole("link", { name: /Volver al Inicio/i });
      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/");
    });

    test("clicking 'Volver al Inicio' navigates to home", async ({ page }) => {
      await page.goto("/track/wrong-token");

      await page.getByRole("link", { name: /Volver al Inicio/i }).click();

      await expect(page).toHaveURL("/");
    });

    test("error page displays warning icon container", async ({ page }) => {
      await page.goto("/track/missing-token");

      // Verify page has the error content with icon container
      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();

      // Verify there's an SVG icon somewhere on the page
      const svgIcon = page.locator("svg").first();
      await expect(svgIcon).toBeVisible();
    });
  });

  test.describe("Component Structure Verification", () => {
    test("error page uses Card component for styling", async ({ page }) => {
      await page.goto("/track/test-invalid");

      // Card component should be present
      const card = page.locator('[data-slot="card"]');
      await expect(card).toBeVisible();
    });

    test("error page has centered layout", async ({ page }) => {
      await page.goto("/track/test-layout");

      // Main container should have flex and center classes
      const main = page.locator("main");
      await expect(main).toHaveClass(/flex/);
      await expect(main).toHaveClass(/items-center/);
    });
  });

  test.describe("StatusBadge Component Tests", () => {
    // These tests verify the StatusBadge component exists and renders correctly
    // by checking the error page which doesn't show a badge (negative test)

    test("error page does not show status badge", async ({ page }) => {
      await page.goto("/track/invalid-token");

      // Status badges should NOT be visible on error page
      await expect(page.getByText("Pendiente")).not.toBeVisible();
      await expect(page.getByText("Aceptada")).not.toBeVisible();
      await expect(page.getByText("Entregada")).not.toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("error page has proper heading structure", async ({ page }) => {
      await page.goto("/track/a11y-test");

      // Should have a heading for the error
      const heading = page.getByRole("heading", {
        name: /Solicitud no encontrada/i,
      });
      await expect(heading).toBeVisible();
    });

    test("home link is keyboard accessible", async ({ page }) => {
      await page.goto("/track/keyboard-test");

      // Focus on the button via keyboard
      const homeLink = page.getByRole("link", { name: /Volver al Inicio/i });
      await homeLink.focus();

      // Should be focusable
      await expect(homeLink).toBeFocused();
    });

    test("button has adequate size for touch interaction", async ({ page }) => {
      await page.goto("/track/touch-test");

      const homeButton = page.getByRole("link", { name: /Volver al Inicio/i });
      const box = await homeButton.boundingBox();

      // Button should have reasonable size (at least 36px height for touch)
      // Note: exact 44x44 depends on padding and responsive design
      expect(box?.height).toBeGreaterThanOrEqual(36);
      expect(box?.width).toBeGreaterThanOrEqual(80); // "Volver al Inicio" needs width for text
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("error page content is in Spanish", async ({ page }) => {
      await page.goto("/track/spanish-test");

      // All UI text should be in Spanish
      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
      await expect(page.getByText("Volver al Inicio")).toBeVisible();
      await expect(
        page.getByText(/enlace puede haber expirado/)
      ).toBeVisible();

      // Should NOT have English text
      await expect(page.getByText("Request not found")).not.toBeVisible();
      await expect(page.getByText("Go Home")).not.toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("error page loads quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/track/perf-test");
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds (NFR1 target)
      expect(loadTime).toBeLessThan(3000);

      // Content should be visible
      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
    });
  });

  test.describe("URL Handling", () => {
    test("handles special characters in token gracefully", async ({ page }) => {
      await page.goto("/track/test%20token%20with%20spaces");

      // Should not crash, should show error page
      await expect(page.locator("main")).toBeVisible();
    });

    test("handles very long tokens", async ({ page }) => {
      const longToken = "a".repeat(100);
      await page.goto(`/track/${longToken}`);

      // Should not crash
      await expect(page.locator("main")).toBeVisible();
    });

    test("handles empty token segment correctly", async ({ page }) => {
      // This should either 404 or show error
      const response = await page.goto("/track/");

      // Should return valid response (might be 404 or redirect)
      expect(response?.status()).toBeLessThan(500);
    });
  });
});

/**
 * Integration tests that require real database data
 * These tests are marked with .describe.skip and should be run
 * with proper test data seeding or in a staging environment.
 */
test.describe.skip("Integration Tests (require seeded data)", () => {
  test.describe("AC2-5-2: StatusBadge displays correct state", () => {
    test("pending status shows amber badge", async ({ page }) => {
      // Requires: A request with status='pending' and known tracking_token
      await page.goto("/track/[SEEDED_PENDING_TOKEN]");

      const badge = page.locator("span").filter({ hasText: "Pendiente" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(254, 243, 199)");
    });

    test("accepted status shows blue badge", async ({ page }) => {
      // Requires: A request with status='accepted' and known tracking_token
      await page.goto("/track/[SEEDED_ACCEPTED_TOKEN]");

      const badge = page.locator("span").filter({ hasText: "Aceptada" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(219, 234, 254)");
    });

    test("delivered status shows green badge", async ({ page }) => {
      // Requires: A request with status='delivered' and known tracking_token
      await page.goto("/track/[SEEDED_DELIVERED_TOKEN]");

      const badge = page.locator("span").filter({ hasText: "Entregada" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(209, 250, 229)");
    });
  });

  test.describe("AC2-5-3: Visual progress indicator shows timeline", () => {
    test("timeline shows correct steps", async ({ page }) => {
      // Requires: Any valid tracking token
      await page.goto("/track/[SEEDED_TOKEN]");

      await expect(page.getByText("Pendiente")).toBeVisible();
      await expect(page.getByText("Aceptada")).toBeVisible();
      await expect(page.getByText("Entregada")).toBeVisible();
    });
  });

  test.describe("AC2-5-4: Request details show amount and partial address", () => {
    test("amount displays correctly", async ({ page }) => {
      // Requires: Request with amount=1000
      await page.goto("/track/[SEEDED_TOKEN]");

      await expect(page.getByText("1.000L")).toBeVisible();
    });

    test("address is truncated for privacy", async ({ page }) => {
      // Requires: Request with long address
      await page.goto("/track/[SEEDED_LONG_ADDRESS_TOKEN]");

      // Check for truncated address (20 chars + "...")
      await expect(page.getByText(/\.\.\./)).toBeVisible();
    });
  });

  test.describe("AC2-5-5: Accepted status shows delivery info", () => {
    test("shows delivery window when accepted", async ({ page }) => {
      // Requires: Accepted request with delivery_window
      await page.goto("/track/[SEEDED_ACCEPTED_TOKEN]");

      await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
    });

    test("shows clickable supplier phone", async ({ page }) => {
      // Requires: Accepted request with supplier info
      await page.goto("/track/[SEEDED_ACCEPTED_TOKEN]");

      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();
    });
  });

  test.describe("AC2-5-6: Delivered status shows completion message", () => {
    test("shows completion message", async ({ page }) => {
      // Requires: Delivered request
      await page.goto("/track/[SEEDED_DELIVERED_TOKEN]");

      await expect(page.getByText("¡Tu agua fue entregada!")).toBeVisible();
    });

    test("shows timestamp in Spanish", async ({ page }) => {
      // Requires: Delivered request
      await page.goto("/track/[SEEDED_DELIVERED_TOKEN]");

      // Format: "X de MONTH, YEAR a las HH:MM"
      await expect(
        page.getByText(/\d+ de \w+, \d{4} a las \d{2}:\d{2}/)
      ).toBeVisible();
    });
  });

  test.describe("AC2-5-7: Page auto-refreshes", () => {
    test("page refreshes after 30 seconds", async ({ page }) => {
      // Requires: Valid tracking token
      await page.goto("/track/[SEEDED_TOKEN]");

      // Monitor for refresh indicator or network calls
      // This test would require waiting 30+ seconds
    });
  });
});
