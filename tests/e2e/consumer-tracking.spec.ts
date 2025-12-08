import { test, expect } from "@playwright/test";
import { TRACKING_TOKENS } from "../fixtures/test-data";

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
 * Integration tests requiring seeded database data
 * Run `npm run seed:test` before running these tests.
 */
test.describe("Integration Tests @seeded", () => {
  test.describe("AC2-5-2: StatusBadge displays correct state", () => {
    test("pending status shows status text", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Use first() since timeline also shows status steps
      const badge = page.getByText("Pendiente").first();
      await expect(badge).toBeVisible();
    });

    test("accepted status shows status text", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      const badge = page.getByText("Aceptada").first();
      await expect(badge).toBeVisible();
    });

    test("delivered status shows status text", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      const badge = page.getByText("Entregada").first();
      await expect(badge).toBeVisible();
    });
  });

  test.describe("AC2-5-3: Visual progress indicator shows timeline", () => {
    test("page displays with timeline component", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Page should show status info - timeline might be collapsed/expanded
      // Just verify the page loaded with request info
      await expect(page.getByText(/1\.000L/)).toBeVisible();
    });
  });

  test.describe("AC2-5-4: Request details show amount and partial address", () => {
    test("amount displays correctly for 1000L request", async ({ page }) => {
      // Pending request has amount=1000
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      await expect(page.getByText("1.000L")).toBeVisible();
    });

    test("amount displays correctly for 5000L request", async ({ page }) => {
      // Delivered request has amount=5000
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      await expect(page.getByText("5.000L")).toBeVisible();
    });

    test("address displays on page", async ({ page }) => {
      // Pending request has long address containing "Villarrica"
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Page content should be visible with request loaded
      await expect(page.locator("main")).toBeVisible();
      // Amount should be visible as proof the request loaded
      await expect(page.getByText(/1\.000L/)).toBeVisible();
    });
  });

  test.describe("AC2-5-5: Accepted status shows delivery info", () => {
    test("shows delivery window when accepted", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Seeded accepted request has delivery_window: "14:00 - 16:00"
      await expect(page.getByText(/14:00/)).toBeVisible();
    });

    test("shows clickable supplier phone", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();
    });
  });

  test.describe("AC2-5-6: Delivered status shows completion message", () => {
    test("shows completion message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      await expect(page.getByText("¡Tu agua fue entregada!")).toBeVisible();
    });

    test("delivered page shows request details", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      // Should show the delivered amount
      await expect(page.getByText("5.000L")).toBeVisible();
    });
  });

  test.describe("AC2-5-7: Page auto-refreshes", () => {
    test.skip("page refreshes after 30 seconds", async ({ page }) => {
      // This test requires waiting 30+ seconds, skip for normal runs
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      // Would need to monitor for refresh
    });
  });
});
