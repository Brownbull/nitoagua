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

**Location:** `tests/support/fixtures/merged-fixtures.ts`

**Key Fixtures:** `log` (structured logging), `recurse` (polling), `interceptNetworkCall`, `networkErrorMonitor`, `userFactory`

**Import (Epic 10+):** `import { test, expect } from '../support/fixtures/merged-fixtures';`

**Log Levels:** `info`, `step`, `success`, `warning`, `error`, `debug`

**Persona Validation:** `tests/e2e/persona-validation.spec.ts` - 13 tests covering all personas

**Full Reference:** `docs/testing/playwright-utils-integration.md`

---

## Chrome Extension vs Playwright Decision Guide

| Factor | Chrome Extension | Playwright |
|--------|------------------|------------|
| **Best For** | New features, multi-persona, exploratory | Regression, CI/CD, timing-sensitive |
| **Data** | Requires real/seeded data | Seeds per-test |
| **Multi-persona** | Natural tab switching | Multi-context setup |
| **Production** | ❌ No seed scripts | ❌ Never run |

**Rule:** New feature → Chrome Extension first → then Playwright for regression.

**Reference:** `docs/testing/e2e-checklists/` for Chrome Extension results.

---

---

## Epic 11 Workflow Validation Patterns

> Added 2025-12-23 from Story 11-3: Provider Visibility (Local)

### Provider Visibility Tests (P7, P8, P9)

**Test File:** `tests/e2e/provider-visibility.spec.ts`

**Seed Dependency:** `npm run seed:offers` (includes notifications)

**Patterns Validated:**
1. **P7 - Track My Offers:** Offers list with status sections (pending/accepted/history)
2. **P8 - Acceptance Notification:** Notification bell popover with offer_accepted type
3. **P9 - Delivery Details:** Full request details page with customer info

**Mobile Testing Pattern:**
```typescript
test.use({
  viewport: { width: 360, height: 780 },
  isMobile: true,
  hasTouch: true,
});
```

**Notification Seeding:**
- Added to `scripts/local/seed-offer-tests.ts`
- Uses valid UUIDs (pattern: `a0000000-0000-0000-0000-00000000XXXX`)
- Creates both read and unread notifications for testing

**Key Selectors:**
| Element | Test ID | Usage |
|---------|---------|-------|
| Pending offers | `section-pending` | P7 status grouping |
| Accepted offers | `section-accepted` | P7 + P9 delivery link |
| Notification bell | `notification-bell` | P8 trigger |
| Offer cards | `offer-card` | P7 card display |
| Offer countdown | `offer-countdown` | P7.3 countdown timer |
| Notification items | `notification-item-${id}` | P8 dynamic testid (use `^=` prefix selector) |

### Code Review Lessons - Story 11-3

**Selector Mismatch Pattern:**
- **Problem:** Tests using `.catch(() => false)` mask selector mismatches
- **Solution:** Use `.count() > 0` before assertions to validate element exists

**Countdown Format Handling:**
- `< 1 hour`: Format is `XX:XX` (e.g., "25:30")
- `> 1 hour`: Format is `X h MM min` (e.g., "1 h 19 min")
- **Regex:** `/Expira en\s*(\d{1,2}:\d{2}|\d+ h \d{2} min)/`

**Dynamic TestID Pattern:**
- Components with dynamic testids (e.g., `notification-item-${id}`) require prefix selectors
- Use `[data-testid^="notification-item-"]` instead of exact match

---

## Production Validation Pattern (Story 11-4)

> Added 2025-12-23 from Story 11-4: Provider Visibility (Production)

### Production Test Execution Pattern

**Seed Command:**
```bash
npm run seed:offers:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution Template:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= \
timeout 180 npx playwright test <test-file> \
  --project=chromium --workers=1 --reporter=list
```

**Key Requirements:**
1. **Environment file:** `.env.production.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. **Seed first:** Run `npm run seed:offers:prod` before tests
3. **Timeout:** Use `timeout 180` (3 min) for production latency
4. **Single worker:** `--workers=1` for deterministic ordering
5. **Dev login:** `NEXT_PUBLIC_DEV_LOGIN=true` enables test login

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| P7 | 3 | Track My Offers - Offer list with status |
| P8 | 2 | Acceptance Notification - Bell + popover |
| P9 | 2 | Delivery Details - Full request info |
| Integration | 1 | Full navigation flow |

---

## Consumer Tracking Production Validation (Story 11-6)

> Added 2025-12-23 from Story 11-6: Consumer Status Tracking (Production)

### Consumer Tracking Production Tests (C3, C4)

**Seed Command:**
```bash
npm run seed:test:prod  # Uses ./scripts/run-with-prod-env.sh wrapper
```

**Test Execution:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= \
timeout 240 npx playwright test tests/e2e/consumer-status-tracking.spec.ts tests/e2e/consumer-tracking.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| C3.1-C3.6 | 6 | Status at each stage (pending, has_offers, accepted, delivered, cancelled, no_offers) |
| C3.7-C3.9 | 3 | Timeline progression indicators |
| C3.10 | 1 | Request details display |
| C4.1-C4.4 | 4 | Contact button visibility states |
| C4.5-C4.6 | 2 | One-tap contact functionality |
| Accessibility | 2 | Keyboard nav, headings |
| Spanish | 1 | All content in Spanish |

### Code Review Lessons - Story 11-6

**Schema Compatibility Pattern:**
- **Problem:** Local schema had `timed_out_at` column, production did not
- **Solution:** Removed column from seed data - `status: 'no_offers'` alone indicates timeout
- **Rule:** When seeding production, verify column existence before including in data

**CSS Class Update Pattern:**
- **Problem:** Test expected `min-h-screen`, code uses `min-h-dvh` per Story 10-7 PWA standards
- **Solution:** Updated test assertion to match current implementation
- **Rule:** When CSS classes change for mobile optimization, update test assertions

---

*Last verified: 2025-12-23 | Sources: run_app.local.md, testing docs, Stories Testing-1/1B/2/3, Chrome Extension E2E, Stories 11-3/11-4/11-5/11-6 code reviews*
