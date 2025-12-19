# Story 11-4: Cross-Persona Integration Tests

| Field | Value |
|-------|-------|
| **Story ID** | 11-4 |
| **Epic** | Epic 11: Full Application Workflow Validation |
| **Title** | Cross-Persona Integration Tests |
| **Status** | ready-for-dev |
| **Priority** | P0 (Critical) |
| **Points** | 8 |
| **Sprint** | Post-Epic 10 |

---

## User Story

As a **QA engineer validating the platform**,
I want **to verify the complete V2 offer model works across all three personas**,
So that **we can confirm the platform operates as a cohesive marketplace**.

---

## Background

This is the **most critical** testing story. It validates that the complete workflow works when all three personas interact together. Previous stories test personas in isolation - this story proves the marketplace actually functions.

**The Complete V2 Flow:**
```
1. Consumer submits water request
2. Provider (verified by Admin) sees request and submits offer
3. Consumer views offers and selects one
4. Provider is notified, makes delivery
5. Provider marks delivered → Commission logged
6. Admin can view settlement and mark paid
```

This test validates the **core value loop** of the platform.

---

## Acceptance Criteria

### Happy Path - Full V2 Offer Model (P0)

| AC# | Criterion | Personas Involved |
|-----|-----------|-------------------|
| AC11.4.1 | E2E: Complete flow from guest request to delivery completion | Consumer + Provider |
| AC11.4.2 | E2E: Provider onboarding → Admin approval → Provider can operate | Provider + Admin |
| AC11.4.3 | E2E: Multiple providers compete for same request | Consumer + Provider x2 |
| AC11.4.4 | E2E: Settlement cycle from delivery to admin payment confirmation | Provider + Admin |

### Cross-Persona State Changes (P0)

| AC# | Criterion | State Transition |
|-----|-----------|-----------------|
| AC11.4.5 | E2E: When consumer selects offer, provider dashboard updates immediately | Consumer action → Provider view |
| AC11.4.6 | E2E: When admin approves provider, provider can see requests | Admin action → Provider view |
| AC11.4.7 | E2E: When provider marks delivered, consumer sees "Entregado" status | Provider action → Consumer view |
| AC11.4.8 | E2E: When provider marks delivered, commission appears in admin view | Provider action → Admin view |

### Realtime Validation (P1)

| AC# | Criterion | Realtime Feature |
|-----|-----------|-----------------|
| AC11.4.9 | E2E: New offer appears on consumer's page without refresh | Supabase Realtime |
| AC11.4.10 | E2E: Offer acceptance notification reaches provider in real-time | Supabase Realtime |
| AC11.4.11 | E2E: Request status changes propagate to all viewers | Supabase Realtime |

### Edge Cases - Cross-Persona (P1)

| AC# | Criterion | Scenario |
|-----|-----------|----------|
| AC11.4.12 | E2E: Consumer cancels after offers submitted → Offers auto-cancelled | Request cancelled |
| AC11.4.13 | E2E: Consumer selects offer while another provider is viewing → Other sees "taken" | Race condition |
| AC11.4.14 | E2E: Provider becomes unavailable → Pending offers still valid | Availability change |
| AC11.4.15 | E2E: Admin rejects provider with active offers → Offers cancelled | Provider rejection |

### Data Integrity (P0)

| AC# | Criterion | Validation |
|-----|-----------|-----------|
| AC11.4.16 | E2E: Commission amount matches delivery price × commission rate | Financial accuracy |
| AC11.4.17 | E2E: All offer state transitions are logged correctly | Audit trail |
| AC11.4.18 | E2E: Provider cannot see requests outside service area after admin changes | Authorization |

---

## Tasks / Subtasks

- [ ] **Task 1: Create Full Integration Seed Script** (AC: ALL)
  - [ ] Create `scripts/local/seed-validation-full.ts`
  - [ ] Seed admin account in allowlist
  - [ ] Seed pending provider for approval flow
  - [ ] Seed approved provider with service areas
  - [ ] Seed consumer accounts (guest + registered)
  - [ ] Seed pending request for offer competition
  - [ ] Add npm script: `npm run seed:validation:full`

