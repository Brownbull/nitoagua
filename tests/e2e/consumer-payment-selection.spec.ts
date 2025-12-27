import { test, expect, assertNoErrorState } from "../fixtures/error-detection";

/**
 * Helper to skip past the map step after filling step 1
 * Story 12-1 added a map pinpoint step between step 1 and step 2
 */
async function skipMapStep(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("map-step")).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId("map-confirm-button")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("map-confirm-button").click();
}

/**
 * Story 12-2: Payment Method Selection Tests
 * Tests the cash/transfer payment selection feature in the request form
 * Uses error-detection fixtures per Atlas Testing Section 5.2
 */
test.describe("Payment Method Selection - Story 12-2", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/request");

    // Wait for comunas to load
    await expect(page.getByText("Selecciona tu comuna")).toBeVisible({ timeout: 10000 });

    // Select comuna first
    await page.getByTestId("comuna-select").click();
    await expect(page.getByTestId("comuna-option-villarrica")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("comuna-option-villarrica").click();

    // Fill step 1 completely
    await page.getByTestId("name-input").fill("María González");
    await page.getByTestId("phone-input").fill("+56912345678");
    await page.getByTestId("address-input").fill("Camino Los Robles 123, Villarrica");
    await page.getByTestId("instructions-input").fill("Después del puente, casa azul");
    await page.getByTestId("next-button").click();

    // Story 12-1: Skip map step to get to step 2
    await skipMapStep(page);

    // Wait for step 2 (amount selection)
    await expect(page.getByText("Paso 2 de 3")).toBeVisible({ timeout: 10000 });
  });

  test.describe("AC12.2.1: Payment Selection Step", () => {
    test("payment selector is visible on step 2", async ({ page }) => {
      await expect(page.getByTestId("payment-selector")).toBeVisible();
    });

    test("displays question label for payment selection", async ({ page }) => {
      await expect(page.getByText("¿Cómo prefieres pagar?")).toBeVisible();
    });

    test("displays both payment options (cash and transfer)", async ({ page }) => {
      await expect(page.getByTestId("payment-option-cash")).toBeVisible();
      await expect(page.getByTestId("payment-option-transfer")).toBeVisible();
    });

    test("displays correct labels in Spanish", async ({ page }) => {
      await expect(page.getByText("Efectivo")).toBeVisible();
      await expect(page.getByText("Transferencia")).toBeVisible();
    });

    test("displays subtitle explanations for each option", async ({ page }) => {
      await expect(page.getByText("Paga al repartidor cuando llegue")).toBeVisible();
      await expect(page.getByText("Transfiere antes de la entrega")).toBeVisible();
    });
  });

  test.describe("AC12.2.2: Visual Design and Selection", () => {
    test("cash is selected by default", async ({ page }) => {
      const cashOption = page.getByTestId("payment-option-cash");
      await expect(cashOption).toHaveAttribute("aria-pressed", "true");

      // Check for checkmark indicator on cash option
      await expect(page.getByTestId("payment-check-cash")).toBeVisible();
    });

    test("can switch to transfer option", async ({ page }) => {
      const transferOption = page.getByTestId("payment-option-transfer");

      // Click transfer option
      await transferOption.click();

      // Verify transfer is now selected
      await expect(transferOption).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("payment-check-transfer")).toBeVisible();

      // Cash should no longer be selected
      const cashOption = page.getByTestId("payment-option-cash");
      await expect(cashOption).toHaveAttribute("aria-pressed", "false");
    });

    test("can switch back to cash after selecting transfer", async ({ page }) => {
      const cashOption = page.getByTestId("payment-option-cash");
      const transferOption = page.getByTestId("payment-option-transfer");

      // Switch to transfer
      await transferOption.click();
      await expect(transferOption).toHaveAttribute("aria-pressed", "true");

      // Switch back to cash
      await cashOption.click();
      await expect(cashOption).toHaveAttribute("aria-pressed", "true");
      await expect(transferOption).toHaveAttribute("aria-pressed", "false");
    });
  });

  test.describe("AC12.2.5: Review Screen Shows Payment Method", () => {
    test.beforeEach(async ({ page }) => {
      // Select amount to enable proceeding
      await page.getByTestId("amount-1000").click();
    });

    test("review screen shows cash payment method when cash selected", async ({ page }) => {
      // Cash is default, proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // AC 9.1.3: Assert no error states before checking content
      await assertNoErrorState(page);

      // Check payment method is shown
      await expect(page.getByTestId("review-payment-method")).toBeVisible();
      await expect(page.getByTestId("review-payment-method")).toContainText("Efectivo");
    });

    test("review screen shows transfer payment method when transfer selected", async ({ page }) => {
      // Select transfer
      await page.getByTestId("payment-option-transfer").click();

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // AC 9.1.3: Assert no error states before checking content
      await assertNoErrorState(page);

      // Check payment method is shown
      await expect(page.getByTestId("review-payment-method")).toBeVisible();
      await expect(page.getByTestId("review-payment-method")).toContainText("Transferencia");
    });

    test("review screen shows transfer info message when transfer selected", async ({ page }) => {
      // Select transfer
      await page.getByTestId("payment-option-transfer").click();

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Check transfer info message is shown
      await expect(page.getByText("Datos para transferencia:")).toBeVisible();
      await expect(page.getByText(/datos bancarios/)).toBeVisible();
    });

    test("review screen has edit link for payment method", async ({ page }) => {
      // Proceed to review with default cash
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Check edit link is visible
      await expect(page.getByTestId("edit-payment-link")).toBeVisible();
    });

    test("edit payment link returns to step 2", async ({ page }) => {
      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Wait for step 3
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Click edit payment link
      await page.getByTestId("edit-payment-link").click();

      // Should be back at step 2
      await expect(page.getByText("Paso 2 de 3")).toBeVisible();
    });
  });

  test.describe("Full Payment Selection Flow", () => {
    test("complete flow with cash payment selection", async ({ page }) => {
      // Step 2: Amount + Payment (cash default)
      await page.getByTestId("amount-1000").click();
      // Cash is selected by default
      await expect(page.getByTestId("payment-option-cash")).toHaveAttribute("aria-pressed", "true");

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Step 3: Review
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });
      await assertNoErrorState(page);
      await expect(page.getByTestId("review-payment-method")).toContainText("Efectivo");
    });

    test("complete flow with transfer payment selection", async ({ page }) => {
      // Step 2: Amount + Payment
      await page.getByTestId("amount-1000").click();
      await page.getByTestId("payment-option-transfer").click();
      await expect(page.getByTestId("payment-option-transfer")).toHaveAttribute("aria-pressed", "true");

      // Proceed to review
      await page.getByTestId("nav-next-button").click();

      // Step 3: Review
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });
      await assertNoErrorState(page);
      await expect(page.getByTestId("review-payment-method")).toContainText("Transferencia");
      await expect(page.getByText("Datos para transferencia:")).toBeVisible();
    });

    test("payment selection persists when navigating back and forth", async ({ page }) => {
      // Select transfer payment
      await page.getByTestId("payment-option-transfer").click();
      await page.getByTestId("amount-1000").click();

      // Go to review
      await page.getByTestId("nav-next-button").click();
      await expect(page.getByText("Paso 3 de 3")).toBeVisible({ timeout: 10000 });

      // Go back to step 2
      await page.getByTestId("nav-back-button").click();
      await expect(page.getByText("Paso 2 de 3")).toBeVisible();

      // Transfer should still be selected
      await expect(page.getByTestId("payment-option-transfer")).toHaveAttribute("aria-pressed", "true");
    });
  });
});
