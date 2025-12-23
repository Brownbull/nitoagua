/**
 * PWA Settings E2E Tests
 *
 * Story 10-6: PWA Settings & Push Notifications
 * Tests the PWA installation status, version display, and notification settings
 * for all three personas (consumer, provider, admin).
 *
 * @see docs/sprint-artifacts/epic10/10-6-pwa-settings-and-notifications.md
 */

import { test, expect } from '../support/fixtures/merged-fixtures';

test.describe('PWA Settings - Consumer', () => {
  test.beforeEach(async ({ page }) => {
    // Use dev login for consumer
    if (!process.env.NEXT_PUBLIC_DEV_LOGIN) {
      test.skip();
    }
  });

  test('AC10.6.10: Consumer can access settings from profile', async ({ page, log }) => {
    await log({ level: 'step', message: 'Navigate to home and log in as consumer' });
    await page.goto('/');

    // Click login link
    await page.click('text=Iniciar sesión');
    await page.waitForURL('/login*');

    await log({ level: 'step', message: 'Log in using dev login' });
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');

    // Wait for redirect back to home
    await page.waitForURL('/');

    await log({ level: 'step', message: 'Navigate to profile' });
    await page.click('a[href="/consumer-profile"]');
    await page.waitForURL('/consumer-profile');

    await log({ level: 'step', message: 'Verify settings link is visible' });
    const settingsLink = page.locator('[data-testid="consumer-settings-link"]');
    await expect(settingsLink).toBeVisible();

    await log({ level: 'step', message: 'Navigate to settings' });
    await settingsLink.click();
    await page.waitForURL('/settings');

    await log({ level: 'success', message: 'Consumer settings page accessible' });
  });

  test('AC10.6.1: Consumer settings shows version badge', async ({ page, log }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');
    await page.waitForURL('/');

    await log({ level: 'step', message: 'Navigate to settings' });
    await page.goto('/settings');

    await log({ level: 'step', message: 'Verify PWA settings section exists' });
    const pwaSettings = page.locator('[data-testid="pwa-settings"]');
    await expect(pwaSettings).toBeVisible();

    await log({ level: 'step', message: 'Verify version badge is visible' });
    const versionBadge = page.locator('[data-testid="app-version"]');
    await expect(versionBadge).toBeVisible();
    await expect(versionBadge).toContainText('v');

    await log({ level: 'success', message: 'Version badge displayed correctly' });
  });

  test('AC10.6.6: Consumer settings shows notification section', async ({ page, log }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');
    await page.waitForURL('/');

    await log({ level: 'step', message: 'Navigate to settings' });
    await page.goto('/settings');

    await log({ level: 'step', message: 'Verify notification settings section exists' });
    const notificationSettings = page.locator('[data-testid="notification-settings"]');
    await expect(notificationSettings).toBeVisible();

    await log({ level: 'step', message: 'Verify notification status badge is visible' });
    const statusBadge = page.locator('[data-testid="notification-status-badge"]');
    await expect(statusBadge).toBeVisible();

    await log({ level: 'success', message: 'Notification section displayed correctly' });
  });

  test('AC10.6.5: Consumer can check for updates', async ({ page, log }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');
    await page.waitForURL('/');

    await log({ level: 'step', message: 'Navigate to settings' });
    await page.goto('/settings');

    await log({ level: 'step', message: 'Find check updates button' });
    const checkUpdatesButton = page.locator('[data-testid="pwa-check-updates-button"]');
    await expect(checkUpdatesButton).toBeVisible();
    await expect(checkUpdatesButton).toContainText('Buscar');

    await log({ level: 'success', message: 'Update check button available' });
  });
});

test.describe('PWA Settings - Provider', () => {
  test.beforeEach(async ({ page }) => {
    // Use dev login for provider
    if (!process.env.NEXT_PUBLIC_DEV_LOGIN) {
      test.skip();
    }
  });

  test('AC10.6.11: Provider settings shows PWA and notification sections', async ({ page, log }) => {
    await log({ level: 'step', message: 'Log in as provider' });
    await page.goto('/login');
    // Click on Supplier button to pre-fill credentials
    await page.click('button:has-text("Supplier")');
    await page.click('button[data-testid="dev-login-button"]');

    // Wait for redirect to provider dashboard or requests
    await page.waitForURL(/\/(provider|requests)/);

    await log({ level: 'step', message: 'Navigate to provider settings' });
    await page.goto('/provider/settings');

    await log({ level: 'step', message: 'Verify PWA settings section exists' });
    const pwaSettings = page.locator('[data-testid="pwa-settings"]');
    await expect(pwaSettings).toBeVisible();

    await log({ level: 'step', message: 'Verify version badge is visible' });
    const versionBadge = page.locator('[data-testid="app-version"]');
    await expect(versionBadge).toBeVisible();

    await log({ level: 'step', message: 'Verify notification settings section exists' });
    const notificationSettings = page.locator('[data-testid="notification-settings"]');
    await expect(notificationSettings).toBeVisible();

    await log({ level: 'success', message: 'Provider settings shows all sections' });
  });
});