- [ ] **Task 2: Happy Path Tests** (AC: 11.4.1-11.4.4)
  - [ ] Create `tests/e2e/validation/full-v2-integration.spec.ts`
  - [ ] Test: Complete guest → offer → delivery flow
  - [ ] Test: Provider onboarding → admin approval → operations
  - [ ] Test: Multiple providers competing
  - [ ] Test: Full settlement cycle

- [ ] **Task 3: Cross-Persona State Change Tests** (AC: 11.4.5-11.4.8)
  - [ ] Test: Consumer selection → Provider dashboard update
  - [ ] Test: Admin approval → Provider access
  - [ ] Test: Provider delivery → Consumer status
  - [ ] Test: Provider delivery → Admin commission view

- [ ] **Task 4: Realtime Tests** (AC: 11.4.9-11.4.11)
  - [ ] Test: New offer appears without refresh
  - [ ] Test: Acceptance notification realtime
  - [ ] Test: Status change propagation

- [ ] **Task 5: Edge Case Tests** (AC: 11.4.12-11.4.15)
  - [ ] Test: Consumer cancellation with pending offers
  - [ ] Test: Offer selection race condition
  - [ ] Test: Provider unavailable with offers
  - [ ] Test: Provider rejection with offers

- [ ] **Task 6: Data Integrity Tests** (AC: 11.4.16-11.4.18)
  - [ ] Test: Commission calculation accuracy
  - [ ] Test: State transition logging
  - [ ] Test: Authorization after service area change

---

## Dev Notes

### Test Architecture

These tests require **multiple browser contexts** to simulate different personas:

```typescript
// tests/e2e/validation/full-v2-integration.spec.ts
import { test, expect, BrowserContext } from '../../support/fixtures/merged-fixtures';

test.describe('Full V2 Integration @validation @integration', () => {

  test('Complete request → offer → delivery cycle', async ({ browser, log }) => {
    // Create separate contexts for each persona
    const consumerContext = await browser.newContext();
    const providerContext = await browser.newContext();

    const consumerPage = await consumerContext.newPage();
    const providerPage = await providerContext.newPage();

    try {
      // Step 1: Consumer submits request
      await log({ level: 'step', message: '1. Consumer submits water request' });
      await consumerPage.goto('/');
      await consumerPage.click('[data-testid="request-water-button"]');
      // ... fill form, submit
      const requestId = await getRequestIdFromUrl(consumerPage);

      // Step 2: Provider sees request
      await log({ level: 'step', message: '2. Provider views request in dashboard' });
      await providerPage.goto('/provider/login');
      // ... login as provider
      await providerPage.goto('/provider/requests');
      await expect(providerPage.locator(`[data-request-id="${requestId}"]`)).toBeVisible();

      // Step 3: Provider submits offer
      await log({ level: 'step', message: '3. Provider submits offer' });
      await providerPage.click(`[data-request-id="${requestId}"]`);
      await providerPage.click('[data-testid="submit-offer-button"]');
      // ... fill delivery window, submit

      // Step 4: Consumer sees offer (without refresh - realtime)
      await log({ level: 'step', message: '4. Consumer sees offer appear' });
      await consumerPage.goto(`/request/${requestId}/offers`);
      await expect(consumerPage.locator('[data-testid="offer-card"]')).toBeVisible();

      // Step 5: Consumer selects offer
      await log({ level: 'step', message: '5. Consumer selects offer' });
      await consumerPage.click('[data-testid="select-offer-button"]');
      await consumerPage.click('[data-testid="confirm-selection"]');

      // Step 6: Provider is notified
      await log({ level: 'step', message: '6. Provider sees acceptance notification' });
      await providerPage.reload(); // or check realtime
      await expect(providerPage.locator('[data-testid="notification-badge"]')).toBeVisible();

      // Step 7: Provider marks delivered
      await log({ level: 'step', message: '7. Provider marks delivered' });
      await providerPage.goto('/provider/dashboard');
      await providerPage.click(`[data-request-id="${requestId}"]`);
      await providerPage.click('[data-testid="mark-delivered"]');
      await providerPage.click('[data-testid="confirm-delivery"]');

      // Step 8: Consumer sees delivered status
      await log({ level: 'step', message: '8. Consumer sees delivered status' });
      await consumerPage.reload();
      await expect(consumerPage.locator('[data-testid="status-delivered"]')).toBeVisible();

      await log({ level: 'success', message: 'Full V2 cycle complete!' });

    } finally {
      await consumerContext.close();
      await providerContext.close();
    }
  });

  test('Multiple providers compete for same request', async ({ browser, log }) => {
    const consumerContext = await browser.newContext();
    const provider1Context = await browser.newContext();
    const provider2Context = await browser.newContext();

    // ... test with 3 simultaneous contexts

  });
});
```

