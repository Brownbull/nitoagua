# Playwright Utils Integration Guide

This document describes how NitoAgua integrates `@seontechnologies/playwright-utils` for enhanced E2E testing capabilities.

## Overview

We use a **gradual adoption strategy** - starting with logging, then expanding to network utilities as we implement Epic 10+.

## Installation

```bash
npm install -D @seontechnologies/playwright-utils
```

Already installed as of Epic 8.

## Merged Fixtures

All utilities are combined in `tests/support/fixtures/merged-fixtures.ts`:

```typescript
import { test, expect } from '../support/fixtures/merged-fixtures';

test('example', async ({ page, log, recurse, interceptNetworkCall, networkErrorMonitor }) => {
  // All utilities available
});
```

### Available Fixtures

| Fixture | Purpose | Example Use Case |
|---------|---------|------------------|
| `userFactory` | Create/cleanup test users | Auth tests |
| `log` | Structured logging in reports | Debug complex flows |
| `recurse` | Poll async conditions | Wait for offer acceptance |
| `interceptNetworkCall` | Spy/stub API calls | Verify Supabase requests |
| `networkErrorMonitor` | Auto-fail on HTTP errors | Catch silent failures |

## Usage Patterns

### 1. Structured Logging

The `log` fixture is a function that takes `{ level, message }`:

```typescript
test('consumer accepts offer', async ({ page, log }) => {
  await log({ level: 'step', message: 'Navigate to offers' });
  await page.goto('/consumer/offers');

  await log({ level: 'step', message: 'Select first offer' });
  await page.click('[data-testid="offer-0"]');

  await log({ level: 'success', message: 'Offer selected successfully' });
});
```

Available levels: `info`, `step`, `success`, `warning`, `error`, `debug`

Logs appear in Playwright HTML report with clear step markers.

### 2. Network Interception

```typescript
test('offers load from API', async ({ page, interceptNetworkCall }) => {
  // Set up spy BEFORE navigation
  const offersCall = interceptNetworkCall({
    url: '**/rest/v1/offers*',
    method: 'GET',
  });

  await page.goto('/consumer/offers');

  // Wait for call and get response
  const { responseJson, status } = await offersCall;

  expect(status).toBe(200);
  expect(responseJson).toHaveLength(3);
});
```

### 3. Polling with Recurse

```typescript
test('wait for delivery status', async ({ page, recurse }) => {
  await page.goto('/consumer/tracking/123');

  // Poll until status changes
  await recurse(
    () => page.locator('[data-testid="status"]').textContent(),
    (text) => text === 'Entregado',
    { timeout: 30000, delay: 1000 }
  );
});
```

### 4. Network Error Monitoring

```typescript
test('no API errors during flow', async ({ page, networkErrorMonitor }) => {
  // Monitor starts automatically
  await page.goto('/provider/offers');
  await page.click('[data-testid="submit-offer"]');

  // Test will fail if any 4xx/5xx responses occurred
  // No explicit assertion needed - networkErrorMonitor handles it
});
```

## Migration Strategy

### Existing Tests

Keep using `@playwright/test` directly - no changes needed:

```typescript
// Still works fine
import { test, expect } from '@playwright/test';
```

### New Tests (Epic 10+)

Use merged fixtures for enhanced capabilities:

```typescript
// Recommended for new tests
import { test, expect } from '../support/fixtures/merged-fixtures';
```

### Gradual Migration

When touching existing tests, consider upgrading imports:

1. Change import to merged-fixtures
2. Add `log({ level: 'step', message: '...' })` for key actions
3. Add `interceptNetworkCall` for API verification
4. No other changes needed - tests work the same

## TestArch Workflows

These utilities integrate with BMAD TestArch workflows:

| Workflow | Command | When to Use |
|----------|---------|-------------|
| `testarch-atdd` | `/bmad:bmm:workflows:testarch-atdd` | Generate E2E tests first (TDD) |
| `testarch-automate` | `/bmad:bmm:workflows:testarch-automate` | Expand test coverage |
| `testarch-test-review` | `/bmad:bmm:workflows:testarch-test-review` | Audit test quality |
| `testarch-framework` | `/bmad:bmm:workflows:testarch-framework` | Initialize test architecture |

## Test Credentials

### Dev Login Users (NEXT_PUBLIC_DEV_LOGIN=true)

When running locally with `NEXT_PUBLIC_DEV_LOGIN=true`, these accounts are available:

| User Type | Email | Password | Use Case |
|-----------|-------|----------|----------|
| Admin | `admin@nitoagua.cl` | `admin.123` | Admin panel tests |
| Provider | `supplier@nitoagua.cl` | `supplier.123` | Provider flow tests |

### Seeded Test Users (npm run seed:test)

Run `npm run seed:test` to create deterministic test data:

| User Type | Email | Password | ID |
|-----------|-------|----------|-----|
| Test Supplier | `test-supplier@test.local` | `TestSupplier123!` | `11111111-1111-1111-1111-111111111111` |
| Test Consumer | `test-consumer@test.local` | `TestConsumer123!` | `22222222-2222-2222-2222-222222222222` |

### Seeded Test Data Scripts

| Command | Description |
|---------|-------------|
| `npm run seed:test` | Create base test users and requests |
| `npm run seed:offers` | Create offer test data (Stories 8-3, 8-4) |
| `npm run seed:earnings` | Create earnings test data (Story 8-6) |

### Using Test Data in Tests

```typescript
import { TEST_SUPPLIER, TEST_CONSUMER, TRACKING_TOKENS } from '../fixtures/test-data';

test('consumer views pending request', async ({ page }) => {
  await page.goto(`/track/${TRACKING_TOKENS.consumerPending}`);
  // Test with deterministic, seeded data
});
```

## Reference

- Package: [@seontechnologies/playwright-utils](https://github.com/seontechnologies/playwright-utils)
- BMAD Knowledge: `_bmad/bmm/testarch/knowledge/overview.md`
- Merged Fixtures: `tests/support/fixtures/merged-fixtures.ts`
- Test Data: `tests/fixtures/test-data.ts`
