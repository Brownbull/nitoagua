# Live Multi-Device Testing - Bug Report

**Date:** 2025-12-30
**Tester:** Atlas Agent
**Version:** 2.4.0
**URL:** https://nitoagua.vercel.app
**Test Plan:** [live-multi-device-test-plan.md](./live-multi-device-test-plan.md)

---

## Bug Summary

| ID | Title | Severity | Test Step | Status |
|----|-------|----------|-----------|--------|
| BUG-001 | Map tiles not rendering on location pinpoint screen (mobile) | Critical | 1.3 | Open |
| BUG-002 | Admin orders page doesn't show new requests without hard refresh | Medium | 1.14-1.15 | Open |
| BUG-003 | Provider request detail screen - UX overload, needs redesign for drivers | Medium | 2.1 | Open |
| BUG-004 | Offer success toast - no icon, poor contrast, unreadable secondary text | Low | 2.6 | Open |
| BUG-005 | Consumer not receiving push notification when provider submits offer | High | 2.9-2.10 | Open |
| BUG-006 | Admin orders - no sorting by date, hard to find new requests | Medium | 2.12-2.13 | Open |
| BUG-007 | Admin orders - clicking request sometimes doesn't open details (intermittent) | High | 2.12-2.13 | Open |
| BUG-008 | Provider not receiving push notification when offer is accepted | High | 3.5-3.7 | Open |
| BUG-009 | Provider missing "En Camino" (on the way) status button | Medium | 4.1 | Open |
| BUG-010 | Provider delivery details screen not driver-friendly, requires scrolling | Medium | 4.1 | Open |
| BUG-011 | Admin panel shows incorrect delivery status - out of sync with Provider | Critical | 3.8-3.11 | Open |
| BUG-012 | Commission payment - no option to attach transfer screenshot as proof | Medium | 4.6 | Open |
| BUG-013 | Consumer not receiving push notification when delivery completed | High | 4.7-4.9 | Open |
| BUG-014 | No rating/review option for provider after delivery | Medium | 4.9 | Open |
| BUG-015 | Consumer cannot dispute delivery - no "Not Delivered" option | High | 4.7-4.9 | Open |
| BUG-016 | Admin needs dispute resolution tools | High | 4.7-4.9 | Open |
| BUG-017 | Admin finances - no "Jump to Today" button, yearly view missing pending payments | Medium | 4.10-4.13 | Open |
| BUG-018 | Push notification icon shows blank placeholder instead of app icon | Low | 5.13 | Open |
| BUG-019 | Request submit - brief flash of Step 1 before success message | Low | 1.10 | Open |
| BUG-020 | Admin provider details - action buttons cut off on mobile viewport | High | 9.3 | Open |
| BUG-021 | Provider cancel offer shows error but actually succeeds | High | Ad-hoc | Open |
| BUG-022 | Cancelled offer remains visible to consumer (stale UI) | High | Ad-hoc | Open |

---

## BUG-001: Map Tiles Not Rendering on Location Pinpoint Screen

### Overview

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P1 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 1.3 - Tap on map to set delivery location |
| **URL/Route** | `/request` → map state |

### Description

After completing Step 1 of the water request flow (entering address details), the location pinpoint screen appears but the **Leaflet map tiles fail to render**:

1. **Map Tiles Not Loading** - Map area shows blank/white instead of OpenStreetMap tiles
2. **Cannot Interact** - Since tiles aren't visible, user can't see where they're placing the pin

**Clarification:** The missing header/nav is **intentional** - this is a full-screen map experience by design (Story 12-1). The "Volver" button provides navigation back.

### Screenshot Evidence

![Location Screen Bug](./screenshots/bug-001-location-pinpoint.png)

*Screenshot shows:*
- Instruction text: "Arrastra el marcador o toca el mapa para ajustar tu ubicación exacta"
- Large blank/white area where map should be
- Address card showing: "Calle Test 123, Villarrica"
- Coordinates: -39.236486, -72.339354
- "Volver" and "Confirmar Ubicación" buttons visible
- No header or navigation bar

### Steps to Reproduce

1. Log in as Consumer (`consumer@nitoagua.cl`)
2. Tap "Pedir Agua" button on home page
3. Request form opens (Step 1)
4. Select Comuna (e.g., Villarrica)
5. **BUG APPEARS:** Location pinpoint screen shows without map/header/nav

### Expected Behavior

- App header should be visible at top
- Bottom navigation bar should be visible
- Google Maps/Leaflet map should render showing the selected comuna area
- User should be able to tap/drag on map to set exact delivery location

### Actual Behavior

- No header visible
- No bottom navigation visible
- Map area is completely blank (white)
- Cannot set location via map interaction
- "Confirmar Ubicación" button is present but map interaction broken

### Environment

- Device: Android Phone
- Browser: Chrome (PWA)
- OS: Android
- Network: WiFi
- PWA Version: 2.4.0

### Potential Root Causes

1. **OpenStreetMap Tile Loading Failure** - Leaflet uses OSM tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) which may be blocked or failing to load
2. **Leaflet CSS Not Loading** - The `leaflet/dist/leaflet.css` import may not be applying correctly on mobile
3. **CSP Issue** - Content Security Policy may be blocking tile.openstreetmap.org resources
4. **Network Issue** - Mobile network may be blocking external tile server requests

**Note:** Header/nav are **intentionally hidden** for this full-screen map step (see `showHeader: false` in code). This is by design per Story 12-1.

### Investigation Notes

**Code Analysis:**
- Component: [location-pinpoint.tsx](src/components/consumer/location-pinpoint.tsx)
- Wrapper: [location-pinpoint-wrapper.tsx](src/components/consumer/location-pinpoint-wrapper.tsx)
- Page: [request/page.tsx](src/app/(consumer)/request/page.tsx:383-396)

**Key findings from code:**
1. Uses **Leaflet** with **OpenStreetMap** tiles (not Google Maps)
2. Has a 10-second timeout for map load detection (line 116-124)
3. Has error state handling with "Skip" option (AC12.1.4)
4. Map state `showHeader: false` at line 334 - this is intentional!

**The map should show:**
- Loading spinner initially
- Then either: map tiles OR error state with "Saltar" (skip) button

**From screenshot:** The map appears to have loaded (`mapLoaded=true` since buttons are enabled) but tiles are not rendering.

### Related Files

- [src/components/consumer/location-pinpoint.tsx](src/components/consumer/location-pinpoint.tsx) - Main map component
- [src/components/consumer/location-pinpoint-wrapper.tsx](src/components/consumer/location-pinpoint-wrapper.tsx) - Dynamic import wrapper
- [src/app/(consumer)/request/page.tsx](src/app/(consumer)/request/page.tsx) - Request wizard page

### Impact

- **User Impact:** Cannot complete water request flow - BLOCKER
- **Business Impact:** No orders can be placed via mobile

---

## Additional Bugs (Add as discovered)

### BUG-002: Admin Orders Page - Stale Data / No Refresh Button

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | 1.14-1.15 - Verify order in Admin Panel |
| **URL/Route** | `/admin/orders` |

**Description:**

After a consumer creates a new water request (steps 1.1-1.10 completed), the admin panel does not show the new order. The page displays stale/cached data.

**Context:**
- Consumer successfully created request (confirmed via Provider view - steps 1.11-1.13 passed)
- Admin navigated to `/admin/orders`
- New request was NOT visible
- No "refresh" button available to reload data
- Had to clear browser cache and hard refresh (Ctrl+Shift+R) to see the new order

**Steps to Reproduce:**

1. Consumer creates a new water request (steps 1.1-1.10)
2. Provider confirms request is visible on their end (steps 1.11-1.13) ✅
3. Admin navigates to Admin → Pedidos (`/admin/orders`)
4. **BUG:** New request is NOT visible
5. No refresh button available
6. Must clear cache + hard refresh to see new data

**Expected Behavior:**

