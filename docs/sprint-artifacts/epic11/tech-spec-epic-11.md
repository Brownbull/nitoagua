# Tech Spec: Epic 11 - Full Application Workflow Validation

**Epic:** Epic 11 (Post-Epic 10)
**Author:** Atlas Project Intelligence
**Date:** 2025-12-19
**Status:** Draft

---

## 1. Overview

This testing epic validates that all three user personas (Consumer, Provider, Admin) can complete their critical workflows end-to-end after Epic 10 completes the V2 offer model. It bridges per-story unit tests with comprehensive integration tests that verify the application works as a cohesive whole.

**Why This Epic Matters:**
- Epic 10 completes the V2 Consumer-Choice Offer Model
- Individual stories have been tested in isolation
- No existing tests validate the complete cross-persona workflow
- Production readiness requires proof that all roles can operate together

---

## 2. Objectives & Scope

### In Scope

| Story | Focus | Validates |
|-------|-------|-----------|
| **11-1** | Consumer workflows | All consumer features from guest to registered |
| **11-2** | Provider workflows | All provider features from onboarding to earnings |
| **11-3** | Admin workflows | All admin features from verification to settlement |
| **11-4** | Cross-persona integration | Complete V2 offer model with all three roles |

### Out of Scope

- Performance/load testing (future epic)
- Security penetration testing (future epic)
- Accessibility compliance testing (covered per-story)
- Mobile-specific testing beyond responsive checks

---

## 3. Feature Inventory by Persona

### 3.1 Consumer (Doña María) Features

| Category | Feature | Epic Source | Priority |
|----------|---------|-------------|----------|
| **Core Flow** | Guest water request | Epic 2 | P0 |
| **Core Flow** | Request tracking | Epic 2 | P0 |
| **Core Flow** | Request cancellation | Epic 4 | P0 |
| **V2 Flow** | View offers | Epic 10 | P0 |
| **V2 Flow** | Select offer | Epic 10 | P0 |
| **V2 Flow** | Offer countdown visibility | Epic 10 | P1 |
| **V2 Flow** | Request timeout handling | Epic 10 | P1 |
| **Registered** | Account registration | Epic 4 | P1 |
| **Registered** | Pre-filled forms | Epic 4 | P1 |
| **Registered** | Request history | Epic 4 | P1 |
| **Registered** | In-app notifications | Epic 5 | P1 |
| **Platform** | PWA installation prompt | Epic 1 | P2 |
| **Platform** | Spanish interface | All | P1 |

### 3.2 Provider (Don Pedro) Features

| Category | Feature | Epic Source | Priority |
|----------|---------|-------------|----------|
| **Onboarding** | Registration flow | Epic 7 | P0 |
| **Onboarding** | Document upload | Epic 7 | P0 |
| **Onboarding** | Verification status | Epic 7 | P0 |
| **Profile** | Service area configuration | Epic 7 | P0 |
| **Profile** | Availability toggle | Epic 7 | P1 |
| **Profile** | Bank details | Epic 7 | P1 |
| **Profile** | Settings page | Epic 8 | P1 |
| **Operations** | Request browser | Epic 8 | P0 |
| **Operations** | Submit offer | Epic 8 | P0 |
| **Operations** | Active offers list | Epic 8 | P0 |
| **Operations** | Withdraw offer | Epic 8 | P1 |
| **Operations** | Offer acceptance notification | Epic 8 | P0 |
| **Operations** | Mark delivered | Epic 3 | P0 |
| **Operations** | Map view | Epic 8 | P2 |
| **Earnings** | Earnings dashboard | Epic 8 | P1 |
| **Earnings** | Commission settlement | Epic 8 | P1 |

### 3.3 Admin Features

| Category | Feature | Epic Source | Priority |
|----------|---------|-------------|----------|
| **Access** | Admin authentication | Epic 6 | P0 |
| **Verification** | Provider verification queue | Epic 6 | P0 |
| **Verification** | Approve/reject providers | Epic 6 | P0 |
| **Management** | Provider directory | Epic 6 | P1 |
| **Management** | Orders management | Epic 6 | P0 |
| **Configuration** | Pricing configuration | Epic 6 | P0 |
| **Configuration** | Offer system settings | Epic 6 | P1 |
| **Finance** | Cash settlement tracking | Epic 6 | P1 |
| **Dashboard** | Operations dashboard | Epic 6 | P2 |

---

## 4. Test Architecture

### 4.1 Test File Structure

