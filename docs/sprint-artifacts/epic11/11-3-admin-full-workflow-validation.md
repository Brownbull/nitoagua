# Story 11-3: Admin Full Workflow Validation

| Field | Value |
|-------|-------|
| **Story ID** | 11-3 |
| **Epic** | Epic 11: Full Application Workflow Validation |
| **Title** | Admin Full Workflow Validation |
| **Status** | ready-for-dev |
| **Priority** | P0 (Critical) |
| **Points** | 5 |
| **Sprint** | Post-Epic 10 |

---

## User Story

As a **QA engineer validating the platform**,
I want **to verify all admin workflows function correctly end-to-end**,
So that **we can confirm platform operations can be managed effectively**.

---

## Background

This story creates comprehensive E2E tests that validate ALL admin features. Admins are the platform operators who:
- Verify and approve new providers
- Manage platform pricing and settings
- Track orders across the platform
- Handle commission settlements

**Admin Access:** Admins are pre-seeded in `admin_allowed_emails` table. Access is via Google OAuth with email verification against allowlist.

---

## Acceptance Criteria

### Admin Authentication (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.1 | E2E: Admin logs in via allowlist-verified email | Epic 6 |
| AC11.3.2 | E2E: Non-admin email is rejected with clear message | Epic 6 |
| AC11.3.3 | E2E: Admin sees admin dashboard after login | Epic 6 |

### Provider Verification (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.4 | E2E: Admin views pending provider verification queue | Epic 6 |
| AC11.3.5 | E2E: Admin reviews provider documents (carnet, truck photo) | Epic 6 |
| AC11.3.6 | E2E: Admin approves provider → status changes to approved | Epic 6 |
| AC11.3.7 | E2E: Admin rejects provider with reason → status changes to rejected | Epic 6 |
| AC11.3.8 | E2E: Approved provider appears in provider directory | Epic 6 |

### Provider Directory (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.9 | E2E: Admin views all providers in directory | Epic 6 |
| AC11.3.10 | E2E: Admin filters providers by status | Epic 6 |
| AC11.3.11 | E2E: Admin views individual provider details | Epic 6 |
| AC11.3.12 | E2E: Admin can revoke provider approval | Epic 6 |

### Orders Management (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.13 | E2E: Admin views all water requests across platform | Epic 6 |
| AC11.3.14 | E2E: Admin filters orders by status (pending, accepted, delivered) | Epic 6 |
| AC11.3.15 | E2E: Admin views order details including consumer and provider | Epic 6 |
| AC11.3.16 | E2E: Admin sees order timeline (request → offers → delivery) | Epic 6 |

### Pricing Configuration (P0)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.17 | E2E: Admin views current pricing tiers | Epic 6 |
| AC11.3.18 | E2E: Admin updates delivery price for a tier | Epic 6 |
| AC11.3.19 | E2E: Admin updates commission percentage | Epic 6 |
| AC11.3.20 | E2E: Price changes reflect in new requests | Epic 6 |

### Offer System Configuration (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.21 | E2E: Admin views offer validity settings | Epic 6 |
| AC11.3.22 | E2E: Admin updates offer validity period | Epic 6 |
| AC11.3.23 | E2E: Admin views request timeout settings | Epic 6 |

### Cash Settlement (P1)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.24 | E2E: Admin views provider commission balances | Epic 6 |
| AC11.3.25 | E2E: Admin filters settlements by provider | Epic 6 |
| AC11.3.26 | E2E: Admin views pending settlement requests | Epic 6 |
| AC11.3.27 | E2E: Admin marks settlement as paid | Epic 6 |
| AC11.3.28 | E2E: Admin views settlement history | Epic 6 |

### Operations Dashboard (P2)

| AC# | Criterion | Features Tested |
|-----|-----------|-----------------|
| AC11.3.29 | E2E: Admin sees platform metrics (requests, providers, revenue) | Epic 6 |
| AC11.3.30 | E2E: Dashboard reflects real-time data | Epic 6 |

---

## Tasks / Subtasks

- [ ] **Task 1: Create Admin Validation Seed Script** (AC: ALL)
  - [ ] Create `scripts/local/seed-validation-admin.ts`
  - [ ] Ensure admin email in allowlist
  - [ ] Seed pending providers for verification
  - [ ] Seed approved providers with deliveries
  - [ ] Seed commission ledger entries
  - [ ] Seed various order states
  - [ ] Add npm script: `npm run seed:validation:admin`

- [ ] **Task 2: Authentication Tests** (AC: 11.3.1-11.3.3)
  - [ ] Create `tests/e2e/validation/admin-workflows.spec.ts`
  - [ ] Test: Admin login with allowed email
  - [ ] Test: Non-admin email rejection
  - [ ] Test: Admin dashboard access

- [ ] **Task 3: Provider Verification Tests** (AC: 11.3.4-11.3.8)
  - [ ] Test: View pending queue
  - [ ] Test: Review documents
  - [ ] Test: Approve provider
  - [ ] Test: Reject provider with reason
  - [ ] Test: Approved shows in directory

- [ ] **Task 4: Provider Directory Tests** (AC: 11.3.9-11.3.12)
  - [ ] Test: View all providers
  - [ ] Test: Filter by status
  - [ ] Test: View provider details
  - [ ] Test: Revoke approval

