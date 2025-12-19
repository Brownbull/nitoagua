# Story 11-1: Consumer Full Workflow Validation

| Field | Value |
|-------|-------|
| **Story ID** | 11-1 |
| **Epic** | Epic 11: Full Application Workflow Validation |
| **Title** | Consumer Full Workflow Validation |
| **Status** | ready-for-dev |
| **Priority** | P0 (Critical) |
| **Points** | 5 |
| **Sprint** | Post-Epic 10 |

---

## User Story

As a **QA engineer validating the platform**,
I want **to verify all consumer (Doña María) workflows function correctly end-to-end**,
So that **we can confirm the consumer experience is complete and production-ready**.

---

## Background

This story creates comprehensive E2E tests that validate ALL consumer features across both guest and registered user flows. After Epic 10 completes the V2 offer model, consumers have the full feature set. This story proves it works.

**Persona Reference:** Doña María - 58yo, rural Chilean, NOT tech-savvy, Android phone set up by daughter.

**UX Requirements to Validate:**
- One big obvious button
- One-thumb operation in 30 seconds
- Large touch targets (44x44px)
- High contrast, Spanish interface

---

## Acceptance Criteria

### Guest Consumer Flow (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.1.1 | E2E: Guest submits water request with address, volume, urgency | Epic 2 |
| AC11.1.2 | E2E: Guest receives tracking link (email or displayed) | Epic 2, Epic 5 |
| AC11.1.3 | E2E: Guest tracks request via tracking token | Epic 2 |
| AC11.1.4 | E2E: Guest views offers on pending request (V2) | Epic 10 |
| AC11.1.5 | E2E: Guest selects an offer from multiple providers (V2) | Epic 10 |
| AC11.1.6 | E2E: Guest sees status update after offer selection | Epic 10 |
| AC11.1.7 | E2E: Guest sees delivery notification when complete | Epic 3 |
| AC11.1.8 | E2E: Guest can cancel request before offer acceptance | Epic 4 |

### Registered Consumer Flow (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.1.9 | E2E: Consumer registers via Google OAuth | Epic 4 |
| AC11.1.10 | E2E: Registered consumer sees pre-filled form with saved address | Epic 4 |
| AC11.1.11 | E2E: Registered consumer views request history | Epic 4 |
| AC11.1.12 | E2E: Registered consumer receives in-app notifications | Epic 5 |

### V2 Offer Experience (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.1.13 | E2E: Consumer sees offer countdown timers | Epic 10 |
| AC11.1.14 | E2E: Expired offers show disabled state | Epic 10 |
| AC11.1.15 | E2E: Consumer sees provider info after selection | Epic 10 |
| AC11.1.16 | E2E: Consumer can call provider via tel: link | Epic 10 |

### Negative/Edge Cases (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.1.17 | E2E: Request with no offers shows timeout state | Epic 10 (10-4) |
| AC11.1.18 | E2E: Cancelled request shows cancelled state | Epic 4 |
| AC11.1.19 | E2E: Invalid tracking token shows error | Epic 2 |

### Platform/UX (P2)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.1.20 | E2E: All consumer pages display in Spanish | All |
| AC11.1.21 | E2E: PWA install prompt appears on eligible browsers | Epic 1 |
| AC11.1.22 | E2E: Mobile responsive layout on consumer pages | All |

---

## Tasks / Subtasks

- [ ] **Task 1: Create Consumer Validation Seed Script** (AC: ALL)
  - [ ] Create `scripts/local/seed-validation-consumer.ts`
  - [ ] Seed verified provider with service areas
  - [ ] Seed pending requests with and without offers
  - [ ] Seed expired offers for edge case tests
  - [ ] Add npm script: `npm run seed:validation:consumer`

