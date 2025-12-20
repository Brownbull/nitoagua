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

**Problem:** Tests passing silently when tables missing or RLS blocked access.

**Pattern:** Run `@health` tests FIRST before other E2E tests.

**Location:** `tests/e2e/database-health.spec.ts`

**Command:** `npm run test:e2e -- --grep "@health"`

### Error Detection Fixture

**Problem:** Tests accepted "empty state OR data" which masked database errors.

**Pattern:** Check for error states BEFORE checking for content.

**Location:** `tests/fixtures/error-detection.ts` - exports `assertNoErrorState(page)`

**Usage:** Import and call FIRST in any test that could show "empty state".

### Seed Script Verification

**Problem:** Seed scripts didn't verify data was actually created.

**Pattern:** Exit with error code if seeded data is missing. All seed scripts include verification step.

### Unit-Style Test Files (Testing-1B)

**Pattern:** Some test files contain unit-style tests (config checks, regex validation) with no page interactions.

**Rule:** `assertNoErrorState` NOT needed for:
- Pure unit tests (constants/config)
- Regex validation tests
- Auth redirect tests

**Rule:** `assertNoErrorState` NEEDED for:
- Tests navigating to pages
- Tests with `.isVisible().catch(() => false)` patterns
- Tests that could show "empty state"

---

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

### Local Database Verification (Testing-2)

**Problem:** Tests passing when tables completely missing.

**Pattern:** Run `npm run verify:local-db` before E2E tests.

**Required Tables:** profiles, water_requests, admin_settings, admin_allowed_emails, provider_documents, commission_ledger, withdrawal_requests, offers, notifications, comunas, provider_service_areas

**Common Fixes:**
- `npx supabase db reset` - Full reset
- `npm run seed:dev-login` - Re-seed dev users
- `npm run seed:test` - Re-seed test data

**Note:** No `deliveries` table - uses `water_requests.status='delivered'`.

### Code Review Lessons (Testing-2)

**Patterns learned:**
1. **Use FK IDs not display names** in seed data (use `comuna_id`, not `comuna_name`)
2. **Check table constraints** before upserts (e.g., `added_by` NOT NULL)
3. **Single source of truth** for REQUIRED_TABLES lists
4. **Fail fast** with actionable error messages (check connection before tables)

---

## Playwright Utils Integration (Testing-3)

> Added 2025-12-18 from Story Testing-3: Playwright Utils Integration

### Merged Fixtures Pattern

**Purpose:** Combine `@seontechnologies/playwright-utils` with project fixtures for enhanced E2E capabilities.

**Location:** `tests/support/fixtures/merged-fixtures.ts`

**Available Fixtures:**

| Fixture | Purpose |
|---------|---------|
| `log` | Structured logging in reports - `log({ level: 'step', message: '...' })` |
| `recurse` | Polling for async conditions (like Cypress retry) |
| `interceptNetworkCall` | Spy/stub network requests |
| `networkErrorMonitor` | Auto-fail on HTTP 4xx/5xx |
| `userFactory` | Create/cleanup test users (project fixture) |

**Log Levels:** `info`, `step`, `success`, `warning`, `error`, `debug`

### Migration Strategy

**New tests (Epic 10+):** Use merged fixtures:
```typescript
import { test, expect } from '../support/fixtures/merged-fixtures';
```

**Existing tests:** Keep `@playwright/test` - no changes needed.

**Gradual migration:** When touching existing tests, consider upgrading imports and adding `log()` calls.

### Example Usage

```typescript
test('example', async ({ page, log }) => {
  await log({ level: 'step', message: 'Navigate to page' });
  await page.goto('/consumer/offers');

  await log({ level: 'step', message: 'Verify content' });
  await expect(page.locator('[data-testid="offer"]')).toBeVisible();

  await log({ level: 'success', message: 'Test complete' });
});
```

**Reference:** `docs/testing/playwright-utils-integration.md`

### Persona Validation Tests

**Purpose:** Verify playwright-utils integration across all three personas.

**Location:** `tests/e2e/persona-validation.spec.ts`

**Personas Tested:**
- **Dona Maria (Consumer)**: Home screen, big button, Spanish interface, request form
- **Don Pedro (Provider)**: Login page access, dev login detection, dashboard access
- **Admin**: Login page, branding, security notices, dev login

**Test Count:** 13 tests (11 pass, 2 skip when dev login unavailable)

**Key Patterns:**
- Use `log({ level: 'step', message: '...' })` for each test step
- Use `log({ level: 'success', message: '...' })` at test completion
- Use `log({ level: 'info', message: '...' })` for informational notes
- Use `log({ level: 'warning', message: '...' })` before test.skip()

---

## Chrome Extension E2E Test Records

### E2E Test Record: 10-3 (Chrome Extension)

**Date:** 2025-12-20
**Story:** 10-3 - Offer Countdown Timer (Consumer View)
**Pass Rate:** N/A (Skipped - no test data on production)

**Coverage:**
- AC10.3.1 - AC10.3.7: All SKIPPED

**Personas Tested:**
- Consumer (Doña María): Login verified, 0 scenarios executed

**Patterns Established:**
- Production lacks seed data for feature E2E tests
- Chrome Extension E2E requires either local environment or real test data
- Dev login mode works on production

**Issues Found:**
- None (tests not executed due to data constraint)

**Checklist:** docs/testing/e2e-checklists/10-3-offer-countdown-timer.md

**Lesson Learned:**
> Chrome Extension E2E testing on production requires real test data or a staging environment with persistent seed data. For feature-specific tests like countdown timers, prefer running Playwright automated tests locally with `npm run seed:offers`.

---

*Last verified: 2025-12-20 | Sources: run_app.local.md, testing docs, Stories Testing-1/1B/2/3, Chrome Extension E2E*
