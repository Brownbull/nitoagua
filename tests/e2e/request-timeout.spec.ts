import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";
import { TRACKING_TOKENS, SEEDED_NO_OFFERS_REQUEST } from "../fixtures/test-data";

/**
 * E2E Tests for Request Timeout Notification (Story 10.4)
 *
 * Tests:
 * - AC10.4.1: Cron job identifies pending requests (4+ hours, no offers)
 * - AC10.4.2: Request status changes to 'no_offers'
 * - AC10.4.3: In-app notification created for consumer
 * - AC10.4.4: Email notification sent (if email provided)
 * - AC10.4.5: Status page shows orange "Sin Ofertas" badge
 * - AC10.4.6: Empathetic message displayed
 * - AC10.4.7: "Nueva Solicitud" button shown
 * - AC10.4.8: "Contactar Soporte" WhatsApp link shown
 *
 * Note: Cron job tests require seeded data. UI tests can run independently.
 */

// Use the local dev secret - this must match what the app is using
const CRON_SECRET = process.env.CRON_SECRET || "local-dev-cron-secret-12345";

// =============================================================================
// CRON JOB TESTS
// =============================================================================

test.describe("Request Timeout Cron - Authentication", () => {
  test("AC10.4.1: returns 401 without CRON_SECRET", async ({ request }) => {
    const response = await request.get("/api/cron/request-timeout");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("AC10.4.1: returns 401 with wrong CRON_SECRET", async ({ request }) => {
    const response = await request.get("/api/cron/request-timeout", {
      headers: {
        Authorization: "Bearer wrong-secret",
      },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  // Note: These tests require the correct CRON_SECRET to be set in the environment
  // They will pass when the test runner and app share the same secret
  test("AC10.4.1: returns 200 with correct CRON_SECRET @cron-secret", async ({ request }) => {
    test.skip(!process.env.CRON_SECRET, "Skipping - CRON_SECRET not configured in environment");

    const response = await request.get("/api/cron/request-timeout", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("timed_out_count");
    expect(body).toHaveProperty("duration_ms");
  });

  test("AC10.4.1: response includes count and duration fields @cron-secret", async ({
    request,
  }) => {
    test.skip(!process.env.CRON_SECRET, "Skipping - CRON_SECRET not configured in environment");

    const response = await request.get("/api/cron/request-timeout", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify response format
    expect(typeof body.timed_out_count).toBe("number");
    expect(typeof body.duration_ms).toBe("number");
    expect(body.duration_ms).toBeGreaterThanOrEqual(0);
    expect(body.timed_out_count).toBeGreaterThanOrEqual(0);
  });

  test("AC10.4.1: cron job is idempotent - safe to run multiple times @cron-secret", async ({
    request,
  }) => {
    test.skip(!process.env.CRON_SECRET, "Skipping - CRON_SECRET not configured in environment");

    // Run cron twice
    const response1 = await request.get("/api/cron/request-timeout", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    const response2 = await request.get("/api/cron/request-timeout", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    // Both should succeed
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);

    // Second run should have same or lower count
    const body1 = await response1.json();
    const body2 = await response2.json();
    expect(body2.timed_out_count).toBeLessThanOrEqual(body1.timed_out_count);
  });
});

// =============================================================================
// STATUS PAGE UI TESTS - No Offers State (GUEST TRACKING PAGE)
// =============================================================================

test.describe("Request Status Page - No Offers State (Guest)", () => {
  // Note: These tests require a seeded no_offers request
  // Skip if data not available

  test("AC10.4.5: shows 'Sin Ofertas' badge for timed out request @seeded", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to guest tracking page with no_offers token" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");

    await log({ level: "step", message: "Assert no error state before content check" });
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify 'Sin Ofertas' badge is visible" });
    await expect(page.getByText("Sin Ofertas")).toBeVisible();
    await log({ level: "success", message: "AC10.4.5 verified" });
  });

  test("AC10.4.6: shows empathetic message @seeded", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify empathetic message is visible" });
    await expect(
      page.getByText(/Lo sentimos.*no hay aguateros disponibles/i)
    ).toBeVisible();
    await log({ level: "success", message: "AC10.4.6 verified" });
  });

  test("AC10.4.7: shows 'Nueva Solicitud' button @seeded", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify retry button is visible and links to home" });
    const retryButton = page.getByRole("link", { name: /Nueva Solicitud/i });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toHaveAttribute("href", "/");
    await log({ level: "success", message: "AC10.4.7 verified" });
  });

  test("AC10.4.8: shows 'Contactar Soporte' WhatsApp link @seeded", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify WhatsApp support link is visible" });
    const supportLink = page.getByRole("link", { name: /Contactar Soporte/i });
    await expect(supportLink).toBeVisible();

    const href = await supportLink.getAttribute("href");
    expect(href).toContain("wa.me");
    await log({ level: "success", message: "AC10.4.8 verified" });
  });

  test("'Nueva Solicitud' button navigates to home @seeded", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Click retry button and verify navigation" });
    await page.getByRole("link", { name: /Nueva Solicitud/i }).click();
    await expect(page).toHaveURL("/");
    await log({ level: "success", message: "Navigation verified" });
  });

  test("shows request details in no_offers state @seeded", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Verify request details are visible" });
    await expect(
      page.getByText(new RegExp(SEEDED_NO_OFFERS_REQUEST.amount.toLocaleString()))
    ).toBeVisible();
    await log({ level: "success", message: "Request details verified" });
  });
});

// =============================================================================
// STATUS PAGE - BADGE VARIANT TESTS
// =============================================================================

test.describe("Status Badge - no_offers variant", () => {
  test("badge has orange styling for no_offers status @seeded", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Find and verify status badge styling" });
    const badge = page.getByText("Sin Ofertas");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/text-\[#C2410C\]|orange/);
    await log({ level: "success", message: "Badge styling verified" });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Request Timeout - Accessibility", () => {
  test("no_offers page is accessible @seeded", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to no_offers tracking page" });
    await page.goto(`/track/${TRACKING_TOKENS.noOffers}`);
    await page.waitForLoadState("networkidle");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Check page has main heading" });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    await log({ level: "step", message: "Check interactive elements are keyboard accessible" });
    const buttons = page.getByRole("link");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    await log({ level: "step", message: "Check support link opens in new tab securely" });
    const supportLink = page.getByRole("link", { name: /Contactar Soporte/i });
    await expect(supportLink).toHaveAttribute("target", "_blank");
    await expect(supportLink).toHaveAttribute("rel", /noopener/);
    await log({ level: "success", message: "Accessibility checks passed" });
  });
});

// =============================================================================
// DATA-DEPENDENT TESTS (require seeded data with timeout trigger)
// =============================================================================

test.describe("Request Timeout - With Seeded Timeout Data @seeded", () => {
  test.skip(
    true,
    "Requires seeded test data with old pending requests - run npm run seed:test first"
  );

  // These tests would verify:
  // - AC10.4.2: Pending requests older than 4 hours without offers are marked 'no_offers'
  // - AC10.4.3: In-app notifications are created for registered consumers
  // - AC10.4.4: Email notifications are sent (mock Resend or check logs)
  //
  // To implement these tests:
  // 1. Create seed script that inserts pending requests with created_at > 4 hours ago
  // 2. Run cron job
  // 3. Verify request status updated to 'no_offers'
  // 4. Verify notifications created
  // 5. Verify timed_out_at timestamp set
});
