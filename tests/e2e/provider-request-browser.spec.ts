import { test, expect } from "@playwright/test";
import { assertNoErrorState } from "../fixtures/error-detection";

/**
 * E2E Tests for Provider Request Browser - Story 8-1
 *
 * Tests the request browser functionality for verified providers:
 * - AC8.1.1: Verified, available provider sees pending requests in service areas
 * - AC8.1.2: Request card shows: location, amount, urgency, time posted, offer count
 * - AC8.1.3: Requests sorted by urgency first, then by time
 * - AC8.1.4: Real-time updates via Supabase Realtime
 * - AC8.1.5: Requests disappear when filled or timed out
 * - AC8.1.6: Unavailable provider sees empty state with toggle prompt
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded supplier@nitoagua.cl user
 *
 * IMPORTANT: Tests use explicit error detection to fail on DB issues.
 * See Story Testing-1 for reliability improvements.
 */

// Skip tests if dev login is not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== "true";

// Helper to login as supplier
async function loginAsSupplier(page: import("@playwright/test").Page) {
  await page.goto("/login");

  // Wait for dev login section to be visible
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Click supplier button in role selector (exact match to avoid "New Supplier")
  const supplierButton = page.getByRole("button", { name: "Supplier", exact: true });
  await supplierButton.click();

  // Wait a moment for the email/password to auto-fill
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId("dev-login-button").click();
  await page.waitForURL("**/provider/requests", { timeout: 15000 });
}

test.describe("Provider Request Browser - Story 8-1", () => {
  test.describe("AC8.1.1: Verified Provider Access", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("verified provider can navigate to request browser", async ({ page }) => {
      await loginAsSupplier(page);

      // Navigate to request browser
      await page.goto("/provider/requests");

      // Should see the request browser page
      await expect(page.getByText("Solicitudes Disponibles")).toBeVisible({ timeout: 10000 });
    });

    test("page shows subtitle about service areas", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/requests");

      await expect(page.getByText("Solicitudes de agua en tus áreas de servicio")).toBeVisible();
    });

    test("connection status indicator is visible", async ({ page }) => {
      await loginAsSupplier(page);
      await page.goto("/provider/requests");

      // Should see some connection status (either connected or polling)
      const connectionText = page.getByText(/Actualizaciones en tiempo real|Usando actualización periódica|Conectando/);
      await expect(connectionText).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("AC8.1.6: Unavailable Provider State", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("unavailable provider sees prompt to activate availability", async ({ page }) => {
      await loginAsSupplier(page);

      // First, ensure we're unavailable
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");

      if (currentState === "checked") {
        // Turn OFF
        await switchElement.click();

        // Handle warning dialog if it appears
        const warningDialog = page.getByTestId("active-deliveries-warning-dialog");
        const isWarningVisible = await warningDialog.isVisible().catch(() => false);
        if (isWarningVisible) {
          await page.getByTestId("confirm-unavailable-button").click();
        }
        await page.waitForTimeout(1000);
      }

      // Navigate to request browser
      await page.goto("/provider/requests");

      // Should see unavailable state
      const unavailableState = page.getByTestId("unavailable-state");
      await expect(unavailableState).toBeVisible({ timeout: 10000 });

      // Should show the prompt message
      await expect(page.getByText("No estás disponible")).toBeVisible();
      await expect(page.getByText("Activa tu disponibilidad")).toBeVisible();
    });

    test("unavailable state has link to settings", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure unavailable state
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");

      if (currentState === "checked") {
        await switchElement.click();
        const warningDialog = page.getByTestId("active-deliveries-warning-dialog");
        const isWarningVisible = await warningDialog.isVisible().catch(() => false);
        if (isWarningVisible) {
          await page.getByTestId("confirm-unavailable-button").click();
        }
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");

      // Should have a button to activate availability
      const activateButton = page.getByRole("link", { name: /Activar Disponibilidad/i });
      await expect(activateButton).toBeVisible();
    });
  });

  test.describe("AC8.1.2: Request Card Content", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("request cards display expected elements when available", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure available
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      // FIRST: Check for error states - fail if any database errors present
      await assertNoErrorState(page);

      // Check if there are requests or empty state
      const requestList = page.getByTestId("request-list");
      const emptyState = page.getByTestId("empty-requests-state");

      const hasRequests = await requestList.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      // Either we see requests or empty state - both are valid
      // This is now safe because we checked for errors first
      expect(
        hasRequests || isEmpty,
        "Expected either 'request-list' or 'empty-requests-state' to be visible"
      ).toBe(true);

      if (hasRequests) {
        // If there are requests, verify card elements
        const firstCard = page.getByTestId("request-card").first();
        await expect(firstCard).toBeVisible();

        // Should have "Ver Detalles" button
        const viewDetailsButton = page.getByTestId("view-details-button").first();
        await expect(viewDetailsButton).toBeVisible();
      }
    });

    test("empty state shows appropriate message", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure available
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");
      await page.waitForTimeout(2000);

      const emptyState = page.getByTestId("empty-requests-state");
      const isEmpty = await emptyState.isVisible().catch(() => false);

      if (isEmpty) {
        await expect(page.getByText("No hay solicitudes disponibles")).toBeVisible();
      }
    });
  });

  test.describe("AC8.1.4: Real-time Updates", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("refresh button is visible and clickable", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure available
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");

      // Should have a refresh button
      const refreshButton = page.getByRole("button", { name: /Actualizar/i });
      await expect(refreshButton).toBeVisible();

      // Click refresh
      await refreshButton.click();
      await page.waitForTimeout(1000);

      // Page should still be on request browser
      await expect(page.getByText("Solicitudes Disponibles")).toBeVisible();
    });

    test("connection indicator updates based on websocket status", async ({ page }) => {
      await loginAsSupplier(page);

      // Ensure available
      const switchElement = page.getByTestId("availability-switch");
      const currentState = await switchElement.getAttribute("data-state");
      if (currentState === "unchecked") {
        await switchElement.click();
        await page.waitForTimeout(1000);
      }

      await page.goto("/provider/requests");

      // Give time for WebSocket to connect or fall back to polling
      await page.waitForTimeout(3000);

      // Should show either connected state or polling fallback
      const connectionStatus = page.getByText(/Actualizaciones en tiempo real|Usando actualización periódica/);
      await expect(connectionStatus).toBeVisible();
    });
  });

  test.describe("Navigation and Routing", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("unauthenticated user is redirected to login", async ({ page }) => {
      await page.goto("/provider/requests");

      // Should redirect to login
      await page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
    });

    test("non-supplier user is redirected to home", async ({ page }) => {
      // Login as consumer instead
      await page.goto("/login");
      await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

      // Try to find consumer role button
      const consumerButton = page.getByRole("button", { name: "Consumer", exact: true });
      const hasConsumerButton = await consumerButton.isVisible().catch(() => false);

      if (hasConsumerButton) {
        await consumerButton.click();
        await page.waitForTimeout(100);
        await page.getByTestId("dev-login-button").click();

        // Wait for login to complete
        await page.waitForTimeout(2000);

        // Try to access provider requests page
        await page.goto("/provider/requests");

        // Should redirect to home or show error
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        expect(currentUrl).not.toContain("/provider/requests");
      }
    });
  });
});

