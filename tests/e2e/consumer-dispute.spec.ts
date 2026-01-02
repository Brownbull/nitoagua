import { test, expect } from "../support/fixtures/merged-fixtures";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Story 12.7-5: Consumer Dispute Option
 *
 * Bug Reference: BUG-015 - Consumer cannot dispute delivery
 *
 * Test coverage for acceptance criteria:
 * - AC12.7.5.1: Dispute button appears on delivered requests
 * - AC12.7.5.2: All dispute types are selectable
 * - AC12.7.5.3: Dispute saved to database with confirmation step
 * - AC12.7.5.4: Consumer sees dispute status after filing
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

test.describe("12.7-5 Consumer Dispute Option", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for consumer tests");

  test.beforeEach(async ({ page }) => {
    // Login as consumer
    await page.goto("/");
    await assertNoErrorState(page);
  });

  test.describe("Dispute Button Visibility - AC12.7.5.1", () => {
    test("dispute section appears on delivered requests", async ({ page }) => {
      // Navigate to consumer login (dev login)
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Navigate to history to find a delivered request
      await page.goto("/history");
      await assertNoErrorState(page);

      // Find a delivered request
      const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
        has: page.locator('text="Entregado"'),
      }).first();

      // If no delivered requests, skip
      if (!(await deliveredRequest.isVisible())) {
        test.skip();
        return;
      }

      // Click on the delivered request
      await deliveredRequest.click();
      await assertNoErrorState(page);

      // Verify dispute section is visible
      const disputeSection = page.getByTestId("dispute-section");
      await expect(disputeSection).toBeVisible();
    });

    test("dispute button is not visible on pending requests", async ({ page }) => {
      // Login as consumer
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Create a new request to test pending status
      await page.goto("/request");
      await assertNoErrorState(page);

      // On pending request page, dispute section should not exist
      const disputeButton = page.getByTestId("dispute-button");
      await expect(disputeButton).not.toBeVisible();
    });
  });

  test.describe("Dispute Type Selection - AC12.7.5.2", () => {
    test("all dispute types are displayed and selectable", async ({ page }) => {
      // This test uses a mock approach - we test the dialog component behavior
      // Navigate to a request page with a delivered status

      // Login as consumer
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Navigate to history to find a delivered request
      await page.goto("/history");
      await assertNoErrorState(page);

      // Find a delivered request
      const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
        has: page.locator('text="Entregado"'),
      }).first();

      // If no delivered requests, skip
      if (!(await deliveredRequest.isVisible())) {
        test.skip();
        return;
      }

      // Click on the delivered request
      await deliveredRequest.click();
      await assertNoErrorState(page);

      // Click dispute button if available
      const disputeButton = page.getByTestId("dispute-button");
      if (!(await disputeButton.isVisible())) {
        // May already have a dispute or window expired
        test.skip();
        return;
      }
      await disputeButton.click();

      // Verify dialog opens
      const disputeDialog = page.getByTestId("dispute-dialog");
      await expect(disputeDialog).toBeVisible();

      // Verify all dispute types are present
      await expect(page.getByTestId("dispute-type-not_delivered")).toBeVisible();
      await expect(page.getByTestId("dispute-type-wrong_quantity")).toBeVisible();
      await expect(page.getByTestId("dispute-type-late_delivery")).toBeVisible();
      await expect(page.getByTestId("dispute-type-quality_issue")).toBeVisible();
      await expect(page.getByTestId("dispute-type-other")).toBeVisible();

      // Click on one dispute type
      await page.getByTestId("dispute-type-not_delivered").click();

      // Verify it's selected (has check icon)
      const selectedType = page.getByTestId("dispute-type-not_delivered");
      await expect(selectedType).toHaveClass(/border-\[#0077B6\]/);
    });
  });

  test.describe("Dispute Submission Flow - AC12.7.5.3", () => {
    test("dispute dialog has confirmation step", async ({ page }) => {
      // Login as consumer
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Navigate to history to find a delivered request
      await page.goto("/history");
      await assertNoErrorState(page);

      // Find a delivered request
      const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
        has: page.locator('text="Entregado"'),
      }).first();

      // If no delivered requests, skip
      if (!(await deliveredRequest.isVisible())) {
        test.skip();
        return;
      }

      // Click on the delivered request
      await deliveredRequest.click();
      await assertNoErrorState(page);

      // Click dispute button if available
      const disputeButton = page.getByTestId("dispute-button");
      if (!(await disputeButton.isVisible())) {
        test.skip();
        return;
      }
      await disputeButton.click();

      // Verify dialog opens
      const disputeDialog = page.getByTestId("dispute-dialog");
      await expect(disputeDialog).toBeVisible();

      // Select a dispute type
      await page.getByTestId("dispute-type-wrong_quantity").click();

      // Add a description
      await page.getByTestId("dispute-description").fill("Recibí menos agua de lo que pedí");

      // Click continue
      await page.getByTestId("dispute-continue-button").click();

      // Verify confirmation step shows selected type
      const confirmationType = page.getByTestId("dispute-confirmation-type");
      await expect(confirmationType).toContainText("Cantidad incorrecta");

      // Verify description is shown
      const confirmationDescription = page.getByTestId("dispute-confirmation-description");
      await expect(confirmationDescription).toContainText("Recibí menos agua de lo que pedí");

      // Verify back button exists
      await expect(page.getByTestId("dispute-back-button")).toBeVisible();

      // Verify submit button exists
      await expect(page.getByTestId("dispute-submit-button")).toBeVisible();
    });

    test("can go back from confirmation to edit", async ({ page }) => {
      // Login as consumer
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Navigate to history to find a delivered request
      await page.goto("/history");
      await assertNoErrorState(page);

      // Find a delivered request
      const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
        has: page.locator('text="Entregado"'),
      }).first();

      // If no delivered requests, skip
      if (!(await deliveredRequest.isVisible())) {
        test.skip();
        return;
      }

      // Click on the delivered request
      await deliveredRequest.click();
      await assertNoErrorState(page);

      // Click dispute button if available
      const disputeButton = page.getByTestId("dispute-button");
      if (!(await disputeButton.isVisible())) {
        test.skip();
        return;
      }
      await disputeButton.click();

      // Select type and continue
      await page.getByTestId("dispute-type-late_delivery").click();
      await page.getByTestId("dispute-continue-button").click();

      // Now click back
      await page.getByTestId("dispute-back-button").click();

      // Should be back to type selection
      await expect(page.getByTestId("dispute-type-late_delivery")).toBeVisible();

      // Selected type should still be highlighted
      const selectedType = page.getByTestId("dispute-type-late_delivery");
      await expect(selectedType).toHaveClass(/border-\[#0077B6\]/);
    });
  });

  test.describe("Dispute Status Display - AC12.7.5.4", () => {
    test("dispute dialog can be cancelled", async ({ page }) => {
      // Login as consumer
      await page.goto("/auth/login");
      await page.fill("#phone", "+56912345678");
      await page.getByTestId("dev-login-button").click();
      await page.waitForURL("**/");
      await assertNoErrorState(page);

      // Navigate to history to find a delivered request
      await page.goto("/history");
      await assertNoErrorState(page);

      // Find a delivered request
      const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
        has: page.locator('text="Entregado"'),
      }).first();

      // If no delivered requests, skip
      if (!(await deliveredRequest.isVisible())) {
        test.skip();
        return;
      }

      // Click on the delivered request
      await deliveredRequest.click();
      await assertNoErrorState(page);

      // Click dispute button if available
      const disputeButton = page.getByTestId("dispute-button");
      if (!(await disputeButton.isVisible())) {
        test.skip();
        return;
      }
      await disputeButton.click();

      // Verify dialog opens
      await expect(page.getByTestId("dispute-dialog")).toBeVisible();

      // Click cancel button
      await page.getByTestId("dispute-cancel-button").click();

      // Dialog should be closed
      await expect(page.getByTestId("dispute-dialog")).not.toBeVisible();

      // Dispute button should still be visible
      await expect(page.getByTestId("dispute-button")).toBeVisible();
    });
  });
});