```
tests/
├── e2e/
│   ├── validation/
│   │   ├── consumer-workflows.spec.ts      # 11-1
│   │   ├── provider-workflows.spec.ts      # 11-2
│   │   ├── admin-workflows.spec.ts         # 11-3
│   │   └── full-v2-integration.spec.ts     # 11-4
│   └── ... (existing tests)
├── fixtures/
│   ├── validation-seeds.ts                 # Shared seed data
│   └── ... (existing fixtures)
└── support/
    └── fixtures/
        └── merged-fixtures.ts              # Playwright utils (Testing-3)
```

### 4.2 Test Patterns

**Use Merged Fixtures (from Testing-3):**
```typescript
import { test, expect } from '../../support/fixtures/merged-fixtures';

test.describe('Consumer Workflows @validation', () => {
  test('Guest request → offer selection → tracking', async ({ page, log }) => {
    await log({ level: 'step', message: '1. Submit water request as guest' });
    // ...
  });
});
```

**Per-Test Seeding:**
```typescript
test.beforeEach(async ({ userFactory }) => {
  // Create isolated test data for this test
  await userFactory.createConsumer({ name: 'Test Consumer' });
  await userFactory.createProvider({ verified: true });
});
```

### 4.3 Seed Data Requirements

| Scenario | Data Required | Script |
|----------|--------------|--------|
| Consumer full flow | Provider with offers, requests | `scripts/local/seed-validation-consumer.ts` |
| Provider full flow | Pending requests, approved provider | `scripts/local/seed-validation-provider.ts` |
| Admin full flow | Pending providers, active orders | `scripts/local/seed-validation-admin.ts` |
| Integration flow | All personas, realistic state | `scripts/local/seed-validation-full.ts` |

---

## 5. Story Breakdown

### Story 11-1: Consumer Full Workflow Validation (5 points)

**Critical Paths:**
1. Guest request → offer viewing → selection → tracking → delivery notification
2. Registered user: login → prefilled form → request → history update
3. Request cancellation (before offer acceptance)
4. Request timeout (no offers scenario)

### Story 11-2: Provider Full Workflow Validation (8 points)

**Critical Paths:**
1. Registration → document upload → verification pending
2. After approval: service area config → availability on
3. Browse requests → submit offer → wait for acceptance
4. Offer accepted → mark delivered → commission logged
5. Earnings view → settlement request
6. Withdraw pending offer

### Story 11-3: Admin Full Workflow Validation (5 points)

**Critical Paths:**
1. Admin login (allowlist validation)
2. Verification queue → approve provider → provider can operate
3. Verification queue → reject provider → provider blocked
4. Orders management → view all requests → filter by status
5. Pricing configuration → update delivery prices
6. Settlement tracking → view provider debts → mark settled

### Story 11-4: Cross-Persona Integration Tests (8 points)

**The Complete V2 Happy Path:**
```
Doña María (Consumer)     Don Pedro (Provider)      Admin
        |                         |                    |
        |-- Submit Request ------>|                    |
        |                         |                    |
        |                  [Sees request in dashboard] |
        |                         |                    |
        |                  [Submits offer]             |
        |                         |                    |
        |<-- Sees offer --------->|                    |
        |                         |                    |
        |-- Selects offer ------->|                    |
        |                         |                    |
        |                  [Notified of acceptance]   |
        |                         |                    |
        |                  [Marks delivered]          |
        |                         |                    |
        |                  [Commission logged] ------>|
        |                         |                    |
        |                         |      [Views in settlement]
```

**Edge Cases:**
- Consumer cancels after provider offers (offers auto-cancelled)
- Multiple providers compete for same request
- Offer expires while consumer views it
- Provider unavailable when consumer selects

---

## 6. Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 10 complete | Pending | Consumer offer selection tests |
| Testing-3 merged fixtures | ✅ Complete | Log fixture, userFactory |
| Seed scripts | Needs creation | Per-test data isolation |
| Dev login mode | ✅ Available | Auth bypass for E2E |

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| All P0 paths passing | 100% |
| All P1 paths passing | 100% |
| P2 paths passing | 80%+ |
| Test execution time | < 10 min total |
| Cross-browser (Chromium) | 100% pass |
| Cross-browser (Firefox) | 95%+ pass |
| Cross-browser (WebKit) | 90%+ pass (known flakiness) |

---

## 8. Execution Strategy

### Phase 1: Seed Data Setup
Create validation seed scripts before writing tests.

### Phase 2: Per-Persona Tests (Parallel)
Testing-4, Testing-5, Testing-6 can run in parallel.

### Phase 3: Integration Tests
Testing-7 requires all persona features working.

### Phase 4: CI Integration
Add validation tests to CI pipeline as gate before deployment.

---

*Generated by Atlas Project Intelligence*
*Date: 2025-12-19*