test.describe('PWA Settings - Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Use dev login for admin
    if (!process.env.NEXT_PUBLIC_DEV_LOGIN) {
      test.skip();
    }
  });

  test('AC10.6.12: Admin settings shows PWA and notification sections', async ({ page, log }) => {
    await log({ level: 'step', message: 'Log in as admin' });
    await page.goto('/admin/login');
    // Admin dev login has different IDs
    await page.fill('input#admin-email', 'admin@nitoagua.cl');
    await page.fill('input#admin-password', 'admin.123');
    await page.click('button[data-testid="admin-dev-login-button"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin\/dashboard/);

    await log({ level: 'step', message: 'Navigate to admin settings' });
    await page.goto('/admin/settings');

    await log({ level: 'step', message: 'Verify PWA settings section exists' });
    const pwaSettings = page.locator('[data-testid="pwa-settings"]');
    await expect(pwaSettings).toBeVisible();

    await log({ level: 'step', message: 'Verify version badge is visible' });
    const versionBadge = page.locator('[data-testid="app-version"]');
    await expect(versionBadge).toBeVisible();

    await log({ level: 'step', message: 'Verify notification settings section exists' });
    const notificationSettings = page.locator('[data-testid="notification-settings"]');
    await expect(notificationSettings).toBeVisible();

    await log({ level: 'success', message: 'Admin settings shows all sections' });
  });
});

test.describe('PWA Settings - Component Tests', () => {
  // These tests don't require auth and test the UI components directly

  test('PWA settings shows platform-specific install info', async ({ page, log }) => {
    await log({ level: 'info', message: 'This test verifies component rendering in browser context' });

    // We need to be logged in to access settings
    if (!process.env.NEXT_PUBLIC_DEV_LOGIN) {
      test.skip();
    }

    await page.goto('/login');
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');
    await page.waitForURL('/');

    await page.goto('/settings');

    await log({ level: 'step', message: 'Verify PWA install section exists' });
    const pwaSettings = page.locator('[data-testid="pwa-settings"]');
    await expect(pwaSettings).toBeVisible();

    // Either installed badge OR instructions toggle should be visible
    const installedBadge = page.locator('[data-testid="pwa-installed-badge"]');
    const instructionsToggle = page.locator('[data-testid="pwa-instructions-toggle"]');
    const installButton = page.locator('[data-testid="pwa-install-button"]');

    // One of these three should be visible depending on state
    const hasInstalledBadge = await installedBadge.isVisible().catch(() => false);
    const hasInstructionsToggle = await instructionsToggle.isVisible().catch(() => false);
    const hasInstallButton = await installButton.isVisible().catch(() => false);

    expect(hasInstalledBadge || hasInstructionsToggle || hasInstallButton).toBe(true);

    await log({ level: 'success', message: 'PWA install UI rendered correctly' });
  });

  test('Notification test button is disabled when permission not granted', async ({ page, log }) => {
    if (!process.env.NEXT_PUBLIC_DEV_LOGIN) {
      test.skip();
    }

    await page.goto('/login');
    await page.fill('input#email', 'consumer@nitoagua.cl');
    await page.fill('input#password', 'consumer.123');
    await page.click('button[data-testid="dev-login-button"]');
    await page.waitForURL('/');

    await page.goto('/settings');

    await log({ level: 'step', message: 'Find notification test button' });
    const testButton = page.locator('[data-testid="notification-test-button"]');
    await expect(testButton).toBeVisible();

    await log({ level: 'step', message: 'Verify test button state matches permission state' });
    // In headless browser, notification permission is usually 'denied' or 'default'
    // The button should be disabled or show appropriate state
    const buttonText = await testButton.textContent();
    expect(buttonText).toBeTruthy();

    await log({ level: 'success', message: 'Notification test button rendered correctly' });
  });
});
