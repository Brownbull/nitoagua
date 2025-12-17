# Story Testing-1: E2E Testing Reliability Improvements

| Field | Value |
|-------|-------|
| **Epic** | Testing & Quality (Tech Debt) |
| **Story ID** | Testing-1 |
| **Status** | in-progress |
| **Priority** | High |
| **Created** | 2025-12-17 |

## Problem Statement

During E2E testing of the provider flow, we discovered that tests were **passing silently** even when critical database issues existed:

1. **Missing tables** - `provider_service_areas` returning 404 (table doesn't exist in local Supabase)
2. **RLS permission errors** - `notifications` returning 403 (permission denied)
3. **Schema mismatches** - Local Supabase out of sync with production

The tests passed because they accepted either "data present" OR "empty state" as valid outcomes, never distinguishing between "no data" and "database error".

### Evidence

Console errors observed when logging in as test supplier:
```
GET http://127.0.0.1:55326/rest/v1/provider_service_areas?select=comuna_id&provider_id=eq.0b3739a2-b8a4-43fa-adf0-90a45cc0d6dd 404 (Not Found)

GET http://127.0.0.1:55326/rest/v1/notifications?select=*&user_id=eq.0b3739a2-b8a4-43fa-adf0-90a45cc0d6dd 403 (Forbidden)

[Notifications] Error fetching: {code: '42501', details: null, hint: null, message: 'permission denied for table users'}
```

### Why Tests Didn't Catch This

Tests like this pattern pass even when the database is broken:
```typescript
// BAD PATTERN - Always passes!
const hasEmptyState = await page.getByText("No hay entregas").isVisible().catch(() => false);
const hasData = await page.getByText("Actividad reciente").isVisible().catch(() => false);
expect(hasEmptyState || hasData).toBe(true);
```

## Acceptance Criteria

### AC 9.1.1: Database Health Check Tests
- [ ] Create `tests/e2e/database-health.spec.ts` that runs first
- [ ] Verify all required tables exist (profiles, water_requests, offers, provider_service_areas, notifications, etc.)
- [ ] Verify RLS policies work for test users (consumer, supplier)
- [ ] Fail fast if any table is missing or inaccessible
- [ ] Run as part of test:e2e but can also run standalone

### AC 9.1.2: Console Error Detection
- [ ] Configure Playwright to capture console errors (4xx, 5xx responses)
- [ ] Fail tests when critical API errors occur (404, 403, 500)
- [ ] Add to `playwright.config.ts` or test fixtures
- [ ] Whitelist known acceptable errors if any

### AC 9.1.3: Explicit Error State Assertions
- [ ] Tests should FAIL if they see error toasts or error messages
- [ ] Never accept "empty state OR data" - be explicit about expected state
- [ ] Update existing tests to check for error indicators first

### AC 9.1.4: Seeded Data Requirements
- [ ] Tests that check for data should require seeded data
- [ ] Use `@seeded` tag for tests that need specific data
- [ ] Seed scripts should verify data was created successfully
- [ ] Tests should assert specific expected values, not just "something exists"

## Implementation Tasks

### Task 1: Create Database Health Check Test
```typescript
// tests/e2e/database-health.spec.ts
import { test, expect } from "@playwright/test";

const REQUIRED_TABLES = [
  "profiles",
  "water_requests",
  "offers",
  "provider_service_areas",
  "notifications",
  "comunas",
  "deliveries",
  "commission_ledger",
];

test.describe("Database Health Check @health", () => {
  test("all required tables exist and are accessible", async ({ request }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    for (const table of REQUIRED_TABLES) {
      const response = await request.get(
        `${supabaseUrl}/rest/v1/${table}?limit=0`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      expect(response.status(), `Table ${table} should exist`).not.toBe(404);
    }
  });

  test("test supplier can access their data", async ({ page }) => {
    // Login as supplier and verify no console errors
    // ...
  });
});
```

### Task 2: Add Console Error Listener to Playwright Config
```typescript
// In playwright.config.ts or test fixtures
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Capture 404, 403, 500 errors
      if (text.includes("404") || text.includes("403") || text.includes("500")) {
        errors.push(text);
      }
    }
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });

  // Store errors for afterEach check
  (page as any).__apiErrors = errors;
});

test.afterEach(async ({ page }) => {
  const errors = (page as any).__apiErrors || [];
  expect(errors, "No API errors should occur").toEqual([]);
});
```

### Task 3: Update Existing Test Patterns

**Before (Bad):**
```typescript
const hasError = await page.getByText("Error").isVisible().catch(() => false);
const hasData = await page.getByText("Data").isVisible().catch(() => false);
expect(hasError || hasData).toBe(true); // Passes on error!
```

**After (Good):**
```typescript
// First, assert NO error state
await expect(page.getByText(/Error|error|failed/i)).not.toBeVisible();

// Then check for expected content
await expect(page.getByText("Expected Data")).toBeVisible();
```

### Task 4: Seed Script Verification
```typescript
// In seed scripts, verify data was created
const { data, error } = await supabase.from("table").select("*").eq("id", id);

if (error) {
  console.error(`❌ Failed to verify seeded data: ${error.message}`);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.error(`❌ Seeded data not found for id: ${id}`);
  process.exit(1);
}

console.log(`✓ Verified: ${data.length} records`);
```

## Files to Create/Modify

### New Files
- `tests/e2e/database-health.spec.ts` - Health check tests
- `tests/fixtures/error-detection.ts` - Shared error detection logic

### Files to Modify
- `playwright.config.ts` - Add error detection hooks
- `tests/e2e/provider-*.spec.ts` - Update test patterns
- `scripts/local/seed-*.ts` - Add verification

## Test Commands

```bash
# Run health check only
npm run test:e2e -- --grep "@health"

# Run all tests (health check runs first)
npm run test:e2e

# Run with verbose error logging
DEBUG=pw:api npm run test:e2e
```

## Related Issues

- Local Supabase schema out of sync with production
- `provider_service_areas` table missing locally
- `notifications` table RLS blocking access
- E2E tests passed despite these issues

## Definition of Done

- [ ] Database health check test exists and catches missing tables
- [ ] Console/API errors cause test failures
- [ ] No tests use "error OR success" pattern
- [ ] Seed scripts verify data creation
- [ ] Documentation updated with new patterns
- [ ] All provider E2E tests updated to new patterns
- [ ] CI runs health check before other tests

## Notes

### Current Test Results (Before Fix)
- `provider-earnings.spec.ts` - 21/21 passed (but didn't detect DB issues)
- `provider-settings.spec.ts` - 13/13 passed (only checks UI)
- `provider-availability-toggle.spec.ts` - Failed (toggle not found due to errors)
- `provider-request-browser.spec.ts` - Failed (needs provider_service_areas)

### Root Cause
The E2E tests were written to be "resilient" by accepting empty states, but this resilience masked real database problems. We need tests that fail fast on infrastructure issues while still being flexible about test data.
