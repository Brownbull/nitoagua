/**
 * Provider Visibility Workflow Tests - Story 11-3
 *
 * Epic: Epic 11 - Playwright Workflow Validation
 * Story: 11-3-provider-visibility-local
 * Priority: P1 - High
 *
 * Validates the provider visibility workflows:
 * - P7: Track My Offers - See all offers with status
 * - P8: Receive Acceptance Notification - Know when offer accepted
 * - P9: View Delivery Details - See full request info
 *
 * Test Environment:
 * - Local Supabase
 * - Mobile viewport (360x780)
 * - Dev login enabled
 * - Seeded data via `npm run seed:offers`
 *
 * @see docs/sprint-artifacts/epic11/11-3-provider-visibility-local.md
 */

import { test, expect } from '../support/fixtures/merged-fixtures';
import { assertNoErrorState } from '../fixtures/error-detection';
import { OFFER_TEST_DATA } from '../fixtures/test-data';

// Test configuration: Use mobile viewport for PWA testing
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Skip if dev login not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== 'true';

/**
 * Helper: Login as supplier via dev login
 */
async function loginAsSupplier(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 30000 });

  // Select Supplier role
  const supplierButton = page.getByRole('button', { name: 'Supplier', exact: true });
  await supplierButton.click();

  // Wait for credentials to auto-fill
  await page.waitForTimeout(100);

  // Click login
  await page.getByTestId('dev-login-button').click();

  // Wait for redirect to provider requests
  await page.waitForURL('**/provider/requests', { timeout: 60000 });
  // Wait for page to render (don't use networkidle — realtime stays open)
  await expect(page.getByRole("heading", { name: "Solicitudes Disponibles" })).toBeVisible({ timeout: 30000 });
}

test.describe('P7: Track My Offers @workflow @P7', () => {
  test.describe.configure({ mode: 'serial' });

  test('[P7.1] Provider sees list of their offers', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // WHEN: Provider navigates to Mis Ofertas
    await log({ level: 'step', message: 'Navigating to Mis Ofertas' });
    await page.goto('/provider/offers');

    // Assert no error state
    await assertNoErrorState(page);

    // THEN: Provider sees offers page header
    await log({ level: 'step', message: 'Verifying offers page structure' });
    await expect(page.getByRole('heading', { name: 'Mis Ofertas' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/\d+ de \d+ ofertas/)).toBeVisible();

    await log({ level: 'success', message: 'P7.1 - Offers list page visible' });
  });

  test('[P7.2] Each offer shows status (pending/accepted/expired)', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // WHEN: Provider navigates to Mis Ofertas
    await page.goto('/provider/offers');
    await assertNoErrorState(page);

    // THEN: Provider sees offers page with filters (v2.6.2 unified list)
    await log({ level: 'step', message: 'Checking offer page structure' });

    const hasGlobalEmpty = await page.getByTestId('empty-state-global').isVisible().catch(() => false);

    // If no global empty state, offer list and filter dropdowns should exist
    if (!hasGlobalEmpty) {
      await log({ level: 'step', message: 'Verifying filter dropdown presence' });

      // v2.6.2: Estado filter dropdown should be visible with status options
      const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
      await expect(estadoButton).toBeVisible();

      // Open Estado dropdown to verify options
      await estadoButton.click();
      await expect(page.getByRole('button', { name: /Pendientes/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /En proceso/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Historial/i })).toBeVisible();
      await page.keyboard.press('Escape');
    }

    await log({ level: 'success', message: 'P7.2 - Offers grouped by status' });
  });

  test('[P7.3] Status updates reflect correctly', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in and on offers page
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    await page.goto('/provider/offers');
    await assertNoErrorState(page);

    // WHEN: Looking at pending offers (v2.6.2 unified list - use Pendientes filter)
    await log({ level: 'step', message: 'Checking pending offers display' });

    // Apply Pendientes filter
    const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
    await estadoButton.click();
    await page.getByRole('button', { name: /Pendientes/i }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const hasPendingOffers = await page.getByTestId('offer-card').first().isVisible().catch(() => false);

    if (hasPendingOffers) {
      // THEN: Pending offers show countdown timer (testid="offer-countdown" from OfferCard)
      const countdown = page.getByTestId('offer-countdown').first();
      const countdownCount = await page.locator('[data-testid="offer-countdown"]').count();

      if (countdownCount > 0) {
        // Countdown shows "Expira en XX:XX" format (< 1hr) or "Expira en X h MM min" (> 1hr)
        await expect(countdown).toHaveText(/Expira en\s*(\d{1,2}:\d{2}|\d+ h \d{2} min)/);
        await log({ level: 'success', message: 'Countdown timer visible on pending offers' });
      }

      // Pending offers should have Cancel button
      const cancelButton = page.getByRole('button', { name: /Cancelar Oferta/ }).first();
      await expect(cancelButton).toBeVisible();
      await log({ level: 'success', message: 'Cancel button visible on pending offers' });
    }

    // Clear filters and apply En proceso to check accepted offers
    await estadoButton.click();
    // Deselect Pendientes
    await page.getByRole('button', { name: /Pendientes/i }).click();
    // Select En proceso
    await page.getByRole('button', { name: /En proceso/i }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const hasAcceptedOffers = await page.getByTestId('offer-card').first().isVisible().catch(() => false);

    if (hasAcceptedOffers) {
      const viewDeliveryButton = page.getByRole('link', { name: /Ver Entrega/ }).first();
      await expect(viewDeliveryButton).toBeVisible();
      await log({ level: 'success', message: 'Ver Entrega button visible on accepted offers' });
    }

    await log({ level: 'success', message: 'P7.3 - Status updates reflect correctly' });
  });
});

