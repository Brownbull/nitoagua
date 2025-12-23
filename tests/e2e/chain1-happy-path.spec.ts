/**
 * CHAIN-1: Core Transaction Happy Path - Local Environment
 *
 * Story: 11-1-chain1-local
 * Epic: Epic 11 - Playwright Workflow Validation
 * Priority: P0 - Critical
 *
 * Validates the complete water delivery transaction flow:
 * C1 → P5 → P6 → C2 → P10
 *
 * Test Environment:
 * - Local Supabase
 * - Mobile viewport (360x780)
 * - Dev login enabled
 *
 * @see docs/sprint-artifacts/epic11/11-1-chain1-local.md
 */

import { test, expect } from '../support/fixtures/merged-fixtures';
import { assertNoErrorState } from '../fixtures/error-detection';

// Test configuration: Use mobile viewport for PWA testing
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});

// Test credentials - from dev-login.tsx
const TEST_USERS = {
  consumer: { email: 'consumer@nitoagua.cl', password: 'consumer.123' },
  supplier: { email: 'supplier@nitoagua.cl', password: 'supplier.123' },
};

// Skip if dev login not enabled
const skipIfNoDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN !== 'true';

/**
 * Helper: Login as consumer via dev login
 */
async function loginAsConsumer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Select Consumer role
  const consumerButton = page.getByRole('button', { name: 'Consumer', exact: true });
  await consumerButton.click();

  // Click login
  await page.getByTestId('dev-login-button').click();

  // Wait for redirect to consumer home
  await page.waitForURL('**/', { timeout: 15000 });
}

/**
 * Helper: Login as supplier via dev login
 */
async function loginAsSupplier(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="dev-login-button"]', { timeout: 10000 });

  // Select Supplier role
  const supplierButton = page.getByRole('button', { name: 'Supplier', exact: true });
  await supplierButton.click();

  // Click login
  await page.getByTestId('dev-login-button').click();

  // Wait for redirect to provider requests
  await page.waitForURL('**/provider/requests', { timeout: 15000 });
}

// Shared state for the transaction chain
let requestId: string | null = null;

