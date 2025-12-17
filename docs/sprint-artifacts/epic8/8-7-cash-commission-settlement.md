# Story 8.7: Cash Commission Settlement

| Field | Value |
|-------|-------|
| **Story ID** | 8-7 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Cash Commission Settlement |
| **Status** | ready-for-dev |
| **Priority** | P1 (High) |
| **Points** | 4 |
| **Sprint** | TBD |

---

## User Story

As a **provider with pending cash commission**,
I want **to submit payment proof for commission I owe**,
So that **my account is settled and I maintain good standing**.

---

## Background

When customers pay providers in cash, the provider owes commission to the platform. This story implements the settlement flow where providers transfer commission to the platform's bank account and upload proof of payment for admin verification.

This completes the financial cycle for cash-based transactions in the marketplace.

---

## Acceptance Criteria

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC8.7.1 | Amount due displayed prominently | From commission_pending calculation |
| AC8.7.2 | Platform bank details shown: Banco, Cuenta, Titular, RUT | From admin_settings |
| AC8.7.3 | Upload receipt button functional | Supabase Storage upload |
| AC8.7.4 | Upon submission: payment record created with status 'pending_verification' | Creates withdrawal_request |
| AC8.7.5 | Admin notified for verification | Via notification system |
| AC8.7.6 | Provider sees "Pago enviado - En verificación" | Status feedback |
| AC8.7.7 | Once verified: commission_paid entry created, pending balance reduced | Admin action completes cycle |

---

## Tasks / Subtasks

- [ ] **Task 1: Settlement Page** (AC: 8.7.1, 8.7.2)
  - [ ] Create `src/app/(provider)/earnings/withdraw/page.tsx`
  - [ ] Display commission pending amount prominently
  - [ ] Show platform bank details from admin_settings
  - [ ] Format: Banco, Tipo de Cuenta, Número de Cuenta, Titular, RUT

- [ ] **Task 2: Bank Details from Admin Settings** (AC: 8.7.2)
  - [ ] Add to admin_settings: platform_bank_name, platform_account_type
  - [ ] Add: platform_account_number, platform_account_holder, platform_rut
  - [ ] Create server action to fetch bank details
  - [ ] Format for display

- [ ] **Task 3: Receipt Upload Component** (AC: 8.7.3)
  - [ ] Create receipt upload form component
  - [ ] Accept image files (JPG, PNG) and PDF
  - [ ] Preview uploaded file
  - [ ] Upload to Supabase Storage `commission-receipts` bucket
  - [ ] Generate unique path: `{provider_id}/{timestamp}-receipt.{ext}`

- [ ] **Task 4: Submit Payment Server Action** (AC: 8.7.4, 8.7.5)
  - [ ] Add `submitCommissionPayment(data)` to `src/lib/actions/settlement.ts`
  - [ ] Validate amount matches pending commission
  - [ ] Upload receipt to Supabase Storage
  - [ ] Create withdrawal_request with status 'pending_verification'
  - [ ] Notify admin for verification
  - [ ] Return success with request ID

- [ ] **Task 5: Supabase Storage Bucket** (AC: 8.7.3)
  - [ ] Create `commission-receipts` storage bucket
  - [ ] Configure RLS: providers can insert own, admins can read all
  - [ ] Set file size limit (5MB)
  - [ ] Configure allowed MIME types

- [ ] **Task 6: Pending Verification State** (AC: 8.7.6)
  - [ ] Show "Pago enviado - En verificación" status
  - [ ] Disable new submissions while pending
  - [ ] Show submission timestamp
  - [ ] Link to view uploaded receipt

- [ ] **Task 7: Admin Verification Flow** (AC: 8.7.5, 8.7.7)
  - [ ] Add to admin panel: pending settlement verifications
  - [ ] Display: provider, amount, receipt image
  - [ ] "Aprobar" button: creates commission_paid ledger entry
  - [ ] "Rechazar" button: returns to provider with note
  - [ ] Update pending balance after approval

- [ ] **Task 8: Testing** (AC: ALL)
  - [ ] Integration: Receipt uploads to Supabase Storage
  - [ ] Integration: Withdrawal request created
  - [ ] Integration: Admin receives notification
  - [ ] E2E: Full settlement submission flow
  - [ ] E2E: Admin approval reduces pending balance

---

## Dev Notes

### Architecture Alignment

Per tech spec:
- Page: `src/app/(provider)/earnings/withdraw/page.tsx`
- Actions: `src/lib/actions/settlement.ts`
- Storage: `commission-receipts` bucket

### Withdrawal Request Flow

```
Provider submits payment
    │
    ▼
Create withdrawal_request
status = 'pending_verification'
    │
    ▼
Admin notified
    │
    ▼
Admin reviews receipt
    │
    ├── Approve → commission_paid entry created
    │             pending balance reduced
    │
    └── Reject → Provider notified with reason
                 Can resubmit
```

### Database Tables Involved

```sql
-- withdrawal_request (exists or create)
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  receipt_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'approved', 'rejected')),
  admin_id UUID REFERENCES profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- commission_ledger entry on approval
INSERT INTO commission_ledger (provider_id, type, amount, description, admin_id)
VALUES (provider_id, 'commission_paid', amount, 'Bank transfer verified', admin_id);
```

### Admin Settings for Bank Details

```typescript
// admin_settings additions
{
  platform_bank_name: 'Banco de Chile',
  platform_account_type: 'Cuenta Corriente',
  platform_account_number: '12345678',
  platform_account_holder: 'NitoAgua SpA',
  platform_rut: '77.XXX.XXX-X'
}
```

### Security Considerations

- Receipt bucket is private (authenticated access only)
- Providers can only see their own receipts
- Admins can see all receipts for verification
- Amount must match exactly to prevent fraud

### Project Structure Notes

- Builds on Story 8-6 earnings dashboard
- Integrates with admin panel from Epic 6
- Uses existing notification patterns from Epic 5

### References

- [Source: docs/sprint-artifacts/epic8/tech-spec-epic-8.md#Story-8.7]
- [Source: docs/epics.md#Story-8.7-Cash-Commission-Settlement]
- [Source: docs/sprint-artifacts/epic6/6-5-cash-settlement-tracking.md] (admin side)

---

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story drafted from tech spec and epics | Claude |