- [ ] **Task 5: Orders Management Tests** (AC: 11.3.13-11.3.16)
  - [ ] Test: View all orders
  - [ ] Test: Filter by status
  - [ ] Test: View order details
  - [ ] Test: Order timeline display

- [ ] **Task 6: Pricing Configuration Tests** (AC: 11.3.17-11.3.20)
  - [ ] Test: View pricing tiers
  - [ ] Test: Update delivery price
  - [ ] Test: Update commission percentage
  - [ ] Test: Verify price change applies

- [ ] **Task 7: Offer Configuration Tests** (AC: 11.3.21-11.3.23)
  - [ ] Test: View offer validity
  - [ ] Test: Update validity period
  - [ ] Test: View request timeout

- [ ] **Task 8: Settlement Tests** (AC: 11.3.24-11.3.28)
  - [ ] Test: View commission balances
  - [ ] Test: Filter by provider
  - [ ] Test: View pending settlements
  - [ ] Test: Mark as paid
  - [ ] Test: View history

- [ ] **Task 9: Dashboard Tests** (AC: 11.3.29-11.3.30)
  - [ ] Test: Metrics display
  - [ ] Test: Real-time updates

---

## Dev Notes

### Test File Structure

```typescript
// tests/e2e/validation/admin-workflows.spec.ts
import { test, expect } from '../../support/fixtures/merged-fixtures';

test.describe('Admin Workflows @validation', () => {

  test.describe('Authentication', () => {
    test('Admin login via allowlist', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Navigate to admin login' });
      await page.goto('/admin/login');

      await log({ level: 'step', message: '2. Login via dev login (admin)' });
      // Use dev login with admin@nitoagua.cl

      await log({ level: 'step', message: '3. Verify admin dashboard access' });
      await expect(page).toHaveURL('/admin');
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();

      await log({ level: 'success', message: 'Admin login complete' });
    });

    test('Non-admin email rejected', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Attempt login with non-admin email' });
      // ...

      await log({ level: 'step', message: '2. Verify rejection message' });
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });
  });

  test.describe('Provider Verification', () => {
    test('Admin approves pending provider', async ({ page, log }) => {
      await log({ level: 'step', message: '1. Navigate to verification queue' });
      await page.goto('/admin/verification');

      await log({ level: 'step', message: '2. Select pending provider' });
      await page.click('[data-testid="pending-provider-row"]:first-child');

      await log({ level: 'step', message: '3. Review documents' });
      await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();

      await log({ level: 'step', message: '4. Approve provider' });
      await page.click('[data-testid="approve-button"]');
      await page.click('[data-testid="confirm-approve"]');

      await log({ level: 'step', message: '5. Verify status changed' });
      await expect(page.locator('[data-testid="provider-status"]'))
        .toContainText('Aprobado');

      await log({ level: 'success', message: 'Provider approval flow complete' });
    });
  });

  test.describe('Orders Management', () => {
    // ...
  });

  test.describe('Pricing Configuration', () => {
    // ...
  });

  test.describe('Settlement', () => {
    // ...
  });
});
```

### Seed Data Requirements

```typescript
// scripts/local/seed-validation-admin.ts
export async function seedAdminValidation() {
  // 1. Ensure admin in allowlist
  await upsertAdminAllowedEmail('admin@nitoagua.cl');

  // 2. Pending providers for verification
  await createProvider({
    email: 'pending1@test.com',
    verificationStatus: 'pending',
    hasDocuments: true
  });
  await createProvider({
    email: 'pending2@test.com',
    verificationStatus: 'pending',
    hasDocuments: true
  });

  // 3. Approved providers with various states
  const provider = await createProvider({
    email: 'approved@test.com',
    verificationStatus: 'approved'
  });

  // 4. Orders in various states
  await createRequest({ status: 'pending' });
  await createRequest({ status: 'accepted', providerId: provider.id });
  await createRequest({ status: 'delivered', providerId: provider.id });

  // 5. Commission entries for settlement
  await createCommissionEntry({
    providerId: provider.id,
    amount: 5000,
    status: 'pending'
  });
  await createCommissionEntry({
    providerId: provider.id,
    amount: 3000,
    status: 'settled'
  });
}
```

### Admin Routes to Test

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard |
| `/admin/verification` | Provider verification queue |
| `/admin/providers` | Provider directory |
| `/admin/orders` | Orders management |
| `/admin/pricing` | Pricing configuration |
| `/admin/settings` | Offer system configuration |
| `/admin/settlements` | Cash settlement tracking |

### Pricing Tiers Reference

| Tier | Volume | Default Price (CLP) |
|------|--------|---------------------|
| Small | Up to 100L | $5,000 |
| Medium | Up to 1,000L | $20,000 |
| Large | Up to 5,000L | $75,000 |
| X-Large | Over 5,000L | $140,000 |

Default commission: 10%

---

## References

- [Source: docs/sprint-artifacts/epic11/tech-spec-epic-11.md#3.3]
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/02-features.md#Admin-Features]
- [Source: docs/sprint-artifacts/epic6/] (Admin panel stories)
- [Source: _bmad/agents/atlas/atlas-sidecar/knowledge/04-architecture.md#Pricing]

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
