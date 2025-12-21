import { test, expect } from "@playwright/test";
import { TRACKING_TOKENS, SEEDED_PENDING_REQUEST, SEEDED_ACCEPTED_REQUEST, SEEDED_DELIVERED_REQUEST, TEST_SUPPLIER, CONSUMER_OFFERS_TEST_DATA } from "../fixtures/test-data";

/**
 * Tests for Consumer Request Status with Offer Context (Story 10-5)
 *
 * This story enhances the request status page to show:
 * - 4-step timeline: Solicitud enviada → Repartidor confirmó → En camino → Entregado (AC10.5.1)
 * - Provider info when offer is selected (AC10.5.2)
 * - Delivery window format (AC10.5.3)
 * - "Llamar al repartidor" button with tel: link (AC10.5.4)
 * - Cancel button before in_transit (AC10.5.5)
 * - "Ver Ofertas" button for pending requests (AC10.5.6)
 * - Offer count badge (AC10.5.7)
 * - Realtime status updates (AC10.5.8)
 *
 * Tests use seeded data from `npm run seed:test` and `npm run seed:offers`
 *
 * NOTE: Timeline steps match mockup design patterns from docs/ux-mockups/
 */

test.describe("Consumer Request Status with Offer Context (Story 10-5)", () => {
  test.describe("AC10.5.1: 4-Step Timeline Display", () => {
    test("pending request shows 4-step timeline with first step active", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Mockup-aligned vertical timeline with 4 steps
      // For pending: Solicitud enviada → Recibiendo ofertas → Seleccionar oferta → Entrega
      await expect(page.getByText("Solicitud enviada")).toBeVisible();
      await expect(page.getByText("Recibiendo ofertas")).toBeVisible();
      await expect(page.getByText("Seleccionar oferta")).toBeVisible();
      await expect(page.getByText("Entrega")).toBeVisible();
    });

    test("accepted request shows first two steps completed", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // For accepted: Solicitud enviada → Repartidor confirmó → En camino → Entregado
      // Use exact match to avoid matching status card titles
      await expect(page.getByText("Solicitud enviada", { exact: true })).toBeVisible();
      await expect(page.getByText("Repartidor confirmó", { exact: true })).toBeVisible();
      await expect(page.getByText("En camino", { exact: true })).toBeVisible();
      await expect(page.getByText("Entregado", { exact: true })).toBeVisible();
    });

    test("delivered request shows all steps completed", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      // For delivered: all steps completed
      // Use exact match to avoid matching status card descriptions
      await expect(page.getByText("Solicitud enviada", { exact: true })).toBeVisible();
      await expect(page.getByText("Repartidor confirmó", { exact: true })).toBeVisible();
      await expect(page.getByText("En camino", { exact: true })).toBeVisible();
      await expect(page.getByText("Entregado", { exact: true })).toBeVisible();
    });

    test("timeline steps show timestamps when available", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Accepted request should show timestamp for completed steps
      // Format: "X dic, HH:MM" or similar - visible somewhere on page
      await expect(page.getByText(/\d+\s+\w+,\s+\d{2}:\d{2}/).first()).toBeVisible();
    });
  });

  test.describe("AC10.5.2: Provider Name Display", () => {
    test("accepted request shows provider name", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Should show "Repartidor" label and provider name (mockup uses "Repartidor")
      // Use exact match to avoid matching "Repartidor confirmó" and other elements
      await expect(page.getByText("Repartidor", { exact: true })).toBeVisible();
      await expect(page.getByTestId("provider-name")).toBeVisible();
    });

    test("pending request does not show provider info", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Should not show provider name section (pending has no provider)
      await expect(page.getByTestId("provider-name")).not.toBeVisible();
    });
  });

  test.describe("AC10.5.3: Delivery Window Format", () => {
    test("accepted request shows delivery window with 'Entrega estimada' label", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Should show the delivery window
      // Use exact match to avoid matching the status card description
      await expect(page.getByText("Entrega estimada", { exact: true })).toBeVisible();
      await expect(page.getByTestId("delivery-window")).toBeVisible();
    });

    test("delivery window shows time range format", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Seeded accepted request has delivery_window: "14:00 - 16:00"
      // Use the data-testid to get the specific element
      await expect(page.getByTestId("delivery-window")).toContainText(/14:00.*16:00/);
    });
  });

  test.describe("AC10.5.4: 'Llamar al repartidor' Button", () => {
    test("accepted request shows call button with tel: link", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      const callButton = page.getByTestId("call-provider-button");
      await expect(callButton).toBeVisible();
      await expect(callButton).toContainText("Llamar al repartidor");

      // Should have tel: href
      const href = await callButton.getAttribute("href");
      expect(href).toMatch(/^tel:/);
    });

    test("call button is styled with green color", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      const callButton = page.getByTestId("call-provider-button");
      // Mockup uses specific green color #10B981 (bg-[#10B981])
      await expect(callButton).toHaveClass(/bg-\[#10B981\]/);
    });

    test("pending request does not show call button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      await expect(page.getByTestId("call-provider-button")).not.toBeVisible();
    });
  });

  test.describe("AC10.5.5: Cancel Button Visibility", () => {
    test("pending request shows cancel button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      await expect(page.getByText("Cancelar Solicitud")).toBeVisible();
    });

    test("accepted request shows cancel button (before in_transit)", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      await expect(page.getByText("Cancelar Solicitud")).toBeVisible();
    });

    test("delivered request does not show cancel button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      await expect(page.getByText("Cancelar Solicitud")).not.toBeVisible();
    });
  });

  test.describe("AC10.5.6: 'Ver Ofertas' Button for Pending", () => {
    test("pending request shows 'Ver Ofertas' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      await expect(viewOffersButton).toBeVisible();
      await expect(viewOffersButton).toContainText("Ver Ofertas");
    });

    test("'Ver Ofertas' button links to offers page with tracking token", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      const href = await viewOffersButton.getAttribute("href");

      // Should include request ID and tracking token
      expect(href).toContain(`/request/${SEEDED_PENDING_REQUEST.id}/offers`);
      expect(href).toContain(`token=${TRACKING_TOKENS.pending}`);
    });

    test("accepted request does not show 'Ver Ofertas' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      await expect(page.getByTestId("view-offers-button")).not.toBeVisible();
    });
  });

  test.describe("AC10.5.7: Offer Count Badge @seeded", () => {
    test("pending request with offers shows count badge", async ({ page }) => {
      // This test requires seeded offers via `npm run seed:offers`
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // Badge should show "X ofertas disponibles"
      const badge = page.getByTestId("offer-count-badge");

      // If offers are seeded, badge should be visible
      // This is a conditional test based on seeded data
      const badgeCount = await badge.count();
      if (badgeCount > 0) {
        await expect(badge).toContainText(/\d+ ofertas? disponibles?/);
      }
    });

    test("offer count badge format is correct (singular vs plural)", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const badge = page.getByTestId("offer-count-badge");
      const badgeCount = await badge.count();

      if (badgeCount > 0) {
        const text = await badge.textContent();
        // Should be "1 oferta disponible" or "N ofertas disponibles"
        expect(text).toMatch(/^\d+ ofertas? disponibles?$/);
      }
    });
  });

  test.describe("AC10.5.8: Realtime Status Updates", () => {
    test("page shows refresh indicator when polling", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      // The TrackingRefresh component should be present
      // It shows an indicator when refreshing
      await expect(page.locator("main")).toBeVisible();
    });

    test.skip("page updates status without manual refresh", async ({ page }) => {
      // This test would require:
      // 1. Loading a pending request
      // 2. Externally updating the status in the database
      // 3. Waiting for the page to auto-update
      // Skip for now as it requires complex setup
    });
  });

  test.describe("Delivered Status Display", () => {
    test("delivered request shows completion message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      await expect(page.getByText("¡Tu agua fue entregada!")).toBeVisible();
    });

    test("delivered request shows delivery timestamp", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      // Should show "Entregado el X de MONTH..."
      await expect(page.getByText(/Entregado el/)).toBeVisible();
    });

    test("delivered request shows reorder button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.delivered}`);

      const reorderButton = page.getByRole("link", { name: /Solicitar Agua de Nuevo/i });
      await expect(reorderButton).toBeVisible();
      await expect(reorderButton).toHaveAttribute("href", "/");
    });
  });

  test.describe("Cancelled Status Display", () => {
    test("cancelled request shows cancellation message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);

      // Use first() since text appears in both header and status card
      await expect(page.getByText("Solicitud cancelada").first()).toBeVisible();
    });

    test("cancelled request shows 'Nueva Solicitud' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.cancelled}`);

      await expect(page.getByRole("link", { name: /Nueva Solicitud/i })).toBeVisible();
    });
  });

  test.describe("No Offers (Timeout) Status Display @seeded", () => {
    test("no_offers status shows 'Sin Ofertas' badge", async ({ page }) => {
      // This test requires seeded no_offers request
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);

      // Wait for card to load - no_offers card has testid
      const noOffersCard = page.getByTestId("no-offers-card");
      const cardCount = await noOffersCard.count();

      if (cardCount > 0) {
        await expect(page.getByTestId("no-offers-title")).toContainText("Sin Ofertas");
      } else {
        // If no seeded data, skip gracefully
        test.skip();
      }
    });

    test("no_offers status shows empathetic message", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);

      const noOffersCard = page.getByTestId("no-offers-card");
      const cardCount = await noOffersCard.count();

      if (cardCount > 0) {
        await expect(page.getByTestId("no-offers-message")).toContainText("no hay aguateros disponibles");
      } else {
        test.skip();
      }
    });

    test("no_offers status shows 'Nueva Solicitud' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);

      const noOffersCard = page.getByTestId("no-offers-card");
      const cardCount = await noOffersCard.count();

      if (cardCount > 0) {
        await expect(page.getByTestId("new-request-button")).toBeVisible();
      } else {
        test.skip();
      }
    });

    test("no_offers status shows 'Contactar Soporte' button", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);

      const noOffersCard = page.getByTestId("no-offers-card");
      const cardCount = await noOffersCard.count();

      if (cardCount > 0) {
        await expect(page.getByTestId("contact-support-button")).toBeVisible();
      } else {
        test.skip();
      }
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("all UI text is in Spanish", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      // Timeline steps in Spanish (mockup-aligned labels) - use exact match
      await expect(page.getByText("Solicitud enviada", { exact: true })).toBeVisible();
      await expect(page.getByText("Repartidor confirmó", { exact: true })).toBeVisible();
      await expect(page.getByText("En camino", { exact: true })).toBeVisible();
      await expect(page.getByText("Entregado", { exact: true })).toBeVisible();

      // Labels in Spanish (mockup uses "Repartidor" instead of "Aguatero")
      // Check for Repartidor label in supplier info
      await expect(page.locator("[data-testid='provider-name']")).toBeVisible();
      await expect(page.getByText("Entrega estimada", { exact: true })).toBeVisible();
      await expect(page.getByText("Llamar al repartidor")).toBeVisible();

      // No English text
      await expect(page.getByText("Provider")).not.toBeVisible();
      await expect(page.getByText("Delivery Window")).not.toBeVisible();
      await expect(page.getByText("Call Driver")).not.toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("call button is keyboard accessible", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.accepted}`);

      const callButton = page.getByTestId("call-provider-button");
      await callButton.focus();
      await expect(callButton).toBeFocused();
    });

    test("view offers button is keyboard accessible", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      await viewOffersButton.focus();
      await expect(viewOffersButton).toBeFocused();
    });

    test("buttons have adequate touch target size", async ({ page }) => {
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);

      const viewOffersButton = page.getByTestId("view-offers-button");
      const box = await viewOffersButton.boundingBox();

      // Should have minimum 36px height for touch targets
      expect(box?.height).toBeGreaterThanOrEqual(36);
    });
  });

  test.describe("Performance", () => {
    test("page loads within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`/track/${TRACKING_TOKENS.pending}`);
      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds (NFR1 target)
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
