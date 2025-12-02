# Test Suite - nitoagua

End-to-end testing infrastructure using Playwright.

## Setup

```bash
# Install dependencies (including Playwright)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# View last report
npm run test:e2e:report
```

## Directory Structure

```
tests/
├── e2e/                      # Test files
│   └── example.spec.ts       # Sample tests
├── support/                  # Framework infrastructure
│   ├── fixtures/             # Test fixtures
│   │   ├── index.ts          # Fixture exports
│   │   └── factories/        # Data factories
│   │       └── user-factory.ts
│   ├── helpers/              # Utility functions
│   └── page-objects/         # Page object models
└── README.md
```

## Architecture

### Fixtures

Custom fixtures extend Playwright's base test with project-specific utilities:

```typescript
import { test, expect } from '../support/fixtures';

test('example', async ({ page, userFactory }) => {
  const user = await userFactory.createUser();
  // Test code...
});
```

### Data Factories

Factories create test data with auto-cleanup:

```typescript
const user = await userFactory.createUser({
  email: 'custom@example.com', // Optional overrides
});
```

### Selector Strategy

Use `data-testid` attributes:

```html
<button data-testid="login-button">Login</button>
```

```typescript
await page.click('[data-testid="login-button"]');
```

## Configuration

- **Config file**: `playwright.config.ts` (project root)
- **Base URL**: `http://localhost:3005`
- **Timeouts**: action 15s, navigation 30s, test 60s
- **Browsers**: Chromium, Firefox, WebKit (Safari)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
TEST_ENV=local
BASE_URL=http://localhost:3005
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=...
```

## CI Integration

Tests run in CI with:
- Single worker (stability)
- 2 retries on failure
- JUnit XML output for reporting
- HTML report artifacts

## Best Practices

1. **Test Isolation**: Each test creates/cleans its own data
2. **Selectors**: Always use `data-testid`, never CSS classes
3. **Assertions**: Use Playwright's auto-waiting assertions
4. **Fixtures**: Share setup via fixtures, not test hooks
5. **Cleanup**: Factories auto-cleanup on test end

## Debugging

```bash
# Debug mode
npx playwright test --debug

# Trace viewer (after failure)
npx playwright show-trace test-results/.../trace.zip

# Headed + slow motion
npx playwright test --headed --slowmo=500
```
