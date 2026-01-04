# Live Multi-Device Testing - Round 2 Bug Report

**Date:** 2026-01-04
**Tester:** Manual
**Version:** 2.7.0
**URL:** https://nitoagua.vercel.app
**Test Plan:** [live-multi-device-test-plan-round2.md](../plans/live-multi-device-test-plan-round2.md)

---

## Bug Summary

| ID | Title | Severity | Test | Status |
|----|-------|----------|------|--------|
| BUG-R2-001 | Provider delivery screen - action buttons hidden below fold | Medium | 2.7 | **Fixed** |
| BUG-R2-002 | "Iniciar Entrega" fails - missing in_transit status in DB | Critical | 2.7 | **Fixed** |
| BUG-R2-003 | Push notifications bound to device instead of user account | High | 2.7 | Open |
| BUG-R2-004 | Admin can access consumer view via notification click - role isolation broken | Critical | 2.7 | Open |
| BUG-R2-005 | Push notification status bar icon shows grey circle instead of app icon | Low | - | Open |
| BUG-R2-006 | Rating popup may have inconsistent font styling | Low | 2.8 | Open (to verify) |
| BUG-R2-007 | Admin orders page mobile UX - cluttered layout, filter text cut off | High | 3.1 | Open |
| BUG-R2-008 | Admin order detail - status badge clutters header, needs separate row | Medium | 3.1 | Open |
| BUG-R2-009 | Provider "Mis Ofertas" - wrong default filter and incorrect status display | Medium | - | Open |

---

## Session Log

| Time | Test | Step | Result | Notes |
|------|------|------|--------|-------|
| - | Test 1 | 1.1 | PASS | Consumer login works |
| - | Test 1 | 1.2 | PASS | "Pedir Agua" opens request form |
| - | Test 1 | 1.3 | PASS | Location pinpoint screen appears |
| - | Test 1 | 1.4 | PASS | Map tiles render correctly (BUG-001 fix verified) |
| - | Test 1 | 1.5 | PASS | Can drag/tap to set location |
| - | Test 1 | 1.6 | PASS | All steps completed |
| - | Test 1 | 1.7 | PASS | Full-screen overlay appears (BUG-019 fix verified) |
| - | Test 1 | 1.8 | PASS | No flash to Step 1, smooth transition |
| - | **CHECKPOINT 1** | - | **PASS** | Map works, request submits cleanly |

---

## Detailed Bug Reports

### BUG-R2-001: Provider delivery screen - action buttons hidden below fold

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Mobile (Provider view) |
| **Test Step** | 2.7 |
| **URL/Route** | Provider delivery detail screen |

**Description:**

On the provider's active delivery screen, the critical action buttons ("En Camino" / "Marcar como Entregado") are hidden below the fold and require scrolling to access. There's a large empty space between the "Instrucciones especiales" card and the action buttons that could be used to make these buttons visible without scrolling.

For drivers who need to quickly glance at their screen, the most important action should be immediately visible.

**Steps to Reproduce:**

1. Log in as Provider (supplier@nitoagua.cl)
2. Have an active delivery assigned
3. Open the delivery detail screen
4. Observe the layout - action buttons are not visible without scrolling

**Expected Behavior:**

- "En Camino" button should be prominently visible without scrolling
- Either in the top section or immediately after the delivery info cards
- The large empty space should be removed or the buttons should be moved up
- Driver should see the action button within 2 seconds of opening the screen

**Actual Behavior:**

- Large empty space between "Instrucciones especiales" and the action buttons
- Must scroll down to see "Entregar antes de X" and action buttons
- Not driver-friendly - requires extra interaction to access primary action

**Screenshot:** Provided - shows empty space between instructions card and bottom nav

**Proposed Fix:**

Move the delivery deadline and action buttons directly below the instruction card, eliminating the empty space. Consider:
1. Sticky action button at bottom (above nav)
2. Or move buttons immediately after the info cards

**Resolution:**