test.describe("Provider Request Browser - Integration Tests", () => {
  test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

  test("full flow: login, navigate, and interact with request browser", async ({ page }) => {
    // Login
    await loginAsSupplier(page);

    // Ensure availability is ON
    const switchElement = page.getByTestId("availability-switch");
    const currentState = await switchElement.getAttribute("data-state");
    if (currentState === "unchecked") {
      await switchElement.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to request browser
    await page.goto("/provider/requests");

    // Verify page loads correctly
    await expect(page.getByText("Solicitudes Disponibles")).toBeVisible({ timeout: 10000 });

    // FIRST: Check for error states - fail if any database errors present
    await page.waitForTimeout(2000);
    await assertNoErrorState(page);

    // Check for either requests or empty state
    const hasContent = await page.getByTestId("request-list").isVisible().catch(() => false) ||
                       await page.getByTestId("empty-requests-state").isVisible().catch(() => false);

    expect(
      hasContent,
      "Expected either 'request-list' or 'empty-requests-state' to be visible"
    ).toBe(true);
  });

  test("request browser maintains state after navigation", async ({ page }) => {
    await loginAsSupplier(page);

    // Navigate to request browser
    await page.goto("/provider/requests");
    await page.waitForTimeout(2000);

    // Navigate away
    await page.goto("/dashboard");
    await page.waitForTimeout(1000);

    // Navigate back
    await page.goto("/provider/requests");

    // Should still see the request browser
    await expect(page.getByText("Solicitudes Disponibles")).toBeVisible({ timeout: 10000 });
  });
});
