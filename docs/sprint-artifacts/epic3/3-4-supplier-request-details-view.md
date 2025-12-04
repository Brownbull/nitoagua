# Story 3.4: Supplier Request Details View

Status: done

## Story

As a **supplier (Don Pedro)**,
I want **to see full details of a water request before accepting**,
So that **I can review all customer information, location, and delivery requirements to make an informed decision**.

## Background

This story extends the supplier dashboard (Story 3-3) with a detailed view of individual requests. When a supplier clicks "Ver Detalles" on a request card, they should see comprehensive information including the full address, special instructions, contact details, and a map preview when coordinates are available.

The details view serves as the decision point before accepting or declining a request. It provides all the information a supplier needs to plan their delivery, including clickable phone numbers for direct calling and map integration for location verification.

## Acceptance Criteria

1. **AC3-4-1**: Details show full: name, phone (clickable tel: link), address, special instructions
2. **AC3-4-2**: Amount badge and urgency indicator clearly displayed (consistent with request cards)
3. **AC3-4-3**: Submission time shown in relative format ("hace X horas") or full date for older requests
4. **AC3-4-4**: Map preview displayed if coordinates (latitude/longitude) are available
5. **AC3-4-5**: Accept/Decline action buttons available for pending requests
6. **AC3-4-6**: For accepted requests, show delivery window (if set) and hide accept/decline buttons
7. **AC3-4-7**: Close/back navigation returns to dashboard preserving current tab

## Tasks / Subtasks

- [x] **Task 1: Request Details Page Structure** (AC: 1, 7)
  - [x] Create `src/app/(supplier)/requests/[id]/page.tsx`
  - [x] Implement authentication check (redirect to /login if not authenticated)
  - [x] Verify supplier role (redirect to / if consumer)
  - [x] Add page metadata (title: "Detalles de Solicitud - nitoagua")
  - [x] Fetch request data by ID using server component
  - [x] Handle 404 case (request not found)
  - [x] Add "Volver" back button to return to dashboard

- [x] **Task 2: Request Details Component** (AC: 1, 2, 3)
  - [x] Create `src/components/supplier/request-details.tsx`
  - [x] Display customer name prominently
  - [x] Display phone with `tel:` link (clickable to call)
  - [x] Display full address (not truncated like in cards)
  - [x] Display special instructions in full
  - [x] Display amount with appropriate badge (reuse color coding from request-card)
  - [x] Display urgency indicator (red badge if urgent)
  - [x] Display relative time ("hace X horas") using date-fns
  - [x] For requests > 24 hours old, show full date

- [x] **Task 3: Map Preview Component** (AC: 4)
  - [x] Create `src/components/supplier/location-map.tsx`
  - [x] Check if request has latitude and longitude
  - [x] If coordinates exist: display Google Maps static image or embed
  - [x] If no coordinates: show "Ubicación no disponible" message with address only
  - [x] Use environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - [x] Handle API key missing gracefully (show placeholder)
  - [x] Add "Abrir en Google Maps" link for full navigation

- [x] **Task 4: Action Buttons** (AC: 5, 6)
  - [x] For status='pending': Show "Aceptar" and "Rechazar" buttons
  - [x] "Aceptar" button triggers accept flow (Story 3-5 will implement modal)
  - [x] "Rechazar" button triggers decline with optional reason (stub for now)
  - [x] For status='accepted': Hide action buttons, show delivery window if set
  - [x] For status='delivered': Show completion timestamp, hide actions
  - [x] Use consistent button styling from design system

- [x] **Task 5: Data Fetching and Error Handling** (AC: 1)
  - [x] Query `water_requests` by ID using server Supabase client
  - [x] Verify supplier has access (RLS should handle, add explicit check)
  - [x] Handle loading state with skeleton
  - [x] Handle error state with user-friendly message
  - [x] Handle not found state with "Solicitud no encontrada" message

- [x] **Task 6: E2E Tests** (AC: all)
  - [x] Create `tests/e2e/supplier-request-details.spec.ts`
  - [x] Test: Details page loads with all customer information
  - [x] Test: Phone number is clickable (href="tel:...")
  - [x] Test: Map preview shown when coordinates exist
  - [x] Test: "Ubicación no disponible" when no coordinates
  - [x] Test: Action buttons visible for pending requests
  - [x] Test: Action buttons hidden for accepted/delivered requests
  - [x] Test: Back button returns to dashboard
  - [x] Test: 404 handling for invalid request ID
  - [x] Test: Authentication required (redirect to login)

## Dev Notes

### Learnings from Previous Story

**From Story 3-3-supplier-request-dashboard (Status: review)**

- **Components to reuse**: Import from `src/components/supplier/index.ts`:
  - Amount badge styling and color logic from `request-card.tsx`
  - Urgency indicator styling (red left border pattern)
  - Time formatting with date-fns and Spanish locale
