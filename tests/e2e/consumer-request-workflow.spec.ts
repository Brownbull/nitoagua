/**
 * Consumer Request Workflow Tests - Story 11-9
 *
 * Validates C1 (Fill Request Form) and C2 (Submit Request) workflows
 * using REAL database operations (no mocks).
 *
 * These tests complement the existing form/submission tests by validating
 * the complete end-to-end workflow with actual data persistence.
 *
 * Workflows Covered:
 * - C1: Fill Request Form (address, volume, urgency, contact)
 * - C2: Submit Request (confirmation, tracking link, email)
 *
 * Prerequisites:
 * - Local Supabase running
 * - Comunas seeded (npm run seed:test)
 */

import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * Helper to skip past the map step after filling step 1
 * Story 12-1 added a map pinpoint step between step 1 and step 2
 */
async function skipMapStep(page: import("@playwright/test").Page) {
  // Wait for map step to appear
  await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
  // Wait for map to load and confirm button to be visible
  await expect(page.getByTestId("map-confirm-button")).toBeVisible({ timeout: 15000 });
  // Confirm location to proceed to step 2
  await page.getByTestId("map-confirm-button").click();
}

// Mobile viewport for PWA testing
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

test.describe("C1 - Fill Request Form Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request");
    await assertNoErrorState(page);
  });

  test("C1.1: Form shows all required fields", async ({ page, log }) => {
    await log({ level: "step", message: "Verify form loads with all fields" });

    // Step 1 - Contact + Location
    await expect(page.getByTestId("name-input")).toBeVisible();
    await expect(page.getByTestId("phone-input")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("comuna-select")).toBeVisible();
    await expect(page.getByTestId("address-input")).toBeVisible();
    await expect(page.getByTestId("instructions-input")).toBeVisible();

    await log({ level: "success", message: "All Step 1 fields visible" });
  });

  test("C1.2: Address input works with comuna dropdown", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Test comuna selection" });

    // Wait for comunas to load from database
    await expect(page.getByText("Selecciona tu comuna")).toBeVisible({
      timeout: 10000,
    });

    // Open comuna dropdown
    await page.getByTestId("comuna-select").click();

    // Verify at least one comuna option is visible (from seeded data)
    await expect(page.getByTestId("comuna-option-villarrica")).toBeVisible({
      timeout: 5000,
    });

    // Select Villarrica
    await page.getByTestId("comuna-option-villarrica").click();

    // Verify selection is reflected
    await expect(page.getByTestId("comuna-select")).toContainText("Villarrica");

    await log({ level: "success", message: "Comuna selection works" });
  });

  test("C1.3: Volume selection shows pricing tiers", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to Step 2 to test volume" });

    // Fill Step 1 to proceed
    await fillStep1(page);
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step
    await skipMapStep(page);

    // Wait for Step 2
    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

    await log({ level: "step", message: "Verify volume options with prices" });

    // Check all volume options exist
    await expect(page.getByTestId("amount-100")).toBeVisible();
    await expect(page.getByTestId("amount-1000")).toBeVisible();
    await expect(page.getByTestId("amount-5000")).toBeVisible();
    await expect(page.getByTestId("amount-10000")).toBeVisible();

    // Check prices are displayed (based on getDeliveryPrice() tiers)
    await expect(page.getByText("$5.000")).toBeVisible(); // 100L
    await expect(page.getByText("$20.000")).toBeVisible(); // 1000L
    await expect(page.getByText("$75.000")).toBeVisible(); // 5000L
    await expect(page.getByText("$140.000")).toBeVisible(); // 10000L

    await log({ level: "success", message: "All volume options with prices visible" });
  });

  test("C1.4: Urgency toggle works correctly", async ({ page, log }) => {
    await log({ level: "step", message: "Navigate to Step 2 to test urgency" });

    await fillStep1(page);
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step
    await skipMapStep(page);

    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

    await log({ level: "step", message: "Test urgency toggle" });

    // Urgency defaults to Normal
    const normalButton = page.getByTestId("urgency-normal");
    const urgentButton = page.getByTestId("urgency-urgent");

    await expect(normalButton).toHaveAttribute("aria-checked", "true");
    await expect(urgentButton).toHaveAttribute("aria-checked", "false");

    // Toggle to Urgent
    await urgentButton.click();
    await expect(urgentButton).toHaveAttribute("aria-checked", "true");
    await expect(normalButton).toHaveAttribute("aria-checked", "false");

    // Select amount to see urgency price impact
    await page.getByTestId("amount-1000").click();

    // Urgent adds 10% - $20,000 * 1.1 = $22,000
    await expect(page.getByText("$22.000")).toBeVisible();
    await expect(page.getByText(/cargo de urgencia/)).toBeVisible();

    await log({ level: "success", message: "Urgency toggle works with price calculation" });
  });

  test("C1.5: Form validates required fields", async ({ page, log }) => {
    await log({ level: "step", message: "Test form validation" });

    // Try to proceed without filling required fields
    await page.getByTestId("next-button").click();

    // Should stay on Step 1 (not advance to Step 2)
    await expect(page.getByText("Paso 1 de 3")).toBeVisible();

    // Phone validation - enter invalid format
    await page.getByTestId("phone-input").fill("12345678");
    await page.getByTestId("next-button").click();

    // Should show phone format error
    const phoneError = page.getByText(/Formato.*\+56/);
    await expect(phoneError).toBeVisible({ timeout: 5000 });

    await log({ level: "success", message: "Form validation working" });
  });
});

