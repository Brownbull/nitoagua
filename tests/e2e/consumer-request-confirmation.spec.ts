import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Request Confirmation Screen (Story 2-4)
 *
 * Tests cover:
 * - AC2-4-1: Success icon display
 * - AC2-4-2: "¡Solicitud Enviada!" heading
 * - AC2-4-3: Request ID display
 * - AC2-4-4: "El aguatero te contactará pronto" message
 * - AC2-4-5: Supplier phone clickable
 * - AC2-4-6: "Ver Estado" button navigation
 * - AC2-4-7: "Nueva Solicitud" button navigation
 * - AC2-4-8: Guest tracking message with URL
 */

// Mock request data for sessionStorage
// Note: These are fake test UUIDs, not real secrets
const mockRequestData = {
  id: "test-id-0000-0000-000000000001",
  trackingToken: "test-token-0000-0000-000000000001",
  status: "pending",
  createdAt: "2025-12-03T12:00:00Z",
};

test.describe("Request Confirmation Screen", () => {
  test.beforeEach(async ({ page }) => {
    // Set up sessionStorage before navigating
    await page.addInitScript((data) => {
      sessionStorage.setItem("nitoagua_last_request", JSON.stringify(data));
    }, mockRequestData);

    // Navigate to confirmation page with mock ID
    await page.goto(`/request/${mockRequestData.id}/confirmation`);
  });

  test("AC2-4-1 - displays success icon (green checkmark)", async ({
    page,
  }) => {
    // Check for the CheckCircle2 icon (rendered as SVG)
    const iconContainer = page.locator(
      ".bg-emerald-100, [class*='bg-emerald-100']"
    );
    await expect(iconContainer).toBeVisible();

    // Check for the SVG icon with correct color class
    const icon = page.locator("svg.text-emerald-500");
    await expect(icon).toBeVisible();
  });

  test("AC2-4-2 - shows '¡Solicitud Enviada!' heading", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "¡Solicitud Enviada!" });
    await expect(heading).toBeVisible();

    // Verify heading has text-2xl class (24px) and font-bold class
    const hasTextClass = await heading.evaluate((el) =>
      el.className.includes("text-2xl")
    );
    expect(hasTextClass).toBe(true);

    const hasBoldClass = await heading.evaluate((el) =>
      el.className.includes("font-bold")
    );
    expect(hasBoldClass).toBe(true);
  });

  test("AC2-4-3 - displays request ID formatted as short ID", async ({
    page,
  }) => {
    // The request ID should show first 8 characters
    const shortId = mockRequestData.id.slice(0, 8).toUpperCase();
    const requestIdText = page.getByText(`#${shortId}`);
    await expect(requestIdText).toBeVisible();

    // Should show "Solicitud #XXXXXXXX" format
    await expect(page.getByText(/Solicitud.*#/)).toBeVisible();
  });

  test("AC2-4-4 - shows 'El aguatero te contactará pronto' message", async ({
    page,
  }) => {
    const message = page.getByText("El aguatero te contactará pronto");
    await expect(message).toBeVisible();
  });

  test("AC2-4-5 - displays supplier phone in clickable format", async ({
    page,
  }) => {
    // The phone link should be a tel: link if supplier phone exists
    // If no supplier, shows "Teléfono no disponible"
    const phoneLink = page.locator('a[href^="tel:"]');
    const noPhoneMessage = page.getByText("Teléfono no disponible");

    // Either phone link OR no phone message should be visible
    const phoneVisible = await phoneLink.isVisible().catch(() => false);
    const noPhoneVisible = await noPhoneMessage.isVisible().catch(() => false);

    expect(phoneVisible || noPhoneVisible).toBe(true);

    if (phoneVisible) {
      // Verify it's clickable
      await expect(phoneLink).toBeEnabled();
      // Verify it has proper tel: href
      const href = await phoneLink.getAttribute("href");
      expect(href).toMatch(/^tel:\+?[0-9]+/);
    }
  });

  test("AC2-4-6 - 'Ver Estado' button navigates to tracking page", async ({
    page,
  }) => {
    const verEstadoButton = page.getByRole("link", { name: /Ver Estado/ });
    await expect(verEstadoButton).toBeVisible();

    // For guest users, should link to /track/[token]
    const href = await verEstadoButton.getAttribute("href");
    expect(href).toContain("/track/");

    // Click and verify navigation
    await verEstadoButton.click();
    await page.waitForURL("**/track/**");
    expect(page.url()).toContain("/track/");
  });

  test("AC2-4-7 - 'Nueva Solicitud' button navigates to request form", async ({
    page,
  }) => {
    const nuevaSolicitudButton = page.getByRole("link", {
      name: /Nueva Solicitud/,
    });
    await expect(nuevaSolicitudButton).toBeVisible();

    // Should link to /request
    const href = await nuevaSolicitudButton.getAttribute("href");
    expect(href).toBe("/request");

    // Click and verify navigation
    await nuevaSolicitudButton.click();
    await page.waitForURL("**/request");
    expect(page.url()).toContain("/request");
    expect(page.url()).not.toContain("/confirmation");
  });

  test("AC2-4-8 - guest consumers see email tracking message", async ({
    page,
  }) => {
    // Guest message about email with tracking link
    const emailMessage = page.getByText(
      /Te enviamos un email con el enlace para seguir tu solicitud/
    );
    await expect(emailMessage).toBeVisible();

    // Tracking URL should be displayed
    const trackingUrl = page.getByText(/nitoagua\.cl\/track\//);
    await expect(trackingUrl).toBeVisible();
  });

  test("buttons have minimum touch target size of 44x44px", async ({
    page,
  }) => {
    const verEstadoButton = page.getByRole("link", { name: /Ver Estado/ });
    const nuevaSolicitudButton = page.getByRole("link", {
      name: /Nueva Solicitud/,
    });

    // Wait for buttons to be visible first with extra time for webkit
    await expect(verEstadoButton).toBeVisible({ timeout: 10000 });
    await expect(nuevaSolicitudButton).toBeVisible({ timeout: 10000 });

    // Wait for layout to stabilize
    await page.waitForTimeout(500);

    // Check Ver Estado button
    const verEstadoBox = await verEstadoButton.boundingBox();
    expect(verEstadoBox).not.toBeNull();
    expect(verEstadoBox!.height).toBeGreaterThanOrEqual(44);

    // Check Nueva Solicitud button
    const nuevaSolicitudBox = await nuevaSolicitudButton.boundingBox();
    expect(nuevaSolicitudBox).not.toBeNull();
    expect(nuevaSolicitudBox!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Request Confirmation - Direct URL Access", () => {
  test("handles direct URL access without sessionStorage", async ({ page }) => {
    // Navigate directly without setting sessionStorage
    await page.goto("/request/test-request-id/confirmation");

    // Should still render the confirmation page
    const heading = page.getByRole("heading", { name: "¡Solicitud Enviada!" });
    await expect(heading).toBeVisible();

    // Should display the ID from URL (fallback)
    const requestIdText = page.getByText(/Solicitud.*#/);
    await expect(requestIdText).toBeVisible();
  });

  test("clears sessionStorage after reading", async ({ page }) => {
    // Navigate first without init script
    await page.goto(`/request/${mockRequestData.id}/confirmation`);

    // Now set sessionStorage manually via evaluate and reload
    await page.evaluate((data) => {
      sessionStorage.setItem("nitoagua_last_request", JSON.stringify(data));
    }, mockRequestData);

    // Reload the page to trigger the component to read sessionStorage
    await page.reload();

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "¡Solicitud Enviada!" })
    ).toBeVisible();

    // Wait a bit for the useEffect cleanup to run
    await page.waitForTimeout(500);

    // Check that sessionStorage was cleared
    const storageValue = await page.evaluate(() =>
      sessionStorage.getItem("nitoagua_last_request")
    );
    expect(storageValue).toBeNull();
  });
});

test.describe("Request Confirmation - Layout and Styling", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((data) => {
      sessionStorage.setItem("nitoagua_last_request", JSON.stringify(data));
    }, mockRequestData);
    await page.goto(`/request/${mockRequestData.id}/confirmation`);
  });

  test("content is centered on screen", async ({ page }) => {
    const card = page.locator('[data-slot="card"]');
    await expect(card).toBeVisible();

    // Card should be centered (max-w-md and mx-auto classes)
    const hasMaxWidth = await card.evaluate((el) =>
      el.className.includes("max-w-md")
    );
    expect(hasMaxWidth).toBe(true);

    const hasCentering = await card.evaluate((el) =>
      el.className.includes("mx-auto")
    );
    expect(hasCentering).toBe(true);
  });

  test("all text is in Spanish", async ({ page }) => {
    // Verify Spanish text is present
    await expect(page.getByText("¡Solicitud Enviada!")).toBeVisible();
    await expect(
      page.getByText("El aguatero te contactará pronto")
    ).toBeVisible();
    await expect(page.getByText(/Ver Estado/)).toBeVisible();
    await expect(page.getByText(/Nueva Solicitud/)).toBeVisible();
    await expect(page.getByText(/Solicitud #/)).toBeVisible();
  });

  test("buttons are full width", async ({ page }) => {
    const verEstadoButton = page.getByRole("link", { name: /Ver Estado/ });
    const nuevaSolicitudButton = page.getByRole("link", {
      name: /Nueva Solicitud/,
    });

    // Both buttons should have w-full class
    const verEstadoFullWidth = await verEstadoButton.evaluate((el) =>
      el.className.includes("w-full")
    );
    expect(verEstadoFullWidth).toBe(true);

    const nuevaSolicitudFullWidth = await nuevaSolicitudButton.evaluate((el) =>
      el.className.includes("w-full")
    );
    expect(nuevaSolicitudFullWidth).toBe(true);
  });
});
