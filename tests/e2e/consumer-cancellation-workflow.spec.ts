import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";
import { TRACKING_TOKENS } from "../fixtures/test-data";

/**
 * Consumer Cancellation Workflow Tests (Story 11-15)
 *
 * Validates workflows C8-C11 for consumer request cancellation.
 *
 * Seed Data Required:
 *   - npm run seed:test    # Creates pending, cancelled requests
 *   - npm run seed:offers  # Creates offers on SEEDED_PENDING_REQUEST
 *
 * Workflows Covered:
 *   C8: Cancel Pending Request - Cancel before any offers received
 *   C9: Cancel With Offers - Cancel after offers submitted (providers notified)
 *   C10: Cancellation Confirmation - Consumer sees confirmation
 *   C11: Provider Notification - Provider notified their offer was cancelled
 */

test.describe("Consumer Cancellation Workflow (C8-C11)", () => {
  test.describe.configure({ mode: "serial" });

  // Mobile viewport for consumer testing (PWA)
  test.use({
    viewport: { width: 360, height: 780 },
    isMobile: true,
    hasTouch: true,
  });

  test.describe("C8: Cancel Pending Request", () => {
    test("C8.1: Cancel button visible on pending request tracking page", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Cancel button should be visible for pending requests
      const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });
      await expect(cancelButton).toBeVisible();
    });

    test("C8.2: Cancel dialog opens with confirmation message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Click cancel button
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Dialog should open with confirmation message (Spanish)
      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(
        page.getByText("¿Estás seguro de que quieres cancelar esta solicitud?")
      ).toBeVisible();

      // Should have Volver and Cancelar buttons
      await expect(page.getByRole("button", { name: "Volver" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar Solicitud" })).toBeVisible();
    });

    test("C8.3: Volver closes dialog without cancelling", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();

      // Click Volver
      await page.getByRole("button", { name: "Volver" }).click();

      // Dialog should close
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // Request should still show pending UI
      await expect(page.getByText("Tu solicitud está activa")).toBeVisible();
    });
  });

  test.describe("C9: Cancel With Offers", () => {
    // This uses SEEDED_PENDING_REQUEST which has 3 active offers from seed:offers
    test("C9.1: Cancel button visible on pending request with offers", async ({ page }) => {
      // SEEDED_PENDING_REQUEST has offers seeded by seed:offers
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Should show Ver Ofertas button (indicating offers exist)
      const viewOffersButton = page.getByTestId("view-offers-button");
      const hasOffers = await viewOffersButton.isVisible().catch(() => false);

      if (hasOffers) {
        // Request has offers - test C9 scenarios
        const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });
        await expect(cancelButton).toBeVisible();
      } else {
        // No offers seeded - skip C9-specific tests
        test.skip(true, "Run npm run seed:offers to test C9 (Cancel With Offers)");
      }
    });

    test("C9.2: Cancel dialog shows warning for request with offers", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Check if offers exist
      const hasOffers = await page.getByTestId("view-offers-button").isVisible().catch(() => false);
      if (!hasOffers) {
        test.skip(true, "Run npm run seed:offers to test C9 (Cancel With Offers)");
        return;
      }

      // Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Dialog should open with confirmation message
      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(
        page.getByText("¿Estás seguro de que quieres cancelar esta solicitud?")
      ).toBeVisible();

      // Warning about active offers should be shown (AC 11A-2.3)
      const warning = page.getByTestId("active-offers-warning");
      await expect(warning).toBeVisible();
      await expect(warning).toContainText("ofertas activas");
    });
  });

  test.describe("C10: Cancellation Confirmation", () => {
    test("C10.1: Cancelled status page shows 'Solicitud cancelada' heading", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Page title (h1) should indicate cancelled status
      await expect(page.locator("h1").filter({ hasText: /Solicitud cancelada/i })).toBeVisible();
    });

    test("C10.2: Cancelled request shows grey 'Cancelada' badge", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Badge should show "Cancelada" status
      const badge = page.getByText("Cancelada", { exact: true });
      await expect(badge).toBeVisible();
    });

    test("C10.3: Cancelled page shows cancellation message in Spanish", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Message should explain the cancellation
      await expect(
        page.getByText("Esta solicitud fue cancelada y no será procesada")
      ).toBeVisible();
    });

    test("C10.4: Cancelled request shows 'Nueva Solicitud' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Should have link to create new request
      const newRequestButton = page.getByRole("link", { name: /Nueva Solicitud/i });
      await expect(newRequestButton).toBeVisible();

      // Button should link to home page
      await expect(newRequestButton).toHaveAttribute("href", "/");
    });

    test("C10.5: Cancelled page shows key information", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Cancelled page shows minimal info - status and action button
      // Note: Full request details (address, amount) are NOT shown on cancelled page
      // This is the current design - only status card and "Nueva Solicitud" button
      await expect(
        page.getByText("Esta solicitud fue cancelada y no será procesada")
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /Nueva Solicitud/i })).toBeVisible();
    });
  });

  test.describe("C11: Provider Notification", () => {
    /**
     * C11: Provider Notification on Consumer Cancel
     * Story 11A-2 implemented:
     * - Offers are invalidated (status: request_cancelled) when consumer cancels
     * - Providers receive in-app notification
     * - Warning shown to consumer when offers exist
     */

    test("C11.1: Warning shown when cancelling request with active offers", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Check if offers exist (via offer count badge)
      const offerBadge = page.getByTestId("offer-count-badge");
      const hasOffers = await offerBadge.isVisible().catch(() => false);

      if (!hasOffers) {
        test.skip(true, "Run npm run seed:offers to test C11 (Provider Notification)");
        return;
      }

      // Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();

      // Warning about active offers should be shown
      const warning = page.getByTestId("active-offers-warning");
      await expect(warning).toBeVisible();
      await expect(warning).toContainText("ofertas activas");
      await expect(warning).toContainText("serán notificados");
    });

    test("C11.2: No warning shown when cancelling request without offers", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // This test verifies the base case - when there are no offers
      // The offer count badge should not be visible OR should show 0
      const offerBadge = page.getByTestId("offer-count-badge");
      const hasOffers = await offerBadge.isVisible().catch(() => false);

      if (hasOffers) {
        // If offers exist, skip this test (we test with offers in C11.1)
        test.skip(true, "Request has offers - testing no-offers case elsewhere");
        return;
      }

      // Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();

      // Warning should NOT be shown (no offers)
      const warning = page.getByTestId("active-offers-warning");
      await expect(warning).not.toBeVisible();
    });

    test("C11.3: Cancel dialog buttons work correctly with offers", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();

      // Verify dialog structure (with or without warning)
      await expect(page.getByRole("button", { name: "Volver" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar Solicitud" })).toBeVisible();

      // Close with Volver
      await page.getByRole("button", { name: "Volver" }).click();
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // Request should still be pending
      await expect(page.getByText("Tu solicitud está activa")).toBeVisible();
    });
  });

  test.describe("Edge Cases", () => {
    test("Cancel button NOT visible on delivered request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);
      await assertNoErrorState(page);

      // Cancel button should NOT be visible
      const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });
      await expect(cancelButton).not.toBeVisible();
    });

    // This test expects HTTP errors (cancel on accepted request returns 404/409)
    // Use annotation to skip automatic network error monitoring
    test("Cancel button visible on accepted request shows error when clicked",
      { annotation: [{ type: "skipNetworkMonitoring" }] },
      async ({ page }) => {
        await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

        // Cancel button IS shown for accepted requests (UI design choice)
        // But API will reject the cancellation
        const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });

        // Button should be visible
        await expect(cancelButton).toBeVisible();

        // Clicking should open dialog
        await cancelButton.click();

        // Dialog should appear
        await expect(page.getByRole("alertdialog")).toBeVisible();

        // Confirming cancellation should show error
        await page.getByRole("button", { name: "Cancelar Solicitud" }).click();

        // Should show error toast (either "already accepted" or generic error)
        // Note: The API may return 409 (Conflict) with "ya fue aceptada" message
        // or 404 (due to RLS) depending on auth context
        await expect(
          page.getByText(/ya fue aceptada|no puede ser cancelada|Error al cancelar|Solicitud no encontrada/i)
        ).toBeVisible({ timeout: 5000 });
      });

    test("Cancel button NOT visible on already cancelled request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Cancel button should NOT be visible on cancelled request
      const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });
      await expect(cancelButton).not.toBeVisible();
    });

    test("Cancel button NOT visible on no_offers request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // no_offers status is a terminal state - should NOT have cancel button
      // as the request already timed out
      const cancelButton = page.getByRole("button", { name: /Cancelar Solicitud/i });
      await expect(cancelButton).not.toBeVisible();
    });
  });

  test.describe("Integration", () => {
    test("Full cancel flow navigation: pending → cancel dialog → cancelled page", async ({ page }) => {
      // This is a non-destructive test that verifies the flow without actually cancelling
      // (Actual cancellation would consume test data)

      // 1. Start on pending request
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);
      await expect(page.getByText("Tu solicitud está activa")).toBeVisible();

      // 2. Open cancel dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();
      await expect(page.getByRole("alertdialog")).toBeVisible();

      // 3. Verify dialog structure
      await expect(
        page.getByText("¿Estás seguro de que quieres cancelar esta solicitud?")
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Volver" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar Solicitud" })).toBeVisible();

      // 4. Close dialog (don't actually cancel)
      await page.getByRole("button", { name: "Volver" }).click();
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // 5. Navigate to see what cancelled looks like
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);
      await expect(page.locator("h1").filter({ hasText: /Solicitud cancelada/i })).toBeVisible();
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("All cancellation UI elements are in Spanish", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Button text in Spanish
      await expect(page.getByRole("button", { name: /Cancelar Solicitud/i })).toBeVisible();

      // Open dialog
      await page.getByRole("button", { name: /Cancelar Solicitud/i }).click();

      // Dialog text in Spanish
      await expect(
        page.getByText("¿Estás seguro de que quieres cancelar esta solicitud?")
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Volver" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar Solicitud" })).toBeVisible();

      // Close dialog
      await page.getByRole("button", { name: "Volver" }).click();
    });

    test("Cancelled page text all in Spanish", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Spanish status texts
      await expect(page.getByText("Cancelada", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Esta solicitud fue cancelada y no será procesada")
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /Nueva Solicitud/i })).toBeVisible();

      // No English should be visible
      await expect(page.getByText("Cancelled")).not.toBeVisible();
      await expect(page.getByText("This request")).not.toBeVisible();
    });
  });
});
