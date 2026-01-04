/**
 * Rating/Review System Tests - Story 12.7-13
 *
 * Validates the rating flow after delivery completion:
 * - Rating prompt appears after delivery
 * - Star selection works
 * - Optional comment submission
 * - Skip functionality
 * - Rating display on offer cards
 *
 * Prerequisites:
 * - Local Supabase running
 * - Dev login enabled (NEXT_PUBLIC_DEV_LOGIN=true)
 * - Test data seeded
 */

import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";
import { createClient } from "@supabase/supabase-js";

// Test configuration: Use mobile viewport for PWA testing
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Skip if dev login not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Supabase admin client for test setup
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required for E2E tests");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Helper: Login as consumer via dev login
 */
async function loginAsConsumer(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForSelector('[data-testid="dev-login-button"]', {
    timeout: 10000,
  });

  // Select Consumer role
  const consumerButton = page.getByRole("button", {
    name: "Consumer",
    exact: true,
  });
  await consumerButton.click();

  // Click login
  await page.getByTestId("dev-login-button").click();

  // Wait for redirect to consumer home
  await page.waitForURL("**/", { timeout: 15000 });
}

test.describe("Rating/Review System @rating @12.7-13", () => {
  // Tests must run in order (serial) since they mutate data
  test.describe.configure({ mode: "serial" });

  // Track test request/offer IDs for cleanup
  let testRequestId: string | null = null;
  let testProviderId: string | null = null;
  let testConsumerId: string | null = null;

  test.beforeAll(async () => {
    // Get consumer ID from dev login user
    const adminClient = getAdminClient();

    // Find the consumer test user
    const { data: consumer } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "consumer")
      .limit(1)
      .single();

    // Find a provider test user
    const { data: provider } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "supplier")
      .eq("verification_status", "approved")
      .limit(1)
      .single();

    if (consumer) testConsumerId = consumer.id;
    if (provider) testProviderId = provider.id;
  });

  test.afterAll(async () => {
    // Clean up test data
    if (testRequestId) {
      const adminClient = getAdminClient();

      // Delete any ratings created for this request
      await adminClient.from("ratings").delete().eq("request_id", testRequestId);

      // Delete the test request
      await adminClient.from("water_requests").delete().eq("id", testRequestId);
    }
  });

  test("AC12.7.13.1: Rating dialog elements are present", async ({
    page,
    log,
  }) => {
    test.skip(skipIfNoDevLogin, "Dev login required for E2E tests");
    test.skip(!testConsumerId || !testProviderId, "Test users not found");

    // GIVEN: Create a delivered request directly in the database
    await log({
      level: "step",
      message: "Creating test delivered request",
    });

    const adminClient = getAdminClient();

    // Create a delivered water request for testing
    const { data: request, error: requestError } = await adminClient
      .from("water_requests")
      .insert({
        consumer_id: testConsumerId,
        supplier_id: testProviderId,
        address: "Test Address for Rating",
        guest_phone: "+56912345678",
        amount: 1000,
        status: "delivered",
        delivered_at: new Date().toISOString(),
        comuna_id: "villarrica",
      })
      .select("id")
      .single();

    if (requestError || !request) {
      throw new Error(`Failed to create test request: ${requestError?.message}`);
    }

    testRequestId = request.id;
    await log({ level: "info", message: `Created test request: ${testRequestId}` });

    // WHEN: Consumer logs in and navigates to the request status
    await loginAsConsumer(page);
    await assertNoErrorState(page);

    await page.goto(`/request/${testRequestId}`);
    await assertNoErrorState(page);

    // THEN: Rating section should be visible
    await log({ level: "step", message: "Checking rating section visibility" });

    // Wait for rating section to appear (may need to wait for loading)
    await expect(page.getByTestId("rating-section")).toBeVisible({
      timeout: 10000,
    });

    // Check the rate button is visible (since no rating exists yet)
    await expect(page.getByTestId("rate-button")).toBeVisible();

    await log({
      level: "success",
      message: "Rating section visible with rate button",
    });
  });

  test("AC12.7.13.2: Star rating selection works", async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, "Dev login required for E2E tests");
    test.skip(!testRequestId, "Test request not created");

    // GIVEN: Consumer is on the delivered request page
    await loginAsConsumer(page);
    await page.goto(`/request/${testRequestId}`);
    await assertNoErrorState(page);

    // Wait for page to load
    await expect(page.getByTestId("rating-section")).toBeVisible({
      timeout: 10000,
    });

    // WHEN: Consumer clicks the rate button
    await log({ level: "step", message: "Opening rating dialog" });
    await page.getByTestId("rate-button").click();

    // THEN: Rating dialog should open
    await expect(page.getByTestId("rating-dialog")).toBeVisible({
      timeout: 5000,
    });

    // AND: Star rating input should be visible
    await expect(page.getByTestId("rating-stars-input")).toBeVisible();

    // WHEN: Consumer selects a 5-star rating
    await log({ level: "step", message: "Selecting 5-star rating" });
    await page.getByTestId("star-5").click();

    // THEN: Rating label should show "Excelente"
    await expect(page.getByTestId("rating-label")).toHaveText("Excelente");

    await log({ level: "success", message: "Star selection works correctly" });
  });

  test("AC12.7.13.3: Optional comment and submission", async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, "Dev login required for E2E tests");
    test.skip(!testRequestId, "Test request not created");

    // GIVEN: Consumer is on the delivered request page
    await loginAsConsumer(page);
    await page.goto(`/request/${testRequestId}`);
    await assertNoErrorState(page);

    // Wait for page and open dialog
    await expect(page.getByTestId("rating-section")).toBeVisible({
      timeout: 10000,
    });
    await page.getByTestId("rate-button").click();
    await expect(page.getByTestId("rating-dialog")).toBeVisible();

    // WHEN: Consumer selects rating and adds a comment
    await log({
      level: "step",
      message: "Selecting rating and adding comment",
    });
    await page.getByTestId("star-4").click();

    // Add optional comment
    const commentText = "Excelente servicio, muy puntual";
    await page.getByTestId("rating-comment").fill(commentText);

    // Verify character counter
    await expect(page.getByText(`${commentText.length}/500`)).toBeVisible();

    // WHEN: Consumer submits the rating
    await log({ level: "step", message: "Submitting rating" });
    await page.getByTestId("rating-submit-button").click();

    // THEN: Dialog should close and success toast should appear
    await expect(page.getByTestId("rating-dialog")).not.toBeVisible({
      timeout: 5000,
    });

    // Verify rating was saved - check existing rating is shown
    await page.reload();
    await assertNoErrorState(page);

    await expect(page.getByTestId("rating-section")).toBeVisible({
      timeout: 10000,
    });
    // Edit button should now be visible instead of rate button
    await expect(page.getByTestId("edit-rating-button")).toBeVisible();

    await log({
      level: "success",
      message: "Rating submitted successfully",
    });
  });

  test("AC12.7.13.5: Rating persists in database", async ({ log }) => {
    test.skip(!testRequestId || !testConsumerId, "Test data not available");

    await log({ level: "step", message: "Verifying rating in database" });

    const adminClient = getAdminClient();

    // Check that rating was saved
    const { data: rating, error } = await adminClient
      .from("ratings")
      .select("*")
      .eq("request_id", testRequestId)
      .eq("consumer_id", testConsumerId)
      .single();

    if (error) {
      throw new Error(`Rating not found: ${error.message}`);
    }

    expect(rating).toBeTruthy();
    expect(rating.rating).toBe(4); // We selected 4 stars in previous test
    expect(rating.comment).toBe("Excelente servicio, muy puntual");

    await log({
      level: "success",
      message: `Rating saved: ${rating.rating} stars`,
    });
  });

  test("Provider average rating updated via trigger", async ({ log }) => {
    test.skip(!testProviderId, "Test provider not available");

    await log({
      level: "step",
      message: "Verifying provider average rating",
    });

    const adminClient = getAdminClient();

    // Check provider profile has updated rating
    const { data: profile } = await adminClient
      .from("profiles")
      .select("average_rating, rating_count")
      .eq("id", testProviderId)
      .single();

    expect(profile).toBeTruthy();
    // Should have at least 1 rating (from our test)
    expect(profile?.rating_count).toBeGreaterThanOrEqual(1);
    // Average should be defined
    expect(profile?.average_rating).toBeTruthy();

    await log({
      level: "success",
      message: `Provider rating: ${profile?.average_rating} (${profile?.rating_count} reviews)`,
    });
  });
});
