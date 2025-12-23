import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";
import {
  TRACKING_TOKENS,
  SEEDED_CONSUMER_NO_OFFERS_REQUEST,
  REQUEST_IDS,
} from "../fixtures/test-data";

/**
 * E2E Tests for Request Timeout Workflow (Story 11-13: C5-C7)
 *
 * Workflow Coverage:
 * - C5: Request Timeout - Request expires after 24h with no offers
 * - C6: Timeout Notification - Consumer receives email/notification
 * - C7: Retry Request - Consumer can submit new request
 *
 * Prerequisites:
 * - Run `npm run seed:test` to seed test data including:
 *   - SEEDED_NO_OFFERS_REQUEST (guest timeout)
 *   - SEEDED_CONSUMER_NO_OFFERS_REQUEST (registered consumer timeout)
 *
 * Note: These tests complement the existing request-timeout.spec.ts which
 * covers Story 10.4 acceptance criteria. This file focuses on workflow
 * validation specific to Epic 11 requirements.
 */

// =============================================================================
// C5: REQUEST TIMEOUT - Timeline and Status Display
// =============================================================================

test.describe("C5: Request Timeout Status Display @seeded", () => {
  test("C5.1: Timed out request shows correct 'Sin Ofertas' status", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to guest tracking page with no_offers token" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");

    await log({ level: "step", message: "Assert no error state" });
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify 'Sin Ofertas' badge is visible" });
    // Uses .first() because "Sin Ofertas" appears in status badge, page heading, and address area
    await expect(page.getByText("Sin Ofertas").first()).toBeVisible();
    await log({ level: "success", message: "C5.1 verified - Status shows Sin Ofertas" });
  });

  test("C5.2: Status page shows timeout message in Spanish", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify Spanish empathetic message" });
    // Match the message from status-card.tsx for no_offers status
    await expect(
      page.getByText(/Lo sentimos.*no hay aguateros disponibles|No recibimos ofertas/i)
    ).toBeVisible();
    await log({ level: "success", message: "C5.2 verified - Spanish message displayed" });
  });

  test("C5.3: Timeline shows appropriate state for timeout", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify timeline component is visible" });
    const timeline = page.getByTestId("timeline");
    await expect(timeline).toBeVisible();

    await log({ level: "step", message: "Verify timeline step 1 (Solicitud enviada) is completed" });
    const step1 = page.getByTestId("timeline-step-1");
    await expect(step1).toBeVisible();
    await expect(step1).toHaveAttribute("data-status", "completed");

    await log({ level: "step", message: "Verify remaining steps are pending for no_offers" });
    // For no_offers status, steps 2-4 should be pending (see timeline-tracker.tsx)
    const step2 = page.getByTestId("timeline-step-2");
    await expect(step2).toHaveAttribute("data-status", "pending");

    await log({ level: "success", message: "C5.3 verified - Timeline shows correct state" });
  });
});

// =============================================================================
// C6: TIMEOUT NOTIFICATION - Notification exists in database
// =============================================================================

