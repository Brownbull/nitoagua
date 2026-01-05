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
| BUG-R2-010 | Admin Providers page - filter layout inefficient, missing email on cards | Medium | 5.1 | Open |
| BUG-R2-011 | Admin Providers - missing ratings on cards and no rating history in detail | Medium | 5.1 | Open |
| BUG-R2-012 | Admin orders - "Total" filter card should be replaced with "Disputas" | Medium | 3.1 | **Fixed** |
| BUG-R2-013 | Admin not notified when consumer creates a dispute | Medium | 6.14 | **Fixed** |
| BUG-R2-014 | Provider dispute resolution display - no warning when resolved against them | Medium | 6.14 | **Fixed** |
| BUG-R2-015 | Consumer dispute resolution display - no apologetic message or retry link | Medium | 6.14 | **Fixed** |
| BUG-R2-016 | Toast notifications - inconsistent font and missing icons | Low | 9 | Open |
| BUG-R2-017 | Push notifications sent to wrong user on shared devices | Critical | 10 | Open |
| BUG-R2-018 | Provider "Mis Ofertas" shows completed deliveries instead of hiding them | Medium | 10 | Open |

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

### BUG-R2-010: Admin Providers page - filter layout inefficient, missing email on cards

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Admin panel) |
| **Test Step** | 5.1 |
| **URL/Route** | /admin/providers |

**Description:**

Two issues with the admin Providers listing page:

**Issue 1: Filter layout inefficient**
- Status filter and Area/Comuna filter should be in the same row
- Search bar should be on a separate row below
- Current layout wastes vertical space

**Issue 2: Provider cards missing email**
- Cards show name and phone number
- Email is NOT displayed but should be
- Email is important for admin to contact providers

**Current Layout:**
```
[Status Filter ▼]
[Area Filter ▼]
[🔍 Search...]
```

**Proposed Layout:**
```
Row 1: [Status ▼] [Area ▼]
Row 2: [🔍 Buscar proveedores...]
```

**Provider Card - Current:**
```
[Avatar] Provider Name
         📞 +56912345678
         [Status Badge]
```

**Provider Card - Proposed:**
```
[Avatar] Provider Name
         📞 +56912345678
         ✉️ provider@email.com
         [Status Badge]
```

**Steps to Reproduce:**

1. Log in as Admin
2. Navigate to Providers section
3. Observe filter layout (vertical, takes space)
4. Observe provider cards (missing email)

**Proposed Fix:**

1. Put status and area filters in a flex row with `gap-2`
2. Keep search bar full-width on its own row below
3. Add email field to provider card component
4. Use email icon (✉️ or Mail icon from lucide)

---

### BUG-R2-011: Admin Providers - missing ratings on cards and no rating history in detail

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Admin panel) |
| **Test Step** | 5.1 |
| **URL/Route** | /admin/providers, /admin/providers/[id] |

**Description:**

Provider ratings are not visible in the admin panel - neither on the provider list cards nor in the provider detail view.

**Issue 1: Provider cards missing rating**
- No rating displayed on provider cards in the list
- Should show average rating + count in top-right corner

**Issue 2: Provider detail missing rating history**
- When viewing a provider's details, there's no rating section
- Should show list of all ratings with: date, consumer name, star rating, comment

**Provider Card - Proposed:**
```
[Avatar] Provider Name                    ⭐ 4.5 (12)
         📞 +56912345678
         ✉️ provider@email.com
         [Status Badge]
```

**Provider Detail - Proposed Rating Section:**
```
## Calificaciones (12 total) - Promedio: ⭐ 4.5

| Fecha      | Cliente        | Rating | Comentario          |
|------------|----------------|--------|---------------------|
| 2026-01-04 | Consumer Test  | ⭐⭐⭐⭐⭐ | Excelente servicio  |
| 2026-01-03 | Juan Pérez     | ⭐⭐⭐⭐   | Llegó a tiempo      |
| ...        | ...            | ...    | ...                 |
```

**Steps to Reproduce:**

1. Log in as Admin
2. Navigate to Providers section
3. Observe provider cards - no rating visible
4. Click on a provider to see details
5. Observe - no rating history section

**Data Available:**

- `profiles.average_rating` - provider's average rating
- `profiles.rating_count` - number of ratings
- `ratings` table - individual ratings with consumer_id, score, comment, created_at

**Proposed Fix:**

1. **Provider cards**: Add rating badge in top-right showing `⭐ {average_rating} ({rating_count})`
2. **Provider detail**: Add "Calificaciones" section with:
   - Summary: average rating, total count
   - Table/list of individual ratings
   - Each rating shows: date, consumer name, stars, comment (if any)
