import { test, expect } from "../support/fixtures/merged-fixtures";

/**
 * Story 12-5: Remove Fake Social Proof - Playwright Validation
 *
 * Validates that fake social proof metrics have been replaced with qualitative trust signals.
 *
 * Test IDs from Story 12-7:
 * - 12-5-T1: Home screen does NOT show "500+ ENTREGAS"
 * - 12-5-T2: Home screen does NOT show "50+ AGUATEROS"
 * - 12-5-T3: Home screen does NOT show "4.8 RATING"
 * - 12-5-T4: Home screen shows "Proveedores verificados" pattern
 * - 12-5-T5: Home screen shows "Agua certificada"
 * - 12-5-T6: Home screen shows "Servicio confiable" pattern (reliable service)
 */
test.describe("Story 12-5: Trust Signals Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Removed Fake Social Proof (12-5-T1 to 12-5-T3)", () => {
    test("12-5-T1: does NOT show '500+ ENTREGAS' fake metric", async ({
      page,
      log,
    }) => {
      await log({
        level: "step",
        message: "Verify fake delivery count is removed",
      });

      // Check that fake metrics are NOT present
      await expect(page.getByText(/500\+?\s*ENTREGAS/i)).not.toBeVisible();
      await expect(page.getByText(/\d+\+?\s*entregas/i)).not.toBeVisible();

      await log({
        level: "success",
        message: "Fake delivery count not displayed",
      });
    });

    test("12-5-T2: does NOT show '50+ AGUATEROS' fake metric", async ({
      page,
      log,
    }) => {
      await log({
        level: "step",
        message: "Verify fake provider count is removed",
      });

      // Check that fake provider counts are NOT present
      await expect(page.getByText(/50\+?\s*AGUATEROS/i)).not.toBeVisible();
      await expect(page.getByText(/\d+\+?\s*aguateros/i)).not.toBeVisible();
      await expect(page.getByText(/\d+\+?\s*proveedores/i)).not.toBeVisible();

      await log({
        level: "success",
        message: "Fake provider count not displayed",
      });
    });

    test("12-5-T3: does NOT show '4.8 RATING' fake metric", async ({
      page,
      log,
    }) => {
      await log({ level: "step", message: "Verify fake rating is removed" });

      // Check that fake rating metrics are NOT present
      await expect(page.getByText(/4\.[0-9]\s*RATING/i)).not.toBeVisible();
      await expect(
        page.getByText(/calificación\s*[0-9]+\.[0-9]+/i)
      ).not.toBeVisible();

      await log({ level: "success", message: "Fake rating not displayed" });
    });
  });

  test.describe("Qualitative Trust Signals (12-5-T4 to 12-5-T6)", () => {
    test("12-5-T4: shows 'Verificados' (verified providers) trust signal", async ({
      page,
      log,
    }) => {
      await log({
        level: "step",
        message: "Verify 'Verificados' trust signal is displayed",
      });

      // The benefits section shows "Verificados" with "Agua certificada" subtext
      await expect(page.getByText("Verificados")).toBeVisible();

      await log({
        level: "success",
        message: "'Verificados' trust signal displayed",
      });
    });

    test("12-5-T5: shows 'Agua certificada' trust signal", async ({
      page,
      log,
    }) => {
      await log({
        level: "step",
        message: "Verify 'Agua certificada' is displayed",
      });

      // Should show "Agua certificada" text (in benefits section)
      await expect(page.getByText("Agua certificada")).toBeVisible();

      // Also verify the quality badge has similar messaging
      await expect(page.getByText("Agua de calidad certificada")).toBeVisible();

      await log({
        level: "success",
        message: "'Agua certificada' trust signal displayed",
      });
    });

    test("12-5-T6: shows reliable service indicators", async ({ page, log }) => {
      await log({
        level: "step",
        message: "Verify service reliability trust signals",
      });

      // The benefits section shows delivery speed as reliability indicator
      await expect(page.getByText("Entrega rápida")).toBeVisible();
      await expect(page.getByText("En menos de 24h")).toBeVisible();

      // No account required = low barrier, trustworthy
      await expect(page.getByText("Sin cuenta")).toBeVisible();

      await log({
        level: "success",
        message: "Service reliability signals displayed",
      });
    });
  });

  test.describe("Overall Trust Signal Layout", () => {
    test("benefits section displays all three trust pillars", async ({
      page,
      log,
    }) => {
      await log({
        level: "step",
        message: "Verify complete benefits section layout",
      });

      // All three pillars should be visible:
      // 1. Speed: "Entrega rápida"
      await expect(page.getByText("Entrega rápida")).toBeVisible();

      // 2. Quality: "Verificados"
      await expect(page.getByText("Verificados")).toBeVisible();

      // 3. Accessibility: "Sin cuenta"
      await expect(page.getByText("Sin cuenta")).toBeVisible();

      await log({
        level: "success",
        message: "All three trust pillars displayed",
      });
    });

    test("quality badge is prominently displayed", async ({ page, log }) => {
      await log({
        level: "step",
        message: "Verify quality badge visibility",
      });

      // The green quality badge should be visible at the top
      const qualityBadge = page.getByText("Agua de calidad certificada");
      await expect(qualityBadge).toBeVisible();

      await log({ level: "success", message: "Quality badge is prominent" });
    });

    test("no numeric metrics or statistics displayed", async ({ page, log }) => {
      await log({
        level: "step",
        message: "Verify no fake statistics anywhere on page",
      });

      // Comprehensive check for any numeric social proof patterns
      await expect(page.getByText(/\d+\s*\+/)).not.toBeVisible(); // "123+"
      await expect(page.getByText(/\+\s*\d+/)).not.toBeVisible(); // "+123"

      await log({
        level: "success",
        message: "No numeric statistics displayed",
      });
    });
  });

  test.describe("Spanish Language Verification", () => {
    test("all trust signals are in Spanish", async ({ page, log }) => {
      await log({ level: "step", message: "Verify Spanish language" });

      // Spanish terms should be present
      await expect(page.getByText("Verificados")).toBeVisible();
      await expect(page.getByText("Agua certificada")).toBeVisible();
      await expect(page.getByText("Entrega rápida")).toBeVisible();
      await expect(page.getByText("Sin cuenta")).toBeVisible();

      // English equivalents should NOT be present
      await expect(page.getByText("Verified", { exact: true })).not.toBeVisible();
      await expect(
        page.getByText("Certified Water", { exact: true })
      ).not.toBeVisible();
      await expect(
        page.getByText("Fast Delivery", { exact: true })
      ).not.toBeVisible();

      await log({
        level: "success",
        message: "All trust signals verified in Spanish",
      });
    });
  });
});