test.describe('CHAIN-1: Happy Path Delivery @chain1 @P0', () => {
  // Tests must run in order (serial) since they share state
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    // Reset shared state
    requestId = null;
  });

  test('[P0] C1 - Consumer creates water request', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');

    // GIVEN: Consumer is logged in
    await log({ level: 'step', message: 'Logging in as consumer' });
    await loginAsConsumer(page);

    // Assert no error state on home page
    await assertNoErrorState(page);

    // WHEN: Consumer navigates to request form
    await log({ level: 'step', message: 'Navigating to request form' });
    // Click on "Pedir Agua Ahora" button
    await page.getByRole('button', { name: /pedir agua/i }).click();
    await expect(page).toHaveURL('/request');

    // === STEP 1: Contact + Location ===
    await log({ level: 'step', message: 'Filling Step 1: Contact + Location' });

    // Name should be pre-filled from profile, but fill if empty
    const nameInput = page.getByTestId('name-input');
    if (await nameInput.inputValue() === '') {
      await nameInput.fill('Test Consumer');
    }

    // Phone - clear and fill
    const phoneInput = page.getByTestId('phone-input');
    if (await phoneInput.inputValue() === '') {
      await phoneInput.fill('+56912345678');
    }

    // Email should be pre-filled
    const emailInput = page.getByTestId('email-input');
    if (await emailInput.inputValue() === '') {
      await emailInput.fill('consumer@nitoagua.cl');
    }

    // Select comuna (required field)
    const comunaSelect = page.getByTestId('comuna-select');
    await comunaSelect.click();
    // Wait for dropdown options to appear
    const firstComuna = page.locator('[data-testid^="comuna-option-"]').first();
    await firstComuna.waitFor({ state: 'visible', timeout: 5000 });
    await firstComuna.click();

    // Address
    const addressInput = page.getByTestId('address-input');
    await addressInput.fill('Camino Los Robles 123, Villarrica');

    // Special instructions (optional)
    const instructionsInput = page.getByTestId('instructions-input');
    await instructionsInput.fill('Casa azul con portón verde');

    // Click next button to go to Step 2
    await page.getByTestId('next-button').click();

    // === STEP 2: Amount Selection ===
    await log({ level: 'step', message: 'Filling Step 2: Amount' });

    // Wait for step 2 to load
    await expect(page.getByTestId('amount-1000')).toBeVisible({ timeout: 5000 });

    // Select 1000L option
    await page.getByTestId('amount-1000').click();

    // Click "Siguiente" button in header to go to Step 3
    await page.getByTestId('nav-next-button').click();

    // === STEP 3: Review & Confirm ===
    await log({ level: 'step', message: 'Step 3: Reviewing and confirming' });

    // Wait for review screen
    await expect(page.getByTestId('review-screen')).toBeVisible({ timeout: 5000 });

    // Click the main "Confirmar Pedido" button (green button in content)
    await page.getByTestId('submit-button').click();

    // Wait for submission - could show loading state
    await log({ level: 'step', message: 'Waiting for submission...' });

    // THEN: Consumer sees confirmation page with tracking code
    await log({ level: 'step', message: 'Verifying confirmation' });

    // Wait for either:
    // 1. Successful navigation to confirmation page
    // 2. Error toast (to detect failures early)
    await Promise.race([
      page.waitForURL(/\/request\/[a-z0-9-]+\/confirmation/, { timeout: 30000 }),
      page.locator('[data-sonner-toast][data-type="error"]').waitFor({ timeout: 30000 }).then(() => {
        throw new Error('Request submission failed - error toast appeared');
      }),
    ]);

    await expect(page.getByText(/solicitud enviada|pedido confirmado/i)).toBeVisible();

    // Capture request ID from URL for subsequent tests
    const url = page.url();
    const match = url.match(/\/request\/([a-z0-9-]+)\/confirmation/);
    if (match) {
      requestId = match[1];
      await log({ level: 'success', message: `Request created: ${requestId}` });
    }

    expect(requestId).toBeTruthy();
  });

  test('[P0] P5 - Provider sees request in dashboard', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');
    test.skip(!requestId, 'Requires request from C1 test');

    // GIVEN: Provider is logged in (redirects to /provider/requests)
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // Assert no error state
    await assertNoErrorState(page);

    // WHEN: Provider is on request dashboard (already there after login)
    await log({ level: 'step', message: 'Viewing request dashboard' });

    // THEN: The consumer's request should appear
    await log({ level: 'step', message: 'Looking for consumer request' });

    // Wait for request cards to appear - they contain "1 mil litros" text
    await expect(page.getByText(/1 mil litros/i).first()).toBeVisible({ timeout: 10000 });

    // Find the specific request we created by using the requestId
    // The "Ver" link should point to our request
    const viewLink = page.locator(`a[href="/provider/requests/${requestId}"]`);
    await expect(viewLink).toBeVisible({ timeout: 5000 });

    // Click on "Ver" to view request details
    await log({ level: 'step', message: 'Clicking Ver to view details' });
    await viewLink.click();

    // THEN: Should navigate to request detail page
    await page.waitForURL(`/provider/requests/${requestId}`, { timeout: 10000 });

    await log({ level: 'success', message: 'Request visible and clickable in provider dashboard' });
  });

  test('[P0] P6 - Provider submits offer', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');
    test.skip(!requestId, 'Requires request from C1 test');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // GIVEN: Provider navigates directly to request detail
    await log({ level: 'step', message: 'Navigating to request detail' });
    await page.goto(`/provider/requests/${requestId}`);

    // Wait for request detail page to load
    await expect(page.getByText(/detalles|solicitud/i)).toBeVisible({ timeout: 10000 });

    // WHEN: Provider fills offer form
    await log({ level: 'step', message: 'Looking for offer form' });

    // The offer form should be visible on the request detail page
    // Look for submit button or form elements
    const submitOfferButton = page.getByRole('button', { name: /enviar oferta|ofertar|submit/i });

    // If there's a form with delivery times, fill them
    const deliveryTimeInput = page.locator('input[type="time"]').first();
    if (await deliveryTimeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await log({ level: 'step', message: 'Filling delivery time' });
      // Set delivery time to 2 hours from now
      const now = new Date();
      now.setHours(now.getHours() + 2);
      const deliveryTime = `${String(now.getHours()).padStart(2, '0')}:00`;
      await deliveryTimeInput.fill(deliveryTime);
    }

    // Check for message input
    const messageInput = page.locator('textarea, input[type="text"][placeholder*="mensaje"], input[type="text"][placeholder*="nota"]').first();
    if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messageInput.fill('Confirmo entrega');
    }

    // WHEN: Provider submits offer
    await log({ level: 'step', message: 'Submitting offer' });
    await expect(submitOfferButton).toBeVisible({ timeout: 5000 });
    await submitOfferButton.click();

    // THEN: Offer is created - wait for success indication
    await log({ level: 'step', message: 'Verifying offer created' });

    // Wait for either navigation away or success toast
    await Promise.race([
      page.waitForURL(/\/provider\/offers/, { timeout: 15000 }),
      page.locator('[data-sonner-toast]').filter({ hasText: /oferta|enviada|success/i }).waitFor({ timeout: 15000 }),
      page.getByText(/oferta enviada|enviado/i).waitFor({ timeout: 15000 }),
    ]).catch(() => {
      // If none of these happened, the button might have changed state
    });

    // Navigate to Mis Ofertas to verify the offer exists
    await page.goto('/provider/offers');
    await expect(page.getByText(/activ|pending|en espera/i)).toBeVisible({ timeout: 10000 });

    await log({ level: 'success', message: 'Offer submitted successfully' });
  });

  test('[P0] C2 - Consumer accepts offer', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');
    test.skip(!requestId, 'Requires request from C1 test');

    // GIVEN: Consumer is logged in
    await log({ level: 'step', message: 'Logging in as consumer' });
    await loginAsConsumer(page);

    // WHEN: Consumer navigates to their request
    await log({ level: 'step', message: 'Navigating to request tracking' });
    await page.goto(`/request/${requestId}`);

    // Wait for the page to load
    await expect(page.getByText(/tu solicitud/i)).toBeVisible({ timeout: 10000 });

    // THEN: Consumer should see the provider's offer
    await log({ level: 'step', message: 'Looking for offer' });

    // Look for "Ofertas activas" text or offer count
    await expect(page.getByText(/ofertas? activas?/i)).toBeVisible({ timeout: 15000 });

    // Find and click the "Seleccionar oferta" button
    const selectOfferButton = page.getByRole('button', { name: /seleccionar oferta/i });
    await expect(selectOfferButton).toBeVisible({ timeout: 10000 });

    // WHEN: Consumer accepts the offer
    await log({ level: 'step', message: 'Accepting offer' });
    await selectOfferButton.click();

    // Handle confirmation dialog if present
    const confirmButton = page.getByRole('button', { name: /confirmar|aceptar/i });
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // THEN: Status should change to accepted - wait for page update
    await log({ level: 'step', message: 'Verifying acceptance' });

    // Wait for the success heading that indicates offer was accepted
    // "¡Tu agua viene en camino!" appears after successful offer acceptance
    await expect(
      page.getByRole('heading', { name: /tu agua viene en camino/i })
    ).toBeVisible({ timeout: 15000 });

    await log({ level: 'success', message: 'Offer accepted successfully' });
  });

  /**
   * P10 - Provider Completes Delivery
   *
   * Story: 11A-1 P10 Delivery Completion
   * FR31: Suppliers can mark an accepted request as delivered
   *
   * Implementation: src/lib/actions/delivery.ts, delivery-detail-client.tsx
   *
   * Flow:
   * 1. Navigate to /provider/offers (Entregas Activas section)
   * 2. Click on the accepted delivery
   * 3. Click "Marcar como Entregado" (data-testid="complete-delivery-button")
   * 4. Confirm in dialog
   * 5. Verify success toast and redirect
   */
  test('[P0] P10 - Provider completes delivery', async ({ page, log }) => {
    test.skip(skipIfNoDevLogin, 'Dev login required for E2E tests');
    test.skip(!requestId, 'Requires request from C1 test');

    // GIVEN: Provider is logged in
    await log({ level: 'step', message: 'Logging in as supplier' });
    await loginAsSupplier(page);

    // Navigate to offers page to find accepted delivery
    await log({ level: 'step', message: 'Navigating to Mis Ofertas' });
    await page.goto('/provider/offers');

    // Find accepted delivery in "Entregas Activas" section
    await log({ level: 'step', message: 'Finding active delivery' });
    const activeSection = page.getByTestId('section-accepted');
    await expect(activeSection).toBeVisible({ timeout: 10000 });

    // Find the specific delivery for our request using the requestId
    // The link points to /provider/deliveries/{requestId}
    const deliveryLink = activeSection.locator(`a[href="/provider/deliveries/${requestId}"]`);
    await expect(deliveryLink).toBeVisible({ timeout: 5000 });

    // Click to view delivery details
    await deliveryLink.click();
    await page.waitForURL(`/provider/deliveries/${requestId}`);

    // WHEN: Provider marks delivery as complete
    await log({ level: 'step', message: 'Clicking complete button' });
    const completeButton = page.getByTestId('complete-delivery-button');
    await expect(completeButton).toBeVisible({ timeout: 5000 });
    await expect(completeButton).toBeEnabled({ timeout: 5000 });

    // Click the complete button
    await completeButton.click();

    // WHEN: Provider confirms in dialog
    await log({ level: 'step', message: 'Confirming delivery in dialog' });
    const confirmButton = page.getByRole('button', { name: /confirmar entrega/i });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // THEN: Verify success - wait for either toast or redirect
    await log({ level: 'step', message: 'Verifying success' });

    await Promise.race([
      // Success toast appears
      page.locator('[data-sonner-toast]').filter({
        hasText: /entrega completada/i,
      }).waitFor({ timeout: 15000 }),
      // Or redirected to offers page
      page.waitForURL('**/provider/offers', { timeout: 15000 }),
    ]);

    await log({ level: 'success', message: 'Delivery completed successfully - CHAIN-1 COMPLETE!' });
  });
});