Fixed by excluding delivery detail page from provider layout's header/nav/padding. The page now uses its own full-screen layout with fixed footer containing the action buttons. See `src/app/provider/layout.tsx`.

---

### BUG-R2-002: "Iniciar Entrega" fails - missing in_transit status in DB

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P0 (Blocker) |
| **Device** | All |
| **Test Step** | 2.7 |
| **URL/Route** | /provider/deliveries/[id] |

**Description:**

Clicking "Iniciar Entrega" (En Camino button) throws "Error al actualizar estado". The database check constraint on `water_requests.status` only allows `['pending', 'accepted', 'delivered', 'cancelled', 'no_offers']` but the En Camino feature (Story 12.7-11) tries to set status to `in_transit`.

**Steps to Reproduce:**

1. Log in as Provider (supplier@nitoagua.cl)
2. Have an active delivery with status "accepted"
3. Click "Iniciar Entrega" button
4. Error toast appears: "Error al actualizar estado"

**Expected Behavior:**

- Status updates to "in_transit"
- Toast shows "¡Estás en camino!"
- Button changes to "Marcar como Entregado"

**Actual Behavior:**

- PostgreSQL error: `new row for relation "water_requests" violates check constraint "water_requests_status_check"`
- Toast shows: "Error al actualizar estado"

**Root Cause:**

Database migration was missing when En Camino feature was implemented. The check constraint needed to include `in_transit`.

**Resolution:**

Applied migration `add_in_transit_status_to_water_requests` to add `in_transit` to the allowed status values:

```sql
ALTER TABLE water_requests DROP CONSTRAINT IF EXISTS water_requests_status_check;
ALTER TABLE water_requests ADD CONSTRAINT water_requests_status_check
  CHECK (status = ANY (ARRAY['pending', 'accepted', 'in_transit', 'delivered', 'cancelled', 'no_offers']));
```

---

### BUG-R2-003: Push notifications bound to device instead of user account

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | All (cross-device issue) |
| **Test Step** | 2.7 |
| **URL/Route** | Push notification system |

**Description:**

Push notifications are being sent to the device/browser that was previously logged in as a user, rather than following the currently authenticated user. When switching accounts on a device, notifications continue going to the old account's previous device instead of the current device where the user is logged in.

**Steps to Reproduce:**

1. On Laptop: Log in as Consumer (consumer@nitoagua.cl)
2. On Phone: Log in as Admin (admin@nitoagua.cl)
3. Switch accounts:
   - On Laptop: Log out Consumer, log in as Admin
   - On Phone: Log out Admin, log in as Consumer
4. On another computer: Log in as Supplier and mark a delivery as "En Camino"
5. Observe where the notification is received

**Expected Behavior:**

- Consumer notification should appear on the Phone (where Consumer is currently logged in)
- The notification should follow the user account, not the device

**Actual Behavior:**

- Consumer notification appears on the Laptop (where Consumer was PREVIOUSLY logged in)
- Phone (currently logged in as Consumer) does NOT receive the notification
- Notifications are "sticky" to the device, ignoring account switches

**Root Cause (suspected):**

The push notification subscription (FCM token or similar) is likely stored when the user first grants notification permission, but is not updated or re-associated when:
1. User logs out
2. Different user logs in on the same device

The token-to-user mapping in the database probably retains the old association.

**Proposed Fix:**

1. On logout: Disassociate the push token from the user (or delete it)
2. On login: Re-register the push token for the newly logged-in user
3. Consider having multiple tokens per user (for multi-device support)
4. Ensure RLS policies on push tokens table properly filter by authenticated user

**Impact:**

- Users may miss important delivery status updates
- Privacy concern: notifications could be seen by wrong person on shared devices
- Confusing UX when switching between test accounts

---

### BUG-R2-004: Admin can access consumer view via notification click - role isolation broken

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P0 |
| **Device** | All |
| **Test Step** | 2.7 |
| **URL/Route** | /settings (consumer profile) |

**Description:**