- [ ] **Task 2: Guest Flow Tests** (AC: 11.1.1-11.1.8)
  - [ ] Create `tests/e2e/validation/consumer-workflows.spec.ts`
  - [ ] Test: Guest submits request
  - [ ] Test: Guest receives tracking confirmation
  - [ ] Test: Guest tracks request via token
  - [ ] Test: Guest views offers
  - [ ] Test: Guest selects offer
  - [ ] Test: Guest sees updated status
  - [ ] Test: Guest cancels pending request

- [ ] **Task 3: Registered Flow Tests** (AC: 11.1.9-11.1.12)
  - [ ] Test: Consumer login via dev login mode
  - [ ] Test: Pre-filled form displays saved info
  - [ ] Test: Request history shows past orders
  - [ ] Test: In-app notifications appear

- [ ] **Task 4: V2 Offer Experience Tests** (AC: 11.1.13-11.1.16)
  - [ ] Test: Countdown timers display on offers
  - [ ] Test: Expired offer shows disabled button
  - [ ] Test: Provider info visible after selection
  - [ ] Test: Call button has tel: href

- [ ] **Task 5: Edge Case Tests** (AC: 11.1.17-11.1.19)
  - [ ] Test: Request timeout shows "Sin Ofertas"
  - [ ] Test: Cancelled request displays correctly
  - [ ] Test: Invalid token shows error

- [ ] **Task 6: Platform Tests** (AC: 11.1.20-11.1.22)
  - [ ] Test: Spanish text verification
  - [ ] Test: PWA manifest present
  - [ ] Test: Mobile viewport renders correctly

- [ ] **Task 7: CI Integration**
  - [ ] Add `@validation` tag to all tests
  - [ ] Update CI to run `npm run test:e2e -- --grep "@validation"`

---

## Dev Notes

### Test File Structure

```typescript
// tests/e2e/validation/consumer-workflows.spec.ts
import { test, expect } from '../../support/fixtures/merged-fixtures';

test.describe('Consumer Workflows @validation', () => {

  test.describe('Guest Flow', () => {
    test('Guest completes full request → offer → delivery', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Navigate to home' });
      await page.goto('/');

      await log({ level: 'step', message: '2. Click big action button' });
      await page.click('[data-testid="request-water-button"]');

      // ... full flow

      await log({ level: 'success', message: 'Guest flow complete' });
    });
  });

  test.describe('Registered Flow', () => {
    // ...
  });

  test.describe('V2 Offer Experience', () => {
    // ...
  });

  test.describe('Edge Cases', () => {
    // ...
  });
});
```

### Seed Data Requirements

```typescript
// scripts/local/seed-validation-consumer.ts
export async function seedConsumerValidation() {
  // 1. Create verified provider with service areas
  const provider = await createProvider({ verified: true });
  await addServiceArea(provider.id, 'Villarrica');

  // 2. Create request with multiple offers
  const requestWithOffers = await createRequest({ status: 'pending' });
  await createOffer({ requestId: requestWithOffers.id, providerId: provider.id });
  await createOffer({ requestId: requestWithOffers.id, providerId: provider2.id });

  // 3. Create request with no offers (for timeout test)
  await createRequest({ status: 'pending', createdAt: '4 hours ago' });

  // 4. Create expired offer
  await createOffer({ expiresAt: '1 hour ago', status: 'expired' });
}
```

### Spanish Text Verification

```typescript
test('All consumer pages display in Spanish', async ({ page }) => {
  const spanishTerms = [
    'Solicitar Agua',
    'Ofertas Recibidas',
    'Entrega estimada',
    'Seleccionar',
    'Cancelar'
  ];

  await page.goto('/');
  for (const term of spanishTerms) {
    // Verify term exists somewhere in consumer flow
  }
});
```

### Pattern References

- Use `assertNoErrorState()` from Testing-1
- Use `log()` fixture from Testing-3
- Use per-test seeding pattern from Testing-2

---

## References

- [Source: docs/sprint-artifacts/epic11/tech-spec-epic-11.md#3.1]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/03-personas.md]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/02-features.md#Consumer-Features]
- [Source: docs/ux-design-specification.md#Dona-Maria]

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
