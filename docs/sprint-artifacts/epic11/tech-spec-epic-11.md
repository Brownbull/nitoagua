# Tech Spec: Epic 11 - Playwright Workflow Validation

**Epic:** Epic 11 (Post-Epic 10)
**Author:** Atlas Project Intelligence
**Date:** 2025-12-22 (Revised after Chrome Extension attempt)
**Status:** Active

---

## 1. Overview

This epic validates nitoagua workflows using **Playwright tests executed in WSL**.

**Key Insight from Chrome Extension Testing:**
> Chrome Extension E2E on production should come LAST, after Playwright tests and manual testing verify the app works. RLS issues cascade and make entire test sessions unproductive.

### New Testing Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: LOCAL VALIDATION (WSL + Local Supabase)              │
│  - Create/verify seed scripts                                   │
│  - Write Playwright tests                                       │
│  - Run tests, identify gaps                                     │
│  - Fix issues locally                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: PRODUCTION VALIDATION (WSL + Production Supabase)    │
│  - Create prod seed scripts (same data pattern)                 │
│  - Run same Playwright tests against production                 │
│  - Identify prod-only issues (RLS, migrations)                  │
│  - Fix or backlog issues                                        │
└─────────────────────────────────────────────────────────────────┘
```

**For each gap/issue found:**
1. Discuss: Is it worth fixing now?
2. If yes: Fix immediately
3. If no: Create backlog story for future epic

---

## 2. Workflow Inventory (From Brainstorming)

### 2.1 Priority Tiers

**Tier 1: Critical Path (Epic 11 Focus)**
| ID | Workflow | Persona | Success Criteria |
|----|----------|---------|------------------|
| C1 | Request Water | Consumer | Home → Form → Confirm in ≤3 screens |
| P5 | Browse Requests | Provider | See requests in service areas |
| P6 | Submit Offer | Provider | Quick offer with auto-pricing |
| C2 | Accept Offer | Consumer | See provider → One-tap accept |
| P10 | Complete Delivery | Provider | One-tap mark delivered |

**Tier 2: Trust Layer (Epic 11 Optional)**
| ID | Workflow | Persona |
|----|----------|---------|
| C3 | Track Delivery Status | Consumer |
| P7 | Track My Offers | Provider |
| P8 | Receive Acceptance | Provider |

**Tier 3: Lifecycle (Epic 13 - Chrome Extension)**
- P1-P4: Provider Onboarding
- A1-A7: Admin Operations
- C5, P12, P13: Accountability

---

## 3. Story Breakdown

### Story 11-1: CHAIN-1 Core Transaction (Local)

**Goal:** Validate happy path delivery flow works locally

**Workflows:** C1 → P5 → P6 → C2 → P10

**Deliverables:**
1. Seed script: `scripts/local/seed-chain1-test.ts`
2. Playwright test: `tests/e2e/chain1-happy-path.spec.ts`
3. All tests passing on local

**Acceptance Criteria:**
- [ ] Seed script creates consumer + approved provider + service areas
- [ ] Consumer can create water request via UI
- [ ] Provider sees request in dashboard
- [ ] Provider can submit offer
- [ ] Consumer can accept offer
- [ ] Provider can mark delivered
- [ ] Commission recorded in ledger

---

### Story 11-2: CHAIN-1 Core Transaction (Production)

**Goal:** Validate happy path delivery flow works on production

**Prerequisites:** Story 11-1 complete

**Deliverables:**
1. Prod seed script: `scripts/production/seed-chain1-test.ts`
2. Same Playwright tests run against production
3. Report of issues found

**Acceptance Criteria:**
- [ ] Prod seed script creates test data
- [ ] Same tests pass on production
- [ ] RLS issues identified and documented
- [ ] Fix stories created OR issues fixed inline

---

### Story 11-3: Provider Visibility (Local)

**Goal:** Validate provider can track their offers and deliveries

**Workflows:** P7, P8, P9

**Deliverables:**
1. Seed script updates for offer states
2. Playwright tests for offer tracking
3. All tests passing on local

---

### Story 11-4: Provider Visibility (Production)

**Goal:** Same as 11-3 but on production

**Prerequisites:** Story 11-3 complete

---

### Story 11-5: Consumer Status Tracking (Local)

**Goal:** Validate consumer can track delivery status

**Workflows:** C3, C4

**Deliverables:**
1. Playwright tests for status page
2. Tests for contact driver link
3. All tests passing on local

---

### Story 11-6: Consumer Status Tracking (Production)

**Goal:** Same as 11-5 but on production

**Prerequisites:** Story 11-5 complete

---

## 4. Test File Structure

```
tests/
├── e2e/
│   ├── chain1-happy-path.spec.ts      # Story 11-1, 11-2
│   ├── provider-offer-tracking.spec.ts # Story 11-3, 11-4
│   └── consumer-status-tracking.spec.ts # Story 11-5, 11-6
│
scripts/
├── local/
│   └── seed-chain1-test.ts            # Local seed
└── production/
    └── seed-chain1-test.ts            # Prod seed (already created)
```

---

## 5. Implementation Pattern

Each story follows this pattern:

```typescript
// tests/e2e/chain1-happy-path.spec.ts
import { test, expect } from '../support/fixtures/merged-fixtures';
import { assertNoErrorState } from '../fixtures/error-detection';

test.describe('CHAIN-1: Happy Path Delivery', () => {
  test.beforeAll(async () => {
    // Seed data using appropriate script
    // Local: npm run seed:chain1:local
    // Prod: npm run seed:chain1:prod
  });

  test('C1: Consumer creates water request', async ({ page }) => {
    await page.goto('/');
    await assertNoErrorState(page);
    // ... test steps
  });

  test('P5: Provider sees request in dashboard', async ({ page }) => {
    // Login as provider
    // Navigate to requests
    // Assert request visible
  });

  // ... more tests
});
```

---

## 6. RLS Issues Found (From 11-1 Chrome Extension)

These must be fixed before production tests will pass:

| # | Issue | Root Cause | Status |
|---|-------|------------|--------|
| 1 | Provider can't create offers | Policy checks `role = 'provider'` but profiles use `role = 'supplier'` | Migration exists, needs deploy |
| 2 | Consumer can't view own requests | Missing RLS policy | Needs investigation |
| 3 | Tracking token page broken | Unknown | Needs investigation |
| 4 | Offers page permission error | RLS on users table join | Needs investigation |

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| Local tests passing | 100% for CHAIN-1 |
| Production tests passing | 100% for CHAIN-1 |
| RLS issues identified | All documented |
| RLS issues fixed | Critical ones fixed |
| Backlog stories created | For non-critical issues |

---

## 8. Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Local Supabase running | Required | Local tests |
| Production access | Required | Prod tests |
| Merged fixtures | ✅ Available | Test patterns |
| Seed scripts | Partial | Need chain1 seeds |

---

## 9. Chrome Extension Testing (Moved to Epic 13)

**Original Epic 11 content (Chrome Extension E2E) moved to Epic 13:**
- Will execute AFTER Playwright validation
- Will use same workflow definitions
- Will be final production validation
- Reference: `docs/testing/chrome-extension/*.md`

---

*Revised 2025-12-22 after Chrome Extension E2E revealed RLS issues*
*Pattern: Playwright first → Chrome Extension last*
