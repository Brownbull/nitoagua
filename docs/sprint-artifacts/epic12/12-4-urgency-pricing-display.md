# Story 12-4: Urgency Pricing Display

| Field | Value |
|-------|-------|
| **Story ID** | 12-4 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Urgency Pricing Display |
| **Status** | done |
| **Priority** | P1 (High) |
| **Points** | 3 |
| **Sprint** | Current |

## User Story

**As a** consumer,
**I want** to see the urgency pricing impact clearly when selecting urgent delivery,
**So that** I can make an informed decision about whether to pay extra for faster service.

## Problem Statement

Current implementation (verified in Epic 6, Story 6-9):
- Urgency toggle exists in request form
- `urgency_surcharge_percent` is configurable via admin settings (default 10%)
- Request submission captures `is_urgent` flag

However, the UX audit (Issue 3.3) identified:
- Urgency toggle doesn't show pricing impact
- Consumer unaware of additional cost until review screen (or never)
- No visual breakdown of base vs. surcharge pricing

## Acceptance Criteria

### AC12.4.1: Urgency Toggle with Price Impact
- [x] Normal option: "Normal" (no additional label)
- [x] Urgent option: "Urgente (+X%)" where X is from admin settings
- [x] Example: "Urgente (+10%)"
- [x] Visual indicator (⚡ or similar) for urgency

### AC12.4.2: Dynamic Surcharge Display
- [x] Fetch `urgency_surcharge_percent` from admin_settings
- [x] Display current surcharge percentage in UI
- [x] Handle missing/null setting gracefully (default to 10%)

### AC12.4.3: Review Screen Price Breakdown
- [x] Show itemized pricing when urgent:
  - Base price: $XX.XXX
  - Recargo urgente (X%): $X.XXX
  - **Total: $XX.XXX**
- [x] When not urgent, show simple total only
- [x] Price formatting in Chilean pesos (no decimals, thousand separators)

### AC12.4.4: Offer Display Impact
- [x] Provider offers show urgency surcharge calculation
- [x] Consumer sees offer price breakdown if urgent
- [x] Urgency badge visible on urgent requests

### AC12.4.5: Existing Behavior Preservation
- [x] Urgency still affects request timeout (faster expiration for urgent)
- [x] Providers still see urgency indicator in request browser
- [x] No changes to business logic, only display improvements

## Tasks/Subtasks

### Task 1: Create server action to fetch urgency surcharge percentage
- [x] 1.1 Add `getUrgencySurchargePercent()` action in `/lib/actions/admin.ts`
- [x] 1.2 Handle missing/null setting gracefully (default to 10%)
- [x] 1.3 Use createAdminClient to bypass RLS for public access

### Task 2: Update RequestStep3Amount component with dynamic surcharge
- [x] 2.1 Create client-side hook or fetch surcharge on component mount
- [x] 2.2 Update urgency toggle button text from hardcoded "Urgente (+10%)" to dynamic "Urgente (+X%)"
- [x] 2.3 Update info hint text to use dynamic percentage
- [x] 2.4 Update price summary calculation to use dynamic surcharge

### Task 3: Update RequestReview component with price breakdown
- [x] 3.1 Pass surcharge percentage to review component
- [x] 3.2 Show itemized breakdown for urgent requests (base + surcharge = total)
- [x] 3.3 Show simple total for non-urgent requests
- [x] 3.4 Use formatCLP() for consistent price formatting

### Task 4: Update consumer offer display for urgent requests
- [x] 4.1 Pass is_urgent flag to OfferCard component
- [x] 4.2 Show urgency badge on offer cards if request is urgent
- [x] 4.3 Optionally show price breakdown in offer selection

### Task 5: Add E2E tests for urgency pricing display
- [x] 5.1 Test urgency toggle shows correct percentage from admin settings
- [x] 5.2 Test review screen shows itemized breakdown for urgent requests
- [x] 5.3 Test review screen shows simple total for normal requests
- [x] 5.4 Test offer cards display urgency indicator
- [x] 5.5 AC12.4.4 E2E tests for offer card urgency badge (3 tests added)

