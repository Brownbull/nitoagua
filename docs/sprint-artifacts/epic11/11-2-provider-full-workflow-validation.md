# Story 11-2: Provider Full Workflow Validation

| Field | Value |
|-------|-------|
| **Story ID** | 11-2 |
| **Epic** | Epic 11: Full Application Workflow Validation |
| **Title** | Provider Full Workflow Validation |
| **Status** | ready-for-dev |
| **Priority** | P0 (Critical) |
| **Points** | 8 |
| **Sprint** | Post-Epic 10 |

---

## User Story

As a **QA engineer validating the platform**,
I want **to verify all provider (Don Pedro) workflows function correctly end-to-end**,
So that **we can confirm providers can onboard, operate, and earn on the platform**.

---

## Background

This story creates comprehensive E2E tests that validate ALL provider features from initial registration through earnings settlement. Providers are the supply side of the marketplace - their experience must be validated completely.

**Persona Reference:** Don Pedro - 42yo, one-man cistern truck operation, tech-comfortable, ~60 customers/month.

**Key Provider Journeys:**
1. Onboarding: Register → Upload docs → Wait for verification
2. Operations: Browse requests → Submit offers → Complete deliveries
3. Earnings: View commissions → Request settlement

---

## Acceptance Criteria

### Onboarding Flow (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.1 | E2E: Provider registers via Google OAuth | Epic 7 |
| AC11.2.2 | E2E: Provider completes personal information | Epic 7 |
| AC11.2.3 | E2E: Provider uploads required documents (carnet, truck photo) | Epic 7 |
| AC11.2.4 | E2E: Provider sees "Pending Verification" status | Epic 7 |
| AC11.2.5 | E2E: After admin approval, provider sees "Approved" status | Epic 7 |
| AC11.2.6 | E2E: Rejected provider sees rejection reason and can resubmit | Epic 7 |

### Profile Configuration (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.7 | E2E: Provider configures service areas (comunas) | Epic 7 |
| AC11.2.8 | E2E: Provider toggles availability on/off | Epic 7 |
| AC11.2.9 | E2E: Provider adds bank account details | Epic 7 |
| AC11.2.10 | E2E: Provider updates vehicle information | Epic 7 |
| AC11.2.11 | E2E: Provider accesses settings page | Epic 8 |

### Request Operations (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.12 | E2E: Provider browses available requests in service area | Epic 8 |
| AC11.2.13 | E2E: Provider sees request details (location, volume, urgency) | Epic 8 |
| AC11.2.14 | E2E: Provider submits offer with delivery window | Epic 8 |
| AC11.2.15 | E2E: Provider sees active offers list | Epic 8 |
| AC11.2.16 | E2E: Provider withdraws pending offer | Epic 8 |
| AC11.2.17 | E2E: Provider receives notification when offer accepted | Epic 8 |
| AC11.2.18 | E2E: Provider sees customer details after acceptance | Epic 8 |

### Delivery Operations (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.19 | E2E: Provider marks request as delivered | Epic 3 |
| AC11.2.20 | E2E: Commission is logged upon delivery completion | Epic 8 |
| AC11.2.21 | E2E: Provider sees delivery in history | Epic 3 |

### Earnings & Settlement (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.22 | E2E: Provider views earnings dashboard | Epic 8 |
| AC11.2.23 | E2E: Provider sees commission breakdown by delivery | Epic 8 |
| AC11.2.24 | E2E: Provider can filter earnings by period | Epic 8 |
| AC11.2.25 | E2E: Provider submits settlement request | Epic 8 |
| AC11.2.26 | E2E: Provider uploads payment receipt | Epic 8 |

### Map & Navigation (P2)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.27 | E2E: Provider accesses map view | Epic 8 |
| AC11.2.28 | E2E: Map shows request locations in service area | Epic 8 |

### Edge Cases (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.2.29 | E2E: Unavailable provider cannot see requests | Epic 7 |
| AC11.2.30 | E2E: Provider without service areas sees empty state | Epic 7 |
| AC11.2.31 | E2E: Offer on already-accepted request shows error | Epic 8 |
| AC11.2.32 | E2E: Multiple offers from same provider blocked | Epic 8 |

---

## Tasks / Subtasks

- [ ] **Task 1: Create Provider Validation Seed Script** (AC: ALL)
  - [ ] Create `scripts/local/seed-validation-provider.ts`
  - [ ] Seed pending provider (for onboarding tests)
  - [ ] Seed approved provider with service areas
  - [ ] Seed pending requests in provider's service area
  - [ ] Seed completed deliveries with commissions
  - [ ] Add npm script: `npm run seed:validation:provider`

- [ ] **Task 2: Onboarding Flow Tests** (AC: 11.2.1-11.2.6)
  - [ ] Create `tests/e2e/validation/provider-workflows.spec.ts`
  - [ ] Test: Provider registration
  - [ ] Test: Document upload flow
  - [ ] Test: Pending verification status display
  - [ ] Test: Approved status after verification
  - [ ] Test: Rejection flow with resubmission