When logged in as Admin and clicking a notification (that was intended for a different user due to BUG-R2-003), the admin is taken to the consumer view. After viewing the error message about not being able to display the information, navigating to the profile shows the consumer profile UI with admin account details (admin@nitoagua.cl, "Admin Test").

This is a critical role isolation failure - admin accounts should NEVER be able to access consumer-only views.

**Steps to Reproduce:**

1. Have BUG-R2-003 condition: notification token still bound to previous consumer session
2. Log in as Admin (admin@nitoagua.cl) on the same device
3. Receive and click a consumer notification (e.g., "En Camino" status update)
4. See error message about unable to display information
5. Navigate to Profile/Settings
6. Observe: Consumer profile UI is displayed with Admin account details

**Expected Behavior:**

- Admin clicking consumer notification should either:
  - Stay on admin panel with "unauthorized" message
  - Or redirect to admin dashboard
- Admin should NEVER see consumer UI
- Role-based routing should enforce strict separation

**Actual Behavior:**

- Admin is taken to consumer view (/settings)
- Consumer profile form displays with admin credentials
- Role isolation is completely bypassed
- Screenshot shows: Consumer "Mi Perfil" page with admin@nitoagua.cl and "Admin Test"

**Screenshot:** Provided - shows consumer profile page displaying admin account info

**Root Cause (suspected):**

1. Notification click handler doesn't verify user role before navigation
2. Consumer routes (/settings, etc.) don't have middleware checking for consumer role
3. The app may be checking only "is authenticated" but not "has correct role for this route"

**Proposed Fix:**

1. Add role verification middleware to all consumer routes
2. Add role verification middleware to all provider routes
3. Notification click handler should verify role matches expected recipient
4. If role mismatch, redirect to appropriate dashboard for actual role
5. Consider route groups: `/consumer/*`, `/provider/*`, `/admin/*` with role guards

**Security Impact:**

- Role isolation is fundamental to multi-tenant security
- Admin could potentially see consumer data they shouldn't access
- Could lead to data leakage or privilege escalation scenarios

---

### BUG-R2-005: Push notification status bar icon shows grey circle instead of app icon

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | Android Phone |
| **Test Step** | - |
| **URL/Route** | N/A (system notification) |

**Description:**

When a push notification arrives on Android, the small icon displayed in the status bar (top bar) appears as a grey/white circle instead of the NitoAgua app icon. The expanded notification in the notification shade shows correctly, but the mini status bar icon is generic.

**Steps to Reproduce:**

1. Have push notifications enabled on Android device
2. Receive any push notification from NitoAgua
3. Look at the status bar (top of screen) - see grey circle icon
4. Pull down notification shade - notification content displays correctly

**Expected Behavior:**

- Status bar should show NitoAgua droplet icon (or a recognizable monochrome version)
- Icon should be identifiable as coming from NitoAgua app

**Actual Behavior:**

- Grey/white circle appears in status bar
- User cannot identify which app sent the notification without pulling down

**Screenshot:** Notification shade shows correct content, but status bar icon is grey circle

**Root Cause (likely):**

Android requires a specific monochrome/transparent icon for the status bar notification. The PWA/Firebase configuration may be:
1. Missing the `badge` icon in web manifest
2. Missing proper notification icon in Firebase messaging config
3. Using a full-color icon where Android expects monochrome

**Proposed Fix:**

1. Add a monochrome notification icon (white on transparent) to `/public/icons/`
2. Update `manifest.json` to include notification badge icon
3. Update Firebase messaging config to specify the small icon
4. Icon should be simple shape (droplet silhouette) that renders well at small sizes

**Note:** This is cosmetic but affects brand recognition in notifications.

---

### BUG-R2-006: Rating popup may have inconsistent font styling

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | Android Phone (Consumer) |
| **Test Step** | 2.8 |
| **URL/Route** | Rating popup after delivery completion |

**Description:**

The rating popup that appears for consumers after delivery completion may have inconsistent font styling compared to the rest of the app. The exact inconsistency needs verification - it was noticed but not fully captured.

