# Story 12-1: Map Location Pinpoint

| Field | Value |
|-------|-------|
| **Story ID** | 12-1 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Map Location Pinpoint |
| **Status** | done |
| **Priority** | P1 (High) |
| **Points** | 5 |
| **Sprint** | Active |

## User Story

**As a** consumer,
**I want** to confirm my exact location on a map after entering my address,
**So that** the provider can find me accurately for water delivery.

## Problem Statement

Current implementation uses text-only addresses with descriptive landmarks ("Casa azul con portón verde"). While helpful, this is insufficient for accurate delivery in rural Chilean areas where:
- Street numbers may not exist or be accurate
- Multiple buildings share similar descriptions
- GPS coordinates provide much more precise delivery locations

The UX audit (Issue 3.2) identified this as a P1 priority requiring a map pinpoint screen after address entry.

## Acceptance Criteria

### AC12.1.1: Map Display After Address Entry
- [x] After consumer completes Step 1 (contact + address), show map confirmation step
- [x] Map centers on comuna default location OR geocoded address if available
- [x] Address text displayed below map for verification
- [x] Use Leaflet + OpenStreetMap (consistent with provider map, no API key required)

### AC12.1.2: Draggable Pin for Fine-tuning
- [x] Map shows draggable pin marker at initial location
- [x] User can drag pin to adjust exact delivery location
- [x] Coordinates update in real-time as pin is moved
- [x] Visual feedback when pin is being dragged (marker shadow/animation)

### AC12.1.3: Confirmation Actions
- [x] "Confirmar Ubicación" button saves coordinates and continues to amount step
- [x] "Volver" button returns to address entry (Step 1)
- [x] Coordinates (`latitude`, `longitude`) saved with water request

### AC12.1.4: Graceful Degradation
- [x] If map fails to load (network issues, tile error), show warning message
- [x] Allow skip with warning: "No pudimos cargar el mapa. Tu dirección será usada sin coordenadas exactas."
- [x] Log map failures for monitoring via console.error
- [x] "Saltar" (skip) button visible when map fails

### AC12.1.5: Mobile Optimization
- [x] Touch-friendly pin dragging on mobile devices
- [x] Map fits within mobile viewport without horizontal scroll
- [x] Zoom controls accessible and usable (+/- buttons visible)
- [x] Uses `min-h-dvh` for proper mobile viewport handling

## Tasks/Subtasks

### Task 1: Create LocationPinpoint Component
- [x] 1.1 Create `src/components/consumer/location-pinpoint.tsx` with Leaflet map
- [x] 1.2 Implement dynamic import pattern (SSR bypass) per Story 8-10 pattern
- [x] 1.3 Add draggable marker with dragend event handler
- [x] 1.4 Display address text below map
- [x] 1.5 Add "Confirmar Ubicación" and "Volver" buttons
- [x] 1.6 Implement coordinates state management
- [x] 1.7 Add data-testid attributes for E2E testing

### Task 2: Integrate Map Step into Request Wizard
- [x] 2.1 Update request page to add "map" step between step1 and step2
- [x] 2.2 Pass address and comuna from step1 to map step
- [x] 2.3 Pass coordinates from map step to step2/step3
- [x] 2.4 Update step count and progress indicator (now 4 steps)
- [x] 2.5 Update header titles and subtitles for map step

### Task 3: Implement Graceful Degradation
- [x] 3.1 Add error boundary for map loading failures
- [x] 3.2 Show warning message when tiles fail to load
- [x] 3.3 Add "Saltar" (skip) button for map failures
- [x] 3.4 Log errors to console for monitoring

### Task 4: Add Comuna Coordinates for Initial Map Center
- [x] 4.1 Add default coordinates for Villarrica comuna
- [x] 4.2 Use comuna coordinates as fallback when no GPS location

### Task 5: E2E Tests
- [x] 5.1 Create `tests/e2e/consumer-map-pinpoint.spec.ts`
- [x] 5.2 Test map displays after step 1 completion
- [x] 5.3 Test pin dragging updates coordinates
- [x] 5.4 Test confirm button advances to amount step
- [x] 5.5 Test back button returns to step 1
- [x] 5.6 Test graceful fallback when map unavailable

## Database Changes