- [ ] **Task 3: Profile Configuration Tests** (AC: 11.2.7-11.2.11)
  - [ ] Test: Service area configuration
  - [ ] Test: Availability toggle
  - [ ] Test: Bank details form
  - [ ] Test: Vehicle information
  - [ ] Test: Settings page access

- [ ] **Task 4: Request Operations Tests** (AC: 11.2.12-11.2.18)
  - [ ] Test: Request browser displays requests
  - [ ] Test: Request details view
  - [ ] Test: Offer submission
  - [ ] Test: Active offers list
  - [ ] Test: Withdraw pending offer
  - [ ] Test: Acceptance notification
  - [ ] Test: Customer details after acceptance

- [ ] **Task 5: Delivery Operations Tests** (AC: 11.2.19-11.2.21)
  - [ ] Test: Mark delivered action
  - [ ] Test: Commission logging
  - [ ] Test: Delivery history

- [ ] **Task 6: Earnings & Settlement Tests** (AC: 11.2.22-11.2.26)
  - [ ] Test: Earnings dashboard access
  - [ ] Test: Commission breakdown display
  - [ ] Test: Period filter functionality
  - [ ] Test: Settlement request flow
  - [ ] Test: Receipt upload

- [ ] **Task 7: Map Tests** (AC: 11.2.27-11.2.28)
  - [ ] Test: Map view loads
  - [ ] Test: Request markers display

- [ ] **Task 8: Edge Case Tests** (AC: 11.2.29-11.2.32)
  - [ ] Test: Unavailable state
  - [ ] Test: No service areas state
  - [ ] Test: Already-accepted request error
  - [ ] Test: Duplicate offer blocked

---

## Dev Notes

### Test File Structure

```typescript
// tests/e2e/validation/provider-workflows.spec.ts
import { test, expect } from '../../support/fixtures/merged-fixtures';

test.describe('Provider Workflows @validation', () => {

  test.describe('Onboarding', () => {
    test('New provider completes registration flow', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Register as provider' });
      // ... registration flow

      await log({ level: 'step', message: '2. Upload documents' });
      // ... document upload

      await log({ level: 'step', message: '3. Verify pending status' });
      await expect(page.locator('[data-testid="verification-status"]'))
        .toContainText('Pendiente');

      await log({ level: 'success', message: 'Onboarding flow complete' });
    });
  });

  test.describe('Operations', () => {
    test('Provider submits offer and completes delivery', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Browse requests' });
      await page.goto('/provider/requests');

      await log({ level: 'step', message: '2. Submit offer' });
      // ...

      await log({ level: 'step', message: '3. Mark delivered' });
      // ...

      await log({ level: 'step', message: '4. Verify commission logged' });
      // ...

      await log({ level: 'success', message: 'Full delivery cycle complete' });
    });
  });

  test.describe('Earnings', () => {
    // ...
  });

  test.describe('Edge Cases', () => {
    // ...
  });
});
```

### Seed Data Requirements

```typescript
// scripts/local/seed-validation-provider.ts
export async function seedProviderValidation() {
  // 1. Pending provider (for onboarding tests)
  await createProvider({
    email: 'pending-provider@test.com',
    verificationStatus: 'pending',
    hasDocuments: true
  });

  // 2. Approved provider with complete profile
  const provider = await createProvider({
    email: 'approved-provider@test.com',
    verificationStatus: 'approved',
    isAvailable: true
  });
  await addServiceArea(provider.id, 'Villarrica');
  await addBankDetails(provider.id, { /* ... */ });

  // 3. Pending requests in service area
  await createRequest({ comunaId: villarricaId, status: 'pending' });
  await createRequest({ comunaId: villarricaId, status: 'pending' });

  // 4. Completed deliveries with commissions
  const completedRequest = await createRequest({ status: 'delivered', providerId: provider.id });
  await createCommissionEntry({ requestId: completedRequest.id, amount: 2000 });

  // 5. Request with existing offer (for edge case)
  const requestWithOffer = await createRequest({ status: 'pending' });
  await createOffer({ requestId: requestWithOffer.id, providerId: provider.id });
}
```

### Provider States to Test

| State | Characteristic | Expected Behavior |
|-------|---------------|-------------------|
| Unverified | No documents | Cannot access dashboard |
| Pending | Documents uploaded | Sees "pending" status |
| Approved | Verified by admin | Full dashboard access |
| Rejected | Failed verification | Sees reason, can resubmit |
| Unavailable | Toggle off | Cannot see requests |
| No service areas | Empty areas | Empty request browser |

### Document Upload Testing

For document upload tests, use test files:
```typescript
const testDocument = 'tests/fixtures/files/test-document.png';
await page.setInputFiles('[data-testid="document-upload"]', testDocument);
```

---

## References

- [Source: docs/sprint-artifacts/epic11/tech-spec-epic-11.md#3.2]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/03-personas.md#Don-Pedro]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/02-features.md#Provider-Features]
- [Source: docs/sprint-artifacts/epic7/] (Onboarding stories)
- [Source: docs/sprint-artifacts/epic8/] (Offer system stories)

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