test.describe("C2 - Submit Request Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request");
    await assertNoErrorState(page);
  });

  test("C2.1: Guest can submit request with email", async ({ page, log }) => {
    await log({ level: "step", message: "Fill complete form as guest" });

    // Generate unique email for this test run
    const timestamp = Date.now();
    const testEmail = `guest-${timestamp}@test.local`;

    // Step 1: Contact + Location
    await fillStep1(page, { email: testEmail });
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step
    await skipMapStep(page);

    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

    // Step 2: Select amount
    await log({ level: "step", message: "Select volume" });
    await page.getByTestId("amount-1000").click();
    await page.getByTestId("nav-next-button").click();
    await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

    // Step 3: Review and submit
    await log({ level: "step", message: "Review and submit" });
    await expect(page.getByTestId("review-screen")).toBeVisible();
    await expect(page.getByTestId("review-email")).toContainText(testEmail);

    // Submit the request (real API call, no mock)
    await page.getByTestId("submit-button").click();

    // Should navigate to confirmation page
    await expect(page).toHaveURL(/\/request\/[a-f0-9-]+\/confirmation/, {
      timeout: 15000,
    });

    await log({ level: "success", message: "Guest request submitted successfully" });
  });

  test("C2.2: Registered user can submit request", async ({ page, log }) => {
    await log({ level: "step", message: "Login as registered user" });

    // Use dev login for test consumer
    await page.goto("/login");

    // Wait for dev login component to load
    await page.waitForSelector('[data-testid="dev-login-button"]', {
      timeout: 10000,
    });

    // Consumer role is selected by default, just click login
    await page.getByTestId("dev-login-button").click();

    // Consumer redirects to home page
    await expect(page).toHaveURL("/", { timeout: 10000 });

    // Navigate to request form
    await page.goto("/request");
    await assertNoErrorState(page);

    await log({ level: "step", message: "Form auto-fills for registered user" });

    // For registered users, the form is pre-filled - just verify Step 1 is shown
    await expect(page.getByText("Paso 1 de 3")).toBeVisible({ timeout: 5000 });

    // Verify some pre-filled data is present (from consumer profile)
    const nameInput = page.getByTestId("name-input");
    await expect(nameInput).toBeVisible();
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0); // Name is pre-filled

    // Proceed to Step 2 (form should be valid since it's pre-filled)
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step
    await skipMapStep(page);

    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

    // Step 2: Select amount
    await page.getByTestId("amount-5000").click();
    await page.getByTestId("nav-next-button").click();
    await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

    // Step 3: Submit
    await log({ level: "step", message: "Submit request" });
    await page.getByTestId("submit-button").click();

    // Should navigate to confirmation
    await expect(page).toHaveURL(/\/request\/[a-f0-9-]+\/confirmation/, {
      timeout: 15000,
    });

    await log({ level: "success", message: "Registered user request submitted" });
  });

  test("C2.3: Confirmation page shows request details", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Submit request and verify confirmation" });

    // Submit a request
    const testEmail = `confirm-${Date.now()}@test.local`;
    await submitFullRequest(page, { email: testEmail });

    // Verify confirmation page elements
    await log({ level: "step", message: "Verify confirmation elements" });

    // Success heading
    await expect(page.getByText("¡Solicitud Enviada!")).toBeVisible();

    // Request ID displayed
    await expect(page.getByText(/Solicitud.*#/)).toBeVisible();

    // Next steps message
    await expect(
      page.getByText("El aguatero te contactará pronto")
    ).toBeVisible();

    // Ver Estado button
    const verEstadoBtn = page.getByRole("link", { name: /Ver Estado/ });
    await expect(verEstadoBtn).toBeVisible();

    // Nueva Solicitud button
    const nuevaSolicitudBtn = page.getByRole("link", {
      name: /Nueva Solicitud/,
    });
    await expect(nuevaSolicitudBtn).toBeVisible();

    await log({ level: "success", message: "Confirmation page displays all required elements" });
  });

  test("C2.4: Tracking token is generated", async ({ page, log }) => {
    await log({ level: "step", message: "Submit and verify tracking" });

    await submitFullRequest(page);

    // Check that Ver Estado links to tracking page with token
    const verEstadoLink = page.getByRole("link", { name: /Ver Estado/ });
    const href = await verEstadoLink.getAttribute("href");

    expect(href).toContain("/track/");
    expect(href).not.toBe("/track/"); // Should have a token

    await log({ level: "step", message: "Navigate to tracking page" });

    await verEstadoLink.click();
    await expect(page).toHaveURL(/\/track\//, { timeout: 10000 });
    await assertNoErrorState(page);

    // Should show request status
    await expect(
      page.getByText(/Pendiente|En espera|Buscando proveedor/i)
    ).toBeVisible({ timeout: 5000 });

    await log({ level: "success", message: "Tracking token works correctly" });
  });

  test("C2.5: Email field validation for guests", async ({ page, log }) => {
    await log({
      level: "step",
      message: "Test email validation before submit",
    });

    // Fill Step 1 with invalid email format
    await fillStep1(page, { email: "not-an-email" });
    await page.getByTestId("next-button").click();

    // Should either show validation error or stay on Step 1
    // depending on when validation triggers
    const stillOnStep1 =
      (await page.getByText("Paso 1 de 3").isVisible()) ||
      (await page.getByText(/email.*inválido|formato.*correo/i).isVisible());

    expect(stillOnStep1).toBe(true);

    await log({
      level: "success",
      message: "Email validation prevents invalid submission",
    });
  });
});

