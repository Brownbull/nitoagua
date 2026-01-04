# Live Multi-Device Testing - Round 2 (Post-Bug Fixes)

**Version:** 2.7.0 (Epic 12.7 complete)
**Created:** 2025-12-31
**Updated:** 2026-01-04
**Prerequisites:** All P1-P3 bugs from Round 1 fixed (Epic 12.7)
**Test Environment:** Production (https://nitoagua.vercel.app)

---

## Overview

This test plan builds on Round 1 findings and focuses on:

1. **Regression testing** - Verify all Round 1 bugs are fixed
2. **New features validation** - Rating system, En Camino status, dispute flow
3. **Intensive concurrent testing** - Stress test with all 3 roles simultaneously
4. **Production profile testing** - Real accounts, real data scenarios
5. **Edge cases & error handling** - Boundary conditions and failure modes

---

## Test Environment Setup

### Device Configuration

| Device | Role | Account Type | Purpose |
|--------|------|--------------|---------|
| Computer 1 | Admin | admin@nitoagua.cl | Admin operations, monitoring |
| Computer 2 | Provider | supplier@nitoagua.cl | Offer management, deliveries |
| Android Phone | Consumer | consumer@nitoagua.cl | Request flow, mobile UX |
| **Optional: Computer 3** | Provider 2 | (create new) | Competing provider scenarios |
| **Optional: Tablet/2nd Phone** | Consumer 2 | (create new) | Concurrent consumer scenarios |

### Production Profile Testing (Test 12)

| Device | Role | Account | Notes |
|--------|------|---------|-------|
| Computer 1 | Admin | Production admin | Real admin account |
| Computer 2 | Provider | Real provider | Verified provider account |
| Phone | Consumer | Your personal account | Real consumer experience |

---

## Pre-Test Checklist

### Bug Fix Verification (Before Starting)

All Round 1 bugs have been fixed in Epic 12.7 (v2.7.0):

**P1 Critical (All Fixed):**
- [x] BUG-001: Map tiles rendering - Fixed with CSS height chain + invalidateSize()
- [x] BUG-005: Consumer push notification on new offer - Triggers verified, E2E tests added
- [x] BUG-007: Admin orders click intermittent failure - Debounced realtime refresh
- [x] BUG-008: Provider push notification on offer accepted - Triggers verified
- [x] BUG-011: Admin panel status out of sync - Enum fix (assigned→accepted)
- [x] BUG-013: Consumer push notification on delivery complete - Triggers verified
- [x] BUG-015: Consumer dispute option - Dispute form with multiple types
- [x] BUG-016: Admin dispute resolution tools - Full dispute management system
- [x] BUG-020: Admin provider details buttons cut off - Flex layout + sticky footer
- [x] BUG-021: Provider cancel offer error handling - Fixed error response handling
- [x] BUG-022: Cancelled offer stale UI - Realtime subscription added

**P2 Medium (All Fixed):**
- [x] BUG-002: Admin orders stale data - Refresh button + realtime subscription
- [x] BUG-003: Provider request detail UX - Hero cards, driver-friendly layout
- [x] BUG-006: Admin orders sorting - Sort dropdown with direction toggle
- [x] BUG-009: Provider "En Camino" status - Full timeline with status button
- [x] BUG-010: Provider delivery details UX - Single-screen layout, no scrolling
- [x] BUG-012: Commission screenshot upload - Storage bucket + upload form
- [x] BUG-014: Rating/review system - 5-star rating + optional comments
- [x] BUG-017: Admin finances navigation - "Hoy" button + pending payments visible

**P3 Low (All Fixed):**
- [x] BUG-004: Offer toast styling - WCAG AA compliant (7:1 contrast ratio)
- [x] BUG-018: Push notification icon - Maskable + any purposes in manifest
- [x] BUG-019: Request submit flash - Full-screen overlay during submit

---

## Part A: Regression Testing (Verify Bug Fixes)

### Test 1: Consumer Request Flow (BUG-001, BUG-019)

**Objective:** Verify map rendering and request submission work correctly

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1.1 | Log in as Consumer on phone | Home page loads | | |
| 1.2 | Tap "Pedir Agua" | Request form opens | | |
| 1.3 | Select Comuna | Location pinpoint screen appears | | |
| 1.4 | **VERIFY:** Map tiles render | Map shows OpenStreetMap tiles (BUG-001 fix) | | |
| 1.5 | **VERIFY:** Can drag/tap to set location | Pin moves, coordinates update | | |
| 1.6 | Confirm location, complete all steps | Reach final step | | |
| 1.7 | Click "Enviar Pedido" | **VERIFY:** Full-screen overlay appears (BUG-019 fix) | | |
| 1.8 | **VERIFY:** No flash to Step 1 | Smooth transition to success | | |

**CHECKPOINT 1:** Map works, request submits cleanly

---

### Test 2: Push Notification Triggers (BUG-005, BUG-008, BUG-013, BUG-018)

**Objective:** Verify push notifications are sent for all critical events

**Setup:** Ensure push notifications enabled on all devices

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 2.1 | Consumer creates request | Request created | | |
| 2.2 | Provider submits offer | Offer submitted | | |
| 2.3 | **VERIFY:** Consumer receives push notification | "Nueva oferta" notification (BUG-005 fix) | | |
| 2.4 | **VERIFY:** Push icon shows NitoAgua logo | Not blank (BUG-018 fix) | | |
| 2.5 | Consumer accepts offer | Offer accepted | | |
| 2.6 | **VERIFY:** Provider receives push notification | "Oferta aceptada" notification (BUG-008 fix) | | |
| 2.7 | Provider marks "En Camino" | Status updated | | |
| 2.8 | **VERIFY:** Consumer sees "En Camino" notification | In-app or push | | |
| 2.9 | Provider marks as delivered | Delivery completed | | |
| 2.10 | **VERIFY:** Consumer receives push notification | "Entrega completada" notification (BUG-013 fix) | | |

**CHECKPOINT 2:** All push notifications working with proper icon

---

### Test 3: Admin Panel Sync & Sorting (BUG-002, BUG-006, BUG-007, BUG-011)

**Objective:** Verify admin panel shows correct, real-time data with sorting

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 3.1 | Admin opens Orders page | Orders list loads | | |
| 3.2 | **VERIFY:** Sort dropdown visible | Can sort by date/status (BUG-006 fix) | | |
| 3.3 | Click sort toggle (newest/oldest) | Order changes | | |
| 3.4 | Consumer creates new request | Request created | | |
| 3.5 | **VERIFY:** Refresh button available | Can manually refresh (BUG-002 fix) | | |
| 3.6 | Click refresh or wait for realtime | New request appears | | |
| 3.7 | Click on the new request row | | | |
| 3.8 | **VERIFY:** Details open on first click | No intermittent failure (BUG-007 fix) | | |
| 3.9 | Provider submits offer, consumer accepts | Offer accepted | | |
| 3.10 | **VERIFY:** Admin shows correct status "Aceptado" | Not "Entregado" (BUG-011 fix) | | |
| 3.11 | Provider marks as delivered | Delivery completed | | |
| 3.12 | **VERIFY:** Admin shows "Entregado" status | Status updates correctly | | |

**CHECKPOINT 3:** Admin panel syncs correctly with sorting

---

### Test 4: Provider Flow - En Camino & UX (BUG-003, BUG-009, BUG-010, BUG-021, BUG-022)

**Objective:** Verify provider UX improvements, En Camino status, and offer cancellation

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 4.1 | Consumer creates request | Request created | | |
| 4.2 | Provider views request details | | | |
| 4.3 | **VERIFY:** Driver-friendly layout | Hero cards, earnings prominent (BUG-003 fix) | | |
| 4.4 | Provider submits offer | Offer created | | |
| 4.5 | Provider cancels the offer | | | |
| 4.6 | **VERIFY:** Success message shown | Not error (BUG-021 fix) | | |
| 4.7 | **VERIFY:** Offer disappears from consumer view | Realtime update (BUG-022 fix) | | |
| 4.8 | Consumer creates new request | For delivery test | | |
| 4.9 | Provider submits offer, consumer accepts | Delivery assigned | | |
| 4.10 | Provider views active delivery | | | |
| 4.11 | **VERIFY:** "En Camino" button present | New status option (BUG-009 fix) | | |
| 4.12 | **VERIFY:** Single-screen layout | No scrolling needed (BUG-010 fix) | | |
| 4.13 | Provider clicks "En Camino" | Status updates | | |
| 4.14 | **VERIFY:** Consumer sees "En Camino" status | Timeline shows update | | |
| 4.15 | Provider marks as delivered | Delivery completed | | |

**CHECKPOINT 4:** Provider flow improved with En Camino

---

### Test 5: Rating & Review System (BUG-014)

**Objective:** Verify rating system works after delivery

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 5.1 | Complete a delivery (from Test 4) | Delivery marked complete | | |
| 5.2 | Consumer views completed delivery | History page | | |
| 5.3 | **VERIFY:** Rating option visible | Star rating UI (BUG-014 fix) | | |
| 5.4 | Tap on completed request | Rating form appears | | |
| 5.5 | Select 5 stars | Stars highlight | | |
| 5.6 | Add optional comment | "Excelente servicio" | | |
| 5.7 | Submit rating | Rating saved | | |
| 5.8 | **VERIFY:** Thank you message appears | Rating confirmed | | |
| 5.9 | Admin views provider profile | | | |
| 5.10 | **VERIFY:** Rating appears on provider | Average rating visible | | |

**CHECKPOINT 5:** Rating system working

---

### Test 6: Consumer Dispute Flow (BUG-015, BUG-016)

**Objective:** Verify dispute creation and admin resolution

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 6.1 | Start new delivery flow, complete it | Delivery done | | |
| 6.2 | Consumer views completed delivery | | | |
| 6.3 | **VERIFY:** "Reportar Problema" option visible | Dispute option (BUG-015 fix) | | |
| 6.4 | Consumer clicks report problem | Dispute form opens | | |
| 6.5 | Select dispute type | "No recibí mi pedido" or other | | |
| 6.6 | Add description (optional) | Explain issue | | |
| 6.7 | Submit dispute | Dispute created | | |
| 6.8 | **VERIFY:** Confirmation shown to consumer | Dispute submitted message | | |
| 6.9 | Admin navigates to Disputes | Admin panel | | |
| 6.10 | **VERIFY:** Dispute visible in admin panel | Dispute tools (BUG-016 fix) | | |
| 6.11 | Admin views dispute details | Order timeline visible | | |
| 6.12 | Admin resolves dispute | Choose consumer/provider favor | | |
| 6.13 | **VERIFY:** Consumer notified of resolution | Push notification | | |
| 6.14 | **VERIFY:** Provider notified of resolution | Push notification | | |

**CHECKPOINT 6:** Dispute system working end-to-end

---

### Test 7: Admin UI Fixes (BUG-017, BUG-020)

**Objective:** Verify admin UI improvements

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 7.1 | Admin opens Finances/Settlement page | | | |
| 7.2 | **VERIFY:** "Hoy" quick button visible | Jump to today (BUG-017 fix) | | |
| 7.3 | Click "Hoy" button | Jumps to current date | | |
| 7.4 | View yearly aggregation | | | |
| 7.5 | **VERIFY:** Pending payments count visible | Summary card shows pending | | |
| 7.6 | Admin opens Provider details | Any provider | | |
| 7.7 | Open Chrome DevTools, set mobile viewport | iPhone SE or similar | | |
| 7.8 | Scroll to action buttons | | | |
| 7.9 | **VERIFY:** All buttons fully visible | Not cut off (BUG-020 fix) | | |
| 7.10 | **VERIFY:** Can click all action buttons | Functional | | |

**CHECKPOINT 7:** Admin UI improvements verified

---

### Test 8: Commission Payment with Screenshot (BUG-012)

**Objective:** Verify commission payment with screenshot upload

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 8.1 | Complete a delivery as provider | Delivery done, commission owed | | |
| 8.2 | Provider navigates to Earnings | Pending commission visible | | |
| 8.3 | Click "Pagar Comisión" | | | |
| 8.4 | **VERIFY:** Confirmation modal appears | Not instant payment (BUG-012 fix) | | |
| 8.5 | **VERIFY:** Screenshot upload option visible | Can attach proof | | |
| 8.6 | Upload test screenshot | Image attached | | |
| 8.7 | Add reference number | Reference saved | | |
| 8.8 | Confirm payment | Payment recorded | | |
| 8.9 | Admin views pending payments | | | |
| 8.10 | **VERIFY:** Screenshot visible in admin | Proof attached, can view | | |

**CHECKPOINT 8:** Commission payment flow complete with proof

---

### Test 9: Toast Styling (BUG-004)

**Objective:** Verify toast notifications have proper styling

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 9.1 | Provider submits offer | | | |
| 9.2 | **VERIFY:** Success toast styling | Green background, white text (BUG-004 fix) | | |
| 9.3 | **VERIFY:** Text is readable | High contrast (7:1 ratio) | | |
| 9.4 | Trigger error state (invalid input) | | | |
| 9.5 | **VERIFY:** Error toast styling | Red background, readable | | |

**CHECKPOINT 9:** Toast styling verified

---

## Part B: Intensive Concurrent Testing

### Test 10: Multi-Consumer Competition

**Setup:** 2 Consumers, 1 Provider, Admin monitoring

**Objective:** Test what happens when multiple consumers have active requests

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 10.1 | Consumer A creates request | Request visible | | |
| 10.2 | Consumer B creates request | Both requests visible to provider | | |
| 10.3 | Provider sees both requests | Can distinguish between them | | |
| 10.4 | Provider submits offer to Consumer A | Offer appears for A only | | |
| 10.5 | **VERIFY:** Consumer B doesn't see offer | Offer correctly targeted | | |
| 10.6 | Provider submits offer to Consumer B | Offer appears for B | | |
| 10.7 | Both consumers accept simultaneously | | | |
| 10.8 | **VERIFY:** No race condition | Both accepted correctly | | |
| 10.9 | Provider sees 2 active deliveries | Both visible, distinguishable | | |
| 10.10 | Provider completes A's delivery | A sees complete, B still active | | |
| 10.11 | Provider completes B's delivery | B sees complete | | |
| 10.12 | Admin sees both in order history | Correctly tracked | | |

**CHECKPOINT 10:** Multi-consumer handling works

---

### Test 11: Multi-Provider Competition

**Setup:** 1 Consumer, 2 Providers, Admin monitoring

**Objective:** Test competing offers from multiple providers

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 11.1 | Consumer creates request | Request visible to both providers | | |
| 11.2 | Provider A submits offer ($15,000) | Offer visible to consumer | | |
| 11.3 | Provider B submits offer ($14,000) | Both offers visible to consumer | | |
| 11.4 | **VERIFY:** Consumer sees both offers | Can compare prices/times | | |
| 11.5 | Consumer accepts Provider B (cheaper) | | | |
| 11.6 | **VERIFY:** Provider A's offer becomes unavailable | Automatically expired/rejected | | |
| 11.7 | **VERIFY:** Provider B notified of acceptance | Push notification works | | |
| 11.8 | Provider A tries to view the request | Should show request is taken | | |
| 11.9 | Provider B completes delivery | Delivery done | | |
| 11.10 | Admin sees which provider won | Tracking correct | | |

**CHECKPOINT 11:** Multi-provider competition works

---

### Test 12: Rapid Sequential Transactions

**Setup:** All 3 roles active simultaneously

**Objective:** Stress test with rapid sequential transactions

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 12.1 | Create 3 requests rapidly (30s apart) | All 3 created | | |
| 12.2 | Provider submits 3 offers rapidly | All 3 offers sent | | |
| 12.3 | **VERIFY:** Consumer sees all 3 | All visible | | |
| 12.4 | Consumer accepts all 3 rapidly | All accepted | | |
| 12.5 | **VERIFY:** Provider sees 3 active deliveries | All visible | | |
| 12.6 | Complete all 3 rapidly | All completed | | |
| 12.7 | **VERIFY:** No data corruption | All records correct | | |
| 12.8 | Admin sees all 3 in history | Correctly tracked | | |

**CHECKPOINT 12:** System handles rapid transactions

---

### Test 13: Edge Case - Offer Expires

**Setup:** Consumer, Provider, Admin

**Objective:** Test offer expiration flow

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 13.1 | Consumer creates request | Request created | | |
| 13.2 | Provider submits offer | Offer created with expiration | | |
| 13.3 | Note offer expiration time | Record the deadline | | |
| 13.4 | Consumer waits (don't accept) | Let offer expire | | |
| 13.5 | After expiration, consumer tries to accept | | | |
| 13.6 | **VERIFY:** Error message shown | "Oferta expirada" or similar | | |
| 13.7 | **VERIFY:** Offer shows as expired | Visual indication | | |
| 13.8 | Provider can submit new offer | Fresh offer possible | | |

**CHECKPOINT 13:** Offer expiration works

---

### Test 14: Edge Case - Request Timeout

**Setup:** Consumer, Admin

**Objective:** Test request timeout when no providers respond

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 14.1 | Consumer creates request | Request created | | |
| 14.2 | Wait for timeout period | No offers submitted | | |
| 14.3 | After timeout, check request status | | | |
| 14.4 | **VERIFY:** Consumer notified | Timeout notification | | |
| 14.5 | **VERIFY:** Request shows appropriate status | Expired/Cancelled state | | |
| 14.6 | Consumer can create new request | Not blocked | | |

**CHECKPOINT 14:** Request timeout works

---

### Test 15: Full Delivery Lifecycle with En Camino

**Setup:** Consumer, Provider, Admin

**Objective:** Test complete delivery lifecycle with new status

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 15.1 | Consumer creates request | Status: Pending | | |
| 15.2 | Provider submits offer | Status: Buscando | | |
| 15.3 | Consumer accepts offer | Status: Aceptado | | |
| 15.4 | **VERIFY:** Consumer sees delivery timeline | Shows all status changes | | |
| 15.5 | Provider clicks "En Camino" | Status: En Camino | | |
| 15.6 | **VERIFY:** Timeline updates for consumer | Shows "En Camino" with timestamp | | |
| 15.7 | Provider marks as delivered | Status: Entregado | | |
| 15.8 | **VERIFY:** Full timeline visible | All 4 statuses with timestamps | | |
| 15.9 | Consumer rates delivery | Rating recorded | | |
| 15.10 | Admin sees complete order history | All status changes logged | | |

**CHECKPOINT 15:** Complete lifecycle with timeline works

---

## Part C: Production Profile Testing

### Test 16: Real User Experience

**IMPORTANT:** This test uses real accounts and may create real data. Proceed carefully.

**Setup:**
- Your personal phone as Consumer (your real account)
- Real verified provider account (coordinate with a provider)
- Admin on computer

**Objective:** Experience the app exactly as real users do

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 16.1 | Log in with your real consumer account | Home loads | | |
| 16.2 | Create a real water request (small amount) | Request created | | |
| 16.3 | Wait for real provider to respond | | | |
| 16.4 | **OBSERVE:** Time to receive offer | Note: _____ minutes | | |
| 16.5 | **VERIFY:** Push notification received | Notification works | | |
| 16.6 | Evaluate offer (price, time, provider info) | Is info sufficient? | | |
| 16.7 | Accept offer | | | |
| 16.8 | **OBSERVE:** Time to "En Camino" | Note: _____ minutes | | |
| 16.9 | **VERIFY:** Timeline tracking works | Can see status progression | | |
| 16.10 | Receive actual water delivery | | | |
| 16.11 | Mark as complete / rate provider | | | |
| 16.12 | **OVERALL:** Rate the experience 1-10 | Note: _____ | | |

**Real User Experience Notes:**

**What felt good:**
1.
2.

**What felt frustrating:**
1.
2.

**What was confusing:**
1.
2.

**What was missing:**
1.
2.

---

## Summary & Next Steps

### Regression Test Results (Tests 1-9)

| Test | Status | Issues Found |
|------|--------|--------------|
| Test 1 - Consumer Request Flow | | |
| Test 2 - Push Notifications | | |
| Test 3 - Admin Sync & Sorting | | |
| Test 4 - Provider Flow & En Camino | | |
| Test 5 - Rating System | | |
| Test 6 - Dispute Flow | | |
| Test 7 - Admin UI Fixes | | |
| Test 8 - Commission Payment | | |
| Test 9 - Toast Styling | | |

### Concurrent Testing Results (Tests 10-15)

| Test | Status | Issues Found |
|------|--------|--------------|
| Test 10 - Multi-Consumer | | |
| Test 11 - Multi-Provider | | |
| Test 12 - Rapid Transactions | | |
| Test 13 - Offer Expiration | | |
| Test 14 - Request Timeout | | |
| Test 15 - Full Lifecycle | | |

### Production Test Insights (Test 16)

**Key Learnings:**
1.
2.
3.

---

## New Bugs Discovered (Round 2)

| ID | Title | Severity | Test | Status |
|----|-------|----------|------|--------|
| BUG-R2-001 | | | | Open |
| BUG-R2-002 | | | | Open |

*Add detailed bug reports below as discovered*

---

### BUG-R2-001: [Title]

| Field | Value |
|-------|-------|
| **Severity** |  |
| **Priority** |  |
| **Device** |  |
| **Test Step** |  |

**Description:**

**Steps to Reproduce:**

**Expected Behavior:**

**Actual Behavior:**

---

*Document created: 2025-12-31*
*Last updated: 2026-01-04*
*Version tested: 2.7.0*