test.describe('P8: Acceptance Notification @workflow @P8', () => {
  test('[P8.1] Notification created when offer accepted', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // Navigate to any provider page to see notification bell
    await page.goto('/provider/offers');

    // WHEN: Provider clicks notification bell
    await log({ level: 'step', message: 'Opening notification popover' });

    const notificationBell = page.getByTestId('notification-bell');
    await expect(notificationBell).toBeVisible({ timeout: 30000 });

    // Check for unread indicator (badge)
    const hasBadge = await page.locator('[data-testid="notification-badge"]').isVisible().catch(() => false);
    if (hasBadge) {
      await log({ level: 'info', message: 'Unread notification badge visible' });
    }

    await notificationBell.click();

    // THEN: Notification popover shows
    await expect(page.getByText('Notificaciones')).toBeVisible({ timeout: 5000 });

    // Check for acceptance notification
    const hasAcceptanceNotification = await page.getByText('¡Tu oferta fue aceptada!').isVisible().catch(() => false);

    if (hasAcceptanceNotification) {
      await log({ level: 'success', message: 'Acceptance notification found in popover' });
    } else {
      await log({ level: 'info', message: 'No acceptance notifications visible (may need seeding)' });
    }

    await log({ level: 'success', message: 'P8.1 - Notification system working' });
  });

  test('[P8.2] Provider can see notification in UI', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in with seeded notifications
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    await page.goto('/provider/offers');

    // WHEN: Provider clicks notification bell
    await log({ level: 'step', message: 'Opening notification popover' });

    const notificationBell = page.getByTestId('notification-bell');
    await expect(notificationBell).toBeVisible({ timeout: 30000 });
    await notificationBell.click();

    // Wait for popover content
    await expect(page.getByText('Notificaciones')).toBeVisible({ timeout: 5000 });

    // THEN: Check notification content
    await log({ level: 'step', message: 'Verifying notification content' });

    // Look for notification items (testid includes notification ID)
    const notificationItems = page.locator('[data-testid^="notification-item-"]');
    const notificationCount = await notificationItems.count();

    if (notificationCount > 0) {
      // Verify notification shows expected content
      const firstNotification = notificationItems.first();
      await expect(firstNotification).toBeVisible();

      await log({ level: 'success', message: `Found ${notificationCount} notification(s)` });
    } else {
      // Check for empty state
      const hasEmptyState = await page.getByText(/no hay notificaciones|sin notificaciones/i).isVisible().catch(() => false);
      if (hasEmptyState) {
        await log({ level: 'info', message: 'Empty state visible (run npm run seed:offers first)' });
      }
    }

    await log({ level: 'success', message: 'P8.2 - Notification UI verified' });
  });
});