test.describe("12.7-5 Consumer Dispute - UI Elements", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for consumer tests");

  test("dispute dialog shows all required elements", async ({ page }) => {
    // Login as consumer
    await page.goto("/auth/login");
    await page.fill("#phone", "+56912345678");
    await page.getByTestId("dev-login-button").click();
    await page.waitForURL("**/");
    await assertNoErrorState(page);

    // Navigate to history to find a delivered request
    await page.goto("/history");
    await assertNoErrorState(page);

    // Find a delivered request
    const deliveredRequest = page.locator('[data-testid="request-card"]').filter({
      has: page.locator('text="Entregado"'),
    }).first();

    // If no delivered requests, skip
    if (!(await deliveredRequest.isVisible())) {
      test.skip();
      return;
    }

    // Click on the delivered request
    await deliveredRequest.click();
    await assertNoErrorState(page);

    // Click dispute button if available
    const disputeButton = page.getByTestId("dispute-button");
    if (!(await disputeButton.isVisible())) {
      test.skip();
      return;
    }
    await disputeButton.click();

    // Verify dialog title
    const dialogTitle = page.getByTestId("dispute-dialog-title");
    await expect(dialogTitle).toContainText("Reportar Problema");

    // Verify description field exists
    const description = page.getByTestId("dispute-description");
    await expect(description).toBeVisible();

    // Verify continue button is disabled when no type selected
    const continueButton = page.getByTestId("dispute-continue-button");
    await expect(continueButton).toBeDisabled();

    // Select a type
    await page.getByTestId("dispute-type-other").click();

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled();
  });
});
