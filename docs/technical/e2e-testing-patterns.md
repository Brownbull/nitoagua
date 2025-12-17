# E2E Testing Patterns

This document outlines best practices and patterns for E2E testing with Playwright, with special attention to WebKit (Safari) compatibility in WSL/Linux environments.

## Quick Reference

### Running Tests

```bash
# Run all tests on all browsers
npx playwright test

# Run specific browser
npx playwright test --project=webkit

# Run specific test file
npx playwright test tests/e2e/consumer-home.spec.ts

# Run with verbose output
npx playwright test --reporter=list

# Run with trace for debugging
npx playwright test --trace=on
```

## Critical Configuration

### Headless Mode (WSL/Linux)

**Issue:** In WSL environments with `DISPLAY` set, browsers may hang indefinitely trying to connect to a non-functional X server.

**Solution:** Explicitly set `headless: true` in Playwright config:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Ensure headless mode for WSL/Linux environments
    // This prevents hanging when DISPLAY is set to a non-functional X server
    headless: true,
  },
});
```

This fix was implemented in prep-5-5 story after investigation revealed that ~21 "flaky" WebKit tests were actually hanging due to display configuration issues, not test instability.

## Browser-Specific Patterns

### WebKit (Safari) Considerations

WebKit has stricter timing requirements than Chromium or Firefox. Here are patterns to ensure reliable tests:

#### 1. Touch Target Size Tests

```typescript
// RELIABLE: Wait for layout before measuring
test("button has adequate size", async ({ page }) => {
  await page.goto("/path");

  const button = page.getByRole("button", { name: /Submit/ });
  await expect(button).toBeVisible();

  const box = await button.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);
});
```

#### 2. CSS Assertions

```typescript
// AVOID: Direct RGB color assertions (can vary by browser)
await expect(badge).toHaveCSS("background-color", "rgb(254, 243, 199)");

// PREFER: Class-based assertions
await expect(badge).toHaveClass(/bg-amber-100/);

// ALTERNATIVE: Use flexible color matching
const bgColor = await badge.evaluate(el =>
  getComputedStyle(el).backgroundColor
);
expect(bgColor).toMatch(/rgb\(25[0-5], 24[0-9], 19[0-9]\)/);
```

#### 3. Navigation Waits

```typescript
// RELIABLE: Promise.all for click + navigation
await Promise.all([
  page.waitForURL('**/new-page'),
  button.click(),
]);

// ALTERNATIVE: Wait after navigation
await button.click();
await page.waitForURL('**/new-page');
await page.waitForLoadState('networkidle');
```

#### 4. Element Visibility

```typescript
// RELIABLE: Use toBeVisible() with appropriate timeout
await expect(page.getByText("Success")).toBeVisible({ timeout: 10000 });

// FOR DYNAMIC ELEMENTS: Wait for selector first
await page.waitForSelector('[data-testid="result"]', { state: 'visible' });
await expect(page.getByTestId('result')).toContainText('Complete');
```

## Test Organization

### Test File Structure

```typescript
import { test, expect } from "@playwright/test";

// Feature description
test.describe("Feature Name (Story X-Y)", () => {

  // Group by acceptance criteria
  test.describe("AC-X-Y-1: Specific Requirement", () => {

    test("descriptive test name", async ({ page }) => {
      // Arrange
      await page.goto("/path");

      // Act
      await page.getByRole("button", { name: /Action/ }).click();

      // Assert
      await expect(page.getByText("Result")).toBeVisible();
    });
  });
});
```

### Skip Patterns

```typescript
// Skip tests that require authentication setup
test.describe.skip("Requires Auth Setup", () => {
  // These tests need seeded users or mock auth
});

// Skip destructive tests (modify database)
test.skip("modifies data @destructive", async ({ page }) => {
  // Run manually or with fresh seed data
});
```

## Timeout Configuration

Current project timeouts (playwright.config.ts):

| Setting | Value | Purpose |
|---------|-------|---------|
| Test timeout | 60s | Overall test execution |
| Assertion timeout | 15s | expect() calls |
| Action timeout | 15s | click(), fill(), etc. |
| Navigation timeout | 30s | goto(), waitForURL() |

For slow operations, extend timeout locally:

```typescript
await expect(element).toBeVisible({ timeout: 30000 });
```

## Debugging Tips

### View Test Traces

```bash
# Enable traces for all tests
npx playwright test --trace=on

# View trace file
npx playwright show-trace test-results/artifacts/test-name/trace.zip
```

### Screenshots on Failure

Screenshots are automatically captured on failure (configured in playwright.config.ts). Find them in:
- `test-results/artifacts/[test-name]/`

### Run with UI

```bash
# Interactive mode (requires display)
npx playwright test --ui

# Debug specific test
npx playwright test --debug tests/e2e/file.spec.ts
```

## CI/CD Configuration

In CI environments, use these settings:

```typescript
export default defineConfig({
  forbidOnly: !!process.env.CI,  // Fail if test.only exists
  retries: process.env.CI ? 2 : 0,  // Retry flaky tests in CI
  workers: process.env.CI ? 1 : undefined,  // Single worker in CI
});
```

## Known Patterns by Component

### AlertDialog Tests

```typescript
test("dialog opens and closes", async ({ page }) => {
  await page.goto("/path");

  // Open dialog
  await page.getByRole("button", { name: /Open/ }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();

  // Close dialog
  await page.getByRole("button", { name: /Cancel/ }).click();
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
});
```

### Form Validation Tests

```typescript
test("shows validation errors", async ({ page }) => {
  await page.goto("/form");

  // Submit empty form
  await page.getByRole("button", { name: /Submit/ }).click();

  // Check error messages
  await expect(page.getByText(/required/i)).toBeVisible();
});
```

### API Tests (using request fixture)

```typescript
test("API returns expected response", async ({ request }) => {
  const response = await request.patch("/api/resource", {
    data: { action: "update" }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty("success", true);
});
```

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Flaky Tests](https://playwright.dev/docs/test-retries#debugging-flaky-tests)
- [WebKit Known Issues](https://github.com/microsoft/playwright/issues?q=is%3Aissue+webkit)

## Related Documentation

- [Test Data Seeding Guide](../testing/test-data-seeding-guide.md) - How to seed test data for E2E tests

---

*Last updated: 2025-12-07 (prep-5-5 story)*