test.describe("C1-C2 Integration", () => {
  test("Full workflow: Guest request from home to confirmation", async ({
    page,
    log,
  }) => {
    await log({ level: "step", message: "Start from home page" });

    await page.goto("/");
    await assertNoErrorState(page);

    // Click main CTA button (it's a button, not a link)
    const ctaButton = page.getByTestId("request-water-button");
    await expect(ctaButton).toBeVisible({ timeout: 10000 });
    await ctaButton.click();

    // Should navigate to request form
    await expect(page).toHaveURL(/\/request/, { timeout: 10000 });
    await assertNoErrorState(page);

    await log({ level: "step", message: "Complete form with map step" });

    // Step 1
    await fillStep1(page, { email: `fullflow-${Date.now()}@test.local` });
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step
    await skipMapStep(page);

    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

    // Step 2
    await page.getByTestId("amount-1000").click();
    await page.getByTestId("nav-next-button").click();
    await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

    // Step 3 - Submit
    await page.getByTestId("submit-button").click();

    // Confirmation
    await expect(page).toHaveURL(/\/request\/[a-f0-9-]+\/confirmation/, {
      timeout: 15000,
    });
    await expect(page.getByText("¡Solicitud Enviada!")).toBeVisible();

    await log({
      level: "success",
      message: "Complete C1-C2 workflow successful",
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

interface Step1Options {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  instructions?: string;
  skipEmail?: boolean;
}

async function fillStep1(
  page: import("@playwright/test").Page,
  options: Step1Options = {}
) {
  const {
    name = "Test User",
    phone = "+56912345678",
    email = `test-${Date.now()}@test.local`,
    address = "Calle Test 123, Villarrica",
    instructions = "Casa con reja verde",
    skipEmail = false,
  } = options;

  // Wait for comunas to load
  await expect(page.getByText("Selecciona tu comuna")).toBeVisible({
    timeout: 10000,
  });

  // Select comuna
  await page.getByTestId("comuna-select").click();
  await expect(page.getByTestId("comuna-option-villarrica")).toBeVisible({
    timeout: 5000,
  });
  await page.getByTestId("comuna-option-villarrica").click();

  // Fill contact info
  await page.getByTestId("name-input").fill(name);
  await page.getByTestId("phone-input").fill(phone);

  if (!skipEmail) {
    await page.getByTestId("email-input").fill(email);
  }

  // Fill location
  await page.getByTestId("address-input").fill(address);
  await page.getByTestId("instructions-input").fill(instructions);
}

interface SubmitOptions extends Step1Options {
  amount?: "100" | "1000" | "5000" | "10000";
}

async function submitFullRequest(
  page: import("@playwright/test").Page,
  options: SubmitOptions = {}
) {
  const { amount = "1000", ...step1Options } = options;

  // Step 1
  await fillStep1(page, step1Options);
  await page.getByTestId("next-button").click();

  // Story 12-1: Skip map step
  await skipMapStep(page);

  await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });

  // Step 2
  await page.getByTestId(`amount-${amount}`).click();
  await page.getByTestId("nav-next-button").click();
  await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

  // Step 3 - Submit
  await page.getByTestId("submit-button").click();

  // Wait for confirmation
  await expect(page).toHaveURL(/\/request\/[a-f0-9-]+\/confirmation/, {
    timeout: 15000,
  });
}
