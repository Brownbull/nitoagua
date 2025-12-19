# Story 8.9: Provider Settings Page

| Field | Value |
|-------|-------|
| **Story ID** | 8-9 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Provider Settings Page |
| **Status** | done |
| **Priority** | P2 (Medium) |
| **Points** | 3 |
| **Sprint** | TBD |

---

## User Story

As a **provider**,
I want **a centralized settings page to manage my account preferences**,
So that **I can easily access and update my profile, vehicle, bank details, and service areas**.

---

## Background

The provider bottom navigation includes an "Ajustes" (Settings) tab that needs a dedicated page. This page serves as a hub linking to existing functionality (from Epic 7) and provides quick access to common settings. Most of the actual edit flows already exist from the onboarding process - this story creates the settings landing page that aggregates access to them.

---

## Acceptance Criteria

| AC# | Criterion | Notes |
|-----|-----------|-------|
| AC8.9.1 | Settings page accessible at `/provider/settings` | Bottom nav "Ajustes" links here |
| AC8.9.2 | Profile section shows: name, avatar/initials, verified badge | Display current provider info |
| AC8.9.3 | Settings menu includes: Información Personal, Vehículo, Datos Bancarios, Zonas de Servicio | Links to existing pages |
| AC8.9.4 | Availability toggle present and functional | Quick access to is_available toggle |
| AC8.9.5 | "Cerrar Sesión" (Log Out) button functional | Signs out and redirects to home |
| AC8.9.6 | Each settings item links to appropriate edit page | Reuse onboarding edit flows |

---

## Tasks / Subtasks

- [x] **Task 1: Settings Page Structure** (AC: 8.9.1, 8.9.2)
  - [x] Create `src/app/provider/settings/page.tsx`
  - [x] Fetch current provider profile data
  - [x] Display profile header with name, initials avatar, verified badge
  - [x] Server component with dynamic rendering

- [x] **Task 2: Settings Menu Items** (AC: 8.9.3, 8.9.6)
  - [x] Create settings items list component
  - [x] "Información Personal" → `/provider/settings/personal`
  - [x] "Vehículo" → `/provider/settings/vehicle`
  - [x] "Datos Bancarios" → `/provider/settings/bank`
  - [x] "Zonas de Servicio" → `/provider/settings/areas` (consistent design)
  - [x] Style with icons matching mockup (User, Truck, CreditCard, MapPin)

- [x] **Task 3: Availability Toggle** (AC: 8.9.4)
  - [x] Add availability toggle section (only for approved providers)
  - [x] Reuse existing AvailabilityToggleWrapper from Epic 7
  - [x] Show current status with visual indicator

- [x] **Task 4: Sign Out Functionality** (AC: 8.9.5)
  - [x] Add "Cerrar Sesión" button at bottom (red text, ghost button)
  - [x] Implement sign out via client component (sign-out-button.tsx)
  - [x] Redirect to home page `/` after sign out

- [x] **Task 5: Edit Pages (view-only for MVP)** (AC: 8.9.6)
  - [x] Created read-only detail pages for personal/vehicle/bank info
  - [x] Back navigation returns to settings
  - [x] Contact support note for edits (MVP simplification)

- [x] **Task 6: E2E Tests**
  - [x] Test settings page loads with provider data (13 tests)
  - [x] Test navigation to each settings item
  - [x] Test availability toggle visibility
  - [x] Test sign out flow

- [x] **Task 7: Dev Login Redirect Update**
  - [x] Updated dev-login to redirect suppliers to `/provider/requests` instead of old `/dashboard`

- [x] **Task 8: Design Consistency Fixes** (Post-Review)
  - [x] Created `/provider/settings/areas/page.tsx` with consistent design
  - [x] Updated link from `/dashboard/settings/areas` to `/provider/settings/areas`
  - [x] Updated ServiceAreaSettings component to support `hideBackButton` prop
  - [x] Aligned page header style (h1 with gray-900, white bg)
  - [x] Aligned back button position (top, inline with "Volver" text)
  - [x] Aligned max-width (max-w-lg like other settings pages)
  - [x] Updated E2E tests to reflect new URL paths

---

## Technical Notes

### Page Structure

