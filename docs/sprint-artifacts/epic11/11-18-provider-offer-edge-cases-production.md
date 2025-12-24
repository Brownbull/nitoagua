# Story 11-18: Provider Offer Edge Cases (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-18 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Offer Edge Cases (Production) |
| **Status** | done |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-17 |

---

## User Story

**As a** platform owner,
**I want** to verify provider offer edge cases work on production,
**So that** real providers have proper offer handling.

---

## Tasks

### Task 1: Run Production Tests

- [x] 1.1 Seed various offer states in production
- [x] 1.2 Run provider-offer-edge-cases tests against production
- [x] 1.3 Document failures

### Task 2: Fix or Backlog

- [x] 2.1 Analyze each failure
- [x] 2.2 Apply critical fixes
- [x] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-18.1: Tests Pass on Production
- [x] P13, P14, P15, P16 tests pass
- [x] Or: Failures documented and actioned

---

## Definition of Done

- [x] Tests run against production
- [x] Issues documented and actioned
- [x] Story status updated to `review`

---

## Dev Agent Record

### Test Results
**Production Test Run (2025-12-24):**

| Test File | Tests | Passed | Failed |
|-----------|-------|--------|--------|
| provider-offer-edge-cases.spec.ts | 12 | 12 | 0 |

**Workflows Validated:**
| Workflow | Tests | Description |
|----------|-------|-------------|
| P13.1-P13.3 | 3 | Offer Expiration - "Expirada" badge, history placement, no cancel button |
| P14.1 | 1 | Withdraw Offer - "Cancelada" status in history |
| P15.1-P15.2 | 2 | Consumer Cancels - "Cancelada" when request cancelled |
| P16.1-P16.3 | 3 | Another Offer Accepted - "No seleccionada" status |
| Edge Cases | 2 | History section grouping, countdown timer on active |
| Spanish | 1 | All labels in Spanish |

### Implementation Notes
- **Initial test failure:** Tests were running against localhost but authenticating with production Supabase. Caused 401 errors.
- **Fix applied:** Added `BASE_URL=https://nitoagua.vercel.app` to test command to run tests directly against production.
- **Test user refresh:** Ran `seed-production-test-users.ts` to ensure `supplier@nitoagua.cl` credentials were properly set.
- **Seed data:** Tests ran against existing production offer data (no additional seeding required - production already has offers in various states from real usage).

### File List
No files modified (production validation only - runs existing tests against production).

### Test Command Used
```bash
BASE_URL="https://nitoagua.vercel.app" \
NEXT_PUBLIC_SUPABASE_URL="<prod-url>" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 240 npx playwright test tests/e2e/provider-offer-edge-cases.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-24 | All 12 tests passing on production | Dev Agent |
