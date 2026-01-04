# Epic 12.8: Round 2 Manual Testing Bug Fixes

| Field | Value |
|-------|-------|
| **Epic ID** | 12.8 |
| **Title** | Round 2 Manual Testing Bug Fixes |
| **Status** | backlog |
| **Priority** | P0 (Critical) |
| **Type** | Bug Fixes / Security |
| **Source** | Live Multi-Device Testing Round 2 (2026-01-04) |

## Overview

This epic addresses 12 open bugs discovered during Round 2 live multi-device testing of NitoAgua PWA v2.7.0. The most critical issues involve push notification security (notifications going to wrong users) and UI/UX improvements across admin and provider panels.

**Bug Report:** [docs/testing/manual/bugs/live-test-bugs-round2-2026-01-04.md](../../testing/manual/bugs/live-test-bugs-round2-2026-01-04.md)

## Key Findings Summary

### Critical: Push Notification Security (BUG-R2-003, R2-004, R2-017)
Push notifications are being sent to wrong users when accounts are switched on devices. This is a **security vulnerability** - users can receive notifications about OTHER users' orders. Root cause: missing logout cleanup, loose database constraints, no endpoint deduplication.

### Critical: Role Isolation Failure (BUG-R2-004)
Admin users can access consumer views via notification clicks, bypassing role-based routing. Multi-tenant isolation is compromised.

### Provider "Mis Ofertas" Issues (BUG-R2-009, R2-018)
Provider offers page shows wrong default filter and displays completed deliveries as active. Same root cause: using `offers.status` instead of `water_requests.status`.

### Admin Panel UX (BUG-R2-007, R2-008, R2-010, R2-011)
Multiple mobile UX issues: cluttered layouts, missing provider ratings, filter text cut off.

### UI Polish (BUG-R2-005, R2-006, R2-016)
Minor visual issues: notification icons, toast styling, font inconsistencies.

---

## Bug Inventory by Priority

### P0 - Critical (3 bugs)

| Bug ID | Title | Category | Story |
|--------|-------|----------|-------|
| BUG-R2-003 | Push notifications bound to device instead of user | Push Security | 12.8-1 |
| BUG-R2-004 | Admin can access consumer view via notification click | Role Isolation | 12.8-2 |
| BUG-R2-017 | Push notifications sent to wrong user on shared devices | Push Security | 12.8-1 |

### P1 - High (1 bug)

| Bug ID | Title | Category | Story |
|--------|-------|----------|-------|
| BUG-R2-007 | Admin orders page mobile UX - cluttered layout | Admin UX | 12.8-4 |

### P2 - Medium (5 bugs)

| Bug ID | Title | Category | Story |
|--------|-------|----------|-------|
| BUG-R2-008 | Admin order detail - status badge clutters header | Admin UX | 12.8-4 |
| BUG-R2-009 | Provider "Mis Ofertas" - wrong default filter and status | Provider UX | 12.8-3 |
| BUG-R2-010 | Admin Providers page - filter layout, missing email | Admin UX | 12.8-5 |
| BUG-R2-011 | Admin Providers - missing ratings on cards and detail | Admin UX | 12.8-5 |
| BUG-R2-018 | Provider "Mis Ofertas" shows completed deliveries | Provider UX | 12.8-3 |

### P3 - Low (3 bugs)

| Bug ID | Title | Category | Story |
|--------|-------|----------|-------|
| BUG-R2-005 | Push notification status bar icon grey circle | PWA Polish | 12.8-6 |
| BUG-R2-006 | Rating popup font inconsistency | UI Polish | 12.8-6 |
| BUG-R2-016 | Toast notifications - inconsistent font and icons | UI Polish | 12.8-6 |

---

## Dependency Analysis

```
12.8-1 (Push Security) ──┬──> 12.8-2 (Role Isolation)
                         │    [R2-004 partially depends on push fix]
                         │
                         └──> All other stories (can run in parallel after)

12.8-3 (Provider Offers) ──> Independent (no dependencies)

12.8-4 (Admin Orders UX) ──> Independent (no dependencies)

12.8-5 (Admin Providers) ──> Independent (no dependencies)

12.8-6 (UI Polish) ──> Independent (lowest priority)
```

