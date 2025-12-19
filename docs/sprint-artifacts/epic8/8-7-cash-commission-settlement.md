# Story 8.7: Cash Commission Settlement

| Field | Value |
|-------|-------|
| **Story ID** | 8-7 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Cash Commission Settlement |
| **Status** | done |
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
| AC8.7.4 | Upon submission: payment record created with status 'pending' | Creates withdrawal_request |
| AC8.7.5 | Admin notified for verification | Via notification system |
| AC8.7.6 | Provider sees "Pago enviado - En verificación" | Status feedback |
| AC8.7.7 | Once verified: commission_paid entry created, pending balance reduced | Admin action completes cycle |

---

## Tasks / Subtasks

- [x] **Task 1: Settlement Page** (AC: 8.7.1, 8.7.2)
  - [x] Create `src/app/provider/earnings/withdraw/page.tsx`
  - [x] Display commission pending amount prominently
  - [x] Show platform bank details from admin_settings
  - [x] Format: Banco, Tipo de Cuenta, Número de Cuenta, Titular, RUT

- [x] **Task 2: Bank Details from Admin Settings** (AC: 8.7.2)
  - [x] Add to admin_settings: platform_bank_name, platform_account_type
  - [x] Add: platform_account_number, platform_account_holder, platform_rut
  - [x] Create server action to fetch bank details (`getPlatformBankDetails`)
  - [x] Format for display with copy buttons

- [x] **Task 3: Receipt Upload Component** (AC: 8.7.3)
  - [x] Create receipt upload form component in `withdraw-client.tsx`
  - [x] Accept image files (JPG, PNG, WebP) and PDF
  - [x] Preview uploaded file
  - [x] Upload to Supabase Storage `commission-receipts` bucket
  - [x] Generate unique path: `{provider_id}/{timestamp}-receipt.{ext}`

- [x] **Task 4: Submit Payment Server Action** (AC: 8.7.4, 8.7.5)
  - [x] Add `submitCommissionPayment(data)` to `src/lib/actions/settlement.ts`
  - [x] Validate amount matches pending commission exactly
  - [x] Upload receipt to Supabase Storage from client
  - [x] Create withdrawal_request with status 'pending'
  - [x] Notify admin for verification via notification system
  - [x] Return success with request ID

- [x] **Task 5: Supabase Storage Bucket** (AC: 8.7.3)
  - [x] Create `commission-receipts` storage bucket
  - [x] Configure RLS: providers can insert/view own, admins can read all
  - [x] Set file size limit (5MB)
  - [x] Configure allowed MIME types (image/jpeg, image/png, image/webp, application/pdf)

- [x] **Task 6: Pending Verification State** (AC: 8.7.6)
  - [x] Show "Pago enviado - En verificación" status
  - [x] Disable new submissions while pending
  - [x] Show submission timestamp
  - [x] `getPendingWithdrawal()` server action to check status

- [x] **Task 7: Admin Verification Flow** (AC: 8.7.5, 8.7.7)
  - [x] Admin panel shows pending settlement verifications (existing from Epic 6)
  - [x] Display: provider, amount, receipt image (ReceiptViewerModal)
  - [x] "Verificar" button: creates commission_paid ledger entry (verifyPayment)
  - [x] "Rechazar" button: returns to provider with note (rejectPayment)
  - [x] Update pending balance after approval

- [x] **Task 8: Testing** (AC: ALL)
  - [x] E2E: Settlement page displays correctly (11 tests)
  - [x] E2E: Navigation from earnings to withdraw
  - [x] E2E: Bank details displayed
  - [x] E2E: Upload area and submit button behavior
  - [x] E2E: Pending verification state handling

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
status = 'pending'
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
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
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

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None required - all tests passing.

### Completion Notes List

1. Created settlement page at `src/app/provider/earnings/withdraw/page.tsx`
2. Added platform bank settings to admin_settings via migration
3. Created commission-receipts storage bucket with RLS policies
4. Implemented receipt upload and submission flow in `withdraw-client.tsx`
5. Added server actions: `getPlatformBankDetails`, `getPendingWithdrawal`, `submitCommissionPayment`
6. Updated `getReceiptUrl` to use correct bucket name
7. 11 E2E tests passing for settlement flow

### File List

**New Files:**
- `src/app/provider/earnings/withdraw/page.tsx` - Settlement page
- `src/app/provider/earnings/withdraw/withdraw-client.tsx` - Client component with upload
- `tests/e2e/provider-commission-settlement.spec.ts` - E2E tests (11 tests)

**Modified Files:**
- `src/lib/actions/settlement.ts` - Added provider settlement actions (`getPlatformBankDetails`, `getPendingWithdrawal`, `submitCommissionPayment`)
- `src/app/provider/earnings/earnings-dashboard-client.tsx` - Added "Pagar" button navigation to withdraw page
- `src/lib/utils/commission.ts` - Used for `formatCLP` utility

**Database Changes (via Supabase Dashboard):**
- `admin_settings` - Added platform bank account settings (5 keys)
- `commission-receipts` storage bucket - Private, 5MB limit, image/PDF types
- Storage RLS policies - Providers upload/view own, admins view all

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story drafted from tech spec and epics | Claude |
| 2025-12-19 | Implementation complete - all tasks done | Claude Opus 4.5 |
| 2025-12-19 | Atlas code review passed - docs fixed, status → done | Claude Opus 4.5 |