### Task 6: Validation and verification
- [x] 6.1 Run existing E2E tests to ensure no regressions
- [x] 6.2 Verify all ACs are satisfied
- [x] 6.3 Test with different urgency_surcharge_percent values

## Dev Notes

### Architecture Reference
- Use `getDeliveryPrice()` from `src/lib/utils/commission.ts` for base pricing (single source of truth)
- Use `createAdminClient()` to bypass RLS for fetching public admin settings
- Follow pattern from Story 12-2 for passing configuration to client components

### Implementation Pattern
```typescript
// Fetch urgency surcharge (can be called without auth)
export async function getUrgencySurchargePercent(): Promise<number> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("admin_settings")
    .select("value")
    .eq("key", "urgency_surcharge_percent")
    .single();
  return data?.value?.value ?? 10;
}
```

### Price Breakdown UI Example (Urgent)
```
Precio estimado:
  Base:               $20.000
  Recargo urgente (10%):  $2.000
  ─────────────────────────
  Total:              $22.000
```

### Testing Patterns
- Use Playwright E2E tests
- Test with seeded admin_settings values
- Verify Spanish language throughout

## Definition of Done

- [x] Urgency toggle shows percentage surcharge from admin settings
- [x] Review screen shows itemized breakdown when urgent
- [x] Price formatting consistent with Chilean standards
- [x] E2E test for urgency pricing display (20 tests)
- [x] Code review passed (Atlas-enhanced review 2025-12-26)

## Dev Agent Record

### Implementation Plan
1. Create action to fetch urgency surcharge percentage
2. Update RequestStep3Amount with dynamic percentage display
3. Update RequestReview with itemized pricing breakdown
4. Update offer cards with urgency indicator
5. Add E2E tests
6. Run validation suite

### Debug Log
- Starting implementation: 2025-12-26
- Implementation complete: 2025-12-26

### Completion Notes
Implementation completed with all ACs satisfied:
- Added `getUrgencySurchargePercent()` server action to fetch dynamic surcharge from admin_settings
- Updated RequestStep3Amount to display dynamic percentage in urgency toggle and price summary
- Updated RequestReview to show itemized price breakdown (base + surcharge + total) for urgent requests
- Updated OfferCard to show urgency badge when request is urgent
- Created 20 E2E tests covering all acceptance criteria (17 for AC12.4.1-12.4.3 + 3 for AC12.4.4)
- All tests passing (20/20 urgency-pricing tests)

**Code Review Fixes (2025-12-26):**
- Updated File List with Notes column for clarity
- Added 3 E2E tests for AC12.4.4 (offer card urgency badge display)
- Tests handle expired offers gracefully (badge only shows on active offers)

## File List

| Action | File | Notes |
|--------|------|-------|
| Modify | src/lib/actions/admin.ts | Added getUrgencySurchargePercent() |
| Modify | src/components/consumer/request-step3-amount.tsx | Dynamic surcharge display |
| Modify | src/components/consumer/request-review.tsx | Itemized price breakdown |
| Modify | src/components/consumer/offer-card.tsx | Urgency badge on offers |
| Modify | src/components/consumer/offer-list.tsx | Pass isUrgent prop |
| Modify | src/app/(consumer)/request/page.tsx | Fetch surcharge, pass to components |
| Modify | src/app/(consumer)/request/[id]/offers/page.tsx | Pass is_urgent to OffersClient |
| Modify | src/app/(consumer)/request/[id]/offers/offers-client.tsx | Pass isUrgent to OfferList |
| Create | tests/e2e/urgency-pricing.spec.ts | 20 E2E tests for AC12.4.1-12.4.4 |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story drafted for Epic 12 | Claude |
| 2025-12-26 | Tasks/subtasks added, implementation started | Claude |
| 2025-12-26 | Implementation complete, all ACs satisfied, 17 E2E tests passing | Claude |
| 2025-12-26 | Code review: Added 3 AC12.4.4 tests, updated File List | Claude |