**Recommended Order:**
1. **12.8-1** - Push Notification Security (CRITICAL - fixes security vulnerability)
2. **12.8-2** - Role Isolation Guards (CRITICAL - prevents unauthorized access)
3. **12.8-3** - Provider Offers Fix (Medium - affects provider workflow)
4. **12.8-4** - Admin Orders UX (High - mobile usability)
5. **12.8-5** - Admin Providers UX (Medium - adds ratings visibility)
6. **12.8-6** - UI Polish (Low - visual improvements)

---

## Story Breakdown

### Phase 1: Security Fixes (P0) - MUST DO FIRST

| Story ID | Title | Bugs Addressed | Priority | Points |
|----------|-------|----------------|----------|--------|
| 12.8-1 | Push Notification Security & Logout Cleanup | BUG-R2-003, R2-017 | P0 | 8 |
| 12.8-2 | Role-Based Route Guards | BUG-R2-004 | P0 | 5 |

### Phase 2: Core Fixes (P1/P2)

| Story ID | Title | Bugs Addressed | Priority | Points |
|----------|-------|----------------|----------|--------|
| 12.8-3 | Provider "Mis Ofertas" Fix | BUG-R2-009, R2-018 | P2 | 5 |
| 12.8-4 | Admin Orders Mobile UX | BUG-R2-007, R2-008 | P1 | 5 |
| 12.8-5 | Admin Providers UX & Ratings | BUG-R2-010, R2-011 | P2 | 5 |

### Phase 3: Polish (P3)

| Story ID | Title | Bugs Addressed | Priority | Points |
|----------|-------|----------------|----------|--------|
| 12.8-6 | UI Polish (Toasts, Icons, Fonts) | BUG-R2-005, R2-006, R2-016 | P3 | 3 |

**Total Points:** 31

---

## Technical Context

### Affected Components

**Push Notification System:**
- `src/lib/actions/push-subscription.ts` - Subscription management
- `src/lib/push/send-push.ts` - Push sender
- `src/app/provider/settings/sign-out-button.tsx` - Provider logout
- `src/app/consumer-profile/page.tsx` - Consumer logout
- `src/components/admin/admin-logout-button.tsx` - Admin logout
- `public/sw.js` - Service worker

**Role Guards:**
- `src/middleware.ts` - Route middleware
- `src/app/provider/layout.tsx` - Provider layout
- `src/app/admin/layout.tsx` - Admin layout
- `src/app/(consumer)/layout.tsx` - Consumer layout

**Provider Offers:**
- `src/app/provider/offers/page.tsx` - Offers listing
- `src/lib/actions/offers.ts` - Offers queries
- `src/components/provider/offer-card.tsx` - Offer display

**Admin Panel:**
- `src/app/admin/orders/page.tsx` - Orders page
- `src/components/admin/orders-table.tsx` - Orders table
- `src/app/admin/providers/page.tsx` - Providers page
- `src/components/admin/provider-card.tsx` - Provider cards
- `src/app/admin/providers/[id]/page.tsx` - Provider detail

**UI Polish:**
- `src/components/ui/sonner.tsx` - Toast config
- `public/icons/` - Notification icons
- `src/app/manifest.ts` - PWA manifest

### Database Changes

**Migration: Endpoint Uniqueness (Optional)**
```sql
-- Make push subscription endpoint globally unique
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_endpoint_key;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);
```

---

## Success Criteria

### Regression Testing (Round 3)
After all stories are complete, execute regression tests to verify:

1. **All 12 open bugs are fixed** - Pass regression tests
2. **No new bugs introduced** - Smoke test all flows
3. **Push security verified** - Multi-user/device test passes
4. **Role isolation verified** - Cross-role access blocked

### Metrics
- 0 P0/P1 bugs remaining
- Push notification delivery to correct user: 100%
- Role isolation: 100% enforced
- Round 3 Test pass rate > 98%

---

## Notes

### Security Priority
Stories 12.8-1 and 12.8-2 are **SECURITY CRITICAL** and must be completed before production deployment. The push notification bug allows:
- Privacy breach: Users see others' order notifications
- Authorization bypass: Links go to unauthorized pages

### Out of Scope
- Complete admin panel redesign (future epic)
- New features beyond bug fixes
- Performance optimizations

### Related Documentation
- [Round 2 Bug Report](../../testing/manual/bugs/live-test-bugs-round2-2026-01-04.md)
- [Round 2 Test Plan](../../testing/manual/plans/live-multi-device-test-plan-round2.md)
- [Epic 12.7 (Round 1 Fixes)](../epic12.7/epic-12.7.md)