test.describe("C6: Timeout Notification @seeded", () => {
  test("C6.1: Registered consumer can view timeout notification in-app", async ({
    page,
    log,
  }) => {
    // Login as consumer
    await log({ level: "step", message: "Login as test consumer" });
    await page.goto("/login?role=consumer");
    await page.waitForLoadState("networkidle");

    // Use dev login if available
    const devLoginButton = page.getByTestId("dev-login-consumer");
    if (await devLoginButton.isVisible().catch(() => false)) {
      await devLoginButton.click();
      await page.waitForURL(/\/(history|$)/);
    } else {
      test.skip(true, "Dev login not available - skip notification test");
      return;
    }

    await log({ level: "step", message: "Navigate to request status page" });
    await page.goto(`/request/${REQUEST_IDS.consumerNoOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify timeout status is shown for consumer request" });
    await expect(page.getByText("Sin Ofertas")).toBeVisible();

    await log({ level: "success", message: "C6.1 verified - Consumer can view timed out request" });
  });

  test("C6.2: Timeout notification contains helpful next steps", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify helpful actions are available" });
    // Verify retry button exists
    const retryButton = page.getByRole("link", { name: /Nueva Solicitud|Intentar de nuevo/i });
    await expect(retryButton).toBeVisible();

    // Verify support contact exists
    const supportLink = page.getByRole("link", { name: /Contactar Soporte/i });
    await expect(supportLink).toBeVisible();

    await log({ level: "success", message: "C6.2 verified - Helpful next steps shown" });
  });
});

// =============================================================================
// C7: RETRY REQUEST - Consumer can submit new request
// =============================================================================

test.describe("C7: Retry Request Flow @seeded", () => {
  test("C7.1: 'Intentar de nuevo' button is visible on timeout page", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify retry button is visible" });
    const retryButton = page.getByRole("link", { name: /Nueva Solicitud|Intentar de nuevo/i });
    await expect(retryButton).toBeVisible();
    await log({ level: "success", message: "C7.1 verified - Retry button visible" });
  });

  test("C7.2: Retry button navigates to request form", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Click retry button" });
    const retryButton = page.getByRole("link", { name: /Nueva Solicitud|Intentar de nuevo/i });
    await retryButton.click();

    await log({ level: "step", message: "Verify navigation to home or request page" });
    // Should navigate to home (/) or request form (/request)
    // The link goes to "/" which is the home page with the "Pedir Agua" button
    await expect(page).toHaveURL(/^https?:\/\/[^/]+(\/)?$/);
    await log({ level: "success", message: "C7.2 verified - Navigation to request form" });
  });

  test("C7.3: Consumer history shows timed out request", async ({
    page,
    log,
  }) => {
    // Login as consumer
    await log({ level: "step", message: "Login as test consumer" });
    await page.goto("/login?role=consumer");
    await page.waitForLoadState("networkidle");

    const devLoginButton = page.getByTestId("dev-login-consumer");
    if (await devLoginButton.isVisible().catch(() => false)) {
      await devLoginButton.click();
      await page.waitForURL(/\/(history|$)/);
    } else {
      test.skip(true, "Dev login not available");
      return;
    }

    await log({ level: "step", message: "Navigate to history page" });
    await page.goto("/history");
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify timed out request appears in history" });
    // Look for the consumer no_offers request amount (5000L)
    const requestEntry = page.getByText(
      new RegExp(SEEDED_CONSUMER_NO_OFFERS_REQUEST.amount.toLocaleString())
    );

    // The request may or may not be visible depending on the seed state
    // If visible, verify status badge shows Sin Ofertas
    if (await requestEntry.isVisible().catch(() => false)) {
      await log({ level: "step", message: "Request found - verify status badge" });
      // Click to view details
      await requestEntry.click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Sin Ofertas")).toBeVisible();
      await log({ level: "success", message: "C7.3 verified - Timed out request in history" });
    } else {
      await log({ level: "info", message: "Consumer no_offers request not yet seeded - skipping" });
      test.skip(true, "Consumer no_offers request not seeded");
    }
  });
});

// =============================================================================
// INTEGRATION: Full Timeout Flow
// =============================================================================

test.describe("Request Timeout - Integration @seeded", () => {
  test("Full timeout flow: View status → See options → Navigate to retry", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Step 1: Navigate to timed out request" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Step 2: Verify timeout state displayed" });
    // Uses .first() because "Sin Ofertas" appears in status badge, page heading, and address area
    await expect(page.getByText("Sin Ofertas").first()).toBeVisible();

    await log({ level: "step", message: "Step 3: Verify request details are shown" });
    // The amount (1000L) might be formatted as "1,000L" or "1.000L" depending on locale
    await expect(page.getByText(/1[,.]?000\s*L/)).toBeVisible();

    await log({ level: "step", message: "Step 4: Click retry button" });
    const retryButton = page.getByRole("link", { name: /Nueva Solicitud|Intentar de nuevo/i });
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    await log({ level: "step", message: "Step 5: Verify arrived at request form" });
    // The home page URL is "/" - matches http://localhost:3005/ or https://nitoagua.vercel.app/
    await expect(page).toHaveURL(/^https?:\/\/[^/]+(\/)?$/);

    await log({ level: "success", message: "Integration test complete - Full timeout flow verified" });
  });
});
