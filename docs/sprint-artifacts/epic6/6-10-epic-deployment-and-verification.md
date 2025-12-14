# Story 6.10: Epic Deployment & Verification

| Field | Value |
|-------|-------|
| **Story ID** | 6-10 |
| **Epic** | Epic 6: Admin Operations Panel |
| **Title** | Epic Deployment & Verification |
| **Status** | drafted |
| **Priority** | P1 (High) |
| **Points** | 2 |
| **Sprint** | TBD |

---

## User Story

As a **developer**,
I want **to deploy all Epic 6 changes through the git branching workflow and verify production with test users**,
So that **the admin operations panel is live and working for platform operators**.

---

## Background

Epic 6 introduces the Admin Operations Panel with the following features:
- Story 6-1: Admin authentication via Google OAuth with allowlist
- Story 6-2: Offer system configuration (validity bounds, timeout)
- Story 6-3: Provider verification queue
- Story 6-4: Provider directory with status management
- Story 6-5: Cash settlement tracking
- Story 6-6: Orders management with offer history
- Story 6-7: Offer expiration cron job
- Story 6-8: Operations dashboard with metrics
- Story 6-9: Pricing configuration (water prices, commission, urgency surcharge)

This story ensures all changes are properly committed, merged through the branching strategy (develop -> staging -> main), and verified working in production with test admin users.

---

## Acceptance Criteria

1. **AC6.10.1**: All Epic 6 changes committed to develop branch
2. **AC6.10.2**: Develop merged to staging, preview deployment verified
3. **AC6.10.3**: Staging merged to main, production deployment triggered
4. **AC6.10.4**: Production deployment successful (Vercel build passes)
5. **AC6.10.5**: Admin login works with allowlisted email in production
6. **AC6.10.6**: Admin dashboard loads with operations metrics
7. **AC6.10.7**: Offer system configuration page allows changing settings
8. **AC6.10.8**: Provider verification queue is accessible
9. **AC6.10.9**: Provider directory shows provider list with filters
10. **AC6.10.10**: Cash settlement tracking page loads
11. **AC6.10.11**: Orders management page shows orders with details
12. **AC6.10.12**: Pricing configuration page allows price/commission changes
13. **AC6.10.13**: Cron job for offer expiration is configured in Vercel
14. **AC6.10.14**: No regression in consumer flows (request, tracking)
15. **AC6.10.15**: No regression in supplier flows (dashboard, accept, deliver)

---

## Tasks / Subtasks

- [ ] **Task 1: Pre-deployment Checks**
  - [ ] Run `npm run lint` - ensure no errors
  - [ ] Run `npm run build` - ensure build succeeds
  - [ ] Run relevant E2E tests - ensure admin tests pass
  - [ ] Verify admin login works locally with test admin
  - [ ] Verify all admin pages accessible locally

- [ ] **Task 2: Git Commit & Push to Develop**
  - [ ] Review all changes with `git status` and `git diff`
  - [ ] Stage all Epic 6 changes (new files + modified files)
  - [ ] Create commit with descriptive message for Epic 6
  - [ ] Push to develop branch
  - [ ] Verify Vercel preview deployment for develop branch

- [ ] **Task 3: Merge to Staging**
  - [ ] Checkout staging branch
  - [ ] Merge develop into staging
  - [ ] Push staging branch
  - [ ] Verify Vercel preview deployment for staging
  - [ ] Test staging deployment manually:
    - [ ] Admin login with test admin email works
    - [ ] Admin dashboard shows metrics
    - [ ] Settings page loads and saves
    - [ ] Pricing page loads and saves

- [ ] **Task 4: Merge to Main (Production)**
  - [ ] Checkout main branch
  - [ ] Merge staging into main
  - [ ] Push main branch
  - [ ] Monitor Vercel production deployment

- [ ] **Task 5: Production Verification with Test Users**
  - [ ] Navigate to https://nitoagua.vercel.app/admin
  - [ ] Test admin login with allowlisted test user (admin@nitoagua.cl)
  - [ ] Verify admin dashboard loads with metrics (AC6.10.6)
  - [ ] Test offer system configuration:
    - [ ] Navigate to /admin/settings
    - [ ] Change offer validity default
    - [ ] Save and verify persistence
  - [ ] Test pricing configuration:
    - [ ] Navigate to /admin/pricing
    - [ ] Change a water price value
    - [ ] Verify confirmation dialog appears
    - [ ] Save and verify persistence
    - [ ] Verify "Precios actualizados" toast
  - [ ] Test provider verification queue:
    - [ ] Navigate to /admin/verification
    - [ ] Verify page loads (may be empty if no pending providers)
  - [ ] Test provider directory:
    - [ ] Navigate to /admin/providers
    - [ ] Verify provider list loads
    - [ ] Test search/filter functionality
  - [ ] Test cash settlement:
    - [ ] Navigate to /admin/settlement
    - [ ] Verify page loads with summary cards
  - [ ] Test orders management:
    - [ ] Navigate to /admin/orders
    - [ ] Verify orders list loads
    - [ ] Test filters (status, date range)
    - [ ] Click an order to verify detail view
  - [ ] Verify cron job configuration:
    - [ ] Check Vercel dashboard for /api/cron/expire-offers
    - [ ] Verify CRON_SECRET is configured

- [ ] **Task 6: Regression Testing**
  - [ ] Test consumer guest flow (create water request)
  - [ ] Test consumer registered flow (login, history, profile)
  - [ ] Test supplier flow (login, dashboard, accept request)
  - [ ] Verify no console errors on any page

- [ ] **Task 7: Document Deployment**
  - [ ] Update story with deployment notes
  - [ ] Note any issues encountered and resolutions
  - [ ] Record production URLs verified

---

## Technical Notes

### Environment Variables Required in Production

| Variable | Purpose | Status |
|----------|---------|--------|
| `CRON_SECRET` | Auth for cron endpoints | Verify configured |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Should exist |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Should exist |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Should exist |

### Admin Test Users

| Email | Password | Purpose |
|-------|----------|---------|
| admin@nitoagua.cl | admin.123 | Primary test admin |

### Branching Strategy

```
develop → staging → main
   ↓         ↓        ↓
preview   preview  production
```

### Production URL

https://nitoagua.vercel.app

---

## Dependencies

- **Requires:** Stories 6-1 through 6-9 (all Epic 6 stories)
- **Enables:** Epic 7 (Provider Onboarding) can begin after admin panel is live

---

## File List

| Action | File |
|--------|------|
| N/A | Deployment story - no code changes |

---

## Dev Agent Record

### Debug Log

*To be filled during implementation*

### Completion Notes

*To be filled after deployment verification*

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created for Epic 6 deployment | Gabe |
