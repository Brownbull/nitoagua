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

```typescript
test('consumer accepts offer', async ({ page, log }) => {
  await log.step('Navigate to offers');
  await page.goto('/consumer/offers');

  await log.step('Select first offer');
  await page.click('[data-testid="offer-0"]');

  await log.step('Confirm selection');
  await page.click('[data-testid="confirm-button"]');
});
```

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
2. Add `log.step()` for key actions
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

## Reference

- Package: [@seontechnologies/playwright-utils](https://github.com/seontechnologies/playwright-utils)
- BMAD Knowledge: `_bmad/bmm/testarch/knowledge/overview.md`
- Merged Fixtures: `tests/support/fixtures/merged-fixtures.ts`
