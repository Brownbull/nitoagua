# Story 8.8: Epic Deployment & Verification

| Field | Value |
|-------|-------|
| **Story ID** | 8-8 |
| **Epic** | Epic 8: Provider Offer System |
| **Title** | Epic Deployment & Verification |
| **Status** | ready-for-dev |
| **Priority** | P1 (High) |
| **Points** | 2 |
| **Sprint** | TBD |

---

## User Story

As a **developer**,
I want **to deploy all Epic 8 changes through the git branching workflow and verify production with test users**,
So that **the provider offer system is live and working for verified providers**.

---

## Background

Epic 8 introduces the Provider Offer System with the following features:
- Story 8-1: Provider request browser with real-time updates
- Story 8-2: Submit offer on request with delivery window
- Story 8-3: Provider's active offers list with countdown timers
- Story 8-4: Withdraw pending offer
- Story 8-5: Offer acceptance notification (provider side)
- Story 8-6: Earnings dashboard with period selector
- Story 8-7: Cash commission settlement with receipt upload

This story ensures all changes are properly committed, merged through the branching strategy (develop → staging → main), feature branches deleted after successful merge to main, and verified working in production with test provider users.

---

## Acceptance Criteria

### Deployment Criteria

1. **AC8.8.1**: All Epic 8 changes committed to develop branch
2. **AC8.8.2**: Develop merged to staging, preview deployment verified
3. **AC8.8.3**: Staging merged to main, production deployment triggered
4. **AC8.8.4**: Production deployment successful (Vercel build passes)
5. **AC8.8.5**: Feature branches deleted after successful merge to main

### Provider Offer System Verification

6. **AC8.8.6**: Verified provider can access request browser at /provider/requests
7. **AC8.8.7**: Request browser shows pending requests in provider's service areas
8. **AC8.8.8**: Provider can submit offer with delivery window
9. **AC8.8.9**: Offers list shows pending offers with countdown timer
10. **AC8.8.10**: Provider can withdraw pending offer
11. **AC8.8.11**: Earnings dashboard loads with period selector (Hoy/Semana/Mes)
12. **AC8.8.12**: Commission settlement page shows bank details and upload form

### Database & Infrastructure

13. **AC8.8.13**: `offers` table created with correct schema
14. **AC8.8.14**: `commission_ledger` table created with correct schema
15. **AC8.8.15**: RLS policies active for offers and commission_ledger
16. **AC8.8.16**: Supabase Realtime enabled for offers table

### Regression Testing

17. **AC8.8.17**: No regression in consumer flows (request, tracking, offer selection)
18. **AC8.8.18**: No regression in admin flows (dashboard, providers, settings)
19. **AC8.8.19**: No regression in existing provider flows (login, profile, availability)

---

## Tasks / Subtasks

- [ ] **Task 1: Pre-deployment Checks**
  - [ ] Run `npm run lint` - ensure no blocking errors
  - [ ] Run `npm run build` - ensure build succeeds
  - [ ] Run E2E tests - ensure all provider tests pass
  - [ ] Verify offers table migration applied
  - [ ] Verify commission_ledger migration applied
  - [ ] Verify RLS policies working locally

- [ ] **Task 2: Git Commit & Push to Develop**
  - [ ] Review all changes with `git status` and `git diff`
  - [ ] Stage all Epic 8 changes (new files + modified files)
  - [ ] Create commit: `feat(epic-8): Provider Offer System`
  - [ ] Push to develop branch
  - [ ] Verify Vercel preview deployment for develop branch

- [ ] **Task 3: Merge to Staging**
  - [ ] Checkout staging branch
  - [ ] Merge develop into staging
  - [ ] Push staging branch
  - [ ] Verify Vercel preview deployment for staging
  - [ ] Test staging deployment manually:
    - [ ] Provider login works
    - [ ] Request browser shows requests
    - [ ] Offer submission works
    - [ ] Offers list displays correctly

- [ ] **Task 4: Merge to Main (Production)**
  - [ ] Checkout main branch
  - [ ] Merge staging into main
  - [ ] Push main branch
  - [ ] Monitor Vercel production deployment
  - [ ] Verify deployment status: READY

- [ ] **Task 5: Branch Cleanup**
  - [ ] Delete merged feature branches locally: `git branch -d <branch>`
  - [ ] Delete merged feature branches remotely: `git push origin --delete <branch>`
  - [ ] Verify only main, staging, develop branches remain
  - [ ] Document deleted branches

