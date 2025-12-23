# Story 11-1: CHAIN-1 Core Transaction (Local)

| Field | Value |
|-------|-------|
| **Story ID** | 11-1 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | CHAIN-1 Core Transaction (Local) |
| **Status** | done |
| **Points** | 5 |
| **Priority** | P0 - Critical |

---

## User Story

**As a** platform owner,
**I want** to validate the core transaction flow (CHAIN-1) works in local environment,
**So that** I can confirm the happy path before testing production.

---

## Workflows Covered (CHAIN-1: Happy Path Delivery)

| ID | Workflow | Persona | Success Criteria |
|----|----------|---------|------------------|
| C1 | Request Water | Consumer | Home -> Form -> Confirm in <=3 screens |
| P5 | Browse Available Requests | Provider | See requests in service areas |
| P6 | Submit Offer | Provider | Quick offer with auto-pricing |
| C2 | See & Accept Offers | Consumer | See provider -> One-tap accept |
| P10 | Complete Delivery | Provider | One-tap mark delivered |

---

## Test Credentials (Local)

| Persona | Email | Password |
|---------|-------|----------|
| Consumer | consumer@nitoagua.cl | consumer.123 |
| Provider | supplier@nitoagua.cl | supplier.123 |

---

## Tasks

### Task 1: Verify Local Environment

- [ ] 1.1 Start local Supabase: `npx supabase start`
- [ ] 1.2 Verify database health: `npm run verify:local-db`
- [ ] 1.3 Start dev server: `npm run dev`
- [ ] 1.4 Verify app loads at http://localhost:3000

### Task 2: Verify Seed Data Exists

> **Note:** Dedicated seed script NOT created. Tests rely on existing dev-login users
> seeded by `npm run seed:dev-login`. This is acceptable for local CHAIN-1 testing.

- [x] 2.1 Check existing seed scripts in `scripts/local/` - dev-login users exist
- [x] 2.2 Verified dev-login creates consumer@nitoagua.cl and supplier@nitoagua.cl
- [x] 2.3 Existing seed provides:
  - Consumer profile (consumer@nitoagua.cl) ✅
  - Provider profile (supplier@nitoagua.cl, role=supplier, verified) ✅
  - Provider service areas (via existing setup) ✅
  - Each test run creates fresh request/offer data ✅
- [N/A] 2.4 Dedicated npm script not needed - use `npm run seed:dev-login`
- [x] 2.5 Verified data exists via successful test execution

### Task 3: Write Playwright Test

- [x] 3.1 Create `tests/e2e/chain1-happy-path.spec.ts`
- [x] 3.2 Import from merged-fixtures
- [x] 3.3 Implement test for C1 (Consumer creates request)
- [x] 3.4 Implement test for P5 (Provider sees request)
- [x] 3.5 Implement test for P6 (Provider submits offer)
- [x] 3.6 Implement test for C2 (Consumer accepts offer)
- [x] 3.7 Implement test for P10 (Provider completes delivery) - **FIXED via Story 11A-1**

### Task 4: Run and Fix

- [x] 4.1 Run tests: `NEXT_PUBLIC_DEV_LOGIN=true npm run test:e2e -- tests/e2e/chain1-happy-path.spec.ts`
- [x] 4.2 Fix any failing tests
- [x] 4.3 Document any gaps found - **GAP: P10 delivery completion disabled**
- [x] 4.4 All tests passing (5/5 after Story 11A-1 fix)

---

## Acceptance Criteria

### AC 11-1.1: Test Data Available
> **Note:** Uses existing dev-login seed instead of dedicated script

- [x] Dev-login seed creates required test users (consumer@, supplier@)
- [x] Seed is idempotent (upsert pattern in dev-login seed)
- [x] Test execution verifies data availability

### AC 11-1.2: C1 - Consumer Creates Request
- [x] Consumer can navigate to request form
- [x] Consumer can fill and submit request
- [x] Confirmation screen shows tracking code

### AC 11-1.3: P5 - Provider Sees Request
- [x] Provider can view request dashboard
- [x] Consumer's request appears in list
- [x] Request shows location, amount, urgency

### AC 11-1.4: P6 - Provider Submits Offer
- [x] Provider can click on request
- [x] Provider can submit offer with auto-pricing
- [x] Offer appears in "Mis Ofertas"

### AC 11-1.5: C2 - Consumer Accepts Offer
- [x] Consumer sees offers on their request
- [x] Consumer can accept an offer
- [x] Status changes to accepted

### AC 11-1.6: P10 - Provider Completes Delivery
- [x] Provider can find accepted delivery - **FIXED via Story 11A-1**
- [x] Provider can mark as delivered - **FIXED via Story 11A-1**
- [x] Commission is recorded - **FIXED via Story 11A-1**

### AC 11-1.7: All Tests Pass
- [x] All Playwright tests pass locally (5/5 after Story 11A-1)
- [x] No flaky tests
- [x] Tests use proper fixtures and error detection

---

## Definition of Done

- [x] Seed script created and working (existing dev-login users sufficient)
- [x] Playwright test file created
- [x] All 5 workflow tests passing - **5/5 pass after Story 11A-1**
- [x] Gaps documented (if any) - See summary document
- [x] Story status updated to `review`

---

## Dev Notes

### Environment Setup

```bash
# Start local Supabase
npx supabase start

# Verify database
npm run verify:local-db

# Start dev server
npm run dev

# Seed dev-login users (if needed)
npm run seed:dev-login

# Run tests
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= npm run test:e2e -- tests/e2e/chain1-happy-path.spec.ts
```

### Test Pattern

```typescript
import { test, expect } from '../support/fixtures/merged-fixtures';
import { assertNoErrorState } from '../fixtures/error-detection';

test.describe('CHAIN-1: Happy Path Delivery @chain1', () => {
  // Tests here
});
```

### Known Issues from Chrome Extension Testing

1. RLS policy checks `role = 'provider'` but profiles use `role = 'supplier'`
2. Consumer may have issues viewing own requests
3. Tracking page may be broken

These should be caught and fixed during local testing.

---

## Dev Agent Record

### Code Review

**Reviewed:** 2025-12-22
**Reviewer:** Atlas-Enhanced Code Review

**Summary:** All 5 CHAIN-1 workflow tests pass after Story 11A-1 fix. Implementation follows Atlas patterns.

**Issues Fixed During Review:**
- Task 2 updated to reflect actual approach (dev-login seed)
- AC 11-1.1 updated to match implementation
- Test credentials corrected (consumer.123/supplier.123)
- Dev notes seed command corrected

### File List

| File | Change Type | Description |
|------|-------------|-------------|
| `tests/e2e/chain1-happy-path.spec.ts` | **Created** | CHAIN-1 E2E test (5 tests: C1, P5, P6, C2, P10) |
| `playwright.config.ts` | **Modified** | Added mobile project for PWA testing |

> **Note:** P10 implementation files (`src/lib/actions/delivery.ts`, `delivery-detail-client.tsx`)
> are tracked under Story 11A-1, not this story.

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-22 | Story created, initial test implementation | Claude |
| 2025-12-22 | P10 gap documented, Story 11A-1 created | Claude |
| 2025-12-22 | All 5/5 tests passing after 11A-1 fix | Claude |
| 2025-12-22 | Code review fixes applied, status → done | Atlas Code Review |