- New orders should appear automatically (real-time) OR
- A "Refresh" / "Actualizar" button should be available OR
- Page should auto-refresh on navigation/focus

**Actual Behavior:**

- Page shows stale cached data
- No manual refresh option available
- Requires full browser cache clear + hard refresh

**Potential Root Causes:**

1. **No Supabase Realtime subscription** on admin orders page
2. **Aggressive caching** - Next.js ISR/SSG caching stale data
3. **No polling mechanism** for admin dashboard
4. **Missing revalidation** on page navigation

**Related Files (Likely):**

- `src/app/admin/orders/page.tsx`
- Admin orders data fetching logic

**Impact:**

- **User Impact:** Admin cannot see new orders in real-time
- **Business Impact:** Delayed response to incoming orders
- **Workaround:** Hard refresh (poor UX)

---

### BUG-003: Provider Request Detail Screen - UX Overload for Drivers

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 2 (Provider role) - but critical for mobile providers |
| **Test Step** | 2.1 - Click on consumer's request to view details |
| **URL/Route** | `/provider/requests/[id]` or request detail modal |
| **Type** | UX Improvement |

**Description:**

The provider request detail screen shows too much information in a cluttered layout. Providers are often drivers who need to quickly scan and decide - the current design is information overload.

**Current Issues:**

1. **Too many fields displayed** - overwhelming for quick decision-making
2. **Poor information hierarchy** - important info not prominently displayed
3. **Price/earnings not clear** - provider earnings should be prominent, commission secondary
4. **Delivery time selection too complex** - current time picker is confusing
5. **Missing price modification** - provider cannot adjust their offer price

**Proposed UX Redesign:**

#### Section 1: Hero Cards (Top - Most Important)

Two prominent cards side-by-side:

| **AMOUNT Card** | **LOCATION Card** |
|-----------------|-------------------|
| **1000 L** (large, prominent) | **Villarrica** (city name large) |
| Requested: 2 hours ago | Calle Test 123 (address below) |
| Offers: 0 | Distance: ~5km (if available) |

#### Section 2: Details Row (Below cards)

| Payment Method | Special Instructions |
|----------------|---------------------|
| 💵 Efectivo | "Dejar en portón azul" |

#### Section 3: Make Offer (Prominent CTA)

```
┌─────────────────────────────────────────┐
│  TU GANANCIA: $15,000 CLP              │  ← MOST PROMINENT
│  ─────────────────────────────────────  │
│  Precio al consumidor: $18,000 CLP     │
│  Comisión plataforma: $3,000 (15%)     │  ← Secondary info
│                                         │
│  [  Modificar precio  ] (optional)      │  ← Allow price adjustment
└─────────────────────────────────────────┘
```

#### Section 4: Delivery Time (Simplified)

```
┌─────────────────────────────────────────┐
│  ¿Cuándo puedes entregar?               │
│                                         │
│  Fecha: [ Hoy ▼ ] [ Mañana ] [ Otro ]  │
│  Hora:  [ 14:00 ▼ ]                     │
│                                         │
│  ⚠️ Tendrás 1 hora desde la hora        │
│     programada para completar la        │
│     entrega. Entregas tardías pueden    │
│     afectar tu calificación.            │
└─────────────────────────────────────────┘
```

#### Section 5: Message (Optional)

```
┌─────────────────────────────────────────┐
│  Mensaje al cliente (opcional)          │
│  [ __________________________________ ] │
└─────────────────────────────────────────┘
```

#### Section 6: Submit Button

```
┌─────────────────────────────────────────┐
│  [ ENVIAR OFERTA - Ganarás $15,000 ]   │  ← Big, prominent button
└─────────────────────────────────────────┘
```

**Key UX Principles:**

1. **Driver-first design** - scannable in 3 seconds
2. **Earnings prominent** - "What will I make?" is the #1 question
3. **Simple time selection** - Date dropdown + Hour dropdown, that's it
4. **Clear delivery window** - 1-hour window disclaimer visible
5. **Optional price adjustment** - let provider compete on price

**Current Behavior:**

- All fields displayed with equal weight
- Price breakdown not clear
- Time selection with complex datetime picker
- No delivery window explanation
- No price modification option

**Impact:**

- **User Impact:** Providers struggle to quickly evaluate requests
- **Business Impact:** Slower offer submissions, potential lost transactions
- **Safety Impact:** Drivers distracted by complex UI while reviewing requests

**Related Files (Likely):**

- `src/app/provider/requests/[id]/page.tsx`
- `src/components/provider/request-detail.tsx`
- `src/components/provider/offer-form.tsx`

---

### BUG-004: Offer Success Toast - Missing Icon & Poor Contrast

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | Computer 2 (Provider role) |
| **Test Step** | 2.6 - Success message after sending offer |
| **URL/Route** | Provider offer submission flow |
| **Type** | UX/Accessibility |

**Description:**

After successfully submitting an offer, the success toast notification has UX issues:

1. **No success icon** - Missing green checkmark or similar visual confirmation
2. **Poor color contrast** - Secondary text line is unreadable
3. **Text not visible** - Second line of the message couldn't be read due to color issues

**Steps to Reproduce:**

1. As Provider, view a consumer request
2. Fill out offer form
3. Click "Enviar Oferta"
4. **BUG:** Success toast appears but:
   - No confirmation icon (checkmark)
   - Secondary text has poor contrast/unreadable

**Expected Behavior:**

- ✅ Green checkmark icon on success toast
- Clear, readable primary message: "Oferta enviada"
- Readable secondary message with good contrast
- WCAG AA compliant color contrast (4.5:1 minimum)

**Actual Behavior:**

- No icon displayed
- Primary text visible but plain
- Secondary text unreadable due to poor contrast

**Proposed Fix:**

```tsx
toast.success("Oferta enviada", {
  description: "El cliente será notificado de tu oferta",
  icon: <CheckCircle className="text-green-500" />,
  // Ensure description has sufficient contrast
});
```

**Related Files (Likely):**

- Offer submission handler (wherever `toast.success` is called)
- Toast/Sonner configuration
- Global toast styles

**Impact:**

- **User Impact:** Unclear if action succeeded, poor accessibility
- **Accessibility:** May violate WCAG contrast requirements

---

### BUG-005: Consumer Not Receiving Push Notification for New Offer

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 2.9-2.10 - Verify offer received on consumer device |
| **URL/Route** | Consumer tracking/status page |
| **Type** | Push Notification Failure |

**Description:**

When a provider submits an offer for a consumer's water request, the consumer does NOT receive a push notification on their phone. The offer IS visible in the app (when refreshed/checked), but no notification alerts the user.

**Context:**
- Consumer has push notifications enabled (verified in Test 5 later, or assumed enabled)
- Provider successfully submitted offer (Step 2.6 confirmed)
- Offer IS visible in the consumer's app when manually checked
- NO push notification received on Android phone

**Steps to Reproduce:**

1. Consumer creates water request (Steps 1.1-1.10) ✅
2. Provider views request and submits offer (Steps 2.1-2.6) ✅
3. Consumer waits for notification on Android phone
4. **BUG:** No push notification received
5. Consumer manually opens app/refreshes - offer IS visible

**Expected Behavior:**

- 📱 Push notification appears on consumer's phone
- Notification message: "¡Nueva oferta!" or similar
- Tapping notification opens app to offer details
- Notification should arrive within seconds of offer submission

**Actual Behavior:**

- No push notification received
- Consumer must manually check app to see new offers
- Offer data IS present (realtime/polling working), just no push

**Potential Root Causes:**

1. **Push notification not triggered** - Backend not sending push when offer created
2. **Push subscription not registered** - Consumer's device token not saved
3. **Edge function issue** - `send-push-notification` function failing silently
4. **Service worker issue** - PWA service worker not receiving/displaying push
5. **Permission issue** - Push permission granted but not properly configured

**Investigation Checklist:**

