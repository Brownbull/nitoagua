# Story 12-3: Negative Status States

| Field | Value |
|-------|-------|
| **Story ID** | 12-3 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Negative Status States |
| **Status** | done |
| **Priority** | P0 (Critical) |
| **Points** | 5 |
| **Sprint** | Backlog |

## User Story

**As a** consumer,
**I want** to see clear explanations when my request fails or is cancelled,
**So that** I understand what happened and what to do next.

## Problem Statement

Current implementation (verified in Epic 10/11) shows:
- Basic status states: pending, accepted, in_transit, delivered
- Request timeout notification exists (Story 10-4)
- Consumer cancellation works (Epic 11)

However, the UX audit (Issue 5.1 - CRITICAL) identified missing dedicated UI for:
- Clear visual distinction between negative states
- Actionable next steps for each state
- Support contact visibility

## Current Implementation Review

| State | Exists | Has Dedicated UI |
|-------|--------|------------------|
| `pending` | ✅ | ✅ |
| `accepted` | ✅ | ✅ |
| `in_transit` | ✅ | ✅ |
| `delivered` | ✅ | ✅ |
| `timed_out` | ✅ | ⚠️ Basic (Story 10-4) |
| `cancelled` | ✅ | ⚠️ Basic |
| `no_offers` | ⚠️ Alias for timed_out | ❌ |

## Acceptance Criteria

### AC12.3.1: No Offers / Timeout State
- [x] Status displays: "Sin Ofertas" with orange/amber styling
- [x] Message: "No hay aguateros disponibles ahora"
- [x] Show time elapsed since request
- [x] Primary action: "Intentar de nuevo" → Creates new request
- [x] Secondary action: "Contactar Soporte" → WhatsApp/email

### AC12.3.2: Cancelled by User State
- [x] Status displays: "Cancelada" with gray styling
- [x] Message: "Cancelaste esta solicitud"
- [x] Show cancellation timestamp
- [x] Primary action: "Nueva Solicitud" → Request form
- [x] Reason displayed if user provided one

### AC12.3.3: Cancelled by Provider State
- [x] Status displays: "Cancelada por Proveedor" with gray/red styling
- [x] Message: "El proveedor canceló tu solicitud"
- [x] Provider's reason displayed prominently if provided
- [x] Primary action: "Intentar de nuevo" → Creates new request
- [x] Secondary action: "Contactar Soporte" → For disputes

### AC12.3.4: Support Contact Visibility
- [x] Each negative state includes support contact section
- [x] WhatsApp link: `https://wa.me/56XXXXXXXXX`
- [x] Email link: `soporte@nitoagua.cl`
- [x] Styled as secondary/subtle element, not competing with primary action

### AC12.3.5: Visual Consistency
- [x] Use consistent icons for each state (X, clock, alert)
- [x] Color coding matches severity (gray=cancelled, orange=timeout)
- [x] Match existing status tracker component styling

## Database Notes

