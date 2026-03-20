# Live Multi-Device Testing Plan

**Date:** 2025-12-30
**Version:** 2.4.0
**URL:** https://nitoagua.vercel.app

---

## Device Setup

| Device | Role | Email | Password |
|--------|------|-------|----------|
| 🖥️ **Computer 1** | Admin | admin@nitoagua.cl | `admin.123` |
| 💻 **Computer 2** | Provider (Supplier) | supplier@nitoagua.cl | `supplier.123` |
| 📱 **Android Phone** | Consumer | consumer@nitoagua.cl | `consumer.123` |

---

## Pre-Test Setup

### On Each Device

1. Open https://nitoagua.vercel.app
2. If already logged in with different account, log out first
3. Log in with the assigned role account
4. Verify you're on the correct dashboard:
   - **Admin:** `/admin/dashboard`
   - **Provider:** `/provider/requests` or `/provider`
   - **Consumer:** `/` (home page with "Pedir Agua" button)

### Verify Clean State

On **Computer 1 (Admin)**:
- [ ] Go to Admin → Pedidos (`/admin/orders`)
- [ ] Note any existing pending orders (we'll create a new one)

---

## Test 1: Consumer Creates Water Request

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Tap "Pedir Agua" button | Request form opens |
| 1.2 | Select Comuna (e.g., Villarrica) | Map centers on selected area |
| 1.3 | Tap on map to set delivery location | Pin appears, address shown |
| 1.4 | Enter quantity: `1000` liters | Price estimate updates |
| 1.5 | Select urgency: "Normal" | Price shown |
| 1.6 | Verify/enter phone number | Phone field populated |
| 1.7 | Select payment method | Payment option selected |
| 1.8 | Tap "Confirmar Pedido" | Loading indicator shows |
| 1.9 | **VERIFY:** Confirmation screen appears | ✅ Tracking code displayed |
| 1.10 | **RECORD:** Note the tracking code | Code: _____________ |

### 💻 Computer 2 (Provider) - Verify Request Appears

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.11 | Go to "Solicitudes" / Request Browser | Request list loads |
| 1.12 | **VERIFY:** New request appears | ✅ See consumer's request (1000L, Villarrica) |
| 1.13 | Check request details visible | Location, quantity, urgency shown |

### 🖥️ Computer 1 (Admin) - Verify in Admin Panel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.14 | Go to Admin → Pedidos | Orders list loads |
| 1.15 | **VERIFY:** New order appears | ✅ Status: "pending" or "searching" |

**✅ CHECKPOINT 1:** Request created and visible on all 3 devices

---

## Test 2: Provider Submits Offer

### 💻 Computer 2 (Provider)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Click on the consumer's request | Request detail page opens |
| 2.2 | Review request details | Address, quantity, urgency visible |
| 2.3 | Click "Hacer Oferta" | Offer form/dialog opens |
| 2.4 | **VERIFY:** Price auto-calculated | Price based on quantity shown |
| 2.5 | Click "Enviar Oferta" | Loading indicator |
| 2.6 | **VERIFY:** Success message | ✅ "Oferta enviada" |
| 2.7 | Go to "Mis Ofertas" | My offers list |
| 2.8 | **VERIFY:** New offer listed | ✅ Status: "active" or "pending" |

### 📱 Android Phone (Consumer) - Verify Offer Received

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.9 | On tracking/status screen, pull to refresh OR wait | Page updates |
| 2.10 | **VERIFY:** Offer appears | ✅ Provider's offer visible |
| 2.11 | Check offer details | Price, provider name shown |

### 🖥️ Computer 1 (Admin) - Verify Offer in System

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.12 | Refresh Admin → Pedidos | Order updates |
| 2.13 | **VERIFY:** Order shows offer count | ✅ "1 oferta" or similar |

**✅ CHECKPOINT 2:** Offer submitted and visible to consumer

---

## Test 3: Consumer Accepts Offer

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | On offer card, tap "Aceptar" | Confirmation dialog (if any) |
| 3.2 | Confirm acceptance | Loading indicator |
| 3.3 | **VERIFY:** Status changes | ✅ "Aceptado" / "En camino" |
| 3.4 | **VERIFY:** Provider info visible | Provider name, contact shown |

### 💻 Computer 2 (Provider) - Verify Offer Accepted

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.5 | On "Mis Ofertas" or dashboard, refresh | List updates |
| 3.6 | **VERIFY:** Offer status changed | ✅ "Aceptada" |
| 3.7 | **VERIFY:** Can see delivery details | Consumer address visible |

### 🖥️ Computer 1 (Admin) - Verify Status Change

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.8 | Refresh Admin → Pedidos | Order updates |
| 3.9 | **VERIFY:** Order status changed | ✅ "accepted" or "in_progress" |
| 3.10 | Click on order for details | Order detail view |
| 3.11 | **VERIFY:** Provider assigned | Provider name shown |

**✅ CHECKPOINT 3:** Offer accepted, delivery assigned

---

## Test 4: Provider Completes Delivery

### 💻 Computer 2 (Provider)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Navigate to active delivery | Delivery detail page |
| 4.2 | Click "Marcar como Entregado" | Confirmation dialog |
| 4.3 | Confirm delivery completion | Loading indicator |
| 4.4 | **VERIFY:** Success message | ✅ "Entrega completada" |
| 4.5 | Go to "Ganancias" / Earnings | Earnings dashboard |
| 4.6 | **VERIFY:** New earning recorded | ✅ Commission amount shown |

### 📱 Android Phone (Consumer) - Verify Delivery Complete

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.7 | Refresh tracking page | Status updates |
| 4.8 | **VERIFY:** Status shows delivered | ✅ "Entregado" |
| 4.9 | **VERIFY:** Can rate/review (if implemented) | Rating option appears |

### 🖥️ Computer 1 (Admin) - Verify Final State

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.10 | Refresh Admin → Pedidos | Order updates |
| 4.11 | **VERIFY:** Order status: delivered | ✅ Final status shown |
| 4.12 | Go to Admin → Finanzas (if available) | Financial dashboard |
| 4.13 | **VERIFY:** Commission recorded | Platform fee visible |

**✅ CHECKPOINT 4:** CHAIN-1 COMPLETE - Full transaction cycle verified

---

## Test 5: Push Notifications (Provider)

### 💻 Computer 2 (Provider)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Go to Settings → Notificaciones | Notification settings page |
| 5.2 | Toggle ON "Notificaciones Push" | Permission prompt |
| 5.3 | Allow notifications | Toggle turns green |
| 5.4 | **VERIFY:** Status shows "Push activo" | ✅ Green checkmark |
| 5.5 | Click "Probar" (test notification) | Test notification sent |
| 5.6 | **VERIFY:** Notification appears | ✅ "¡Las notificaciones están funcionando!" |

### 📱 Android Phone (Consumer) - Test Consumer Notifications

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.7 | Go to Settings (gear icon) | Settings page |
| 5.8 | Find Notificaciones section | Notification toggle visible |
| 5.9 | Toggle ON "Notificaciones Push" | Permission prompt |
| 5.10 | Allow notifications | Toggle turns green |
| 5.11 | **VERIFY:** Status shows "Push activo" | ✅ Green checkmark |
| 5.12 | Click "Probar" | Test notification |
| 5.13 | **VERIFY:** Notification appears | ✅ Notification shows |

**✅ CHECKPOINT 5:** Push notifications working on both devices

---

## Test 6: PWA Update Check (Android)

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Go to Settings → Instalación | Installation settings |
| 6.2 | Note current version | Should show 2.4.0 |
| 6.3 | Tap "Buscar actualizaciones" | Checking... |
| 6.4 | **VERIFY:** Shows "Estás al día" | ✅ No updates (we're on latest) |

**✅ CHECKPOINT 6:** PWA version detection working

---

## Test 7: Real-Time Updates (Cross-Device)

This test verifies Supabase Realtime is working.

### Setup

Have all three devices visible at once.

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Create a NEW water request | Follow steps 1.1-1.9 |
| 7.2 | Stay on tracking page | Keep page open |

### 💻 Computer 2 (Provider)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.3 | Have "Solicitudes" page open | Request list visible |
| 7.4 | **VERIFY:** New request appears WITHOUT refresh | ✅ Real-time update |
| 7.5 | Submit an offer | Offer sent |

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.6 | **VERIFY:** Offer appears WITHOUT refresh | ✅ Real-time notification |

**✅ CHECKPOINT 7:** Real-time updates working

---

## Test 8: Error Handling - Session Expiry

This tests the Epic 12.6 session handling fixes.

### 📱 Android Phone (Consumer)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Stay on app for 5+ minutes idle | Session may become stale |
| 8.2 | Try to perform an action (e.g., create request) | Action attempted |
| 8.3 | **VERIFY:** If session expired, redirects to login | ✅ Graceful redirect, NOT error message |
| 8.4 | Log back in | Return to app |
| 8.5 | Retry the action | Action succeeds |

**✅ CHECKPOINT 8:** Session expiry handled gracefully

---

## Test 9: Admin Operations

### 🖥️ Computer 1 (Admin)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Go to Admin → Proveedores | Provider list |
| 9.2 | Find test provider | Provider visible |
| 9.3 | Check provider status | Verified/Active status |
| 9.4 | Go to Admin → Configuración | Settings page |
| 9.5 | **VERIFY:** Can view/edit settings | Settings load correctly |
| 9.6 | Go to Admin → Dashboard | Main dashboard |
| 9.7 | **VERIFY:** Stats display correctly | Numbers/charts visible |

**✅ CHECKPOINT 9:** Admin functions working

---

## Summary Checklist

| Test | Status |
|------|--------|
| ✅ Test 1: Consumer creates request | ⬜ |
| ✅ Test 2: Provider submits offer | ⬜ |
| ✅ Test 3: Consumer accepts offer | ⬜ |
| ✅ Test 4: Provider completes delivery | ⬜ |
| ✅ Test 5: Push notifications | ⬜ |
| ✅ Test 6: PWA update check | ⬜ |
| ✅ Test 7: Real-time updates | ⬜ |
| ✅ Test 8: Session expiry handling | ⬜ |
| ✅ Test 9: Admin operations | ⬜ |

---

## Issue Log

| Test | Step | Issue Description | Severity |
|------|------|-------------------|----------|
| | | | |
| | | | |
| | | | |

---

## Notes

- **If something fails:** Note the exact step, take a screenshot if possible
- **Real-time may have delay:** Up to 5 seconds is acceptable
- **Push notifications:** May require app to be in background to receive
- **PWA on Android:** After update, may need to close/reopen app completely

---

*Test plan created 2025-12-30 for NitoAgua v2.4.0*