- [ ] Check if push subscription exists in database for consumer
- [ ] Check Supabase Edge Function logs for `send-push-notification`
- [ ] Verify offer creation triggers notification (database trigger or app code)
- [ ] Test push using "Probar" button in settings (Test 5.12)

**Related Files (Likely):**

- `supabase/functions/send-push-notification/`
- Offer creation handler (should trigger notification)
- `src/hooks/use-notifications.ts`
- Service worker push handler

**Impact:**

- **User Impact:** Consumer misses time-sensitive offers, poor UX
- **Business Impact:** Delayed transaction completion, potential lost sales
- **Competitive Impact:** Users expect instant notifications from marketplace apps

---

### BUG-006: Admin Orders - No Sorting by Date

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | 2.12-2.13 - Admin verifies offer in system |
| **URL/Route** | `/admin/orders` |
| **Type** | Missing Feature / UX |

**Description:**

The admin orders list does not allow sorting by date. When there are many orders, it's very difficult to locate the newest request. Currently only filtering is available, but no sorting options.

**Steps to Reproduce:**

1. Log in as Admin
2. Navigate to Admin → Pedidos (`/admin/orders`)
3. Try to sort orders by date (newest first)
4. **BUG:** No sorting option available

**Expected Behavior:**

- Column headers should be clickable to sort
- Sort by: Date (newest/oldest), Status, Amount, Location
- Default sort: newest first
- Visual indicator showing current sort order (▲/▼)

**Actual Behavior:**

- Only filtering available
- No way to sort by date
- Hard to find recent requests in a long list

**Proposed Solution:**

```
┌─────────────────────────────────────────────────────────────┐
│ Pedidos                                    [Filtrar ▼]      │
├─────────────────────────────────────────────────────────────┤
│ Fecha ▼ │ Cliente │ Cantidad │ Estado │ Ofertas │ Acciones │
├─────────────────────────────────────────────────────────────┤
│ (clickable column headers for sorting)                      │
└─────────────────────────────────────────────────────────────┘
```

**Related Files (Likely):**

- `src/app/admin/orders/page.tsx`
- Admin orders table component

**Impact:**

- **User Impact:** Admin wastes time scrolling to find new orders
- **Business Impact:** Slower response times to incoming requests

---

### BUG-007: Admin Orders - Clicking Request Intermittently Fails to Open Details

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | 2.12-2.13 - Admin verifies offer in system |
| **URL/Route** | `/admin/orders` |
| **Type** | Intermittent Bug / JS Error |

**Description:**

When clicking on a request row in the admin orders list, sometimes nothing happens. The click doesn't open the request details. This is intermittent - sometimes it works, sometimes it doesn't. A page refresh seems to temporarily fix it.

**Steps to Reproduce:**

1. Log in as Admin
2. Navigate to Admin → Pedidos (`/admin/orders`)
3. Click on a request row to view details
4. **BUG (intermittent):** Nothing happens - no modal, no navigation
5. Refresh page (F5)
6. Click same row again - now it works

**Expected Behavior:**

- Every click on a request row should open the details view
- Consistent, reliable interaction
- No need to refresh page

**Actual Behavior:**

- Click sometimes works, sometimes doesn't
- No visual feedback when click fails
- Requires page refresh to fix
- Intermittent/unpredictable

**Potential Root Causes:**

1. **Event handler not attached** - React hydration issue
2. **Stale closure** - Click handler referencing old state
3. **Race condition** - Data loading vs click handler registration
4. **JS error** - Silent error preventing handler execution
5. **Z-index issue** - Invisible element blocking clicks

**Investigation Steps:**

- [ ] Check browser console for JS errors when click fails
- [ ] Check if specific rows fail vs random rows
- [ ] Check if issue occurs after specific actions (filter, scroll, etc.)
- [ ] Add console.log to click handler to verify it's being called

**Related Files (Likely):**

- `src/app/admin/orders/page.tsx`
- Admin orders table row component
- Order detail modal/sheet component

**Impact:**

- **User Impact:** Frustrating UX, admin can't reliably view order details
- **Business Impact:** Delays in order management and customer service

---

### BUG-008: Provider Not Receiving Push Notification When Offer Accepted

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Computer 2 (Provider role) |
| **Test Step** | 3.5-3.7 - Provider verifies offer accepted |
| **URL/Route** | Provider dashboard / "Mis Ofertas" |
| **Type** | Push Notification Failure |

**Description:**

When a consumer accepts a provider's offer, the provider does NOT receive a push notification. The provider can see the updated status in the app (offer shows "Aceptada"), but receives no notification alert.

This is the same category of issue as BUG-005 - push notifications are not being sent for critical transaction events.

**Context:**
- Consumer accepted offer (Steps 3.1-3.4 completed)
- Provider's offer status changed to "Aceptada" in the system
- Provider can see the updated status when checking the app
- NO push notification received by provider

**Steps to Reproduce:**

1. Provider submits offer (Steps 2.1-2.6) ✅
2. Consumer accepts offer (Steps 3.1-3.4) ✅
3. Provider waits for notification
4. **BUG:** No push notification received
5. Provider must manually check app to see acceptance

**Expected Behavior:**

- 📱 Push notification appears on provider's device
- Notification message: "¡Tu oferta fue aceptada!" or similar
- Includes delivery details (address, time)
- Tapping notification opens delivery details
- Notification should arrive within seconds of acceptance

**Actual Behavior:**

- No push notification received
- Provider must manually check app to see offer accepted
- Status IS updated in app (realtime working), just no push

**Impact:**

- **User Impact:** Provider misses time-sensitive acceptance, may delay delivery
- **Business Impact:** Slower delivery times, poor customer experience
- **Critical:** For mobile providers (drivers), missing this notification could mean missing the delivery window entirely

**Related to:** BUG-005 (same root cause likely)

**Related Files (Likely):**

- Offer acceptance handler (should trigger notification to provider)
- `supabase/functions/send-push-notification/`
- Database trigger or app code for offer status change

---

### BUG-009: Provider Missing "En Camino" (On The Way) Status Button

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 2 (Provider role) |
| **Test Step** | 4.1 - Navigate to active delivery |
| **URL/Route** | Provider delivery details page |
| **Type** | Missing Feature |

**Description:**

After an offer is accepted, the provider can only see delivery details and "Marcar como Entregado" (Mark as Delivered). There is no intermediate "En Camino" (On The Way) button to indicate the provider has started the delivery.

**Current Context:**
- Time: 20:20
- Scheduled delivery: 21:00
- Status shows as "Aceptada" (Accepted) but not "En Camino" (On The Way)
- Consumer cannot see that provider is on the way

**Current Flow:**
```
Offer Accepted → [MISSING STEP] → Mark as Delivered
```

**Expected Flow:**
```
Offer Accepted → "En Camino" (On The Way) → Mark as Delivered
```

**Why This Matters:**

1. **Consumer visibility** - Consumer wants to know provider is actually coming
2. **Trust building** - "On the way" status reassures consumer
3. **Time tracking** - Helps track actual delivery time vs scheduled time
4. **Accountability** - Provider commits to delivery by clicking "En Camino"

**Proposed Solution:**

Add a prominent "Estoy en Camino" button that:
- Changes delivery status to "en_camino" / "on_the_way"
- Notifies consumer (push notification + in-app update)
- Records timestamp for analytics
- Changes provider's view to show delivery in progress

**Related Files (Likely):**

- Provider delivery details page
- Delivery status state machine
- Consumer tracking page

**Impact:**

- **User Impact:** Consumer doesn't know when provider leaves for delivery
- **Business Impact:** Less transparency in delivery process

---

### BUG-010: Provider Delivery Details Screen Not Driver-Friendly

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 2 (Provider role) - Critical for mobile |
| **Test Step** | 4.1 - Navigate to active delivery |
| **URL/Route** | Provider delivery details page |
| **Type** | UX Improvement |

**Description:**

