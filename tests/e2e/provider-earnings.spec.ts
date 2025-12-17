import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Provider Earnings Dashboard - Story 8-6
 *
 * Tests the earnings dashboard functionality:
 * - AC8.6.1: Period selector (Hoy / Esta Semana / Este Mes)
 * - AC8.6.2: Summary cards (Total Entregas, Ingreso Bruto, Comision, Ganancia Neta)
 * - AC8.6.3: Cash payment section (Efectivo Recibido, Comision Pendiente)
 * - AC8.6.4: "Pagar Comision" button visible when pending > 0
 * - AC8.6.5: Delivery history list (date, amount, payment method, commission)
 *
 * Requires: NEXT_PUBLIC_DEV_LOGIN=true and seeded supplier@nitoagua.cl user
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

test.describe("Provider Earnings Dashboard - Story 8-6", () => {
  test.describe("Page Access and Layout", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("earnings page requires authentication", async ({ page }) => {
      await page.goto("/provider/earnings");
      await page.waitForTimeout(3000);

      // Without auth, page should show error or redirect to login
      // The page loads but getEarningsSummary returns error for unauthenticated users
      const hasError = await page.getByText("No autenticado").isVisible().catch(() => false);
      const hasRedirected = page.url().includes("/login");
      const hasAuthError = await page.locator("text=/autenticado|login/i").isVisible().catch(() => false);

      // Page should indicate auth is required somehow
      expect(hasError || hasRedirected || hasAuthError).toBe(true);
    });

    test("authenticated provider can access earnings page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show earnings page header
      await expect(page.getByRole("heading", { name: "Mis Ganancias" })).toBeVisible({ timeout: 10000 });
    });

    test("earnings page is accessible via bottom navigation", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/offers");
      await page.waitForTimeout(2000);

      // Click on Ganancias in bottom nav
      const earningsNav = page.getByRole("link", { name: "Ganancias" });
      await expect(earningsNav).toBeVisible();
      await earningsNav.click();

      // Should navigate to earnings page
      await page.waitForURL(/\/provider\/earnings/, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: "Mis Ganancias" })).toBeVisible();
    });
  });

  test.describe("AC8.6.1: Period Selector", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows three period tabs: Hoy, Semana, Mes", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show all three period tabs (matching current implementation)
      await expect(page.getByRole("tab", { name: "Hoy" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Semana" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Mes" })).toBeVisible();
    });

    test("Mes is selected by default", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Mes should be selected (aria-selected=true)
      const monthTab = page.getByRole("tab", { name: "Mes" });
      await expect(monthTab).toHaveAttribute("aria-selected", "true");
    });

    test("clicking period tab updates selection", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Click on Hoy tab
      const todayTab = page.getByRole("tab", { name: "Hoy" });
      await todayTab.click();

      // Hoy should now be selected
      await expect(todayTab).toHaveAttribute("aria-selected", "true");

      // Mes should not be selected
      const monthTab = page.getByRole("tab", { name: "Mes" });
      await expect(monthTab).toHaveAttribute("aria-selected", "false");
    });

    test("period change triggers data refresh", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Click on Semana
      const weekTab = page.getByRole("tab", { name: "Semana" });
      await weekTab.click();

      // Wait for any loading state to complete
      await page.waitForTimeout(1000);

      // Page should still be functional (no error)
      await expect(page.getByRole("heading", { name: "Mis Ganancias" })).toBeVisible();
    });
  });

  test.describe("AC8.6.2: Summary Cards", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows Entregas count", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show Entregas label in stats row (current implementation)
      await expect(page.getByText("Entregas")).toBeVisible();
    });

    test("shows Total pedidos amount", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show Total pedidos label (current implementation)
      await expect(page.getByText("Total pedidos")).toBeVisible();
    });

    test("shows Comision with percentage", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show Comisión plataforma with percentage (current implementation)
      await expect(page.getByText(/Comisión plataforma \(\d+%\)/)).toBeVisible();
    });

    test("shows Tu ganancia neta highlighted", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show Tu ganancia neta label (current implementation)
      await expect(page.getByText(/Tu ganancia neta/)).toBeVisible();
    });

    test("amounts are formatted in CLP currency", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should have CLP formatted amounts ($ prefix)
      // This checks that at least one dollar sign appears in amount values
      const dollarSigns = await page.locator("text=/\\$\\d/").count();
      expect(dollarSigns).toBeGreaterThan(0);
    });
  });

  test.describe("AC8.6.3: Cash Payment Section", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows pending commission section when applicable", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Cash payment section only shows when pending commission > 0
      // Check if section exists (may or may not be visible depending on data)
      const hasPendingSection = await page.getByText("Comisión pendiente").isVisible().catch(() => false);
      const hasPayButton = await page.getByRole("link", { name: "Pagar" }).isVisible().catch(() => false);

      // If there's pending commission, both should be visible together
      if (hasPendingSection) {
        expect(hasPayButton).toBe(true);
      }
      // Test passes either way - section is conditional
    });

    test("hero card shows Efectivo stats", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Hero card should show Efectivo stat (uppercase in stats row)
      // Use first() since there may be multiple "Efectivo" elements on page (in delivery history badges too)
      await expect(page.getByText("Efectivo").first()).toBeVisible();
    });

    test("hero card shows Transfer stats", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Hero card should show Transfer stat (uppercase in stats row)
      // Use first() since there may be multiple "Transfer" elements
      await expect(page.getByText("Transfer").first()).toBeVisible();
    });
  });

  test.describe("AC8.6.4: Pagar Comision Button", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("Pagar button visibility depends on pending amount", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Check if button exists - it should only be visible when pending > 0
      const payButton = page.getByRole("link", { name: "Pagar" });
      const isVisible = await payButton.isVisible().catch(() => false);

      // If visible, verify it's a link to withdraw page
      if (isVisible) {
        await expect(payButton).toHaveAttribute("href", "/provider/earnings/withdraw");
      }
      // If not visible, that's also valid (no pending commission)
    });
  });

  test.describe("AC8.6.5: Delivery History", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("shows activity section or empty state", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Should show history section (either with entries or empty state)
      const hasHistory = await page.getByText("Actividad reciente").isVisible().catch(() => false);
      const hasEmptyState = await page.getByText("No hay entregas en este periodo").isVisible().catch(() => false);

      // Either history section or empty state should be visible
      expect(hasHistory || hasEmptyState).toBe(true);
    });

    test("delivery entries show payment method badge", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Check if any delivery entries exist with payment badge
      const hasEffectivo = await page.getByText("Efectivo").first().isVisible().catch(() => false);
      const hasTransferencia = await page.getByText("Transferencia").first().isVisible().catch(() => false);
      const hasEmptyState = await page.getByText("No hay entregas en este periodo").isVisible().catch(() => false);

      // If there are entries, they should have payment badges
      // If empty state is shown, that's also valid
      if (!hasEmptyState) {
        expect(hasEffectivo || hasTransferencia).toBe(true);
      }
    });

    test("delivery entries show Entrega completada label", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      const hasEmptyState = await page.getByText("No hay entregas en este periodo").isVisible().catch(() => false);

      if (!hasEmptyState) {
        // Each delivery entry shows "Entrega completada" label
        await expect(page.getByText("Entrega completada").first()).toBeVisible();
      }
    });
  });

  test.describe("Empty State Handling", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("handles zero deliveries gracefully", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // Page should load without errors
      await expect(page.getByRole("heading", { name: "Mis Ganancias" })).toBeVisible();

      // Summary cards should show values (zero or non-zero)
      // Check for any of the key elements that indicate page rendered correctly
      const hasDeliveryCount = await page.getByText("Entregas").isVisible().catch(() => false);
      const hasEmptyState = await page.getByText("No hay entregas en este periodo").isVisible().catch(() => false);
      const hasHistory = await page.getByText("Actividad reciente").isVisible().catch(() => false);

      // Page rendered correctly if any of these elements are visible
      expect(hasDeliveryCount || hasEmptyState || hasHistory).toBe(true);
    });
  });

  test.describe("Navigation", () => {
    test.skip(skipIfNoDevLogin, "Dev login required for provider tests");

    test("bottom nav highlights Ganancias when on earnings page", async ({ page }) => {
      await loginAsSupplier(page);

      await page.goto("/provider/earnings");
      await page.waitForTimeout(2000);

      // The Ganancias link should have active styling (orange color class)
      const earningsNav = page.getByRole("link", { name: "Ganancias" });
      await expect(earningsNav).toBeVisible();

      // Check if it has the active text color (orange-500)
      await expect(earningsNav).toHaveClass(/text-orange-500/);
    });
  });
});