```sql
-- Columns already exist in water_requests from MVP
-- Verify they're being populated correctly:
-- latitude DECIMAL(10, 8)
-- longitude DECIMAL(11, 8)
```

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/consumer/location-pinpoint.tsx` | Interactive map component with draggable pin |
| `tests/e2e/consumer-map-pinpoint.spec.ts` | E2E tests for map pinpoint flow |

### Modified Files
| File | Change |
|------|--------|
| `src/app/(consumer)/request/page.tsx` | Add map step after address entry |

## Technical Notes

- **Leaflet + OpenStreetMap**: Free, no API key required, consistent with provider map (Story 8-10)
- **Dynamic Import**: Use `next/dynamic` with `ssr: false` to avoid SSR issues
- **Initial Location**: Center on comuna default coordinates (Villarrica: -39.2833, -72.2167)
- **Mobile-first**: Design for touch-first interaction, use min-h-dvh
- **Existing Pattern**: Reuse dynamic import pattern from `src/app/provider/requests/[id]/map/page.tsx`

## Dev Notes

### Architecture Requirements
- Use Leaflet dynamic import pattern from Story 8-10
- Follow mobile viewport patterns from Story 10-7 (min-h-dvh)
- Maintain 3-step wizard UX but internally add map as intermediate step

### Testing Patterns
- Use assertNoErrorState after navigation
- Test mobile viewport with isMobile: true configuration
- Seed data not required - form flow testing only

## UI/UX Reference

- **Mockup**: See `docs/ux-mockups/` Section 14 - Map Location Pinpoint
- **Audit**: Issue 3.2 in `docs/ux-audit/consumer-flow-audit.md`

## Dependencies

- Existing Leaflet + react-leaflet packages (already installed)
- Existing request form flow (Epic 2)

## Out of Scope

- Address autocomplete improvements (separate enhancement)
- Offline map functionality
- Polygon-based service area visualization
- Geocoding API integration (use comuna center as default)

## Definition of Done

- [x] Map displays after address entry in request form
- [x] Pin is draggable and coordinates are captured
- [x] Graceful fallback when map unavailable
- [x] E2E test covering map pinpoint flow
- [ ] Mobile viewport tested on Android PWA (pending manual validation)
- [x] Code review passed (Atlas-enhanced review 2025-12-27)

---

## Dev Agent Record

### Implementation Plan
- Used Leaflet + OpenStreetMap instead of Google Maps (no API key required, free tiles)
- Followed dynamic import pattern from Story 8-10 for SSR bypass
- Added map step between step1 (address) and step2 (amount) in request wizard
- Maintained visual 3-step progress while internally using 4 states

### Debug Log
- Initial E2E tests had 2 failures: wrong testid (`amount-option-1000` → `amount-1000`) and graceful degradation test logic
- Updated existing E2E tests in `consumer-request-form.spec.ts`, `consumer-request-workflow.spec.ts`, `consumer-payment-selection.spec.ts`, and `urgency-pricing.spec.ts` to include `skipMapStep` helper
- All 14 map pinpoint tests pass
- 3 pre-existing test failures in consumer-request-form.spec.ts related to price changes (not from this story)

### Completion Notes
**Implementation Summary:**
- Created `location-pinpoint.tsx` with Leaflet MapContainer, draggable marker, error state handling
- Created `location-pinpoint-wrapper.tsx` with dynamic import to bypass SSR
- Modified request wizard to add map state between step1 and step2
- Default coordinates: Villarrica (-39.2768, -72.2274)
- Full Spanish UI: "Confirmar Ubicación", "Volver", "Saltar", coordinate labels

**Test Results:**
- 14/14 E2E tests pass for map pinpoint flow
- 36/42 consumer-request-form tests pass (3 skipped, 3 pre-existing price failures)
- Build passes with no TypeScript errors
- No new lint issues

---

## File List

### New Files
| File | Purpose |
|------|---------|
| `src/components/consumer/location-pinpoint.tsx` | Interactive map component with draggable pin using Leaflet |
| `src/components/consumer/location-pinpoint-wrapper.tsx` | Dynamic import wrapper for SSR bypass |
| `tests/e2e/consumer-map-pinpoint.spec.ts` | E2E tests for map pinpoint flow (14 tests) |

### Modified Files
| File | Change |
|------|--------|
| `src/app/(consumer)/request/page.tsx` | Added "map" state, map handlers, map step rendering |
| `tests/e2e/consumer-request-form.spec.ts` | Added skipMapStep helper, updated tests for map flow |
| `tests/e2e/consumer-request-workflow.spec.ts` | Added skipMapStep helper, updated tests |
| `tests/e2e/consumer-payment-selection.spec.ts` | Added skipMapStep helper, updated tests |
| `tests/e2e/urgency-pricing.spec.ts` | Added skipMapStep helper, updated tests |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story drafted for Epic 12 | Claude |
| 2025-12-26 | Added Tasks/Subtasks, updated to Leaflet approach, marked ready-for-dev | Claude |
| 2025-12-26 | Implementation complete, marked for review | Claude |
| 2025-12-27 | Atlas-enhanced code review passed, 1 fix: confirm button disabled until map loads | Claude |
