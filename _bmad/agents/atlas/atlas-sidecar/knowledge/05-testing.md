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

*Last verified: 2025-12-20 | Sources: run_app.local.md, testing docs, Stories Testing-1/1B/2/3, Chrome Extension E2E*