### Seed Data for Integration Tests

```typescript
// scripts/local/seed-validation-full.ts
export async function seedFullValidation() {
  // 1. Admin
  await upsertAdminAllowedEmail('admin@nitoagua.cl');

  // 2. Two approved providers in same service area
  const provider1 = await createProvider({
    email: 'provider1@test.com',
    verificationStatus: 'approved',
    isAvailable: true
  });
  const provider2 = await createProvider({
    email: 'provider2@test.com',
    verificationStatus: 'approved',
    isAvailable: true
  });
  await addServiceArea(provider1.id, 'Villarrica');
  await addServiceArea(provider2.id, 'Villarrica');

  // 3. One pending provider for approval flow test
  await createProvider({
    email: 'pending-provider@test.com',
    verificationStatus: 'pending',
    hasDocuments: true
  });

  // 4. Consumer (registered)
  await createConsumer({
    email: 'consumer@test.com',
    name: 'Test Consumer'
  });

  // 5. Existing pending request for competition test
  await createRequest({
    comunaId: villarricaId,
    status: 'pending',
    consumerEmail: 'guest@test.com'
  });
}
```

### Realtime Testing Strategy

To test realtime updates, use `page.waitForSelector` with polling:

```typescript
// Wait for new offer to appear (realtime)
await providerPage.click('[data-testid="submit-offer"]');

// On consumer page, wait for offer to appear (max 10 seconds)
await consumerPage.waitForSelector('[data-testid="offer-card"]', {
  timeout: 10000,
  state: 'visible'
});
```

### Race Condition Testing

For AC7.13 (race condition), simulate nearly simultaneous actions:

```typescript
test('Consumer selects while other provider views', async ({ browser, log }) => {
  const consumer = await browser.newContext();
  const provider2 = await browser.newContext();

  // Provider 2 is viewing the offer list
  await provider2Page.goto(`/provider/requests/${requestId}`);

  // Consumer selects Provider 1's offer
  await consumerPage.click('[data-testid="select-offer"]');

  // Provider 2's view should update to show "Ya asignada"
  await expect(provider2Page.locator('[data-testid="request-filled"]')).toBeVisible();
});
```

### Commission Accuracy Validation

```typescript
test('Commission calculation is accurate', async ({ page, log }) => {
  // Get delivery price from admin settings
  const deliveryPrice = 20000; // CLP
  const commissionRate = 0.10; // 10%
  const expectedCommission = Math.round(deliveryPrice * commissionRate);

  // After delivery, check admin settlement view
  await adminPage.goto('/admin/settlements');
  const commission = await adminPage.locator('[data-testid="commission-amount"]').textContent();

  expect(parseInt(commission.replace(/[^0-9]/g, ''))).toBe(expectedCommission);
});
```

---

## Workflow Chain Visualization

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CONSUMER      │    │    PROVIDER     │    │     ADMIN       │
│  (Doña María)   │    │   (Don Pedro)   │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ Submit Request       │                      │
         │─────────────────────>│ Sees in Dashboard    │
         │                      │                      │
         │                      │ Submit Offer         │
         │<─────────────────────│                      │
         │ View Offers          │                      │
         │                      │                      │
         │ Select Offer         │                      │
         │─────────────────────>│ Notified             │
         │                      │                      │
         │                      │ Mark Delivered       │
         │<─────────────────────│─────────────────────>│
         │ Status: Entregado    │                      │ Commission Logged
         │                      │                      │
         │                      │ View Earnings        │
         │                      │─────────────────────>│ View Settlement
         │                      │                      │
         │                      │                      │ Mark Settled
         │                      │<─────────────────────│
         │                      │ Settlement Confirmed │
         │                      │                      │
```

---

## References

- [Source: docs/sprint-artifacts/epic11/tech-spec-epic-11.md#5]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/08-workflow-chains.md]
- [Source: docs/architecture.md#ADR-006-Consumer-Choice-Offer-Model]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/03-personas.md]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Story created by Atlas | Claude Opus 4.5 |
