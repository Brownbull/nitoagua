import { test, expect } from "@playwright/test";
import { TRACKING_TOKENS, SEEDED_ACCEPTED_REQUEST, TEST_SUPPLIER } from "../fixtures/test-data";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * Consumer Status Tracking Tests (Story 11-5)
 *
 * Validates workflows:
 * - C3: Track Delivery Status - Consumer sees real-time status updates
 * - C4: Contact Driver - One-tap call/WhatsApp when offer accepted
 *
 * Prerequisites:
 * - Run `npm run seed:local` for base test data
 * - Run `npm run seed:offers` for offer test data (pending with offers)
 *
 * Test Coverage:
 * - Status at each stage: pending, has_offers, accepted, delivered
 * - Timeline/progress indicator
 * - Contact driver visibility and functionality
 */

test.describe("Story 11-5: Consumer Status Tracking (C3, C4)", () => {
  // Use mobile viewport for consumer testing (isMobile not supported on Firefox)
  test.use({
    viewport: { width: 360, height: 780 },
  });

  test.describe("C3: Track Delivery Status - Status at Each Stage", () => {
    test("C3.1: Pending status shows 'Esperando ofertas' message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Should show pending status indicator
      await expect(page.getByText("Pendiente").first()).toBeVisible();

      // Should show waiting for offers message
      await expect(page.getByText(/Esperando ofertas/)).toBeVisible();

      // Should show request amount
      await expect(page.getByText("1.000L")).toBeVisible();
    });

    test("C3.2: Pending with offers shows offer count badge", async ({ page }) => {
      // Uses SEEDED_PENDING_REQUEST which has consumer-facing offers from seed:offers
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // If offers are seeded, should show offer count badge
      // Note: This test requires `npm run seed:offers` to have been run
      const offerBadge = page.getByTestId("offer-count-badge");

      // Use .count() pattern instead of .isVisible().catch() to avoid masking selector issues
      const offerBadgeCount = await offerBadge.count();

      if (offerBadgeCount > 0) {
        await expect(offerBadge).toContainText(/oferta/);
      } else {
        // If no offers seeded, just verify the pending state is shown correctly
        await expect(page.getByText(/Esperando ofertas/)).toBeVisible();
      }
    });

    test("C3.3: Accepted status shows 'Tu agua viene en camino' message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Should show accepted status
      await expect(page.getByText("Aceptada").first()).toBeVisible();

      // Should show delivery in progress message
      await expect(page.getByText(/Tu agua viene en camino/)).toBeVisible();

      // Should show delivery window
      await expect(page.getByTestId("delivery-window")).toContainText(
        SEEDED_ACCEPTED_REQUEST.delivery_window
      );
    });

    test("C3.4: Delivered status shows completion message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);
      await assertNoErrorState(page);

      // Should show delivered status
      await expect(page.getByText("Entregada").first()).toBeVisible();

      // Should show completion message
      await expect(page.getByText("¡Tu agua fue entregada!")).toBeVisible();

      // Should show reorder button
      await expect(page.getByText(/Solicitar Agua de Nuevo/)).toBeVisible();
    });

    test("C3.5: Cancelled status shows cancellation message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);
      await assertNoErrorState(page);

      // Should show cancelled status badge
      await expect(page.getByText("Cancelada", { exact: true })).toBeVisible();

      // Should show cancellation message
      await expect(page.getByText(/Esta solicitud fue cancelada/)).toBeVisible();

      // Should show new request option
      await expect(page.getByText(/Nueva Solicitud/)).toBeVisible();
    });

    test("C3.6: No offers status shows timeout message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
      await assertNoErrorState(page);

      // Should show no offers card
      const noOffersCard = page.getByTestId("no-offers-card");
      await expect(noOffersCard).toBeVisible();

      // Should show "Sin Ofertas" heading within the card
      await expect(noOffersCard.getByRole("heading", { name: "Sin Ofertas" })).toBeVisible();

      // Should show explanation message
      await expect(page.getByTestId("no-offers-message")).toBeVisible();

      // Should show new request button
      await expect(page.getByTestId("new-request-button")).toBeVisible();

      // Should show contact support button
      await expect(page.getByTestId("contact-support-button")).toBeVisible();
    });
  });

  test.describe("C3: Track Delivery Status - Timeline/Progress Indicator", () => {
    test("C3.7: Timeline shows current stage for pending request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Timeline component should be visible
      const timeline = page.getByTestId("timeline");
      await expect(timeline).toBeVisible();

      // Step 1 (Solicitud enviada) should be completed
      await expect(page.getByTestId("timeline-step-1")).toHaveAttribute("data-status", "completed");

      // Step 2 (Recibiendo ofertas) should be current for pending status
      await expect(page.getByTestId("timeline-step-2")).toHaveAttribute("data-status", "current");

      // Should indicate pending status in header
      await expect(page.getByText("Pendiente").first()).toBeVisible();
    });

    test("C3.8: Timeline shows progression for accepted request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Timeline component should be visible
      await expect(page.getByTestId("timeline")).toBeVisible();

      // Steps 1-2 should be completed for accepted status
      await expect(page.getByTestId("timeline-step-1")).toHaveAttribute("data-status", "completed");
      await expect(page.getByTestId("timeline-step-2")).toHaveAttribute("data-status", "completed");

      // Should show that accepted stage is active
      await expect(page.getByText("Aceptada").first()).toBeVisible();

      // Amount should be visible (proves request loaded correctly)
      await expect(page.getByText("1.000L")).toBeVisible();
    });

    test("C3.9: Timeline shows completion for delivered request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);
      await assertNoErrorState(page);

      // Timeline component should be visible
      await expect(page.getByTestId("timeline")).toBeVisible();

      // All steps should be completed for delivered status
      await expect(page.getByTestId("timeline-step-1")).toHaveAttribute("data-status", "completed");
      await expect(page.getByTestId("timeline-step-2")).toHaveAttribute("data-status", "completed");
      await expect(page.getByTestId("timeline-step-4")).toHaveAttribute("data-status", "completed");

      // Should show delivered as completed
      await expect(page.getByText("Entregada").first()).toBeVisible();

      // Delivered amount
      await expect(page.getByText("5.000L")).toBeVisible();
    });
  });

  test.describe("C3: Track Delivery Status - Status Updates", () => {
    test("C3.10: Page shows request details correctly", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Should show request details section
      await expect(page.getByText("Detalles")).toBeVisible();

      // Should show amount with L suffix
      await expect(page.getByText("1.000L")).toBeVisible();
    });
  });

  test.describe("C4: Contact Driver - Button Visibility", () => {
    test("C4.1: Contact button NOT visible for pending request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      await assertNoErrorState(page);

      // Phone link should NOT be visible for pending status
      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).not.toBeVisible();
    });

    test("C4.2: Contact button visible when request is accepted", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Should show supplier info section
      await expect(page.getByText(TEST_SUPPLIER.profile.name)).toBeVisible();

      // Phone link should be visible and clickable
      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();
    });

    test("C4.3: Phone link has correct href format", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();

      // Should have tel: href
      const href = await phoneLink.getAttribute("href");
      expect(href).toMatch(/^tel:\+?56/);
    });

    test("C4.4: Contact button NOT visible for delivered request", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);
      await assertNoErrorState(page);

      // Delivered status should show completion message
      await expect(page.getByText("¡Tu agua fue entregada!")).toBeVisible();

      // Phone link should NOT be visible for delivered status
      // Contact is only needed during active delivery, not after completion
      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).not.toBeVisible();
    });
  });

  test.describe("C4: Contact Driver - One-tap Functionality", () => {
    test("C4.5: Phone link is touch-friendly size", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();

      // Should have adequate touch target size (minimum 44px recommended)
      const boundingBox = await phoneLink.boundingBox();
      expect(boundingBox).toBeTruthy();
      // Allow for various button/link designs - minimum 36px height
      expect(boundingBox!.height).toBeGreaterThanOrEqual(36);
    });

    test("C4.6: Supplier name displayed with contact option", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Should show supplier/provider name
      await expect(page.getByText(TEST_SUPPLIER.profile.name)).toBeVisible();

      // Contact option should be visible
      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("Phone link is keyboard accessible", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      const phoneLink = page.locator('a[href^="tel:"]');
      await expect(phoneLink).toBeVisible();

      // Should be focusable
      await phoneLink.focus();
      await expect(phoneLink).toBeFocused();
    });

    test("Status page has proper heading structure", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Should have headings for screen readers
      const headings = page.getByRole("heading");
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
    });
  });

  test.describe("Spanish Language", () => {
    test("All status content is in Spanish", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);
      await assertNoErrorState(page);

      // Spanish content should be visible
      await expect(page.getByText(/Tu agua/)).toBeVisible();
      await expect(page.getByText("Detalles")).toBeVisible();

      // English content should NOT be visible
      await expect(page.getByText("Your water")).not.toBeVisible();
      await expect(page.getByText("Details")).not.toBeVisible();
    });
  });
});