3. Sort ratings by date descending (newest first)

**Related:** This addresses FR-R2-001 (Provider ratings dashboard) - implementing this bug fix would satisfy that feature request.

---

### BUG-R2-012: Admin orders - "Total" filter card should be replaced with "Disputas"

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Admin panel) |
| **Test Step** | 3.1 |
| **URL/Route** | /admin/orders |

**Description:**

The admin orders page has 6 stats cards: Pending, Accepted, In Transit, Delivered, Cancelled, Total. The "Total" card is redundant because:
1. Total is already shown in the header ("X pedidos totales")
2. Clicking "Total" has the same effect as having no filter selected

A more useful card would be "Disputas" showing orders that have associated disputes, allowing admins to quickly filter to orders with problems.

**Steps to Reproduce:**

1. Log in as Admin
2. Navigate to Orders section
3. Observe the 6 status filter cards
4. Note: "Total" card doesn't provide unique value

**Expected Behavior:**

- Replace "Total" card with "Disputas" (orange color)
- Clicking "Disputas" filters to orders with associated disputes
- Total count visible in header is sufficient

**Resolution:**

Fixed in `src/components/admin/orders-table.tsx`:
1. Replaced "Total" StatsCard with "Disputas" using orange color
2. Added `disputes` count to `OrderStats` type
3. Added `has_dispute` filter that queries dispute request IDs
4. Toggle behavior: clicking an active filter deselects it (shows all)

---

### BUG-R2-013: Admin not notified when consumer creates a dispute

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All |
| **Test Step** | 6.14 |
| **URL/Route** | Dispute creation flow |

**Description:**

When a consumer creates a dispute for a delivered order, admin users should receive an in-app notification to alert them that a dispute needs review. Currently, no notification is sent.

**Steps to Reproduce:**

1. Complete a delivery as Provider
2. As Consumer, file a dispute on the delivered order
3. As Admin, check notifications
4. Observe: No notification about the new dispute

**Expected Behavior:**

- Admin receives notification: "Nueva Disputa Reportada"
- Notification includes dispute type and order ID
- Admin can click to navigate to dispute review

**Actual Behavior:**

- No notification sent to admin
- Admin only discovers disputes by manually checking the orders/disputes section

**Resolution:**

Fixed in `src/lib/actions/disputes.ts`:
1. Added `notifyAdminsOfNewDispute()` helper function
2. Queries `admin_allowed_emails` table to find admin users
3. Creates notification for each admin with type `dispute_created`
4. Notification message: "Disputa '{type}' para pedido #{id}. Requiere revisión."
5. Called after successful dispute creation in `createDispute()`

---

### BUG-R2-014: Provider dispute resolution display - no warning when resolved against them

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Provider view) |
| **Test Step** | 6.14 |
| **URL/Route** | /provider/deliveries/[id] |

**Description:**

When a dispute is resolved against the provider (`resolved_consumer`), the provider sees a generic "Disputa resuelta" message without any indication that it was resolved against them or any warning about consequences.

**Steps to Reproduce:**

1. Have a delivered order with a dispute
2. As Admin, resolve the dispute in favor of the consumer
3. As Provider, view the delivery detail
4. Observe: Generic "resolved" message, no warning

**Expected Behavior:**

- Show clear indication if resolved against provider (red styling)
- Display warning message about account consequences
- Show resolution notes if provided by admin

**Actual Behavior:**

- Generic green "resolved" styling regardless of outcome
- No differentiation between resolved_consumer vs resolved_provider
- No warning about potential account suspension

**Resolution:**

Fixed in `src/app/provider/deliveries/[id]/delivery-detail-client.tsx`:
1. Different styling for `resolved_provider` (green) vs `resolved_consumer` (red)
2. Added warning box when resolved against provider:
   - "⚠️ Advertencia: Esta disputa fue resuelta en tu contra."
   - "Las disputas repetidas pueden resultar en suspensión o desactivación de tu cuenta."
3. Shows resolution notes if available

---

### BUG-R2-015: Consumer dispute resolution display - no apologetic message or retry link

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Consumer view) |
| **Test Step** | 6.14 |
| **URL/Route** | /request/[id] |

**Description:**

When a dispute is resolved in favor of the consumer (`resolved_consumer`), the consumer sees a basic "Resuelta (a tu favor)" message. There's no apologetic tone or encouragement to try the service again with a link to create a new request.

**Steps to Reproduce:**

