# Provider Flow UX Audit Report

**Date:** 2025-12-10
**Reviewed:** `docs/ux-mockups/01-consolidated-provider-flow.html`
**Participants:** Full BMAD Agent Team (Party Mode Roast Session)

---

## Executive Summary

The provider (repartidor) flow mockups show solid UI foundation with good visual differentiation (orange theme) from the consumer app. However, significant flow gaps and missing screens were identified. This document captures all feedback with specific recommendations and clarifications from stakeholders.

---

> **Note:** The request assignment model uses **Consumer-Choice Offer Model**. See Sections 2-3 in [01-consolidated-provider-flow.html](../ux-mockups/01-consolidated-provider-flow.html) for mockups.

---

## Key Clarifications from Session

| Topic | Clarification |
|-------|---------------|
| **Account Model** | Single Gmail = single role (Consumer OR Provider OR Admin). No multi-role accounts. Different Gmail needed for each role. |
| **Request Assignment** | Consumer-Choice model - Request broadcast to all providers, providers submit offers, consumer selects. |
| **Monetization** | Flat percentage commission per transaction (NOT subscription). Commission included in consumer price transparently. |
| **Photo Confirmation** | OPTIONAL - trust-based system. Provider confirms delivery; photos encouraged but not enforced to reduce friction. |
| **Payments** | Mix of cash-on-delivery AND bank transfer. Providers receiving cash must pay platform commission separately. |
| **Withdrawals** | Bank transfer, 1-2 days processing time. |
| **Maps/Navigation** | Current screens are placeholders. Route optimization is future feature. Basic map shows delivery location only. |
| **Rating Enforcement** | Threshold system: warnings → temporary ban → longer ban → permanent ban. Managed via admin panel. |

---

## Screen-by-Screen Audit

### 1. Provider Login

**Status:** Good foundation.

#### Issue 1.1: Missing Provider Registration/Onboarding Flow (CRITICAL)
**Current:** Only shows login screen with Google auth.
**Problem:** No flow for NEW providers to register and get verified.
**Recommendation:** Create separate onboarding flow (see "New Screens Required" section).

#### Issue 1.2: "Soy consumidor" Button
**Current:** Allows switch to consumer app.
**Clarification:** This is correct - but user needs DIFFERENT Gmail account for consumer role.
**Recommendation:** Add tooltip or help text: "Usa otra cuenta de Google para ser consumidor"

---

### 2. Provider Dashboard

#### Issue 2.1: Information Overload (CRITICAL)
**Current:** 6 stats crammed into dashboard: Pedidos hoy, Ganado hoy, Rating, Entregas mes, Ingresos mes, Completadas.
**Problem:** Provider is driving/working - needs quick glance, not data analysis.
**Recommendation:**
- Move ALL stats to separate "Estadísticas" screen
- Dashboard should show ONLY:
  1. Availability toggle (PROMINENT)
  2. Current/pending request (if any)
  3. Quick access to next delivery