The provider delivery details screen requires scrolling to see all information and the "Mark as Delivered" button. For drivers who need to glance at their phone while parked, this is not safe or efficient.

**Current Issues:**

1. **Too much scrolling** - Must scroll to see everything
2. **Information spread out** - Client info, phone, address, details all separate
3. **CTA not visible** - "Marcar como Entregado" button requires scrolling
4. **Not glanceable** - Can't see key info at a glance

**Proposed UX Redesign:**

Everything should fit on one screen without scrolling:

```
┌─────────────────────────────────────────┐
│  🚚 ENTREGA ACTIVA                      │
├─────────────────────────────────────────┤
│                                         │
│  📍 Calle Test 123, Villarrica         │
│     [📞 Llamar] [📍 Navegar]           │  ← Quick action buttons
│                                         │
│  👤 Juan Pérez                          │
│  💧 1000 L  •  💵 Efectivo              │
│                                         │
│  📝 "Dejar en portón azul"              │  ← Special instructions prominent
│                                         │
├─────────────────────────────────────────┤
│  ⏰ Entregar antes de: 22:00            │
│     (Tienes 1hr 40min)                  │
├─────────────────────────────────────────┤
│                                         │
│  [ 🚗 ESTOY EN CAMINO ]                 │  ← New button (BUG-009)
│                                         │
│  [ ✅ MARCAR COMO ENTREGADO ]           │  ← Always visible
│                                         │
└─────────────────────────────────────────┘
```

**Key UX Principles:**

1. **Single screen** - No scrolling needed
2. **Quick actions** - Call and Navigate buttons prominent
3. **Glanceable** - Key info visible in 2 seconds
4. **Large buttons** - Easy to tap while parked
5. **Time remaining** - Countdown to delivery deadline

**Related to:** BUG-003 (same driver-friendly design philosophy)

**Related Files (Likely):**

- `src/app/provider/deliveries/[id]/page.tsx`
- Provider delivery detail component

**Impact:**

- **User Impact:** Drivers must scroll and search for information
- **Safety Impact:** Distracted driving if checking phone
- **Business Impact:** Slower deliveries due to poor UX

---

### BUG-011: Admin Panel Shows Incorrect Delivery Status (Out of Sync)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Priority** | P1 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | 3.8-3.11 - Admin verifies status change |
| **URL/Route** | `/admin/orders` |
| **Type** | Data Sync / Status Mismatch |

**Description:**

The Admin panel is showing deliveries with incorrect status. A delivery that has been **accepted** (but NOT yet delivered) is appearing in the Admin panel as if it's already delivered - mixed in with completed deliveries. Meanwhile, the Provider view correctly shows it as "Entrega Activa" (Active Delivery) with the option to mark it as delivered.

**The Data is Out of Sync:**

| View | What it Shows | What it Should Show |
|------|---------------|---------------------|
| **Provider** | "Entrega Activa" + "Marcar como Entregado" | ✅ Correct |
| **Admin** | Mixed with delivered orders, no "accepted" status visible | ❌ Wrong |

**Steps to Reproduce:**

1. Consumer creates request (Steps 1.1-1.10) ✅
2. Provider submits offer (Steps 2.1-2.6) ✅
3. Consumer accepts offer (Steps 3.1-3.4) ✅
4. Provider sees "Entrega Activa" - correct status ✅
5. Admin navigates to Admin → Pedidos
6. **BUG:** Delivery appears with wrong status:
   - Not showing as "accepted" or "assigned"
   - Appears mixed with already-delivered orders
   - No clear indication this is an active/pending delivery

**Expected Behavior:**

Admin panel should show clear delivery statuses:
- **pending** - Waiting for offers
- **searching** - Has offers, consumer reviewing
- **accepted** / **assigned** - Offer accepted, awaiting delivery
- **en_camino** / **on_the_way** - Provider on the way (if implemented)
- **delivered** - Completed

The accepted delivery should clearly show as "Aceptado" or "Asignado" with the assigned provider visible.

**Actual Behavior:**

- Accepted delivery not clearly distinguished from delivered orders
- Status appears incorrect or missing
- Admin cannot see which deliveries are actively in progress
- Data mismatch between Provider view and Admin view

**Potential Root Causes:**

1. **Status enum mismatch** - Admin using different status values than Provider
2. **Query filter issue** - Admin orders query not properly filtering/grouping by status
3. **Realtime sync issue** - Admin not receiving status updates
4. **Status display mapping** - Backend status not mapped correctly to UI labels
5. **Database trigger issue** - Status not updating correctly when offer accepted

**Investigation Checklist:**

- [ ] Check database: What is the actual `status` value for this order?
- [ ] Compare status enum values between Admin and Provider code
- [ ] Check Admin orders query - is it filtering correctly?
- [ ] Verify offer acceptance updates the correct status field

**Related Files (Likely):**

- `src/app/admin/orders/page.tsx` - Admin orders list
- `src/lib/actions/offers.ts` - Offer acceptance logic
- Database schema for `water_requests` table - status column
- Status enum definitions

**Impact:**

- **User Impact:** Admin cannot accurately monitor delivery pipeline
- **Business Impact:** Cannot distinguish active deliveries from completed ones
- **Operational Impact:** Cannot provide accurate status to customers calling in
- **Critical:** Admin dashboard is the source of truth for operations

---

### BUG-012: Commission Payment - No Option to Attach Transfer Screenshot

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 2 (Provider role) |
| **Test Step** | 4.6 - Verify earnings/commission |
| **URL/Route** | `/provider/earnings` or commission payment flow |
| **Type** | Missing Feature / UX |

**Description:**

When a provider clicks to pay their platform commission, the system immediately shows "Payment Sent" (Pago Enviado) without any intermediate step. There is no opportunity for the provider to:

1. **Attach a screenshot** of the bank transfer as proof of payment
2. **Confirm** before the notification is sent
3. **Add notes** about the payment (transfer reference, etc.)

**Real-World Context:**

Providers in Chile typically pay commissions via bank transfer (transferencia). The standard workflow is:
1. Provider makes transfer in their bank app
2. Provider takes screenshot of transfer confirmation
3. Provider wants to send this screenshot as proof to the platform