**Steps to Reproduce:**

1. Complete a delivery as Provider
2. As Consumer, view the delivered request
3. Rating popup appears
4. Compare font styling to rest of app

**Expected Behavior:**

- All text in popup should use app's standard font (Inter or system font)
- Font weights and sizes should match design system

**Actual Behavior:**

- Font in rating popup may appear different from rest of app
- Needs closer inspection to confirm

**Status:** To verify - needs screenshot comparison

**Note:** Minor visual polish issue. Core rating functionality works correctly.

---

### BUG-R2-007: Admin orders page mobile UX - cluttered layout, filter text cut off

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Mobile (Admin panel) |
| **Test Step** | 3.1 |
| **URL/Route** | /admin/orders |

**Description:**

The admin orders page is too cluttered on mobile devices. Multiple issues:
1. Filter dropdown options extend beyond screen width, text gets cut off (e.g., "Cancelados" filter)
2. Too many elements compete for limited mobile screen space
3. Status filter boxes, search, sort controls, and live indicator all visible at once

**Issues Identified:**

1. **Filter text overflow** - Dropdown options go beyond screen edge, text truncated
2. **Cluttered header area** - Live indicator + refresh button take up prime real estate
3. **Six status boxes always visible** - Takes significant vertical space
4. **Filter controls not optimized** - Search, sort, and filter spread across multiple rows inefficiently

**Proposed Mobile Layout Redesign:**

**Header Row (compact):**
```
[Pedidos]  [2 Pedidos Totales 📋]  |  [🟢 Live]
                                   |  [🔄 0:45]
```
- Left: Title + count with icon
- Right: Live indicator (row 1) + Refresh timer (row 2)

**Status Filter Boxes:**
- Add toggle button to show/hide the 6 status filter boxes
- Default: collapsed on mobile, expanded on desktop
- When collapsed, show only currently selected filter as a chip

**Filter Controls Row 1:**
```
[Status Filter ▼] [📅 ↑↓]
```
- Dropdown for status filter (replaces 6 boxes when collapsed)
- Date sort toggle (calendar icon + arrow direction)

**Filter Controls Row 2:**
```
[🔍 Buscar pedidos...                    ]
```
- Full-width search bar

**Then:** Order cards list

**Current vs Proposed:**

| Current | Proposed |
|---------|----------|
| Live + Refresh spread out | Compact in header right side |
| 6 status boxes always shown | Collapsible, toggle button |
| Multiple filter rows | 2 organized rows |
| Filter text overflows | Proper responsive dropdowns |

**Screenshot:** Filter dropdown showing text cut off on mobile

---

### BUG-R2-008: Admin order detail - status badge clutters header, needs separate row

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Mobile (Admin panel) |
| **Test Step** | 3.1 |
| **URL/Route** | /admin/orders/[id] |

**Description:**

When viewing an individual order's details in the admin panel, the header section is cluttered. The delivery status badge (e.g., "Entregado", "En Camino") competes for space with other header elements, making it hard to scan quickly.

**Current Layout:**
```
[Back] [Order #123] [Entregado Badge] [...]
```
- Status badge cramped in header row
- Too much information on one line

**Proposed Layout:**
```
Row 1: [Back] [Order #123]
Row 2: [🟢 Entregado] [timestamp or other meta]
```
- Status badge gets its own row or prominent position
- Easier to scan delivery state at a glance
- Less visual clutter in header

**Additional Notes:**

- Page requires significant scrolling on mobile
- Consider collapsible sections for less critical info
- Primary info (status, customer, amount) should be visible without scrolling

---

### BUG-R2-009: Provider "Mis Ofertas" - wrong default filter and incorrect status display

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Provider view) |
| **Test Step** | - |
| **URL/Route** | /provider/offers |

**Description:**

Two issues with the Provider's "Mis Ofertas" (My Offers) page:

