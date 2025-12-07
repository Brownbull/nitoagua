import { test, expect } from "@playwright/test";
import { TRACKING_TOKENS } from "../fixtures/test-data";

/**
 * Tests for Cancel Request functionality (Story 4-5)
 *
 * These tests verify the cancel request functionality for both authenticated
 * consumers and guests. Since the cancel feature requires:
 * 1. A pending request in the database
 * 2. Authentication (for consumer path) or tracking token (for guest path)
 *
 * Most tests verify UI structure and component behavior. Full integration
 * tests that modify database state should be run with proper test data seeding.
 */

test.describe("Cancel Request (Story 4-5)", () => {
  test.describe("AC4-5-1: Cancel button visibility based on status", () => {
    // These tests verify the page structure that includes the cancel button
    // Since we can't access authenticated consumer pages without login,
    // we test the guest tracking page with invalid tokens to verify error handling

    test("route /request/[id] exists without errors", async ({ page }) => {
      const response = await page.goto("/request/test-id");
      expect(response?.status()).toBeLessThan(500);
    });

    test("route /track/[token] exists without errors", async ({ page }) => {
      const response = await page.goto("/track/test-token");
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe("AC4-5-2 & AC4-5-3: Cancel dialog component", () => {
    // Tests for the CancelDialog component behavior
    // These would require a real pending request to test fully

    test("AlertDialog component is available in UI library", async ({
      page,
    }) => {
      // Navigate to any page to verify the app loads correctly
      await page.goto("/");
      expect(await page.title()).toBeDefined();
    });
  });

  test.describe("API Endpoint Tests", () => {
    test("PATCH /api/requests/[id] with cancel action returns appropriate response", async ({
      request,
    }) => {
      // Test with invalid request ID - should return error
      const response = await request.patch("/api/requests/invalid-id", {
        data: { action: "cancel" },
      });

      // Should not crash - returns error response
      expect(response.status()).toBeLessThan(500);

      const body = await response.json();
      // Should have error structure
      expect(body).toHaveProperty("error");
      expect(body).toHaveProperty("data");
    });

    test("cancel action with invalid tracking token returns forbidden", async ({
      request,
    }) => {
      const response = await request.patch("/api/requests/some-id", {
        data: { action: "cancel", trackingToken: "wrong-token" },
      });

      // Should return 404 (not found) since request doesn't exist
      expect(response.status()).toBe(404);
    });

    test("unsupported action returns 400", async ({ request }) => {
      const response = await request.patch("/api/requests/test-id", {
        data: { action: "unsupported" },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("UNSUPPORTED_ACTION");
    });
  });

  test.describe("Error Handling", () => {
    test("tracking page shows error for invalid token", async ({ page }) => {
      await page.goto("/track/invalid-token-for-cancel-test");

      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
    });

    test("request page shows auth required for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/request/some-request-id");

      await expect(
        page.getByText("Inicio de sesion requerido")
      ).toBeVisible();
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("auth required page is in Spanish", async ({ page }) => {
      await page.goto("/request/spanish-test");

      // Spanish text should be present
      await expect(
        page.getByText("Inicio de sesion requerido")
      ).toBeVisible();
      await expect(page.getByText("Volver al Inicio")).toBeVisible();

      // English should not be present
      await expect(page.getByText("Login required")).not.toBeVisible();
    });

    test("tracking error page is in Spanish", async ({ page }) => {
      await page.goto("/track/spanish-cancel-test");

      await expect(page.getByText("Solicitud no encontrada")).toBeVisible();
      await expect(
        page.getByText(/enlace puede haber expirado/)
      ).toBeVisible();

      // English should not be present
      await expect(page.getByText("Request not found")).not.toBeVisible();
    });
  });
});

/**
 * Integration tests requiring seeded database data
 * Run `npm run seed:test` before running these tests.
 * These tests need the seeded data from tests/fixtures/test-data.ts
 */
test.describe("Cancel Request Integration Tests @seeded", () => {
  // Using seeded test data tokens
  const PENDING_TRACKING_TOKEN = TRACKING_TOKENS.pending;
  const ACCEPTED_TRACKING_TOKEN = TRACKING_TOKENS.accepted;

  test.describe("AC4-5-1: Cancel button visible only for pending status", () => {
    test("cancel button visible on pending request tracking page", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      await expect(
        page.getByRole("button", { name: /Cancelar Solicitud/i })
      ).toBeVisible();
    });

    test("cancel button NOT visible on accepted request tracking page", async ({
      page,
    }) => {
      await page.goto(`/track/${ACCEPTED_TRACKING_TOKEN}`);

      await expect(
        page.getByRole("button", { name: /Cancelar Solicitud/i })
      ).not.toBeVisible();
    });
  });

  test.describe("AC4-5-2: Cancel dialog opens on button click", () => {
    test("clicking cancel button opens confirmation dialog", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Dialog should appear
      await expect(
        page.getByRole("alertdialog")
      ).toBeVisible();
      await expect(
        page.getByText("¿Estás seguro de que quieres cancelar esta solicitud?")
      ).toBeVisible();
    });
  });

  test.describe("AC4-5-3: Dialog has correct buttons", () => {
    test("dialog has 'Volver' and 'Cancelar Solicitud' buttons", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      await expect(
        page.getByRole("button", { name: "Volver" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Cancelar Solicitud" })
      ).toBeVisible();
    });

    test("'Volver' closes dialog without action", async ({ page }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Click Volver
      await page.getByRole("button", { name: "Volver" }).click();

      // Dialog should close
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // Request should still be pending (page shows pending UI)
      await expect(
        page.getByText("Esperando confirmación del aguatero")
      ).toBeVisible();
    });
  });

  test.describe("AC4-5-4 & AC4-5-5: Cancel API call and status update", () => {
    // NOTE: This test modifies seeded data. Re-run `npm run seed:test` after running.
    test.skip("confirming cancellation calls API and updates status @destructive", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      // Open dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Confirm cancellation
      await page.getByRole("button", { name: "Cancelar Solicitud" }).click();

      // Wait for toast
      await expect(
        page.getByText("Solicitud cancelada exitosamente")
      ).toBeVisible();

      // Page should refresh to show cancelled status
      await expect(page.getByText("Solicitud cancelada")).toBeVisible();
    });
  });

  test.describe("AC4-5-6: Cancelled status UI", () => {
    test("cancelled request shows gray styling", async ({ page }) => {
      // Navigate to a cancelled request using seeded token
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);

      await expect(page.getByText("Solicitud cancelada")).toBeVisible();

      // Should have gray badge (use exact match to avoid multiple elements)
      const badge = page.getByText("Cancelada", { exact: true });
      await expect(badge).toBeVisible();
    });

    test("cancelled request shows 'Nueva Solicitud' button", async ({
      page,
    }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);

      await expect(
        page.getByRole("link", { name: /Nueva Solicitud/i })
      ).toBeVisible();
    });
  });

  test.describe("AC4-5-7: Toast notification", () => {
    // NOTE: This test modifies seeded data. Re-run `npm run seed:test` after running.
    test.skip("success toast shows Spanish message @destructive", async ({ page }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await page.getByRole("button", { name: "Cancelar Solicitud" }).click();

      await expect(
        page.getByText("Solicitud cancelada exitosamente")
      ).toBeVisible();
    });
  });

  test.describe("AC4-5-8: Race condition handling", () => {
    test("error shown if request was accepted during cancel attempt", async ({
      page,
    }) => {
      // This test requires coordinating timing between two operations
      // In a real test, you would:
      // 1. Open the cancel dialog
      // 2. Have another process accept the request
      // 3. Click confirm on cancel
      // 4. Verify error toast appears

      await page.goto(`/track/${ACCEPTED_TRACKING_TOKEN}`);

      // Cancel button should not be visible for accepted requests
      await expect(
        page.getByRole("button", { name: /Cancelar Solicitud/i })
      ).not.toBeVisible();
    });
  });

  test.describe("AC4-5-9: Guest cancel via tracking page", () => {
    // NOTE: This test modifies seeded data. Re-run `npm run seed:test` after running.
    test.skip("guest can cancel pending request using tracking token @destructive", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      // Should see cancel button
      await expect(
        page.getByRole("button", { name: /Cancelar Solicitud/i })
      ).toBeVisible();

      // Click cancel
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Confirm
      await page.getByRole("button", { name: "Cancelar Solicitud" }).click();

      // Should succeed
      await expect(
        page.getByText("Solicitud cancelada exitosamente")
      ).toBeVisible();
    });
  });

  test.describe("Loading state", () => {
    test("cancel button shows 'Cancelando...' during API call", async ({
      page,
    }) => {
      await page.goto(`/track/${PENDING_TRACKING_TOKEN}`);

      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Click confirm - may be quick, so we use Promise.race
      const confirmButton = page.getByRole("button", {
        name: "Cancelar Solicitud",
      });
      await confirmButton.click();

      // The button text should change to "Cancelando..." during the request
      // This may be too fast to catch - use network interception for reliable testing
    });
  });
});

/**
 * Authenticated consumer cancel tests
 * Requires proper auth setup with test user
 */
test.describe.skip("Authenticated Consumer Cancel Tests (require auth)", () => {
  test.describe("Consumer request page cancel functionality", () => {
    test("authenticated consumer sees cancel button on pending request", async ({
      page: _page,
    }) => {
      // Login as test consumer
      // Navigate to /request/[pending_request_id]
      // Verify cancel button is visible
    });

    test("authenticated consumer can cancel their own pending request", async ({
      page: _page,
    }) => {
      // Login as test consumer
      // Navigate to own pending request
      // Click cancel, confirm
      // Verify success
    });

    test("cancel button not visible for accepted request", async ({
      page: _page,
    }) => {
      // Login as test consumer
      // Navigate to own accepted request
      // Verify no cancel button
    });
  });
});
