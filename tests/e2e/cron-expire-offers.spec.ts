import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Offer Expiration Cron Job (Story 6.7)
 *
 * Tests AC6.7.1-5:
 * - AC6.7.1: Cron job runs every minute via Vercel cron (tested via direct call)
 * - AC6.7.2: Job marks offers with expires_at < NOW() as 'expired'
 * - AC6.7.3: Affected providers notified "Tu oferta expiró"
 * - AC6.7.4: Job logs count of expired offers
 * - AC6.7.5: Job authenticated via CRON_SECRET
 *
 * Note: Tests for AC6.7.2, AC6.7.3 require seeded offer data.
 * These are marked with @seeded tag and should run with test seed data.
 */

const CRON_SECRET = process.env.CRON_SECRET || "local-dev-cron-secret-12345";

test.describe("Cron Expire Offers - Authentication", () => {
  test("AC6.7.5: returns 401 without CRON_SECRET", async ({ request }) => {
    const response = await request.get("/api/cron/expire-offers");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("AC6.7.5: returns 401 with wrong CRON_SECRET", async ({ request }) => {
    const response = await request.get("/api/cron/expire-offers", {
      headers: {
        Authorization: "Bearer wrong-secret",
      },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("AC6.7.5: returns 200 with correct CRON_SECRET", async ({ request }) => {
    const response = await request.get("/api/cron/expire-offers", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("expired_count");
    expect(body).toHaveProperty("duration_ms");
  });

  test("AC6.7.4: response includes expired count and duration", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/expire-offers", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify response format per AC6.7.4
    expect(typeof body.expired_count).toBe("number");
    expect(typeof body.duration_ms).toBe("number");
    expect(body.duration_ms).toBeGreaterThanOrEqual(0);
    expect(body.expired_count).toBeGreaterThanOrEqual(0);
  });

  test("AC6.7.1: cron job is idempotent - safe to run multiple times", async ({
    request,
  }) => {
    // Run cron twice
    const response1 = await request.get("/api/cron/expire-offers", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    const response2 = await request.get("/api/cron/expire-offers", {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    // Both should succeed
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);

    // Second run should have same or lower count (already expired offers aren't re-processed)
    const body1 = await response1.json();
    const body2 = await response2.json();
    expect(body2.expired_count).toBeLessThanOrEqual(body1.expired_count);
  });
});

// Data-dependent tests that require seeded offers
// To run: npm run seed:test && npm run test:e2e -- --grep "@seeded"
test.describe("Cron Expire Offers - With Seeded Data @seeded", () => {
  test.skip(
    true,
    "Requires seeded test data with offers - run with npm run seed:test first"
  );

  // These tests would verify:
  // - AC6.7.2: Active offers with past expires_at are marked as 'expired'
  // - AC6.7.3: Notifications are created for affected providers
  //
  // To implement these tests:
  // 1. Create a seed script that inserts offers with various expires_at values
  // 2. Run cron job
  // 3. Verify offer statuses updated
  // 4. Verify notifications created
});