**Issue 1: Default filter hides offers**
- Page loads with a status filter active by default
- Screenshot shows "Estado 1" filter applied, resulting in "Sin resultados"
- Should default to showing ALL offers regardless of status

**Issue 2: Wrong status displayed on offer cards**
- Completed/delivered offers show as "Aceptada" (accepted) instead of actual status
- Should show the correct delivery status: "En Camino", "Entregada", etc.
- Missing dispute indicator if the delivery has an open dispute

**Steps to Reproduce:**

1. Log in as Provider (supplier@nitoagua.cl)
2. Navigate to "Mis Ofertas"
3. Observe: Filter is pre-selected, may show "Sin resultados"
4. Clear filters to see all offers
5. Observe: Delivered offers show "Aceptada" instead of "Entregada"

**Expected Behavior:**

1. **Default view**: Show ALL offers (no filter pre-selected)
2. **Status display**: Show actual delivery status on each card
   - "Pendiente" - offer sent, awaiting consumer response
   - "Aceptada" - consumer accepted, not yet started
   - "En Camino" - delivery in progress
   - "Entregada" - delivery completed
   - "Rechazada" - offer rejected
3. **Dispute indicator**: Show warning icon/badge if delivery has open dispute

**Actual Behavior:**

1. Filter pre-applied, hiding some/all offers
2. All accepted offers show "Aceptada" regardless of actual delivery status
3. No dispute indicator visible

**Screenshot:** Provider offers page showing "Estado 1" filter active with no results

**Proposed Fix:**

1. Remove default filter - show all offers on page load
2. Update offer card to read `water_requests.status` instead of `offers.status`
3. Add dispute badge/icon to cards where `disputes` exists with status != 'resolved'

---

## Feature Requests / Enhancements

These are not bugs but improvements identified during testing.

### FR-R2-001: Admin panel - Provider ratings dashboard

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Category** | Admin Panel Enhancement |
| **Test Step** | Post-delivery review |

**Description:**

After a consumer rates a provider, there's no visibility into provider ratings from the admin panel. Admins should be able to see:

1. **Provider Rankings** - List of providers sorted by average rating
2. **Rating Statistics** - Average rating, total ratings count per provider
3. **Recent Ratings** - List of recent ratings with comments
4. **Rating Trends** - Performance over time (optional)

**Current State:**

- Consumer can rate provider ✅
- Rating is stored in database ✅
- Provider sees their own rating (to verify)
- Admin has NO visibility into ratings ❌

**Proposed Location:**

- New tab/section in Admin panel: "Calificaciones" or "Rankings"
- Or add ratings column to existing Providers list
- Or dedicated "Provider Performance" dashboard

**Value:**

- Admin can identify top-performing providers
- Admin can identify providers with issues (low ratings)
- Useful for quality control and provider management
- Could inform commission rates or featured provider status

---

### FR-R2-002: Provider offer screen - Quick "+1 hour" delivery time button

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Category** | Provider UX Enhancement |
| **URL/Route** | /provider/requests/[id] |

**Description:**

When a provider is creating an offer, they select delivery time using the "Hora de entrega" dropdown. For quick/immediate deliveries, it would be helpful to have a shortcut button that sets the delivery window to "1 hour from now."

**Current Flow:**
1. Select "Hoy" / "Mañana" / "Otro"
2. Open time dropdown
3. Scroll to find desired time
4. Select time

**Proposed Enhancement:**

Add a quick-action button next to the time selector:

```
Hora de entrega
[14:00 ▼] [+1h ⚡]
```

**Button behavior:**
- Click "+1h" → Sets delivery window to current time + 1 hour
- Example: If it's 14:30, clicking "+1h" sets window to 15:30-17:30
- Auto-selects "Hoy" if within today, "Mañana" if past midnight

**Value:**

- Faster offer creation for drivers ready to deliver immediately
- Reduces friction for quick/urgent deliveries
- Common use case: "I can be there in about an hour"

**Screenshot:** Current offer creation screen showing time selector

---

*Document created: 2026-01-04*
*Last updated: 2026-01-04*
