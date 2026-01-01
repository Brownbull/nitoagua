# Epic 12.7: Manual Testing Bug Fixes - Technical Context

## Overview

This document provides the technical context for implementing bug fixes discovered during Round 1 live multi-device testing. It maps each bug to specific files, identifies root causes, and provides implementation guidance.

## Architecture Summary

The codebase uses:
- **Framework:** Next.js 14+ with App Router
- **Backend:** Supabase (PostgreSQL + Realtime + Auth + Storage)
- **State:** React hooks (custom realtime hooks)
- **Notifications:** Sonner (toasts) + Web Push (VAPID)
- **Maps:** Leaflet/react-leaflet
- **Styling:** TailwindCSS
- **Icons:** Lucide-react

---

## Bug-to-File Mapping

### Phase 1: Critical Fixes (P0/P1)

#### BUG-001: Map Tiles Not Rendering
**Status:** Bug in existing implementation

| Item | Details |
|------|---------|
| **Files** | `src/components/consumer/location-pinpoint.tsx`, `src/components/consumer/location-pinpoint-wrapper.tsx` |
| **Dependencies** | react-leaflet, leaflet, leaflet/dist/leaflet.css |
| **Root Cause** | Likely CSS not loading, tile layer config, or container sizing |
| **Fix Pattern** | Verify CSS import, check TileLayer URL, ensure MapContainer has explicit height |

#### BUG-005, 008, 013: Push Notification Triggers
**Status:** Implementation exists but triggers may not fire

| Item | Details |
|------|---------|
| **Files** | `src/lib/push/send-push.ts`, `src/lib/push/trigger-push.ts`, `src/lib/actions/offers.ts`, `src/lib/actions/delivery.ts` |
| **Trigger Functions** | `triggerNewOfferPush()`, `triggerOfferAcceptedPush()`, `triggerDeliveryCompletedPush()` |
| **Call Sites** | offers.ts:643, offers.ts:1239, offers.ts:1469 |
| **Root Cause** | Trigger calls may be missing, failing silently, or VAPID not configured |
| **Fix Pattern** | Add logging, verify VAPID config, ensure trigger calls exist at transaction points |

#### BUG-007: Admin Orders Click Fails
**Status:** Bug in existing implementation

| Item | Details |
|------|---------|
| **Files** | `src/app/admin/orders/page.tsx`, `src/components/admin/orders-table.tsx` |
| **Root Cause** | Click handler on table rows may not work, navigation broken |
| **Fix Pattern** | Check onClick handlers, verify router.push, add loading states |

#### BUG-011: Admin Status Out of Sync
**Status:** Realtime subscription issue

| Item | Details |
|------|---------|
| **Files** | `src/hooks/use-realtime-orders.ts`, `src/app/admin/orders/[id]/page.tsx` |
| **Channels** | "admin-orders", "admin-offers" |
| **Root Cause** | Subscription not connected, router.refresh() not updating, or channel misconfigured |
| **Fix Pattern** | Verify channel subscription, check isConnected state, ensure proper cleanup |

#### BUG-015: Consumer Dispute Option
**Status:** NOT IMPLEMENTED

| Item | Details |
|------|---------|
| **Required Files** | `supabase/migrations/XXXXXX_create_disputes_table.sql`, `src/lib/actions/disputes.ts`, `src/components/consumer/dispute-dialog.tsx` |
| **Integration Point** | Consumer request tracking page after delivery |
| **Fix Pattern** | Create disputes table, add RLS policies, build dispute form, integrate in tracking |

#### BUG-016: Admin Dispute Resolution
**Status:** NOT IMPLEMENTED (depends on BUG-015)

| Item | Details |
|------|---------|
| **Required Files** | `src/app/admin/disputes/page.tsx`, `src/components/admin/dispute-resolution.tsx` |
| **Integration Point** | Admin sidebar, new route |
| **Fix Pattern** | Create admin disputes page, resolution actions, status updates |

#### BUG-020: Admin Responsive UI
**Status:** CSS/responsive issue

| Item | Details |
|------|---------|
| **Files** | `src/components/admin/provider-detail-panel.tsx` |
| **Root Cause** | Buttons cut off on smaller screens |
| **Fix Pattern** | Add responsive classes, flex-wrap, or stack buttons vertically on mobile |

#### BUG-021, 022: Offer Cancellation Flow
**Status:** Logic error + missing realtime

| Item | Details |
|------|---------|
| **Files** | `src/lib/actions/offers.ts` (withdrawOffer at line 841), consumer offer list components |
| **BUG-021 Root Cause** | Status check happens AFTER update, always fails |
| **BUG-022 Root Cause** | Missing realtime subscription on consumer offer list |
| **Fix Pattern** | Check status BEFORE update, add consumer-side realtime subscription |

---

### Phase 2: Medium Priority (P2)

#### BUG-002, 006, 017: Admin Panel UX
**Status:** Multiple UX issues

| Item | Details |
|------|---------|
| **Files** | `src/app/admin/page.tsx`, `src/components/admin/admin-sidebar.tsx`, `src/app/admin/orders/page.tsx` |
| **Issues** | Stale data (no auto-refresh), no date sorting, navigation confusing |
| **Fix Pattern** | Add polling/realtime, implement sort controls, improve nav hierarchy |