#### Issue 2.2: Availability Toggle Buried
**Current:** Small toggle under welcome text.
**Problem:** This is THE most important control - should be dominant.
**Recommendation:**
- Make toggle LARGE and unmissable (like Uber's "Go Online")
- Show current status prominently: "DISPONIBLE" in big green text
- Consider full-width toggle at top of screen

#### Issue 2.3: Request Assignment Model Not Reflected
**Current:** Shows list of requests implying browse-and-claim model.
**Clarification:** System is PUSH model (Uber-style) with 3-5 min acceptance window.
**Recommendation:**
- Remove "browse" style list
- Show ONE incoming request at a time with countdown timer
- "Nuevo pedido - Acepta en 4:32" style urgency indicator
- If no pending request: "Esperando pedidos..." empty state

---

### 3. Request Detail & Accept/Reject

#### Issue 3.1: Missing Earnings Display (CRITICAL)
**Current:** Shows order details but NOT what provider will earn.
**Problem:** Providers need to see earnings BEFORE accepting.
**Recommendation:**
- Add prominent earnings display: "Ganarás: $X,XXX (después de comisión)"
- Show breakdown: Precio total - Comisión plataforma (X%) = Tu ganancia
- This builds trust and transparency

#### Issue 3.2: Acceptance Countdown Not Shown
**Current:** Static accept/reject buttons.
**Clarification:** 3-5 minute window to accept before cycling to next provider.
**Recommendation:**
- Add visible countdown timer: "Responde en 3:45"
- Show what happens if expired: "Si no respondes, el pedido pasará a otro repartidor"

#### Issue 3.3: "Rechazar" Button Styling
**Current:** Red outline button.
**Problem:** Red implies error/danger. Declining a job isn't wrong.
**Recommendation:** Change to neutral gray outline. Reserve red for actual errors.

---

### 4. Delivery in Progress & Completion

#### Issue 4.1: Photo Confirmation Clarity
**Current:** Shows "Tomar foto de entrega" as optional.
**Clarification:** This is INTENTIONAL - trust-based system, minimal bureaucracy.
**Status:** KEEP as optional.
**Recommendation:** Add microcopy: "Opcional: La foto ayuda a resolver disputas"

#### Issue 4.2: Navigation Handoff Unclear
**Current:** Shows Google Maps embed mockup.
**Problem:** Is this in-app navigation or handoff to Google Maps app?
**Recommendation:**
- For MVP: Hand off to Google Maps app (simpler)
- Add "Abrir en Google Maps" button
- Show address clearly for manual navigation

#### Issue 4.3: "I've Arrived" Action Missing
**Current:** No intermediate state between "En camino" and "Completar entrega".
**Recommendation:**
- Add "He llegado" button when near destination
- This notifies consumer and starts delivery handoff

#### Issue 4.4: Completion Success Screen
**Current:** Shows "Entrega completada!" with earnings and stats.
**Status:** Good dopamine hit for provider.
**Recommendation:**
- Add "Ver siguiente pedido" as primary action
- Show daily progress: "13 de 15 entregas hoy" (if goals feature added)

---

### 5. Earnings & History

#### Issue 5.1: Currency Display Confusion
**Current:** Shows "$52.5k" format.
**Problem:** "k" notation is confusing for Chilean pesos.
**Recommendation:** Display full numbers: "$52,500" (with thousands separator)

#### Issue 5.2: Commission Visibility
**Current:** Not shown in earnings breakdown.
**Recommendation:**
- Show gross earnings vs net (after commission)
- Example: "Total pedidos: $65,000 | Comisión (X%): $6,500 | Tu ganancia: $58,500"

#### Issue 5.3: Cash vs Transfer Tracking
**Current:** Only shows general earnings.
**Clarification:** Some payments are cash-on-delivery, others bank transfer.
**Recommendation:**
- Separate tracking: "Efectivo recibido: $X" vs "Por transferir: $Y"
- For cash payments: Show "Comisión pendiente: $Z" (provider owes platform)

---

### 6. Provider Settings

#### Issue 6.1: Work Capacity Configuration Missing (NEW REQUIREMENT)
**Current:** Basic profile and preferences.
**Clarification:** Providers need to configure:
- Working hours (e.g., 10 hours/day)
- Water delivery capacity (liters per day)
- Refill schedule/needs
**Recommendation:** Add "Configuración de trabajo" section with:
- Horario disponible (calendar/time picker)
- Capacidad máxima (liters)
- Paradas de recarga (if needed)

#### Issue 6.2: Redundant Notifications Toggle
**Current:** Notifications toggle in settings AND separate Notificaciones screen.
**Recommendation:** Remove toggle from settings. Keep only notification icon in header.

#### Issue 6.3: Rating/Standing Display
**Current:** Shows rating (4.9 stars) but no context.
**Clarification:** Low ratings lead to warnings → temp ban → permanent ban.
**Recommendation:**
- Show rating status: "Tu calificación está en buen estado" (green)
- If warning: "Tu calificación está baja. Mejora para evitar suspensión" (yellow)
- Link to detailed rating breakdown and policy

---

### 7. Mapa Completo (Full Map View)

#### Issue 7.1: Route Optimization
**Current:** Shows scattered pins without suggested order.
**Clarification:** Route optimization is FUTURE feature. Current is placeholder.
**Recommendation:**
- For MVP: Simple map with delivery location(s)
- Add label: "Optimización de rutas próximamente"
- Future: Integrate route optimization with capacity system

#### Issue 7.2: Center FAB Purpose
**Current:** Location icon in center of bottom nav.
**Clarification:** Should be quick access to current/next delivery with map.
**Recommendation:**
- Rename/redesign: Make it clearly "Mi entrega actual"
- When tapped: Show current delivery details + map
- If no active delivery: "Sin entregas activas" state

---

### 8. Notificaciones

**Status:** Good coverage of notification types.

#### Issue 8.1: Notification Types Shown
**Current:** Nuevo pedido, Entrega completada, Calificación, Pago recibido, Actualización app.
**Status:** Comprehensive.
**Recommendation:** Add notification for:
- Rating warning ("Tu calificación bajó a X")
- Account status changes
- Commission payment reminders (for cash transactions)

---

### 9. Editar Perfil

**Status:** Standard profile editing.

#### Issue 9.1: Vehicle/Certification Info
**Current:** Only shows personal info editing.
**Problem:** Providers have vehicle and certification info to maintain.
**Recommendation:**
- Add section: "Documentos y vehículo"
- Show verification status for each document
- Allow re-upload if documents expire

---

### 10. Reportar Problema

#### Issue 10.1: Post-Report Flow Unclear
**Current:** Shows problem types (Cliente no disponible, Dirección incorrecta, etc.)
**Problem:** What happens AFTER reporting? Does delivery cancel? Does provider get paid?
**Recommendation:**
- Add clear outcome for each problem type:
  - "Cliente no disponible" → Delivery cancelled, no payment, no penalty to provider
  - "Dirección incorrecta" → Option to contact customer or cancel
- Show next steps after submitting report

---

### 11. Retiros (Withdrawals)

#### Issue 11.1: Payout Schedule
**Current:** Shows withdrawal form but no timeline info.
**Clarification:** Bank transfer, 1-2 days processing.
**Recommendation:**
- Show processing time: "Transferencias toman 1-2 días hábiles"
- Show pending amount vs available to withdraw
- For providers with cash transactions: Show "Comisión pendiente" that must be settled

#### Issue 11.2: Cash Commission Payment
**Current:** No flow for providers to pay commission on cash transactions.
**Recommendation:**
- Add "Pagar comisión pendiente" section
- Show: "Comisiones por cobrar: $X,XXX"
- Payment methods: Bank transfer to platform account
- Clear deadline/reminder system

---

### 12. Suscripción (Subscription)

#### Issue 12.1: Remove Subscription Model
**Current:** Shows Gratis vs Pro plans with different commission rates.
**Clarification:** Business model changed to flat commission only (no subscriptions).
**Recommendation:**
- REMOVE this screen entirely
- OR repurpose as "Comisiones" info screen explaining the flat rate
- Show: "Comisión de la plataforma: X% por entrega"

---

## New Screens Required

### A. Provider Onboarding/Registration Flow (CRITICAL)

Complete flow for new providers:

**Screen A1: Welcome/Role Selection**
- "¿Quieres ser repartidor de agua?"
- Requirements overview (vehicle, permits, etc.)
- "Comenzar registro" CTA

**Screen A2: Personal Information**
- Name, phone, email
- Google account linking
- Profile photo

**Screen A3: Document Upload**
- Cédula de identidad (ID)
- Licencia de conducir (if applicable)
- Permisos sanitarios (health permits)
- Certificaciones de agua
- Vehicle information (type, capacity, photos)

**Screen A4: Bank Account Setup**
- Account details for withdrawals
- Account verification

**Screen A5: Verification Pending**
- "Tu solicitud está en revisión"
- Expected timeline (24-48 hours)
- What to expect: admin review, possible requests for more info

**Screen A6: Verification Result**
- Approved: Welcome + tutorial
- Rejected: Reason + how to reapply
- More info needed: Specific requests

### B. Work Capacity Configuration

**Screen B1: Working Hours Setup**
- Weekly calendar with time slots
- "Configura tu horario de trabajo"
- Per-day availability toggles

**Screen B2: Delivery Capacity**
- Maximum liters per day
- Vehicle capacity
- Estimated deliveries based on average order size

**Screen B3: Refill Locations/Schedule**
- Where do you refill water?
- Estimated time for refill
- System calculates effective delivery time

### C. Weekly Request Planning (Future Feature - Placeholder)

**Screen C1: Upcoming Requests Index**
- List of available requests for the week
- Filter by date, zone, volume
- "Reservar" button to lock in requests

**Screen C2: My Schedule**
- Calendar view of locked-in deliveries
- Capacity remaining per day
- Edit/release reservations

### D. Commission Management (for Cash Transactions)

**Screen D1: Pending Commissions**
- List of cash transactions
- Total commission owed
- "Pagar ahora" CTA

**Screen D2: Payment Methods**
- Bank transfer to platform
- Payment confirmation

### E. Account Standing/Warnings

**Screen E1: My Standing**
- Current rating with breakdown
- Account status (Good/Warning/Suspended)
- Tips to improve rating

**Screen E2: Warning Details (if applicable)**
- Why you received a warning
- What to do to resolve
- Timeline for review

### F. Statistics Dashboard (Moved from Main Dashboard)

**Screen F1: Statistics Overview**
- All the stats previously on dashboard
- Period selector (today/week/month)
- Charts and trends

### G. Offline Mode Screens

**Screen G1: Offline Indicator**
- "Sin conexión - Modo offline"
- Show: Scheduled deliveries still visible
- Show: Addresses cached

**Screen G2: Sync Status**
- When back online: "Sincronizando datos..."
- Conflict resolution if any

---

## Priority Matrix

| Priority | Issue | Screen | Effort | Status |
|----------|-------|--------|--------|--------|
| P0 (Critical) | Provider onboarding flow | New Screens | High | Pending |
| P0 (Critical) | Show earnings before accept | Request Detail | Low | ✅ Done |
| P0 (Critical) | Remove subscription model | Suscripción | Low | ✅ Done |
| P1 (High) | Simplify dashboard (stats → separate) | Dashboard | Medium | ✅ Done |
| P1 (High) | Make availability toggle prominent | Dashboard | Low | ✅ Done |
| P1 (High) | Add acceptance countdown | Request Detail | Low | ✅ Done |
| P1 (High) | Show commission in earnings | Earnings | Medium | ✅ Done |
| P1 (High) | Work capacity configuration | Settings | Medium | ✅ Done |
| P2 (Medium) | Cash commission payment flow | New Screen | Medium | ✅ Done |
| P2 (Medium) | Full currency display (no "k") | All screens | Low | ✅ Done |
| P2 (Medium) | Problem report outcomes | Reportar Problema | Low | ✅ Done |
| P2 (Medium) | Account standing/warnings UI | New Screen | Medium | ✅ Done |
| P2 (Medium) | "He llegado" action | Delivery | Low | ✅ Done |
| P3 (Future) | Weekly request planning | New Screens | High | Pending |
| P3 (Future) | Route optimization | Mapa | High | Pending |
| P3 (Future) | Daily/weekly goals | Dashboard | Medium | Pending |
| P3 (Future) | Offline mode | Multiple | High | Pending |

**Note:** Mockups updated on 2025-12-11. See [provider-mockup-updates-2025-12-11.md](provider-mockup-updates-2025-12-11.md) for details.

---

## Business Model Decisions Documented

1. **Commission Model:** Flat percentage per transaction (exact % TBD)
2. **No Subscriptions:** Remove Gratis/Pro tiers
3. **Payment Types:** Cash-on-delivery AND bank transfer supported
4. **Cash Handling:** Providers receiving cash must settle commission with platform separately
5. **Withdrawal Timeline:** 1-2 business days via bank transfer

---

## Summary of Key Decisions Made

1. **Dashboard redesign**: Move stats to separate screen, focus on availability + current delivery
2. **Request model**: Push-based (Uber style) with 3-5 min acceptance window
3. **Earnings transparency**: Show commission breakdown before accepting
4. **Photo confirmation**: Keep optional (trust-based)
5. **Subscription removal**: Flat commission only
6. **Account model**: Single Gmail = single role (no multi-role)
7. **Work capacity**: New feature for hours/capacity/refill configuration
8. **Weekly planning**: Future feature with placeholder
9. **Rating enforcement**: Threshold system with warnings/bans

---

## Next Steps

1. ~~UX Designer updates provider mockups based on this audit~~ ✅ **DONE** (2025-12-11)
2. UX Designer creates provider onboarding flow mockups
3. UX Designer creates admin panel mockups (separate audit)
4. Architect reviews for technical feasibility
5. PM creates/updates PRD with provider features
6. Team defines epics/stories for implementation

### Remaining Mockup Work

| Flow | Status | Notes |
|------|--------|-------|
| Consumer Flow | ✅ Complete | All audit items addressed, Tailwind UI upgrade done |
| Provider Flow | ✅ Complete | All P0-P2 items done including Problem Report outcomes |
| Admin Flow | ✅ Complete | All 11 MVP screens done (2025-12-11) |

### Provider Mockup File Structure

| File | Purpose | Status |
|------|---------|--------|
| `01-consolidated-provider-flow.html` | Master provider flow (Login, Dashboard, Offer Submission, Delivery, Earnings, Settings, Onboarding) | ✅ Complete |

**Note:** All provider flows are consolidated in `01-consolidated-provider-flow.html`. Sections 2-3 cover the Consumer-Choice offer submission flow.

---

*Generated by BMAD Party Mode Roast Session*
*Updated: 2025-12-12 - Provider mockups complete, consolidated*
