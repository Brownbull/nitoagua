# Testing Patterns & Coverage Expectations

> Section 5 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/sprint-artifacts/testing/, run_app.local.md, epic retrospectives

## Testing Strategy

### Test Framework

| Aspect | Choice | Notes |
|--------|--------|-------|
| **Framework** | Playwright | Cross-browser E2E testing |
| **Browsers** | Chromium, Firefox, WebKit | WebKit has flakiness issues |
| **Pattern** | Seed data per test | Deterministic test state |
| **Auth** | Dev login mode | NEXT_PUBLIC_DEV_LOGIN=true |

### Test Levels

| Level | Purpose | Coverage Target |
|-------|---------|-----------------|
| Unit | Component logic | Minimal - focus on E2E |
| Integration | API routes | Via E2E coverage |
| E2E | Full user journeys | 600+ tests across all epics |

## Seed Data Patterns

> "The epic adopts a 'per-test seeding' approach where each test file seeds the specific data it needs."
> — Testing documentation

| Scenario | Data Required | Setup Script |
|----------|--------------|--------------|
| Consumer request | User profile, address | `scripts/local/seed-test-data.ts` |
| Provider offers | Provider profile, pending requests | `scripts/local/seed-offer-tests.ts` |
| Earnings dashboard | Completed deliveries with commissions | `scripts/local/seed-earnings-tests.ts` |
| Admin verification | Pending providers, documents | Per-test seeding |

### Seed Data Commands

```bash
# Full test data setup
npm run seed:local

# Offer-specific tests
npm run seed:offers

# Earnings-specific tests
npm run seed:earnings

# Clean and re-seed
npm run seed:test:clean && npm run seed:test
```

## Workflow Validations

### Critical User Journeys (E2E Required)

1. **Consumer Request Flow**
   - Submit water request (guest)
   - Track request status
   - Cancel pending request

2. **Provider Operations**
   - View request dashboard
   - Submit offer to consumer
   - Mark delivery complete

3. **Admin Functions**
   - Verify pending provider
   - View settlement details

## Coverage Expectations

| Epic | Story Count | E2E Tests | Status |
|------|-------------|-----------|--------|
| Epic 1 | 5 | ~20 | ✅ Complete |
| Epic 2 | 6 | ~40 | ✅ Complete |
| Epic 3 | 8 | ~80 | ✅ Complete |
| Epic 4 | 6 | ~50 | ✅ Complete |
| Epic 5 | 4 | ~30 | ✅ Complete |
| Epic 6 | 10 | ~100 | ✅ Complete |
| Epic 7 | 11 | ~120 | ✅ Complete |
| Epic 8 | 10 | ~160 | ✅ Complete |

## Test File Conventions

| Pattern | Example | Notes |
|---------|---------|-------|
| **Location** | `tests/e2e/*.spec.ts` | All E2E in one directory |
| **Naming** | `consumer-request.spec.ts` | kebab-case, feature-based |
| **Fixtures** | `tests/fixtures/*.ts` | Shared test data |
| **Seeds** | `scripts/local/seed-*.ts` | Per-feature seed scripts |

## E2E Reliability Patterns (Testing-1)

> Added 2025-12-18 from Story Testing-1: E2E Testing Reliability Improvements

### Database Health Check

**Problem Solved:** Tests were passing silently when database tables were missing or RLS blocked access.

**Pattern:** Run health check tests FIRST before other E2E tests.

```typescript
// tests/e2e/database-health.spec.ts
test.describe("Database Health Check @health", () => {
  test("@health all required tables exist", async ({ request }) => {
    for (const table of REQUIRED_TABLES) {
      const response = await request.get(`${supabaseUrl}/rest/v1/${table}?limit=0`);
      expect(response.status(), `Table ${table} should exist`).not.toBe(404);
    }
  });
});
```

**Command:** `npm run test:e2e -- --grep "@health"`

### Error Detection Fixture

**Problem Solved:** Tests accepted "empty state OR data" which masked database errors as valid empty states.

**Pattern:** Check for error states BEFORE checking for content.

```typescript
// tests/fixtures/error-detection.ts
export async function assertNoErrorState(page: Page): Promise<void> {
  const errorIndicators = [
    page.getByText(/Error:|Failed to|Something went wrong/i),
    page.getByText(/No autenticado|permission denied/i),
  ];
  for (const indicator of errorIndicators) {
    const isVisible = await indicator.first().isVisible().catch(() => false);
    if (isVisible) {
      throw new Error(`Error state detected in UI - tests should FAIL on errors`);
    }
  }
}
```

**Usage in tests:**
```typescript
import { assertNoErrorState } from "../fixtures/error-detection";

test("shows content or empty state", async ({ page }) => {
  // FIRST: Check for error states - fail if any database errors present
  await assertNoErrorState(page);

  // THEN: Safe to check for content OR empty state
  const hasContent = await page.getByTestId("content").isVisible().catch(() => false);
  const hasEmpty = await page.getByTestId("empty-state").isVisible().catch(() => false);
  expect(hasContent || hasEmpty).toBe(true);
});
```

### Seed Script Verification

**Problem Solved:** Seed scripts didn't verify data was actually created.

**Pattern:** Exit with error code if seeded data is missing.

```typescript
async function verifySeededData(supabase) {
  const errors: string[] = [];
  // ... verification checks ...
  if (errors.length > 0) {
    throw new Error("Seeded data verification failed. Tests cannot rely on this data.");
  }
}
```

## Known Issues

### WebKit Flakiness

> WebKit tests have intermittent failures on certain interactions.

**Mitigation:**
- Focus on Chromium for primary testing
- Run WebKit separately with retries
- Accept some flakiness in CI

### Test Isolation

Each test must:
1. Seed its own data
2. Clean up after itself (or rely on transaction rollback)
3. Not depend on other tests' state

---

## Sync Notes

Last testing sync: 2025-12-18
Sources: run_app.local.md, docs/sprint-artifacts/testing/, Story Testing-1