#### BUG-003, 010: Provider UX
**Status:** UX improvements needed

| Item | Details |
|------|---------|
| **Files** | `src/app/provider/requests/[id]/page.tsx`, `src/app/provider/deliveries/[id]/page.tsx` |
| **Issues** | Too much info on request detail, delivery page not driver-friendly |
| **Fix Pattern** | Simplify layouts, prioritize key info, add large action buttons |

#### BUG-009: En Camino Status
**Status:** Status transition may be missing

| Item | Details |
|------|---------|
| **Files** | `src/lib/actions/delivery.ts`, `src/components/shared/status-badge.tsx` |
| **Status Value** | "en_transit" |
| **Trigger Function** | `triggerInTransitPush()` at trigger-push.ts:185 |
| **Fix Pattern** | Add "Start Delivery" action that sets en_transit, verify status badge displays it |

#### BUG-012: Commission Screenshot Upload
**Status:** Partial - upload may be missing

| Item | Details |
|------|---------|
| **Files** | `src/components/admin/settlement-dashboard.tsx`, `src/components/admin/verify-payment-modal.tsx` |
| **Storage** | Supabase Storage bucket needed |
| **Fix Pattern** | Add file upload component, store in Supabase Storage, link to payment record |

#### BUG-014: Rating/Review System
**Status:** NOT IMPLEMENTED

| Item | Details |
|------|---------|
| **Required Files** | `supabase/migrations/XXXXXX_create_ratings_table.sql`, `src/lib/actions/ratings.ts`, `src/components/consumer/rating-dialog.tsx`, `src/components/shared/rating-stars.tsx` |
| **Integration Points** | After delivery complete, provider profile, offer cards |
| **Fix Pattern** | Create ratings table with trigger for avg calculation, rating UI, display on offers |

---

### Phase 3: Polish (P3)

#### BUG-004: Toast Contrast
**Status:** Styling issue

| Item | Details |
|------|---------|
| **Files** | `src/components/ui/sonner.tsx` |
| **Root Cause** | Success toast has low contrast colors |
| **Fix Pattern** | Update toast variant styles for WCAG AA compliance |

#### BUG-018: Push Notification Icon Blank
**Status:** PWA config issue

| Item | Details |
|------|---------|
| **Files** | `src/app/manifest.ts`, `public/sw.js`, `public/icons/` |
| **Root Cause** | Icon not specified in push options or missing file |
| **Fix Pattern** | Add icon property to showNotification options in sw.js |

#### BUG-019: Request Submit Flash
**Status:** State timing issue

| Item | Details |
|------|---------|
| **Files** | `src/components/consumer/request-form.tsx`, `src/app/(consumer)/request/page.tsx` |
| **Root Cause** | Form state resets before navigation completes |
| **Fix Pattern** | Navigate before resetting state, or use loading overlay during transition |

---

## Database Changes Required

### New Tables

```sql
-- disputes table (BUG-015, 016)
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES water_requests(id) ON DELETE CASCADE,
  consumer_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'rejected')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ratings table (BUG-014)
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES water_requests(id) ON DELETE CASCADE,
  consumer_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, consumer_id)
);

-- payment_proofs table (BUG-012)
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id),
  settlement_period TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Profile extensions (BUG-014)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
```

---

## Implementation Priority Order

Based on dependencies and impact:

1. **12.7-2** Push Notification Triggers - High user impact, 3 bugs
2. **12.7-8** Offer Cancellation Flow - Error handling + realtime pattern
3. **12.7-4** Admin Status Sync - Realtime pattern (reuse)
4. **12.7-1** Map Tile Rendering - Likely simple CSS fix
5. **12.7-3** Admin Orders Click - Debug + fix
6. **12.7-7** Admin Responsive UI - CSS fixes
7. **12.7-5** Consumer Dispute Option - New feature (creates table)
8. **12.7-6** Admin Dispute Resolution - Depends on 12.7-5

Then P2 stories, then P3.

---

## Testing Considerations

- **VAPID Keys:** Must be configured in production env
- **Push Subscriptions:** Test users need valid subscriptions
- **Realtime:** Supabase Realtime must be enabled
- **PWA Icons:** Must exist in `/public/icons/`
- **Round 2 Testing:** Execute [live-multi-device-test-plan-round2.md](../../testing/manual/plans/live-multi-device-test-plan-round2.md) after all fixes

---

## Key Files Index

| Category | Files |
|----------|-------|
| Push Notifications | `src/lib/push/send-push.ts`, `src/lib/push/trigger-push.ts` |
| Offers | `src/lib/actions/offers.ts` |
| Delivery | `src/lib/actions/delivery.ts` |
| Admin Orders | `src/app/admin/orders/`, `src/components/admin/orders-table.tsx` |
| Admin Providers | `src/components/admin/provider-detail-panel.tsx` |
| Realtime Hooks | `src/hooks/use-realtime-*.ts` |
| Map | `src/components/consumer/location-pinpoint.tsx` |
| Consumer Request | `src/components/consumer/request-form.tsx`, `src/app/(consumer)/request/` |
| Provider Pages | `src/app/provider/requests/`, `src/app/provider/deliveries/` |
| PWA | `src/app/manifest.ts`, `public/sw.js` |
| Toast | `src/components/ui/sonner.tsx` |