1. Have a delivered order with a dispute
2. As Admin, resolve the dispute in favor of the consumer
3. As Consumer, view the request detail
4. Observe: Generic "resolved" message, no apology or retry option

**Expected Behavior:**

- Apologetic message acknowledging the inconvenience
- Encouragement to try the service again
- Prominent "Intentar de Nuevo" button linking to /request

**Actual Behavior:**

- Generic "Resuelta (a tu favor)" status only
- No empathetic messaging
- No call-to-action to retry

**Resolution:**

Fixed in `src/components/consumer/request-status-client.tsx`:

For `resolved_consumer`:
1. Green styling with apologetic message:
   - "Lamentamos mucho los inconvenientes que esto te ha causado."
   - "Tu experiencia es muy importante para nosotros..."
2. Shows resolution notes if provided (in italics)
3. "Intentar de Nuevo" button linking to `/request`

For `resolved_provider`:
1. Gray styling with explanatory message
2. Informs consumer they can contact support if they believe there was an error
3. Shows resolution notes if provided

---

### BUG-R2-016: Toast notifications - inconsistent font and missing icons

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | All |
| **Test Step** | 9 (Toast Styling) |
| **URL/Route** | App-wide |

**Description:**

Toast notifications (via Sonner) have visual polish issues:
1. Font used in toasts doesn't match the app's primary font (Inter)
2. Toast messages lack icons to visually indicate success/error/warning states

**Steps to Reproduce:**

1. Trigger any toast notification (e.g., submit a request, accept an offer)
2. Observe the toast styling
3. Compare font to rest of app UI
4. Note: no icons present in toast messages

**Expected Behavior:**

- Toast font should match app font (Inter or system font stack)
- Success toasts should have a checkmark icon ✓
- Error toasts should have an X or warning icon
- Info toasts should have an info icon ℹ

**Actual Behavior:**

- Toast font appears different from app font
- No icons in toast messages - just text

**Proposed Fix:**

1. Configure Sonner Toaster with app font family in `globals.css` or theme config
2. Add `icon` prop to toast calls or configure default icons in Toaster component:
   ```tsx
   <Toaster
     toastOptions={{
       style: { fontFamily: 'Inter, system-ui, sans-serif' },
     }}
   />
   ```
3. Update toast calls to include icons:
   ```tsx
   toast.success("¡Listo!", { icon: <CheckCircle className="h-4 w-4" /> })
   toast.error("Error", { icon: <XCircle className="h-4 w-4" /> })
   ```

**Note:** This is a visual polish issue - core toast functionality works correctly.

---

### BUG-R2-017: Push notifications sent to wrong user on shared devices

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P0 |
| **Device** | All (cross-device/multi-user issue) |
| **Test Step** | 10 (Multi-Consumer Competition) |
| **URL/Route** | Push notification system |

**Description:**

Push notifications are being sent to the wrong user when multiple users log in on different devices. The notification system sends notifications based on device endpoint rather than following the currently authenticated user.

**Steps to Reproduce:**

1. **Consumer A** (test@nitoagua.cl) logs in on **Laptop**
2. **Consumer B** (trombone.forest@gmail.com) logs in on **Cell Phone**
3. Both consumers create water requests at approximately the same time
4. **Provider** views available requests in their panel (sees both requests)
5. **Provider** creates an offer for **Consumer A's request** (the test consumer)
6. **BUG:** Notification appears on **Cell Phone** (Consumer B) instead of **Laptop** (Consumer A)
7. Consumer B clicks the notification → "No tienes permiso" error (unauthorized)
8. Consumer A must manually refresh the app to see the offer

**Expected Behavior:**

- Notification for Consumer A's request should appear on Laptop (where Consumer A is logged in)
- Consumer A should receive the notification, not Consumer B
- Notification should follow the USER, not the DEVICE

**Actual Behavior:**