- [ ] **Task 6: Production Verification - Provider Offer System**
  - [ ] Navigate to https://nitoagua.vercel.app/provider
  - [ ] Login as verified test provider
  - [ ] **Test Request Browser (AC8.8.6, AC8.8.7)**:
    - [ ] Navigate to /provider/requests
    - [ ] Verify pending requests display
    - [ ] Verify requests show: comuna, amount, urgency, time, offers count
    - [ ] Verify real-time updates (create request in another browser)
  - [ ] **Test Offer Submission (AC8.8.8)**:
    - [ ] Click "Ver Detalles" on a request
    - [ ] Fill in delivery window
    - [ ] Verify earnings preview displayed
    - [ ] Submit offer
    - [ ] Verify toast: "¡Oferta enviada!"
  - [ ] **Test Offers List (AC8.8.9)**:
    - [ ] Navigate to /provider/offers
    - [ ] Verify pending offer appears
    - [ ] Verify countdown timer displays
    - [ ] Verify correct format (MM:SS or H:MM:SS)
  - [ ] **Test Offer Withdrawal (AC8.8.10)**:
    - [ ] Click "Cancelar Oferta"
    - [ ] Confirm in dialog
    - [ ] Verify toast: "Oferta cancelada"
    - [ ] Verify offer moves to history
  - [ ] **Test Earnings Dashboard (AC8.8.11)**:
    - [ ] Navigate to /provider/earnings
    - [ ] Verify period selector (Hoy/Esta Semana/Este Mes)
    - [ ] Verify summary cards display
    - [ ] Switch periods and verify data updates
  - [ ] **Test Settlement Page (AC8.8.12)**:
    - [ ] Navigate to /provider/earnings/withdraw
    - [ ] Verify bank details displayed
    - [ ] Verify receipt upload form functional
    - [ ] Test file upload (don't submit unless testing full flow)

- [ ] **Task 7: Database Verification**
  - [ ] Verify offers table exists in Supabase
  - [ ] Verify commission_ledger table exists
  - [ ] Verify RLS policies are active
  - [ ] Verify Realtime is enabled for offers

- [ ] **Task 8: Regression Testing**
  - [ ] Run full E2E test suite
  - [ ] Test consumer request flow (create water request)
  - [ ] Test admin dashboard (login, metrics)
  - [ ] Test existing provider flows (profile, availability)
  - [ ] Verify no console errors on any page

- [ ] **Task 9: Document Deployment**
  - [ ] Update story with deployment notes
  - [ ] Note any issues encountered and resolutions
  - [ ] Record production URLs verified
  - [ ] List branches deleted

---

## Technical Notes

### Environment Variables Required

| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Should exist |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Should exist |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side operations | Should exist |
| `CRON_SECRET` | Cron job auth | Should exist from Epic 6 |

### Test Users

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@nitoagua.cl | admin.123 | Admin verification |
| Provider | provider@test.cl | provider.123 | Provider offer testing |
| Consumer | consumer@test.cl | consumer.123 | Consumer flow regression |

### Branching Strategy

```
feature/8-x-story → develop → staging → main
                         ↓         ↓        ↓
                    preview   preview  production

After successful merge to main:
- Delete feature/8-x-story branches
- Keep: main, staging, develop
```

### Branch Cleanup Commands

```bash
# List merged branches
git branch --merged main

# Delete local branch
git branch -d feature/8-1-provider-request-browser

# Delete remote branch
git push origin --delete feature/8-1-provider-request-browser

# Prune stale remote tracking branches
git fetch --prune
```

### Production URL

https://nitoagua.vercel.app

### New Routes to Verify

| Route | Expected Behavior |
|-------|-------------------|
| /provider/requests | Request browser with pending requests |
| /provider/requests/[id] | Request detail with offer form |
| /provider/offers | Provider's offers list with countdown |
| /provider/earnings | Earnings dashboard with period selector |
| /provider/earnings/withdraw | Commission settlement page |

---

## Dependencies

- **Requires:** Stories 8-1 through 8-7 (all Epic 8 feature stories)
- **Enables:** Epic 9 (Consumer Offer Selection) can begin

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

*To be filled after deployment*

### Branches Deleted

*List branches deleted after successful merge to main*

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-16 | Story drafted for Epic 8 deployment | Claude |
