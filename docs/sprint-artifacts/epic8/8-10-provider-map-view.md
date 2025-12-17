# Story 8.10: Provider Map View

| Field | Value |
|-------|-------|
| **Story ID** | 8-10 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Provider Map View |
| **Status** | drafted |
| **Priority** | P3 (Low) |
| **Points** | 5 |
| **Sprint** | TBD |

---

## User Story

As a **provider**,
I want **to see available water requests on a map**,
So that **I can visualize request locations and plan efficient delivery routes**.

---

## Background

The provider bottom navigation includes a prominent "Ver mapa" FAB (floating action button) that opens a map view. This provides a visual alternative to the list-based request browser, helping providers understand geographic distribution of requests and plan their routes efficiently.

This is a **nice-to-have** feature that enhances the provider experience but is not critical for MVP functionality. The list view (Story 8-1) already provides full request browsing capability.

---

## Acceptance Criteria

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC8.10.1 | Map page accessible at `/provider/map` | FAB button in nav links here |
| AC8.10.2 | Map displays provider's service area(s) | Based on `provider_service_areas` |
| AC8.10.3 | Pending requests shown as map markers | Only requests in provider's comunas |
| AC8.10.4 | Marker tap shows request preview card | Amount, address, time ago |
| AC8.10.5 | Preview card "Ver Detalles" links to request detail | Navigate to `/provider/requests/[id]` |
| AC8.10.6 | Provider's current location shown (if permitted) | Browser geolocation API |
| AC8.10.7 | Map centers on service area by default | Fallback to Villarrica region |

---

## Tasks / Subtasks

- [ ] **Task 1: Map Page Setup** (AC: 8.10.1)
  - [ ] Create `src/app/provider/map/page.tsx`
  - [ ] Choose map library (Leaflet, Mapbox, or Google Maps)
  - [ ] Set up map container with full-height layout
  - [ ] Add loading state

- [ ] **Task 2: Service Area Display** (AC: 8.10.2, 8.10.7)
  - [ ] Fetch provider's service areas
  - [ ] Get comuna boundaries/center points
  - [ ] Center map on service area
  - [ ] Optionally show service area boundaries

- [ ] **Task 3: Request Markers** (AC: 8.10.3)
  - [ ] Fetch available requests (reuse from Story 8-1)
  - [ ] Filter requests with coordinates
  - [ ] Display markers for each request
  - [ ] Style markers (color by urgency, size by amount)

- [ ] **Task 4: Request Preview Card** (AC: 8.10.4, 8.10.5)
  - [ ] Create bottom sheet / card component
  - [ ] Show on marker tap
  - [ ] Display: amount, address, time since created
  - [ ] "Ver Detalles" button links to detail page
  - [ ] Close button / tap outside to dismiss

- [ ] **Task 5: Provider Location** (AC: 8.10.6)
  - [ ] Request browser geolocation permission
  - [ ] Show provider marker (different style)
  - [ ] Handle permission denied gracefully
  - [ ] Update location periodically (optional)

- [ ] **Task 6: E2E Tests**
  - [ ] Test map page loads
  - [ ] Test markers appear for requests
  - [ ] Test marker tap shows preview
  - [ ] Test navigation to request detail

---

## Technical Notes

### Map Library Options

1. **Leaflet + OpenStreetMap** (Recommended)
   - Free, no API key required
   - Good for MVP
   - `react-leaflet` package

2. **Google Maps**
   - Better UX but requires API key and billing
   - Consider for post-MVP

3. **Mapbox**
   - Good middle ground
   - Free tier available

### Request Coordinates

Note: Many requests may not have coordinates (geolocation is optional in the request form). The map will only show requests that have valid `latitude` and `longitude` values.

### Mockup Reference

From `docs/ux-mockups/01-consolidated-provider-flow.html`, Section 7 (Mapa):
- Full-screen map with gradient header overlay
- Request markers with amount indicators
- Selected request shows bottom card preview
- Card includes: pedido number, address, comuna, amount badge, "Ver Solicitud" button
- Provider location shown with blue marker

### Fallback Behavior

If no requests have coordinates:
- Show empty map centered on service area
- Display message: "No hay solicitudes con ubicación disponible"
- Suggest using list view

---

## Dependencies

- Story 8-1: Provider Request Browser (for request fetching logic)
- Provider service areas from Epic 7
- Browser Geolocation API (optional)

---

## Out of Scope

- Turn-by-turn navigation (use external maps app)
- Route optimization
- Real-time location tracking
- Offline map tiles

---

## Definition of Done

- [ ] Map page renders at `/provider/map`
- [ ] Service area centered correctly
- [ ] Request markers displayed
- [ ] Marker tap shows preview card
- [ ] Preview links to request detail
- [ ] Works without geolocation permission
- [ ] E2E tests pass
- [ ] Code review approved

---

## Notes

This story is marked as **P3 (Low priority)** because:
1. The list view already provides full functionality
2. Many requests may not have coordinates
3. Map implementation adds complexity and potential library dependencies

Consider deferring to a future sprint if timeline is tight.
