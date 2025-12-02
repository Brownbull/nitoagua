import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    // Verify page loads successfully
    await expect(page).toHaveURL('/');
  });

  // TODO: Enable after story 1-3 (auth) is implemented
  test.skip('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });

  // TODO: Enable after story 1-3 (auth) is implemented
  test.skip('should create user and login', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();

    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