Existing statuses cover all cases:
- `cancelled` - Used for both user and provider cancellation
- `timed_out` - Used for no-offer scenarios
- `cancelled_by` field distinguishes cancellation source

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/consumer/negative-status-card.tsx` | Dedicated component for negative states |

### Modified Files
| File | Change |
|------|--------|
| `src/app/(consumer)/request/[id]/page.tsx` | Use negative-status-card for applicable states |
| `src/components/consumer/status-tracker.tsx` | Integrate negative state styling |

## UI/UX Reference

- **Mockup**: See `docs/ux-mockups/` Section 15 - Negative States
- **Audit**: Issue 5.1 (CRITICAL) in `docs/ux-audit/consumer-flow-audit.md`

## Technical Notes

- Reuse existing status-badge component with extended variants
- Support contact info should come from admin_settings or environment
- Consider A/B testing primary action text

## Dependencies

- Request status tracking (Epic 2, 10)
- Request cancellation (Epic 4, 11)
- Request timeout (Story 10-4)

## Out of Scope

- Push notifications for negative states (Story 12-6)
- Admin dashboard for failed requests
- Automatic retry scheduling

## Tasks/Subtasks

### Task 1: Extend RequestWithSupplier interface and query
- [x] 1.1: Add `cancelled_by`, `cancellation_reason`, `cancelled_at` to RequestWithSupplier interface
- [x] 1.2: Update Supabase query in page.tsx to fetch cancellation fields
- [x] 1.3: Join with profiles table to get cancelled_by user info (to distinguish consumer vs provider)

### Task 2: Create NegativeStatusCard component
- [x] 2.1: Create `src/components/consumer/negative-status-card.tsx`
- [x] 2.2: Implement no_offers variant (orange/amber styling, clock icon)
- [x] 2.3: Implement cancelled_by_user variant (gray styling, X icon)
- [x] 2.4: Implement cancelled_by_provider variant (gray/red styling, alert icon)
- [x] 2.5: Add time elapsed display using date-fns
- [x] 2.6: Add support contact section with WhatsApp and email links
- [x] 2.7: Add primary action buttons ("Intentar de nuevo" / "Nueva Solicitud")

### Task 3: Integrate NegativeStatusCard into request-status-client
- [x] 3.1: Replace inline cancelled status handling with NegativeStatusCard
- [x] 3.2: Replace inline no_offers status handling with NegativeStatusCard
- [x] 3.3: Detect cancelled_by field to show appropriate variant
- [x] 3.4: Pass cancellation_reason and timestamp to component

### Task 4: Update TimelineTracker for negative states
- [x] 4.1: Update cancelled timeline to show interrupted state visually
- [x] 4.2: Ensure no_offers timeline shows correct incomplete steps

### Task 5: Add E2E tests for negative states
- [x] 5.1: Create `tests/e2e/negative-status-states.spec.ts`
- [x] 5.2: Test no_offers state displays correct UI elements
- [x] 5.3: Test cancelled_by_user state displays correct messaging
- [x] 5.4: Test cancelled_by_provider state displays provider reason
- [x] 5.5: Test support contact links are visible and functional
- [x] 5.6: Test primary action buttons navigate correctly
- [x] 5.7: Add seed data for negative state scenarios

### Task 6: Run validation and verify ACs
- [x] 6.1: Run lint and type checks
- [x] 6.2: Run full E2E test suite
- [x] 6.3: Verify AC12.3.1 (No Offers UI)
- [x] 6.4: Verify AC12.3.2 (Cancelled by User UI)
- [x] 6.5: Verify AC12.3.3 (Cancelled by Provider UI)
- [x] 6.6: Verify AC12.3.4 (Support Contact visibility)
- [x] 6.7: Verify AC12.3.5 (Visual consistency)

## Dev Notes

### Architecture Requirements
- Reuse existing StatusCard component styling patterns
- Use shadcn/ui components for buttons and links
- Support contact info: WhatsApp `wa.me/56XXXXXXXXX`, Email `soporte@nitoagua.cl`
- All user-facing strings in Spanish

### Technical Context
- `cancelled_by` field in water_requests references profiles.id
- If `cancelled_by === consumer_id` → cancelled by user
- If `cancelled_by !== consumer_id && cancelled_by !== null` → cancelled by provider
- Use `cancelled_at` for timestamp display
- Use `created_at` for time elapsed calculation on no_offers

### Testing Patterns (from Atlas)
- Use Playwright for E2E tests
- Follow per-test seeding approach
- Check for error states before content assertions
- Use Spanish text assertions

## Dev Agent Record

### Implementation Plan
1. Extended `RequestWithSupplier` interface with cancellation fields in both page.tsx and request-status-client.tsx
2. Created new `NegativeStatusCard` component with three variants: no_offers, cancelled_by_user, cancelled_by_provider
3. Updated TimelineTracker to handle cancelled and failed step statuses
4. Integrated NegativeStatusCard into both consumer request status page and guest tracking page
5. Added seeded test data for cancelled_by_provider scenario
6. Created comprehensive E2E tests for all negative states

### Debug Log
- Build passes with no TypeScript errors in modified files
- Component reuses existing StatusCard styling patterns
- Spanish text throughout, consistent with design

### Completion Notes
- All three negative states implemented with appropriate styling
- Support contact visible on all negative states (WhatsApp + Email)
- TimelineTracker shows visual indicators for cancelled/failed states
- E2E tests cover all acceptance criteria

## File List
- `src/components/consumer/negative-status-card.tsx` - New component for negative status states
- `src/components/consumer/request-status-client.tsx` - Updated to use NegativeStatusCard
- `src/components/consumer/timeline-tracker.tsx` - Added cancelled/failed step states
- `src/app/(consumer)/request/[id]/page.tsx` - Extended interface and query
- `src/app/track/[token]/page.tsx` - Extended interface, query, and UI
- `tests/e2e/negative-status-states.spec.ts` - New E2E tests
- `tests/fixtures/test-data.ts` - Added cancelled_by_provider test data
- `scripts/local/seed-test-data.ts` - Added cancelled_by_provider seeding

## Definition of Done

- [x] All three negative states have dedicated UI
- [x] Each state shows appropriate message and actions
- [x] Support contact visible on all negative states
- [x] E2E tests for negative state rendering
- [x] Mobile viewport tested
- [x] Code review passed

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-25 | Code review passed - fixed test selectors, aligned cancelled_by logic, added mobile tests | Claude |
| 2025-12-25 | Implementation complete - all ACs met | Claude |
| 2025-12-25 | Added Tasks/Subtasks structure for development | Claude |
| 2025-12-24 | Story drafted for Epic 12 | Claude |