- Notification appears on Cell Phone (Consumer B's device)
- Consumer B sees notification for Consumer A's request
- Consumer B cannot access the linked page (authorization error)
- Consumer A never receives the notification

**Root Cause Analysis:**

Investigation revealed multiple issues in the push notification system:

**Issue 1: Missing Logout Cleanup**

When a user logs out, the push subscription is NOT cleaned up:
- `signOut()` is called but `unsubscribeFromPush()` is NOT called
- Database record linking user to endpoint remains
- Browser service worker subscription remains active
- Next user who logs in inherits the old user's endpoint

**Affected Files:**
- `src/app/provider/settings/sign-out-button.tsx` - Missing unsubscribe
- `src/app/consumer-profile/page.tsx` - Missing unsubscribe
- `src/components/admin/admin-logout-button.tsx` - Missing unsubscribe

**Issue 2: Database Constraint Too Loose**

The `push_subscriptions` table has:
```sql
UNIQUE(user_id, endpoint)
```

This allows the SAME endpoint to be registered for MULTIPLE users:
- User A → Endpoint E1
- User B → Endpoint E1 (also allowed!)

Should be:
```sql
UNIQUE(endpoint)  -- Global uniqueness per device
```

**Issue 3: No Endpoint Deduplication on Subscribe**

When a user subscribes with an endpoint that already exists for another user, the system should:
1. Check if endpoint exists for DIFFERENT user
2. Delete old user's subscription
3. Create new subscription

Currently it just upserts without deduplication.

**Data Flow (Bug Scenario):**

```
1. Consumer A logs in on Laptop
   → Service worker gets endpoint E1
   → DB: (Consumer_A, E1)

2. Consumer A logs out
   → signOut() called
   → DB still has: (Consumer_A, E1) ← BUG!
   → Browser still subscribed to E1

3. Consumer B logs in on Laptop (or different device with cached SW)
   → Service worker returns endpoint E1 (device-specific)
   → upsert creates: (Consumer_B, E1)
   → DB now has BOTH: (Consumer_A, E1) AND (Consumer_B, E1)

4. Provider creates offer for Consumer A's request
   → Query: SELECT * FROM push_subscriptions WHERE user_id = Consumer_A
   → Returns: endpoint E1
   → Push sent to E1

5. E1 was registered with Consumer B's browser session!
   → Notification appears on Consumer B's device
   → Consumer B sees notification meant for Consumer A
```

**Security Impact:**

- **Privacy breach:** Users can see notifications about OTHER users' orders
- **Authorization bypass:** Notification links go to pages the wrong user cannot access
- **Multi-tenant isolation failure:** Cross-user data leakage

**Proposed Fix (Three-Part):**

**Part 1: Add Logout Cleanup (Immediate)**
```typescript
// In all logout handlers:
async function handleLogout() {
  // 1. Unsubscribe from browser push manager
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();

  // 2. Delete from database
  await unsubscribeFromPush();

  // 3. Then sign out
  await supabase.auth.signOut();
}
```

**Part 2: Endpoint Deduplication on Subscribe**
```typescript
// In subscribeToPush():
// Before upserting, delete any existing subscriptions with same endpoint
await supabase
  .from("push_subscriptions")
  .delete()
  .eq("endpoint", subscription.endpoint)
  .neq("user_id", user.id);  // Only delete OTHER users' records

// Then upsert for current user
```

**Part 3: Database Migration (Optional)**
```sql
-- Make endpoint globally unique
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_endpoint_key;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);
```

**Files to Modify:**

| File | Change Required |
|------|-----------------|
| `src/app/provider/settings/sign-out-button.tsx` | Add `unsubscribeFromPush()` call |
| `src/app/consumer-profile/page.tsx` | Add `unsubscribeFromPush()` call |
| `src/components/admin/admin-logout-button.tsx` | Add `unsubscribeFromPush()` call |
| `src/lib/actions/push-subscription.ts` | Add endpoint deduplication in `subscribeToPush()` |
| (Optional) `supabase/migrations/` | Add global endpoint uniqueness |

**Testing After Fix:**

1. User A logs in on Device X, enables push
2. User A logs out (verify subscription deleted)
3. User B logs in on Device X, enables push
4. User A creates request on different device
5. Provider creates offer
6. Verify: Notification goes to User A's device, NOT Device X

**Additional Confirmed Scenarios:**

The same bug affects ALL notification types, not just "New Offer" notifications:

1. **"Oferta recibida"** - Consumer receives offer notification → Wrong user gets it
2. **"En Camino"** - Provider starts delivery → Consumer notification goes to wrong device
3. **"Entregado"** - Delivery completed → Consumer notification goes to wrong device

All three notification types were observed going to Consumer B's phone instead of Consumer A's laptop during testing.

**Related Bugs:**

This is an expansion of BUG-R2-003 (Push notifications bound to device instead of user account) with:
- Clearer reproduction steps
- Root cause analysis
- Specific code locations identified
- Proposed fix with code examples

---

### BUG-R2-018: Provider "Mis Ofertas" shows completed deliveries instead of hiding them

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | All (Provider view) |
| **Test Step** | 10 (Multi-Consumer Competition) |
| **URL/Route** | /provider/offers |

**Description:**

After completing a delivery, the offer continues to appear in the Provider's "Mis Ofertas" (My Offers) list as an active delivery with "Aceptada" status. Completed deliveries should be hidden from this view or moved to a "Historial" (History) section.

**Steps to Reproduce:**

1. Log in as Provider
2. Accept a consumer's request (offer becomes "Aceptada")
3. Complete the delivery flow: Start delivery → Mark as delivered
4. Navigate to "Mis Ofertas" page
5. Observe: The completed delivery still appears with status "Aceptada"

**Expected Behavior:**

- Completed deliveries (status = "delivered") should NOT appear in active offers list
- Either hide them completely, or move to a separate "Completadas" or "Historial" tab
- Active offers list should only show: pending offers, accepted (awaiting start), and in_transit

**Actual Behavior:**

- Completed delivery still visible in "Mis Ofertas"
- Shows "Aceptada" status badge even though delivery is complete
- Provider sees both active AND completed deliveries mixed together
- Screenshot shows Estado "1" filter with 2 offers, both showing "Aceptada" despite one being delivered

**Screenshot:** Provider "Mis Ofertas" page showing Estado filter "1" with both completed and active offers displaying as "Aceptada"

**Root Cause (suspected):**

The offers query likely joins with `offers` table status instead of `water_requests.status`:
- `offers.status = 'accepted'` (never changes after acceptance)
- `water_requests.status = 'delivered'` (updated when delivery completes)

The UI is showing `offers.status` when it should show `water_requests.status` for the delivery state.

**Proposed Fix:**

1. Update the offers query to JOIN with water_requests and get the actual delivery status:
   ```sql
   SELECT o.*, wr.status as delivery_status
   FROM offers o
   JOIN water_requests wr ON wr.id = o.request_id
   WHERE o.supplier_id = $1
     AND o.status = 'accepted'
     AND wr.status NOT IN ('delivered', 'cancelled')
   ORDER BY wr.created_at DESC
   ```

2. Or filter on the client side to exclude delivered requests:
   ```typescript
   const activeOffers = offers.filter(
     o => o.request?.status !== 'delivered' && o.request?.status !== 'cancelled'
   );
   ```

3. Optionally add tabs: "Activas" | "Completadas" to let provider see history

**Files to Investigate:**

- `src/app/provider/offers/page.tsx` - Offers listing page
- `src/lib/actions/offers.ts` - Offers query logic
- `src/components/provider/offer-card.tsx` - Offer card status display

**Related Issues:**

This is partially related to BUG-R2-009 which noted "wrong status displayed on offer cards" - both issues stem from using `offers.status` instead of `water_requests.status`.

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

### FR-R2-003: Provider offer - Allow price adjustment within admin-defined limits

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Category** | Provider UX / Business Logic |
| **URL/Route** | /provider/requests/[id] |

**Description:**

When creating an offer, providers currently see a fixed price (calculated automatically). Providers should be able to adjust the price within limits set by admin - making offers cheaper (competitive) or slightly higher (premium service).

**Current Flow:**
```
Tu ganancia
$5.225
Precio: $5.500 • Comisión: $275
```
- Price is fixed/calculated
- Provider cannot adjust

**Proposed Flow:**
```
Tu ganancia
[$5.225] [- $100] [+ $100]
Precio: $5.500 • Comisión: $275

Rango permitido: $4.500 - $6.500
```

**Key Requirements:**

1. **Admin sets price limits** (in admin panel):
   - Base price per liter/amount
   - Minimum price (floor)
   - Maximum price (ceiling)
   - Or percentage range (e.g., ±20% from base)

2. **Provider adjusts price** (in offer screen):
   - Quick +/- buttons for fast adjustment
   - Or slider within allowed range
   - Show min/max limits clearly
   - Auto-recalculate commission and earnings

3. **Business rules:**
   - Commission calculated on final price
   - Can't go below minimum (protects platform revenue)
   - Can't go above maximum (protects consumers)

**UI Considerations:**

- Keep it simple for drivers (quick tap buttons)
- Show clear feedback: "Precio más bajo = más competitivo"
- Recalculate earnings in real-time as price changes

**Admin Panel Needs:**

- New section: "Configuración de Precios"
- Set base price per liter
- Set min/max limits or percentage range
- Possibly per-comuna pricing

**Value:**

- Providers can compete on price
- Urgent deliveries can command premium
- Off-peak times can have discounts
- More dynamic marketplace

---

*Document created: 2026-01-04*
*Last updated: 2026-01-04 - Added BUG-R2-018 (Mis Ofertas shows completed deliveries); Updated BUG-R2-017 with confirmed scenarios for En Camino and Delivered notifications*