- **Data fetching pattern**: Use server-side data fetching (Server Components)
- **Dashboard tabs with URL params**: Tab state preserved in `?tab=` query param - back button should preserve this
- **Skeleton component**: `src/components/ui/skeleton.tsx` available for loading states
- **Test patterns**: Mock auth state injection established in `supplier-dashboard.spec.ts`

**New Files Created in 3-3:**
- `src/components/supplier/stats-header.tsx`
- `src/components/supplier/request-card.tsx` - **Reuse badge/urgency styling**
- `src/components/supplier/request-list.tsx`
- `src/components/supplier/dashboard-tabs.tsx`
- `src/components/supplier/empty-state.tsx`
- `src/components/supplier/index.ts` - Barrel export file
- `src/components/ui/skeleton.tsx`
- `tests/e2e/supplier-dashboard.spec.ts`

[Source: docs/sprint-artifacts/epic3/3-3-supplier-request-dashboard.md#Dev Agent Record]

### Architecture Context

**Route Structure (from Architecture)**:
```
src/app/(supplier)/
   layout.tsx              # Supplier layout with auth guard
   dashboard/page.tsx      # Story 3-3 - main dashboard
   requests/[id]/page.tsx  # This story - request details
   profile/page.tsx        # Story 3-7 - profile management
```

**Component Structure**:
```
src/components/supplier/
   request-details.tsx     # This story - full request view
   location-map.tsx        # This story - map preview
   request-card.tsx        # Story 3-3 - reuse styles
   delivery-modal.tsx      # Story 3-5 - accept flow
```

### Phone Link Pattern

```typescript
// Clickable phone number
<a href={`tel:${request.guest_phone}`} className="text-primary hover:underline">
  {request.guest_phone}
</a>
```

### Map Integration Options

**Option 1: Google Maps Static Image (Recommended for MVP)**
```typescript
const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
```

**Option 2: Google Maps Embed (Interactive)**
```typescript
const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;
```

**Open in Google Maps link:**
```typescript
const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
```

### Time Formatting

```typescript
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

function formatRequestTime(createdAt: string): string {
  const date = new Date(createdAt);
  const oneDayAgo = subDays(new Date(), 1);

  if (isAfter(date, oneDayAgo)) {
    // Recent: "hace 2 horas"
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } else {
    // Older: "2 de diciembre, 2025"
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  }
}
```

### Amount Badge Colors (from request-card.tsx)

| Amount | Color | Class |
|--------|-------|-------|
| 100L | Gray | `bg-gray-100 text-gray-800` |
| 1000L | Blue | `bg-blue-100 text-blue-800` |
| 5000L | Green | `bg-green-100 text-green-800` |
| 10000L | Purple | `bg-purple-100 text-purple-800` |

### References

- [Source: docs/sprint-artifacts/epic3/tech-spec-epic-3.md#Story 3-4: Supplier Request Details View]
- [Source: docs/architecture.md#Project Structure] - Route and component organization
- [Source: docs/architecture.md#Database Query Pattern] - Supabase query patterns
- [Source: docs/epics.md#Story 3.4] - Original story definition
- [Source: docs/prd.md#FR25] - Supplier can see request details
- [Source: docs/prd.md#FR28] - View customer location on map

## Prerequisites

- Story 3-3 (Supplier Request Dashboard) - review ✓
- Dashboard with "Ver Detalles" button linking to this page
- water_requests table populated (from Epic 2 consumer flow)

## Definition of Done

- [x] All acceptance criteria met
- [x] Details page shows all customer information correctly
- [x] Phone numbers are clickable (tel: links)
- [x] Map preview works when coordinates exist
- [x] Graceful fallback when no coordinates
- [x] Action buttons display correctly based on request status
- [x] Back navigation preserves dashboard tab state
- [x] E2E tests passing (21 tests)
- [x] No regression in existing E2E tests (166 passing)
- [x] Story status updated to `review`

---

## Dev Agent Record

### Context Reference

- [3-4-supplier-request-details-view.context.xml](./3-4-supplier-request-details-view.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Implementation followed context file patterns for reusing request-card.tsx badge colors
- Used Server Components for data fetching as per architecture guidelines
- Back navigation preserves tab state via `?from=` query param passed through RequestCard → RequestList → DashboardTabs

### Completion Notes List

- Created request details page with all customer info, phone links, address, instructions
- Implemented amount badges and urgency indicators consistent with dashboard cards
- Time formatting shows "hace X horas" for recent, full Spanish date for older requests
- Map preview component uses Google Static Maps API when coordinates available
- Graceful fallback to "Ubicación no disponible" when no GPS coordinates
- Action buttons (Accept/Decline) visible only for pending requests - stubs for Story 3-5
- Delivery window and delivered timestamp displayed for accepted/delivered requests
- Back button preserves tab context from dashboard
- 21 E2E tests added covering all acceptance criteria
- Full regression suite passes (166 tests)

### File List

**New Files:**
- `src/app/(supplier)/requests/[id]/page.tsx` - Request details page
- `src/app/(supplier)/requests/[id]/not-found.tsx` - 404 page for invalid requests
- `src/components/supplier/request-details.tsx` - Main details component with customer info
- `src/components/supplier/location-map.tsx` - Map preview component
- `src/components/supplier/request-actions.tsx` - Accept/Decline action buttons
- `tests/e2e/supplier-request-details.spec.ts` - E2E tests (21 tests)

**Modified Files:**
- `src/components/supplier/index.ts` - Added barrel exports for new components
- `src/components/supplier/request-card.tsx` - Added `currentTab` prop for back navigation
- `src/components/supplier/request-list.tsx` - Pass `currentTab` to RequestCard
- `src/components/supplier/dashboard-tabs.tsx` - Pass `currentTab` to RequestList

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Story drafted via create-story workflow |
| 2025-12-03 | Dev Agent (Claude Opus 4.5) | Implementation complete - all ACs met, 21 E2E tests |
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Senior Developer Review: APPROVED |

---

## Senior Developer Review (AI)

### Reviewer
Gabe

### Date
2025-12-03

### Outcome
**APPROVE** ✅

All acceptance criteria fully implemented with evidence. All tasks verified complete. No blocking issues found.

### Summary
Story 3-4 delivers a complete supplier request details view with all required functionality. The implementation follows established architecture patterns, reuses components appropriately from Story 3-3, and includes comprehensive E2E test coverage.

### Key Findings

**No HIGH severity issues.**

**No MEDIUM severity issues.**

**LOW severity observations:**
- Note: Action buttons use `alert()` as stubs for Story 3-5 - this is expected per task definition

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC3-4-1 | Full details: name, phone (tel: link), address, instructions | ✅ IMPLEMENTED | `request-details.tsx:81-166` |
| AC3-4-2 | Amount badge and urgency indicator | ✅ IMPLEMENTED | `request-details.tsx:18-31, 87-95` |
| AC3-4-3 | Submission time (relative or full date) | ✅ IMPLEMENTED | `request-details.tsx:40-51` |
| AC3-4-4 | Map preview when coordinates available | ✅ IMPLEMENTED | `location-map.tsx:36-61` |
| AC3-4-5 | Accept/Decline buttons for pending | ✅ IMPLEMENTED | `request-actions.tsx:17-76` |
| AC3-4-6 | Delivery window for accepted, hide buttons | ✅ IMPLEMENTED | `request-details.tsx:185-198` |
| AC3-4-7 | Back navigation preserves tab | ✅ IMPLEMENTED | `page.tsx:54`, `request-card.tsx:132` |

**Summary: 7 of 7 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked | Verified | Evidence |
|------|--------|----------|----------|
| Task 1: Page Structure | ✅ | ✅ VERIFIED | `page.tsx` - auth, metadata, fetch, 404, back button |
| Task 2: Details Component | ✅ | ✅ VERIFIED | `request-details.tsx` - all fields with formatting |
| Task 3: Map Preview | ✅ | ✅ VERIFIED | `location-map.tsx` - static map, fallback, Maps link |
| Task 4: Action Buttons | ✅ | ✅ VERIFIED | `request-actions.tsx` - pending only, stubs |
| Task 5: Data Fetching | ✅ | ✅ VERIFIED | Server component, error states, skeleton |
| Task 6: E2E Tests | ✅ | ✅ VERIFIED | 21 tests, 63/63 pass (3 browsers) |

**Summary: 6 of 6 completed tasks verified, 0 falsely marked complete**

### Test Coverage and Gaps

- **21 E2E tests** covering all acceptance criteria
- **63/63 tests pass** across Chromium, Firefox, and WebKit
- Tests cover: auth redirect, 404 handling, phone links, badges, time formatting, map preview, action buttons, back navigation, responsive design
- No significant test gaps identified

### Architectural Alignment

- ✅ Follows route structure: `src/app/(supplier)/requests/[id]/page.tsx`
- ✅ Uses Server Components for data fetching
- ✅ Reuses badge colors and patterns from `request-card.tsx`
- ✅ Proper barrel exports in `index.ts`
- ✅ Tab preservation via URL query params

### Security Notes

- ✅ Auth handled by supplier layout (inherited)
- ✅ UUID validation before DB query (`page.tsx:42-45`)
- ✅ RLS policies protect request access
- ✅ No sensitive data exposure
- ✅ External links use `rel="noopener noreferrer"`

### Best-Practices and References

- [Next.js App Router Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Google Maps Static API](https://developers.google.com/maps/documentation/maps-static)
- [date-fns Spanish Locale](https://date-fns.org/docs/I18n)

### Action Items

**Code Changes Required:**
- None

**Advisory Notes:**
- Note: Story 3-5 will replace alert() stubs with actual accept/decline modal functionality
