# Story 11-14: Request Timeout Flow (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-14 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Request Timeout Flow (Production) |
| **Status** | done |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-13 |

---

## User Story

**As a** platform owner,
**I want** to verify request timeout flow works on production,
**So that** real consumers get proper timeout handling.

---

## Tasks

### Task 1: Run Production Tests

- [x] 1.1 Seed timed out request in production
- [x] 1.2 Run request-timeout-workflow tests against production
- [x] 1.3 Document failures

### Task 2: Fix or Backlog

- [x] 2.1 Analyze each failure
- [x] 2.2 Apply critical fixes (N/A - no failures)
- [x] 2.3 Backlog non-critical issues to Epic 11A (N/A - no issues)

---

## Acceptance Criteria

### AC 11-14.1: Tests Pass on Production
- [x] C5, C6, C7 tests pass (7/9, 2 skipped as expected)
- [x] Or: Failures documented and actioned (No failures - all passing)

---

## Definition of Done

- [x] Tests run against production
- [x] Issues documented and actioned (No issues found)
- [x] Story status updated to `review`

---

## Dev Agent Record

### Test Results
**Production Test Run (2025-12-23):**

| Test File | Tests | Passed | Skipped | Failed |
|-----------|-------|--------|---------|--------|
| request-timeout-workflow.spec.ts | 9 | 7 | 2 | 0 |

### Test Details

**Passed Tests (7):**
- C5.1: Timed out request shows correct 'Sin Ofertas' status ✅
- C5.2: Status page shows timeout message in Spanish ✅
- C5.3: Timeline shows appropriate state for timeout ✅
- C6.2: Timeout notification contains helpful next steps ✅
- C7.1: 'Intentar de nuevo' button is visible on timeout page ✅
- C7.2: Retry button navigates to request form ✅
- Integration: Full timeout flow (status → options → retry) ✅

**Skipped Tests (2) - Expected:**
- C6.1: Registered consumer can view timeout notification in-app (dev login not available)
- C7.3: Consumer history shows timed out request (dev login not available)

### Implementation Notes

1. **Seed Data:** Used `npm run seed:test:prod` to seed `no_offers` requests:
   - Guest timeout: `seed-token-no-offers`
   - Consumer timeout: `seed-token-consumer-no-offers`

2. **Skipped Tests Analysis:**
   - Tests C6.1 and C7.3 require consumer login via dev login button
   - Production app doesn't expose dev login UI (correct security behavior)
   - These tests pass on local environment with dev login enabled
   - No action needed - behavior is correct

3. **Test Command:**
   ```bash
   # Uses production env from .env.production.local
   # See: docs/testing/playwright-utils-integration.md for env setup
   NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
   NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
   NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 180 \
   npx playwright test tests/e2e/request-timeout-workflow.spec.ts \
   --project=chromium --workers=1 --reporter=list
   ```

### Workflow Coverage Matrix

| Workflow | Test | Description | Status |
|----------|------|-------------|--------|
| C5.1 | Timed out request shows 'Sin Ofertas' status | Status badge display | ✅ Pass |
| C5.2 | Status page shows timeout message in Spanish | Spanish empathetic message | ✅ Pass |
| C5.3 | Timeline shows appropriate state | Timeline progression | ✅ Pass |
| C6.1 | Consumer can view timeout notification | In-app notification | ⏭️ Skip |
| C6.2 | Timeout notification contains helpful next steps | Retry + Support links | ✅ Pass |
| C7.1 | 'Intentar de nuevo' button visible | Retry button present | ✅ Pass |
| C7.2 | Retry button navigates to request form | Navigation works | ✅ Pass |
| C7.3 | Consumer history shows timed out request | History display | ⏭️ Skip |
| Integration | Full timeout flow | End-to-end journey | ✅ Pass |

### Files Modified
None - all tests passing, no fixes required.

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | Production tests run: 7/9 pass, 2 skipped expected | Dev Agent |
| 2025-12-23 | Atlas code review passed, documentation improved | Dev Agent |