Currently, providers cannot attach this proof, which creates:
- Trust issues (admin can't verify payment was made)
- Disputes (provider says they paid, no evidence)
- Manual follow-up required (WhatsApp/email to send screenshot)

**Steps to Reproduce:**

1. As Provider, complete a delivery (Steps 4.1-4.5)
2. Go to Earnings/Ganancias page
3. Click "Pagar Comisión" (Pay Commission) button
4. **BUG:** Immediately shows "Pago Enviado" - no intermediate step
5. No option to attach screenshot or add payment reference

**Expected Behavior:**

Payment flow should be:

```
┌─────────────────────────────────────────┐
│  PAGAR COMISIÓN                         │
│                                         │
│  Monto: $3,000 CLP                      │
│                                         │
│  📎 Adjuntar comprobante (opcional)     │
│  [Subir imagen]                         │
│                                         │
│  📝 Referencia de transferencia         │
│  [ __________________________________ ] │
│                                         │
│  [ Cancelar ]  [ Confirmar Pago ]       │
└─────────────────────────────────────────┘
```

After clicking "Confirmar Pago":
- Screenshot uploaded to storage (if provided)
- Payment record created with reference
- Admin can see proof in their panel
- Success message shown to provider

**Actual Behavior:**

- Single click immediately marks as "paid"
- No confirmation dialog
- No screenshot upload option
- No reference field
- Admin has no proof of payment

**Proposed Solution:**

1. **Add confirmation modal** before marking as paid
2. **Optional image upload** for transfer screenshot
3. **Optional reference field** for transfer number
4. **Store proof** in Supabase storage
5. **Show proof in Admin** panel for verification

**Related Files (Likely):**

- `src/app/provider/earnings/page.tsx`
- `src/components/provider/commission-payment.tsx`
- `src/lib/actions/settlement.ts`
- Supabase storage bucket for payment proofs

**Impact:**

- **User Impact:** Providers can't prove they paid
- **Business Impact:** Disputes over commission payments
- **Operational Impact:** Manual follow-up required via WhatsApp
- **Trust Impact:** No audit trail for payments

---

### BUG-013: Consumer Not Receiving Push Notification When Delivery Completed

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 4.7-4.9 - Consumer verifies delivery complete |
| **URL/Route** | Consumer tracking/status page |
| **Type** | Push Notification Failure |

**Description:**

When the provider marks a delivery as completed ("Entregado"), the consumer does NOT receive a push notification. The consumer can see the updated status in the app (shows "Entregado"), but receives no notification alert.

This is the **third push notification failure** discovered (see also BUG-005, BUG-008). Push notifications appear to be systematically broken for all critical transaction events.

**Push Notification Failures Pattern:**

| Event | Who Should Receive | Bug |
|-------|-------------------|-----|
| Provider submits offer | Consumer | BUG-005 ❌ |
| Consumer accepts offer | Provider | BUG-008 ❌ |
| Provider completes delivery | Consumer | **BUG-013** ❌ |

**Steps to Reproduce:**

1. Provider marks delivery as completed (Steps 4.2-4.5) ✅
2. Consumer waits for notification on Android phone
3. **BUG:** No push notification received
4. Consumer manually opens app - status shows "Entregado"

**Expected Behavior:**

- 📱 Push notification appears on consumer's phone
- Notification message: "¡Tu agua ha llegado!" or "Entrega completada"
- Tapping notification opens delivery details/rating screen

**Actual Behavior:**

- No push notification received
- Consumer must manually check app

**Impact:**

- **User Impact:** Consumer doesn't know delivery arrived (may not be home)
- **Business Impact:** Poor customer experience, delayed confirmation
- **Pattern:** This confirms push notifications are broken system-wide

**Related to:** BUG-005, BUG-008 (same root cause)

---

### BUG-014: No Rating/Review Option for Provider After Delivery

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 4.9 - Can rate/review (if implemented) |
| **URL/Route** | Consumer delivery complete screen |
| **Type** | Missing Feature |

**Description:**

After a delivery is marked as completed, there is no option for the consumer to rate or review the provider. The test plan mentions "VERIFY: Can rate/review (if implemented)" - it appears this is NOT implemented.

**Steps to Reproduce:**

1. Delivery is marked as completed by provider
2. Consumer views completed delivery details
3. **BUG:** No rating stars, review form, or feedback option visible

**Expected Behavior:**

When delivery is completed, consumer should see:

```
┌─────────────────────────────────────────┐
│  ✅ ENTREGA COMPLETADA                  │
│                                         │
│  ¿Cómo fue tu experiencia?              │
│                                         │
│  ⭐⭐⭐⭐⭐  (tap to rate)               │
│                                         │
│  📝 Comentario (opcional)               │
│  [ __________________________________ ] │
│                                         │
│  [ Enviar Calificación ]                │
│                                         │
│  [ Saltar ]                             │
└─────────────────────────────────────────┘
```

**Actual Behavior:**

- No rating option visible
- No way to provide feedback on provider
- No review system for quality control

**Why This Matters:**

1. **Quality control** - Bad providers can't be identified
2. **Trust building** - Good providers can't build reputation
3. **Consumer voice** - Customers can't express satisfaction/dissatisfaction
4. **Business insights** - No data on service quality

**Related Files (Likely):**

- Consumer delivery complete/status page
- Rating/review component (may not exist)
- Provider profile (to display ratings)

**Impact:**

- **User Impact:** Cannot provide feedback
- **Business Impact:** No quality metrics, can't identify problems

---

### BUG-015: Consumer Cannot Dispute - No "Not Delivered" Option

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 4.7-4.9 - Consumer verifies delivery |
| **URL/Route** | Consumer delivery status page |
| **Type** | Missing Critical Feature |

**Description:**

When a provider marks a delivery as "Entregado" (Delivered), the consumer has NO WAY to dispute this if the delivery was NOT actually made. The provider could fraudulently mark deliveries as complete without actually delivering, and the consumer has no recourse.

**The Problem:**

```
Provider clicks "Marcar como Entregado"
         ↓
System shows "Delivered" to everyone
         ↓
Consumer: "But I never received anything!"
         ↓
❌ No button to dispute
❌ No way to report fraud
❌ No escalation to admin
```

**Steps to Reproduce:**

1. Provider marks delivery as completed
2. Consumer views delivery status (shows "Entregado")
3. **BUG:** No option to report "I didn't receive this"
4. Consumer has no way to dispute the delivery status

**Expected Behavior:**

Consumer should have dispute options in TWO places:

**Option A: On Delivery Details Page**

```
┌─────────────────────────────────────────┐
│  ✅ ENTREGADO                           │
│                                         │
│  Entregado el: 30 Dic 2024, 21:15       │
│  Proveedor: Juan Provider               │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ⚠️ ¿Hay algún problema?                │
│                                         │
│  [ No recibí mi pedido ]                │
│  [ Cantidad incorrecta ]                │
│  [ Otro problema ]                      │
└─────────────────────────────────────────┘
```

**Option B: In Rating Popup (if implemented)**

```
┌─────────────────────────────────────────┐
│  ¿Cómo fue tu experiencia?              │
│                                         │
│  ⭐⭐⭐⭐⭐                               │
│                                         │
│  [ Enviar ]                             │
│                                         │
│  ─────────────────────────────────────  │
│  ⚠️ [ Reportar problema ]               │  ← Always visible
└─────────────────────────────────────────┘
```

**Dispute Types to Support:**

1. **"No recibí mi pedido"** - Never delivered (fraud risk)
2. **"Cantidad incorrecta"** - Received less than ordered
3. **"Llegó tarde"** - Delivered outside window
4. **"Mala calidad"** - Water quality issues
5. **"Otro problema"** - Free text

**What Happens When Consumer Disputes:**

1. Delivery status changes to "disputed" / "en_disputa"
2. Admin receives notification (see BUG-016)
3. Admin investigates and resolves
4. Consumer receives resolution notification

**Actual Behavior:**

- No dispute option anywhere
- Consumer cannot report non-delivery
- Provider can fraudulently mark as delivered
- No consumer protection

**Impact:**

- **User Impact:** Consumer has no recourse for fraud
- **Business Impact:** Fraud risk, trust issues, chargebacks
- **Legal Impact:** Consumer protection concerns
- **Critical:** This is a fundamental marketplace trust issue

---

### BUG-016: Admin Needs Dispute Resolution Tools

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | Related to 4.7-4.9 |
| **URL/Route** | `/admin/disputes` or `/admin/orders/[id]` |
| **Type** | Missing Critical Feature |

**Description:**

When a consumer disputes a delivery (BUG-015), the admin needs tools to investigate and resolve the dispute. Currently, there appears to be no dispute management system for admins.

**Admin Dispute Resolution Needs:**

1. **Notification** - Admin should be notified when dispute is filed
2. **View disputes** - Dashboard showing all open disputes
3. **Investigation** - See full order history, communications
4. **Resolution actions:**
   - **Confirm delivery** - Validate it was actually delivered
   - **Refund consumer** - If delivery wasn't made
   - **Reassign request** - Assign to new provider
   - **Reopen request** - Put back in marketplace
   - **Ban provider** - For repeated fraud
   - **Contact parties** - Message consumer/provider

**Proposed Admin Dispute Interface:**

```
┌─────────────────────────────────────────────────────────────┐
│  DISPUTA #1234                                    ⚠️ ABIERTA │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tipo: No recibí mi pedido                                  │
│  Consumidor: María Consumer                                 │
│  Proveedor: Juan Provider                                   │
│  Pedido: #5678 - 1000L - $18,000 CLP                       │
│                                                             │
│  Timeline:                                                  │
│  • 14:00 - Pedido creado                                   │
│  • 14:30 - Oferta aceptada                                 │
│  • 15:15 - Marcado como entregado por proveedor            │
│  • 15:20 - Consumidor reporta: "No recibí nada"            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ACCIONES:                                                  │
│                                                             │
│  [ ✅ Confirmar Entrega ]  - Proveedor tiene razón         │
│  [ 💰 Reembolsar ]         - Consumidor tiene razón        │
│  [ 🔄 Reasignar ]          - Nuevo proveedor               │
│  [ 📢 Reabrir Pedido ]     - Volver al marketplace         │
│  [ ⚠️ Advertir Proveedor ] - Primera advertencia           │
│  [ 🚫 Suspender Proveedor ] - Fraude confirmado            │
│                                                             │
│  Notas internas:                                            │
│  [ __________________________________________________ ]    │
│                                                             │
│  [ Guardar Resolución ]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Expected Behavior:**

- Admin dashboard shows dispute count/alerts
- Click to see dispute details
- Resolution actions available
- Audit trail of actions taken
- Notifications to consumer/provider of resolution

**Actual Behavior:**

- No dispute system exists
- Admin cannot resolve conflicts
- No way to handle fraud cases
- No provider accountability

**Impact:**

- **User Impact:** Disputes cannot be resolved
- **Business Impact:** No fraud prevention, no quality control
- **Operational Impact:** Manual WhatsApp/phone resolution required
- **Trust Impact:** Marketplace trust at risk

---

### BUG-017: Admin Finances - No "Jump to Today" Button & Yearly View Missing Pending Payments

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Priority** | P2 |
| **Device** | Computer 1 (Admin role) |
| **Test Step** | 4.10-4.13 - Admin verifies final state / finances |
| **URL/Route** | `/admin/finances` or `/admin/dashboard` |
| **Type** | UX / Data Display Issue |

**Description:**

The Admin finance/earnings view has navigation and data display issues:

1. **No "Jump to Today" button** - When viewing finances, there's no quick way to jump to the current week. Admin must manually navigate through weeks to find today's data.

2. **Yearly view doesn't show pending payments** - When viewing the complete year, pending commission payments are NOT visible. Admin must drill down to the specific week to see pending payments from providers.

**Steps to Reproduce:**

1. As Admin, go to Finances section
2. Select "Year" view (complete year)
3. **BUG:** Cannot see pending payment from today's delivery
4. Switch to "Week" view
5. Navigate manually to find current week
6. **BUG:** No quick "Today" button - must click through weeks
7. Finally find current week - NOW pending payment is visible

**Expected Behavior:**

**Quick Navigation:**
```
┌─────────────────────────────────────────────────────────────┐
│  FINANZAS                                                   │
│                                                             │
│  [ ← ] Semana 52, 2024 (23-30 Dic) [ → ]  [ 📅 HOY ]       │
│                                            ↑                │
│                                     Quick jump to today     │
│                                                             │
│  Vista: [ Día ] [ Semana ✓ ] [ Mes ] [ Año ]               │
└─────────────────────────────────────────────────────────────┘
```

**Yearly View Should Show:**
- Total commissions collected
- Total pending commissions ← Currently missing
- Breakdown by month
- Pending payments should roll up to all views

**Actual Behavior:**

- No "Today" or "Esta Semana" quick navigation button
- Must manually click through time periods
- Yearly view doesn't aggregate pending payments
- Pending payments only visible in weekly view

**Why This Matters:**

1. **Daily operations** - Admin checks finances daily, needs quick access to today
2. **Missing data** - Pending payments not visible in aggregate could lead to missed follow-ups
3. **Time waste** - Manual navigation through weeks is inefficient

**Proposed Solution:**

1. **Add "Hoy" button** - One-click to jump to current week
2. **Fix yearly aggregation** - Show pending payments in all time views
3. **Add pending badge** - Show count of pending payments in any view:
   ```
   Año 2024: $500,000 cobrado | ⏳ 3 pagos pendientes ($15,000)
   ```

**Related Files (Likely):**

- `src/app/admin/finances/page.tsx`
- Admin finance dashboard component
- Finance data aggregation logic

**Impact:**

- **User Impact:** Admin wastes time navigating to find today's data
- **Business Impact:** May miss pending commission payments in yearly view
- **Operational Impact:** Inefficient daily financial review

---

### BUG-018: Push Notification Icon Shows Blank Placeholder on Mobile

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | Android Phone (Consumer & Provider) |
| **Test Step** | 5.13 - Verify notification appears |
| **URL/Route** | Push notification display |
| **Type** | Visual / Branding |

**Description:**

When push notifications are received on mobile devices, the notification icon appears as a blank/placeholder icon instead of the NitoAgua app icon. The notification content works correctly, but the visual branding is missing.

**Good News:** This test confirms that push notifications ARE working when manually triggered via the "Probar" (Test) button. The earlier bugs (BUG-005, BUG-008, BUG-013) are likely caused by notifications not being **triggered** during transaction events, not by the push system itself being broken.

**Steps to Reproduce:**

1. As Consumer or Provider, go to Settings → Notificaciones
2. Enable push notifications (if not already)
3. Click "Probar" (Test) button
4. Notification appears on device ✅
5. **BUG:** Notification icon is blank/placeholder instead of app icon

**Expected Behavior:**

- Notification shows NitoAgua app icon (water drop logo)
- Icon should match the PWA icon used on home screen
- Consistent branding across all notifications

**Actual Behavior:**

- Notification icon is blank or generic placeholder
- No app branding visible in notification tray
- Notification content is correct, only icon is wrong

**Technical Context:**

PWA push notifications require a specific icon configuration:
- Icon must be specified in the service worker
- Icon should be a monochrome/silhouette version for Android
- Different sizes may be needed (192x192, 96x96, etc.)

**Proposed Fix:**

1. Check service worker push notification handler
2. Ensure `icon` property is set in notification options:
   ```javascript
   self.registration.showNotification(title, {
     body: message,
     icon: '/icons/icon-192x192.png',  // App icon
     badge: '/icons/badge-96x96.png',  // Monochrome badge for Android
     ...
   });
   ```
3. Add monochrome badge icon if not present

**Related Files (Likely):**

- `public/sw.js` or service worker file
- `supabase/functions/send-push-notification/`
- PWA manifest icons

**Impact:**

- **User Impact:** Minor - notifications work, just missing branding
- **Branding Impact:** App looks unprofessional in notification tray
- **Recognition:** Users may not immediately recognize notification is from NitoAgua

**Key Insight from Test 5:**

Push notifications WORK when triggered manually. This means:
- BUG-005, BUG-008, BUG-013 are NOT push infrastructure issues
- Those bugs are likely **trigger issues** - the code that should send notifications on transaction events is not executing
- Investigation should focus on offer/acceptance/delivery handlers, not push infrastructure

---

### BUG-019: Request Submit - Brief Flash of Step 1 Before Success Message

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Priority** | P3 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | 1.10 - Submit request |
| **URL/Route** | `/request` |
| **Type** | Visual Glitch / UX |

**Description:**

When submitting a water request at the final step, there is a brief visual glitch where the form flashes back to Step 1 before showing the success message. This creates momentary confusion - the user might think the form reset or something went wrong.

**Steps to Reproduce:**

1. As Consumer, start a new water request
2. Complete all steps (address, location, quantity, delivery time)
3. Click "Enviar Pedido" (Submit Request) on final step
4. **BUG:** Form briefly shows Step 1 (flashes for ~0.5-1 second)
5. Then success message appears

**Expected Behavior:**

After clicking submit:
1. Show loading spinner on button (or disable button)
2. Keep current step visible during submission
3. Transition directly to success message/confirmation
4. No flash of previous steps

**Actual Behavior:**

1. Click submit
2. Form briefly flashes back to Step 1 ← Confusing
3. Success message appears

**Potential Root Causes:**

1. **State reset before redirect** - Form state resets to initial before success redirect completes
2. **Optimistic UI issue** - Component re-renders with initial state during async submission
3. **Router timing** - Navigation happens before success state is set
4. **React re-render** - Parent component causes re-render resetting wizard state

**Proposed Fix:**

Option A: Add loading state that prevents step changes:
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

// During submit, show loading overlay instead of form
if (isSubmitting) {
  return <LoadingSpinner message="Enviando pedido..." />;
}
```

Option B: Maintain step state until redirect:
```tsx
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitRequest();
    // Don't reset form - navigate away instead
    router.push('/request/success');
  } catch (error) {
    setIsSubmitting(false);
  }
};
```

**Related Files (Likely):**

- `src/app/(consumer)/request/page.tsx` - Request wizard
- Request form step management state
- Submit handler

**Impact:**

- **User Impact:** Momentary confusion, might think something went wrong
- **Trust Impact:** Polished apps don't have visual glitches
- **Severity:** Low - request still submits successfully

---

### BUG-020: Admin Provider Details - Action Buttons Cut Off on Mobile Viewport

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Computer 1 (Admin role) - Chrome DevTools mobile view |
| **Test Step** | 9.3 - Verify providers |
| **URL/Route** | `/admin/providers/[id]` or provider details modal |
| **Type** | Responsive Design / UI Overflow |

**Description:**

When viewing provider details in the Admin panel on a mobile viewport (tested with iPhone SE in Chrome DevTools), the action buttons at the bottom of the screen are cut off by the bottom navigation bar. Only the top portion of one button is visible - the button text/label cannot be read.

**What's Visible:**
- "Suspender Proveedor" button - partially visible
- Second red button - **completely hidden/cut off** (cannot see what it says)

**Steps to Reproduce:**

1. As Admin, go to Admin → Proveedores
2. Click on a provider to view details
3. Open Chrome DevTools (F12)
4. Toggle device toolbar (Ctrl+Shift+M)
5. Select "iPhone SE" or similar small viewport
6. Scroll to bottom of provider details
7. **BUG:** Action buttons are cut off by bottom nav:
   - One button partially visible (only top edge)
   - Second button completely hidden

**Expected Behavior:**

All action buttons should be fully visible and clickable:
- Proper spacing above bottom navigation
- Buttons should not be cut off on any viewport
- Consider sticky footer or scrollable content area

**Actual Behavior:**

- Bottom action buttons overflow behind navigation
- Cannot see full button text on at least one button
- Cannot click the hidden button
- Admin cannot perform critical actions on mobile

**Proposed Fix:**

Option A: Add bottom padding to content area:
```css
.provider-details-content {
  padding-bottom: 120px; /* Space for buttons + nav */
}
```

Option B: Sticky action buttons above nav:
```css
.provider-action-buttons {
  position: sticky;
  bottom: 80px; /* Height of bottom nav */
  background: white;
  padding: 16px;
  border-top: 1px solid #eee;
}
```

Option C: Move buttons to top of detail view or use dropdown menu

**Viewports Affected:**

- iPhone SE (375x667) - confirmed broken
- Likely affects most mobile viewports
- May affect tablets in portrait mode

**Related Files (Likely):**

- `src/app/admin/providers/[id]/page.tsx`
- Provider details component/modal
- Admin layout CSS
- Bottom navigation component

**Impact:**

- **User Impact:** Admin cannot perform provider actions on mobile
- **Business Impact:** Cannot suspend/manage providers from phone
- **Accessibility:** Critical functionality inaccessible
- **Severity:** High - hidden button could be important action (delete? ban?)

---

### BUG-021: Provider Cancel Offer Shows Error But Actually Succeeds

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Computer 2 (Provider role) |
| **Test Step** | Ad-hoc testing - Provider offer cancellation |
| **URL/Route** | `/provider/offers` or offer detail page |
| **Type** | Error Handling / UX Confusion |

**Description:**

When a provider cancels an offer, the system shows an **error message** ("Solo puedes cancelar ofertas pendientes") but the cancellation **actually succeeds**. This is confirmed because:
1. Provider sees error message ❌
2. Offer still appears in consumer's view (stale UI - see BUG-022)
3. When consumer tries to accept the offer, they get "Esta oferta ya no está disponible" ✅

The offer WAS cancelled, but the provider received an error instead of success feedback.

**Steps to Reproduce:**

1. Consumer creates a water request
2. Provider submits an offer for the request
3. Offer appears on consumer's view ✅
4. Provider tries to cancel the offer
5. **BUG:** Error message: "Solo puedes cancelar ofertas pendientes"
6. Provider thinks cancellation failed
7. Consumer tries to accept the "available" offer
8. Consumer gets: "Error al seleccionar oferta: esta oferta ya no está disponible"
9. **PROOF:** The offer WAS actually cancelled despite the error message

**The Real Problem:**

```
Provider clicks "Cancel Offer"
         ↓
Backend: Successfully cancels offer ✅
         ↓
Frontend: Shows ERROR message ❌  ← BUG
         ↓
Provider: "My cancel failed, offer still active"
         ↓
Consumer: Sees stale offer (BUG-022)
         ↓
Consumer: Tries to accept → "No longer available"
```

**Expected Behavior:**

When provider cancels offer:
1. Backend cancels offer ✅ (working)
2. Frontend shows SUCCESS message: "Oferta cancelada exitosamente"
3. Offer disappears from provider's list
4. Offer disappears from consumer's view (realtime update)

**Actual Behavior:**

1. Backend cancels offer ✅ (working)
2. Frontend shows ERROR message ❌ (broken)
3. Offer may or may not disappear from provider's list
4. Offer remains visible to consumer until they interact (BUG-022)

**Potential Root Causes:**

1. **Incorrect error handling** - Success response being treated as error
2. **Status check timing** - Checking status AFTER cancellation completes
3. **Race condition** - Status already changed when check runs
4. **Wrong status value** - Checking for wrong "pending" status string

**Example Code Issue (Hypothetical):**

```typescript
// BUGGY CODE - checks status after cancellation
const cancelOffer = async (offerId) => {
  await supabase.from('offers').update({ status: 'cancelled' }).eq('id', offerId);

  // BUG: This check happens AFTER we just changed the status!
  const { data: offer } = await supabase.from('offers').select('status').eq('id', offerId).single();

  if (offer.status !== 'pending') {
    throw new Error('Solo puedes cancelar ofertas pendientes'); // Always throws now!
  }

  return { success: true };
};
```

**Related Files (Likely):**

- `src/lib/actions/offers.ts` - Offer cancellation logic
- Provider offers component
- Error handling in cancel action

**Impact:**

- **User Impact:** Provider confused by false error, thinks action failed
- **Trust Impact:** System appears unreliable
- **UX Impact:** Major confusion about actual state of offer

---

### BUG-022: Cancelled Offer Remains Visible to Consumer (Stale UI)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Priority** | P1 |
| **Device** | Android Phone (Consumer role) |
| **Test Step** | Ad-hoc testing - Related to BUG-021 |
| **URL/Route** | Consumer request detail / offer selection page |
| **Type** | Realtime Sync / Stale Data |

**Description:**

When a provider cancels their offer (BUG-021), the offer remains visible in the consumer's view. The consumer can still see the offer and attempt to interact with it. Only when the consumer tries to accept the offer do they receive an error message "Esta oferta ya no está disponible".

This is a realtime subscription / stale data issue - the consumer's UI is not updating when offer status changes.

**Related to:** BUG-021 (Provider cancel shows error but succeeds)

**The Flow:**

```
1. Provider cancels offer
         ↓
2. Backend: Offer cancelled ✅
         ↓
3. Consumer UI: Still shows offer ❌ (stale)
         ↓
4. Consumer clicks "Accept"
         ↓
5. Error: "Esta oferta ya no está disponible"
```

**Steps to Reproduce:**

1. Consumer creates water request
2. Provider submits offer
3. Offer visible to consumer ✅
4. Provider cancels offer (sees error per BUG-021, but it succeeds)
5. Consumer's view: **Offer still visible** ← BUG
6. Consumer tries to accept the visible offer
7. Error message: "Esta oferta ya no está disponible"
8. Offer finally disappears (after interaction/error)

**Expected Behavior:**

When a provider cancels their offer:
1. Offer should disappear from consumer's view immediately (realtime)
2. OR offer should show "Cancelled" / "No disponible" status
3. Consumer should NOT be able to interact with cancelled offers
4. Realtime subscription should update UI automatically

**Actual Behavior:**

- Cancelled offer remains visible to consumer
- No visual indication that offer is no longer valid
- Consumer can attempt to accept cancelled offer
- Error only shown after consumer tries to interact
- Confusing UX - offer appears available but isn't

**Potential Root Causes:**

1. **Missing Supabase Realtime subscription** - Consumer's offer list not subscribed to changes
2. **Subscription filter issue** - Not listening for status changes to 'cancelled'
3. **No invalidation trigger** - Cache not invalidated when offer cancelled
4. **Optimistic UI not reversed** - If using optimistic updates, not handling remote changes

**Investigation Checklist:**

- [ ] Check if consumer offer list has Realtime subscription
- [ ] Verify subscription filters include status changes
- [ ] Check if React Query/SWR cache is being invalidated
- [ ] Test if navigating away and back shows correct state

**Proposed Fix:**

Option A: Add/fix Realtime subscription:
```typescript
// In consumer offer list component
useEffect(() => {
  const subscription = supabase
    .channel('offers')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'offers',
      filter: `request_id=eq.${requestId}`
    }, (payload) => {
      // Update local state when offers change
      if (payload.new.status === 'cancelled') {
        setOffers(prev => prev.filter(o => o.id !== payload.new.id));
      }
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [requestId]);
```

Option B: Poll for updates (less ideal):
```typescript
// Refetch offers every 10 seconds
const { data: offers } = useQuery(['offers', requestId], fetchOffers, {
  refetchInterval: 10000
});
```

**Related Files (Likely):**

- Consumer request detail / offer list component
- `src/hooks/use-realtime-offers.ts` (if exists)
- Offer data fetching logic
- Supabase Realtime subscriptions

**Impact:**

- **User Impact:** Consumer confused by stale offers
- **Trust Impact:** System appears unreliable - shows unavailable options
- **UX Impact:** Wasted clicks and error messages for invalid offers
- **Pattern:** May affect other realtime data (requests, status, etc.)

---

### BUG-023: [Title]

*Template for additional bugs*

| Field | Value |
|-------|-------|
| **Severity** |  |
| **Priority** |  |
| **Device** |  |
| **Test Step** |  |
| **URL/Route** |  |

**Description:**


**Steps to Reproduce:**

1.

**Expected Behavior:**


**Actual Behavior:**


---

## Epic Proposal: Consumer Request Flow Fixes

Based on bugs discovered during live testing, recommend creating an epic:

### Epic: Fix Consumer Water Request Flow (Mobile)

**Objective:** Resolve all blockers preventing consumers from completing water requests on mobile devices.

**Stories to Create:**

1. **Story: Fix Map Rendering on Location Pinpoint Screen**
   - Investigate and fix map not loading
   - Ensure Google Maps/Leaflet properly initializes
   - Handle API key configuration

2. **Story: Restore Header/Navigation on Location Screen**
   - Determine if full-screen mode is intentional
   - If intentional, ensure "back" button is prominently visible
   - If not intentional, fix layout to show header/nav

3. **Story: Add Error Handling for Map Load Failures**
   - Show user-friendly message if map fails to load
   - Provide fallback (manual address entry?)
   - Log errors for debugging

---

## Session Log

| Time | Action | Result |
|------|--------|--------|
| 19:50 | Started Test 1 - Consumer creates request | In progress |
| 19:50 | Step 1.1-1.2 completed | Passed |
| 19:50 | Step 1.3 - Location pinpoint | **BUG-001** (map tiles not rendering, but continued) |
| -- | Step 1.4-1.10 - Complete request flow | Passed (workaround used) |
| -- | Step 1.11-1.13 - Provider verifies request | Passed |
| -- | Step 1.14-1.15 - Admin verifies request | **BUG-002** (stale data, required hard refresh) |
| -- | **CHECKPOINT 1 COMPLETE** | Request visible on all 3 devices |
| -- | Started Test 2 - Provider submits offer | In progress |
| -- | Step 2.1 - View request details | **BUG-003** (UX overload - needs redesign for drivers) |
| -- | Step 2.2-2.5 - Submit offer | Passed |
| -- | Step 2.6 - Success message | **BUG-004** (no icon, poor contrast on toast) |
| -- | Step 2.7-2.8 - Verify offer in "Mis Ofertas" | (pending) |
| -- | Step 2.9-2.10 - Consumer sees offer | Passed (visible in app) |
| -- | Step 2.9-2.10 - Push notification | **BUG-005** (no push notification received) |
| -- | Step 2.11 - Check offer details | Passed |
| -- | Step 2.12-2.13 - Admin verifies offer | **BUG-006** (no sorting), **BUG-007** (click intermittent) |
| -- | **CHECKPOINT 2 COMPLETE** | Offer submitted and visible to consumer |
| -- | Started Test 3 - Consumer accepts offer | In progress |
| -- | Step 3.1-3.4 - Consumer accepts offer | Passed |
| -- | Step 3.5-3.7 - Provider verifies acceptance | Passed (status visible), **BUG-008** (no push notification) |
| -- | Step 3.8-3.11 - Admin verifies status | (pending) |
| -- | **CHECKPOINT 3 COMPLETE** | Offer accepted, delivery assigned |
| -- | Started Test 4 - Provider completes delivery | In progress |
| -- | Step 4.1 - Navigate to active delivery | **BUG-009** (missing "En Camino"), **BUG-010** (not driver-friendly) |
| -- | Step 3.8-3.11 - Admin verifies status change | **BUG-011** (Admin status out of sync - shows delivered, should show accepted) |
| -- | Step 4.2-4.5 - Provider marks as delivered | Passed |
| -- | Step 4.6 - Verify earnings/commission | **BUG-012** (No screenshot upload for commission payment proof) |
| -- | Step 4.7-4.9 - Consumer verifies delivery | Status visible ✅, **BUG-013** (no push notification) |
| -- | Step 4.7-4.9 - Rating/review option | **BUG-014** (No rating system implemented) |
| -- | Step 4.7-4.9 - Dispute option | **BUG-015** (No way to dispute), **BUG-016** (Admin needs resolution tools) |
| -- | **CHECKPOINT 4 COMPLETE** | Delivery flow works, but missing: push, rating, dispute system |
| -- | Step 4.10-4.13 - Admin verifies final state | Status visible, **BUG-017** (Finance navigation/aggregation issues) |
| -- | Started Test 5 - Push notifications | In progress |
| -- | Step 5.1-5.6 - Provider push setup & test | Passed ✅ |
| -- | Step 5.7-5.13 - Consumer push setup & test | Passed ✅, **BUG-018** (icon is blank placeholder) |
| -- | **CHECKPOINT 5 COMPLETE** | Push notifications WORK - icon needs fix |
| -- | **KEY INSIGHT** | BUG-005/008/013 are TRIGGER issues, not push infrastructure |
| -- | Started Test 9 - Admin operations | In progress |
| -- | Step 9.3 - Verify providers | **BUG-020** (Action buttons cut off on mobile viewport) |
| -- | Ad-hoc - Provider cancel offer | **BUG-021** (Shows error but succeeds), **BUG-022** (Stale offer visible to consumer) |

---

*Document created: 2025-12-30*
*Last updated: 2025-12-30 19:50*