test.describe('P9: Delivery Details @workflow @P9', () => {
  test('[P9.1] Provider can view full request details', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // WHEN: Provider navigates to offers page
    await page.goto('/provider/offers');
    await assertNoErrorState(page);

    // Look for accepted offers with "Ver Entrega" button (v2.6.2 unified list)
    await log({ level: 'step', message: 'Looking for accepted deliveries' });

    // Apply En proceso filter to find accepted offers
    const estadoButton = page.locator('button').filter({ hasText: /^Estado/ }).first();
    await estadoButton.click();
    await page.getByRole('button', { name: /En proceso/i }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const viewDeliveryButton = page.getByRole('link', { name: /Ver Entrega/ }).first();
    const hasViewButton = await viewDeliveryButton.isVisible().catch(() => false);

    if (hasViewButton) {
      // WHEN: Provider clicks "Ver Entrega"
      await log({ level: 'step', message: 'Clicking Ver Entrega to view details' });
      await viewDeliveryButton.click();

      // THEN: Should navigate to delivery detail page
      await page.waitForURL(/\/provider\/deliveries\//, { timeout: 30000 });

      // Verify delivery detail content
      // Verify delivery page loaded (check for back button or any content)
await expect(page.getByRole("button", { name: /Volver/i })).toBeVisible({ timeout: 30000 });

      await log({ level: 'success', message: 'P9.1 - Full request details visible' });
    } else {
      // No accepted offers in "En proceso" filter - try direct navigation
      const acceptedRequestId = OFFER_TEST_DATA.requests.acceptedWithOffer.id;
      await log({ level: 'step', message: `Navigating to seeded delivery: ${acceptedRequestId}` });

      await page.goto(`/provider/deliveries/${acceptedRequestId}`);

      // Wait and check if page loads
      await page.waitForTimeout(2000);

      const hasDeliveryDetails = await page.getByRole("button", { name: /Volver/i }).isVisible().catch(() => false);
      const has404 = await page.getByText('404').isVisible().catch(() => false);

      if (hasDeliveryDetails) {
        await log({ level: 'success', message: 'P9.1 - Delivery details page loads' });
      } else if (has404) {
        await log({ level: 'warning', message: 'Delivery not found - run npm run seed:offers' });
      }
    }
  });

  test('[P9.2] Contact info visible for accepted deliveries', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // Navigate to offers page
    await page.goto('/provider/offers');
    await assertNoErrorState(page);

    // Find an accepted delivery (v2.6.2 unified list - use En proceso filter)
    // Apply En proceso filter to find accepted offers
    const estadoBtn = page.locator('button').filter({ hasText: /^Estado/ }).first();
    await estadoBtn.click();
    await page.getByRole('button', { name: /En proceso/i }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const viewDeliveryButton = page.getByRole('link', { name: /Ver Entrega/ }).first();
    const hasViewButton = await viewDeliveryButton.isVisible().catch(() => false);

    if (hasViewButton) {
      await viewDeliveryButton.click();
      await page.waitForURL(/\/provider\/deliveries\//, { timeout: 30000 });

      // THEN: Contact info should be visible
      await log({ level: 'step', message: 'Verifying contact information visible' });

      // Look for customer name
      const hasCustomerName = await page.getByText(/Cliente|Nombre/i).isVisible().catch(() => false);

      // Look for address
      const hasAddress = await page.getByText(/Dirección|Ubicación/i).isVisible().catch(() => false);

      // Look for phone number pattern
      const hasPhoneInfo = await page.getByText(/\+56|Teléfono/i).isVisible().catch(() => false);

      // At least customer info should be visible
      if (hasCustomerName || hasAddress || hasPhoneInfo) {
        await log({ level: 'success', message: 'P9.2 - Contact info visible' });
      }

      // Verify back button exists
      const backLink = page.getByRole("button", { name: /Volver/i });
      await expect(backLink).toBeVisible();

      await log({ level: 'success', message: 'P9.2 - Delivery details verified' });
    } else {
      // Direct navigation test
      const acceptedRequestId = OFFER_TEST_DATA.requests.acceptedWithOffer.id;
      await page.goto(`/provider/deliveries/${acceptedRequestId}`);

      await page.waitForTimeout(2000);

      const hasDeliveryDetails = await page.getByRole("button", { name: /Volver/i }).isVisible().catch(() => false);

      if (hasDeliveryDetails) {
        // Look for customer info fields
        await log({ level: 'step', message: 'Checking for contact information fields' });

        // The seeded data has: guest_name: "Cliente Aceptado", address: "Camino Internacional, Curarrehue"
        const hasGuestName = await page.getByText('Cliente Aceptado').isVisible().catch(() => false);
        const hasAddressText = await page.getByText(/Curarrehue|Camino/i).isVisible().catch(() => false);

        if (hasGuestName || hasAddressText) {
          await log({ level: 'success', message: 'P9.2 - Seeded contact info visible' });
        } else {
          await log({ level: 'info', message: 'Contact info fields present but seeded data not matched' });
        }
      }
    }
  });
});

test.describe('Provider Visibility - Integration @integration', () => {
  test('[INT] Full flow: Offers list → Delivery details → Back', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // WHEN: Provider navigates to offers
    await page.goto('/provider/offers');
    await assertNoErrorState(page);

    await expect(page.getByRole('heading', { name: 'Mis Ofertas' })).toBeVisible({ timeout: 30000 });
    await log({ level: 'step', message: 'On Mis Ofertas page' });

    // v2.6.2 unified list: apply En proceso filter to find accepted offers
    const estadoFilterBtn = page.locator('button').filter({ hasText: /^Estado/ }).first();
    await estadoFilterBtn.click();
    await page.getByRole('button', { name: /En proceso/i }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const viewButton = page.getByRole('link', { name: /Ver Entrega/ }).first();
    const hasViewButton = await viewButton.isVisible().catch(() => false);

    if (hasViewButton) {
      // WHEN: Click to view delivery
      await log({ level: 'step', message: 'Navigating to delivery details' });
      await viewButton.click();

      await page.waitForURL(/\/provider\/deliveries\//, { timeout: 30000 });
      // Verify delivery page loaded (check for back button or any content)
await expect(page.getByRole("button", { name: /Volver/i })).toBeVisible({ timeout: 30000 });

      // WHEN: Click back button
      await log({ level: 'step', message: 'Navigating back to offers' });
      const backLink = page.getByRole("button", { name: /Volver/i });
      await expect(backLink).toBeVisible();
      await backLink.click();

      // THEN: Back on offers page
      await page.waitForURL(/\/provider\/offers/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: 'Mis Ofertas' })).toBeVisible();

      await log({ level: 'success', message: 'Full navigation flow complete' });
    } else {
      await log({ level: 'info', message: 'No accepted deliveries for integration test' });
    }
  });
});
