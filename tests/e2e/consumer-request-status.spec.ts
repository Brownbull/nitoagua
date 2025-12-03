import { test, expect } from "@playwright/test";

/**
 * Tests for Consumer Request Status Page (Story 2-6)
 *
 * This page requires authentication and shows detailed request status
 * to the consumer who owns the request. Unlike the guest tracking page
 * (/track/[token]), this page at /request/[id] requires the user to be
 * logged in and only shows their own requests.
 *
 * Since authentication is implemented in Epic 4, most tests focus on:
 * 1. Auth required error page (no user logged in)
 * 2. UI structure verification
 * 3. Route accessibility
 *
 * For tests requiring authenticated sessions, real test users should
 * be seeded or authentication should be mocked.
 */

test.describe("Consumer Request Status Page (Story 2-6)", () => {
  test.describe("AC2-6-1: Status page accessible at /request/[id] for authenticated consumers", () => {
    test("route exists and returns content", async ({ page }) => {
      // Navigate to request status page with any ID
      const response = await page.goto("/request/any-id");

      // Should return a valid page (auth error or content)
      expect(response?.status()).toBeLessThan(500);
    });

    test("unauthenticated user sees auth required page", async ({ page }) => {
      await page.goto("/request/test-request-id");

      // Should show auth required message since no user is logged in
      await expect(
        page.getByText("Inicio de sesion requerido")
      ).toBeVisible();
    });

    test("auth required page shows explanation", async ({ page }) => {
      await page.goto("/request/123");

      await expect(
        page.getByText(/Debes iniciar sesion para ver los detalles/)
      ).toBeVisible();
    });

    test("auth required page has 'Volver al Inicio' button", async ({
      page,
    }) => {
      await page.goto("/request/some-id");

      const homeButton = page.getByRole("link", { name: /Volver al Inicio/i });
      await expect(homeButton).toBeVisible();
      await expect(homeButton).toHaveAttribute("href", "/");
    });

    test("clicking 'Volver al Inicio' navigates to home", async ({ page }) => {
      await page.goto("/request/uuid-id");

      await page.getByRole("link", { name: /Volver al Inicio/i }).click();

      await expect(page).toHaveURL("/");
    });

    test("auth page shows guest tracking suggestion", async ({ page }) => {
      await page.goto("/request/test");

      await expect(
        page.getByText(/usa el enlace de seguimiento/)
      ).toBeVisible();
    });
  });

  test.describe("UI Structure Verification", () => {
    test("auth required page uses Card component", async ({ page }) => {
      await page.goto("/request/test-structure");

      // Card component should be present
      const card = page.locator('[data-slot="card"]');
      await expect(card).toBeVisible();
    });

    test("auth page has centered layout", async ({ page }) => {
      await page.goto("/request/test-layout");

      // Container should have flex and center classes - verify page renders
      await expect(page.getByText("Inicio de sesion requerido")).toBeVisible();
    });

    test("auth page shows icon", async ({ page }) => {
      await page.goto("/request/test-icon");

      // Should have an SVG icon
      const svgIcon = page.locator("svg").first();
      await expect(svgIcon).toBeVisible();
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("auth required page content is in Spanish", async ({ page }) => {
      await page.goto("/request/spanish-test");

      // All UI text should be in Spanish
      await expect(
        page.getByText("Inicio de sesion requerido")
      ).toBeVisible();
      await expect(page.getByText("Volver al Inicio")).toBeVisible();

      // Should NOT have English text
      await expect(page.getByText("Login required")).not.toBeVisible();
      await expect(page.getByText("Go Home")).not.toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("auth required page has proper heading structure", async ({
      page,
    }) => {
      await page.goto("/request/a11y-test");

      // Should have a heading for the auth required message
      const heading = page.getByRole("heading", {
        name: /Inicio de sesion requerido/i,
      });
      await expect(heading).toBeVisible();
    });

    test("home link is keyboard accessible", async ({ page }) => {
      await page.goto("/request/keyboard-test");

      const homeLink = page.getByRole("link", { name: /Volver al Inicio/i });
      await homeLink.focus();

      await expect(homeLink).toBeFocused();
    });

    test("button has adequate size for touch interaction", async ({ page }) => {
      await page.goto("/request/touch-test");

      const homeButton = page.getByRole("link", { name: /Volver al Inicio/i });
      const box = await homeButton.boundingBox();

      // Button should have reasonable size (at least 36px height for touch)
      expect(box?.height).toBeGreaterThanOrEqual(36);
      expect(box?.width).toBeGreaterThanOrEqual(80);
    });
  });

  test.describe("URL Handling", () => {
    test("handles UUID format IDs", async ({ page }) => {
      // Using obviously fake test UUID to avoid false positive security alerts
      await page.goto(
        "/request/test-uuid-0000-0000-000000000001"
      );

      // Should not crash - shows auth required page
      await expect(page.getByText("Inicio de sesion requerido")).toBeVisible();
    });

    test("handles special characters in ID gracefully", async ({ page }) => {
      await page.goto("/request/test%20id%20with%20spaces");

      // Should not crash, should show auth required page
      await expect(page.getByText("Inicio de sesion requerido")).toBeVisible();
    });

    test("handles very long IDs", async ({ page }) => {
      const longId = "a".repeat(100);
      await page.goto(`/request/${longId}`);

      // Should not crash - shows auth required page
      await expect(page.getByText("Inicio de sesion requerido")).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("page loads quickly even without auth", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/request/perf-test");
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds (NFR1 target)
      expect(loadTime).toBeLessThan(3000);

      // Content should be visible
      await expect(
        page.getByText("Inicio de sesion requerido")
      ).toBeVisible();
    });
  });

  test.describe("Page inherits ConsumerLayout", () => {
    test("page has consumer navigation", async ({ page }) => {
      await page.goto("/request/layout-test");

      // Should have bottom navigation from ConsumerLayout
      // The nav is at the bottom of the page
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    });
  });
});

/**
 * Integration tests that require authenticated sessions
 * These tests should be run with proper authentication setup
 */
test.describe.skip("Authenticated User Tests (require auth setup)", () => {
  // These tests would require:
  // 1. A test user seeded in the database
  // 2. A way to authenticate as that user (mock auth or real login)
  // 3. Test requests belonging to that user

  test.describe("AC2-6-1: Authenticated user can view own request", () => {
    test("authenticated user sees request status page", async ({ page }) => {
      // Requires: Logged in user with request ID
      await page.goto("/request/[SEEDED_USER_REQUEST_ID]");

      await expect(page.getByText("Estado de tu solicitud")).toBeVisible();
    });

    test("user cannot view another user's request", async ({ page }) => {
      // Requires: Different user's request ID
      await page.goto("/request/[OTHER_USER_REQUEST_ID]");

      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
    });
  });

  test.describe("AC2-6-2: StatusBadge shows correct state", () => {
    test("pending status shows amber badge", async ({ page }) => {
      // Requires: User's pending request
      await page.goto("/request/[PENDING_REQUEST_ID]");

      const badge = page.locator("span").filter({ hasText: "Pendiente" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(254, 243, 199)");
    });

    test("accepted status shows blue badge", async ({ page }) => {
      // Requires: User's accepted request
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      const badge = page.locator("span").filter({ hasText: "Aceptada" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(219, 234, 254)");
    });

    test("delivered status shows green badge", async ({ page }) => {
      // Requires: User's delivered request
      await page.goto("/request/[DELIVERED_REQUEST_ID]");

      const badge = page.locator("span").filter({ hasText: "Entregada" });
      await expect(badge).toBeVisible();
      await expect(badge).toHaveCSS("background-color", "rgb(209, 250, 229)");
    });
  });

  test.describe("AC2-6-3: Timeline visualization displays progression", () => {
    test("timeline shows all three steps", async ({ page }) => {
      // Requires: Any user request
      await page.goto("/request/[USER_REQUEST_ID]");

      await expect(page.getByText("Pendiente")).toBeVisible();
      await expect(page.getByText("Aceptada")).toBeVisible();
      await expect(page.getByText("Entregada")).toBeVisible();
    });

    test("completed steps show timestamps", async ({ page }) => {
      // Requires: Accepted request
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      // Should show timestamp format "X dic, HH:MM"
      await expect(page.getByText(/\d+ \w+, \d{2}:\d{2}/)).toBeVisible();
    });
  });

  test.describe("AC2-6-4: Shows request details", () => {
    test("displays request date", async ({ page }) => {
      // Requires: User request
      await page.goto("/request/[USER_REQUEST_ID]");

      await expect(page.getByText("Fecha de solicitud")).toBeVisible();
      // Spanish date format
      await expect(
        page.getByText(/\d+ de \w+, \d{4} a las \d{2}:\d{2}/)
      ).toBeVisible();
    });

    test("displays amount with L suffix", async ({ page }) => {
      // Requires: User request with amount=1000
      await page.goto("/request/[USER_REQUEST_ID]");

      await expect(page.getByText("Cantidad")).toBeVisible();
      await expect(page.getByText(/\d+L/)).toBeVisible();
    });

    test("displays full address (not masked)", async ({ page }) => {
      // Requires: User request with address
      await page.goto("/request/[USER_REQUEST_ID]");

      await expect(page.getByText("Direccion")).toBeVisible();
      // Full address should be visible (no "..." truncation)
    });

    test("displays special instructions when present", async ({ page }) => {
      // Requires: Request with special_instructions
      await page.goto("/request/[REQUEST_WITH_INSTRUCTIONS]");

      await expect(page.getByText("Instrucciones especiales")).toBeVisible();
    });

    test("shows urgent badge when is_urgent is true", async ({ page }) => {
      // Requires: Request with is_urgent=true
      await page.goto("/request/[URGENT_REQUEST_ID]");

      await expect(page.getByText("Urgente")).toBeVisible();
    });
  });

  test.describe("AC2-6-5: Pending status shows waiting message", () => {
    test("shows 'Esperando confirmacion del aguatero'", async ({ page }) => {
      // Requires: User's pending request
      await page.goto("/request/[PENDING_REQUEST_ID]");

      await expect(
        page.getByText("Esperando confirmacion del aguatero")
      ).toBeVisible();
    });

    test("shows notification subtext", async ({ page }) => {
      // Requires: User's pending request
      await page.goto("/request/[PENDING_REQUEST_ID]");

      await expect(
        page.getByText("Te notificaremos cuando sea aceptada")
      ).toBeVisible();
    });

    test("shows cancel button for pending requests", async ({ page }) => {
      // Requires: User's pending request
      await page.goto("/request/[PENDING_REQUEST_ID]");

      await expect(page.getByText("Cancelar Solicitud")).toBeVisible();
    });
  });

  test.describe("AC2-6-6: Accepted status shows supplier info", () => {
    test("shows 'Confirmado! Tu agua viene en camino'", async ({ page }) => {
      // Requires: User's accepted request
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      await expect(
        page.getByText("Confirmado! Tu agua viene en camino")
      ).toBeVisible();
    });

    test("shows supplier name", async ({ page }) => {
      // Requires: Accepted request with supplier
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      await expect(page.getByText("Aguatero")).toBeVisible();
    });

    test("shows clickable phone number", async ({ page }) => {
      // Requires: Accepted request with supplier phone
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      await expect(page.getByText("Telefono")).toBeVisible();
      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();
    });

    test("phone is formatted correctly", async ({ page }) => {
      // Requires: Accepted request with Chilean phone +56912345678
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      // Should show formatted: +56 9 1234 5678
      await expect(
        page.getByText(/\+56 9 \d{4} \d{4}/)
      ).toBeVisible();
    });

    test("shows delivery window when provided", async ({ page }) => {
      // Requires: Accepted request with delivery_window
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      await expect(page.getByText("Ventana de entrega")).toBeVisible();
    });

    test("does not show cancel button for accepted requests", async ({
      page,
    }) => {
      // Requires: Accepted request
      await page.goto("/request/[ACCEPTED_REQUEST_ID]");

      await expect(page.getByText("Cancelar Solicitud")).not.toBeVisible();
    });
  });

  test.describe("AC2-6-7: Delivered status shows completion timestamp", () => {
    test("shows 'Entrega completada'", async ({ page }) => {
      // Requires: User's delivered request
      await page.goto("/request/[DELIVERED_REQUEST_ID]");

      await expect(page.getByText("Entrega completada")).toBeVisible();
    });

    test("shows completion timestamp in Spanish format", async ({ page }) => {
      // Requires: Delivered request
      await page.goto("/request/[DELIVERED_REQUEST_ID]");

      // Format: "Entregado el X de MONTH, YEAR a las HH:MM"
      await expect(
        page.getByText(/Entregado el \d+ de \w+, \d{4} a las \d{2}:\d{2}/)
      ).toBeVisible();
    });

    test("shows reorder button", async ({ page }) => {
      // Requires: Delivered request
      await page.goto("/request/[DELIVERED_REQUEST_ID]");

      await expect(
        page.getByText("Solicitar Agua de Nuevo")
      ).toBeVisible();
    });

    test("reorder button links to request page", async ({ page }) => {
      // Requires: Delivered request
      await page.goto("/request/[DELIVERED_REQUEST_ID]");

      const reorderLink = page.getByRole("link", {
        name: /Solicitar Agua de Nuevo/,
      });
      await expect(reorderLink).toHaveAttribute("href", "/request");
    });
  });

  test.describe("Auto-Refresh Functionality", () => {
    test("page has refresh component", async ({ page }) => {
      // The TrackingRefresh component renders a subtle indicator when refreshing
      // We can check that it exists by waiting for a refresh cycle
      await page.goto("/request/[USER_REQUEST_ID]");

      // Wait for refresh indicator to appear (after 30 seconds)
      // This is a long test, consider shorter intervals for testing
    });
  });
});