```
/provider/settings
├── Profile Header (avatar, name, verified badge)
├── Settings Menu
│   ├── Información Personal → /provider/settings/personal
│   ├── Vehículo → /provider/settings/vehicle
│   ├── Datos Bancarios → /provider/settings/bank
│   └── Zonas de Servicio → /provider/settings/areas
├── Availability Toggle
└── Cerrar Sesión Button
```

### Reusable Components

Consider reusing from Epic 7 onboarding:
- Personal info form fields
- Vehicle type selection
- Bank account form
- Service area selector

### Mockup Reference

From `docs/ux-mockups/01-consolidated-provider-flow.html`, Section 6 (Settings):
- Profile card at top with avatar and edit button
- Settings grouped by category (Cuenta, Vehículo, Pagos, Soporte)
- Each item has icon, title, description, and chevron
- Availability toggle with green/gray states
- Log out button at bottom (red text, no background)

---

## Dependencies

- Epic 7 provider profile data
- Epic 7 service area configuration
- Existing auth sign-out functionality

---

## Out of Scope

- Push notification settings (future epic)
- Support/Help section (future epic)
- Account deletion (future epic)

---

## File List

| Action | File |
|--------|------|
| Modified | `src/app/provider/settings/page.tsx` - Updated areas link |
| Created | `src/app/provider/settings/areas/page.tsx` - New consistent areas page |
| Modified | `src/components/provider/service-area-settings.tsx` - Added hideBackButton prop |
| Modified | `tests/e2e/provider-settings.spec.ts` - Updated areas navigation test |
| Modified | `tests/e2e/provider-service-areas.spec.ts` - Updated URLs and back button tests |

---

## Dev Agent Record

### Debug Log

*Task 8 (Design Consistency Fixes):*
- Analyzed existing settings pages for design inconsistencies
- Found `/dashboard/settings/areas` page with blue header (bg-[#0077B6]) vs white header on other settings pages
- Found back button at bottom of page vs top on other settings pages
- Found max-w-4xl layout vs max-w-lg on other settings pages
- Created new `/provider/settings/areas` page with consistent design
- Updated ServiceAreaSettings component with `hideBackButton` prop

### Completion Notes

**Design Consistency Fixes Completed:**
1. Created new `/provider/settings/areas/page.tsx` matching other settings page design:
   - White background with gray-900 text header
   - Back button at top with "Volver" text
   - max-w-lg container width
   - Consistent px-4 py-6 padding
2. Updated settings menu link to use new consistent route
3. Added `hideBackButton` prop to ServiceAreaSettings component to avoid duplicate back buttons
4. Updated E2E tests to reflect new URL paths and back button location

All 13 provider settings E2E tests passing.

### Atlas-Enhanced Code Review (2025-12-19)

**Review Findings:**
- 1 HIGH: Test data mismatch (seed data used Santiago-area comunas instead of Villarrica-area)
- 1 MEDIUM: Unused import (LogOut in page.tsx)
- 1 LOW: Pattern observation noted

**Fixes Applied:**
1. Removed unused `LogOut` import from `src/app/provider/settings/page.tsx`
2. Updated `scripts/local/seed-offer-tests.ts` to use Villarrica-area comunas matching COMUNAS constant
   - Changed comuna_id values: santiago→villarrica, las-condes→pucon, providencia→lican-ray, vitacura→curarrehue
   - Updated PROVIDER_SERVICE_AREA_IDS and TEST_COMUNAS to match
3. Re-seeded test data with `npm run seed:offers`

**Test Results:**
- 34/34 E2E tests passing (13 settings + 21 service areas)
- All Acceptance Criteria verified implemented

**Atlas Validation:**
- Architecture compliance: PASSED (Next.js 15 patterns, Server Actions, Supabase client)
- Pattern compliance: PASSED (Spanish UI, shadcn/ui, mobile-first)
- Workflow chain impact: None (settings page is isolated)

---

## Definition of Done

- [x] Settings page renders at `/provider/settings`
- [x] Profile information displayed correctly
- [x] All menu items navigate to correct pages
- [x] All settings sub-pages have consistent design
- [x] Availability toggle works (for approved providers)
- [x] Sign out redirects to home
- [x] E2E tests pass (34 tests - 13 settings + 21 service areas)
- [x] Code review approved (Atlas-enhanced 2025-12-19)
