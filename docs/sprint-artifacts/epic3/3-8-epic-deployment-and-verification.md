# Story 3.8: Epic Deployment & Verification

Status: ready-for-dev

## Story

As a **developer**,
I want **to deploy all Epic 3 changes through the git branching workflow and verify production**,
So that **the supplier dashboard is live and working for real users**.

## Background

Epic 3 introduces significant new functionality:
- Google OAuth authentication
- Supplier onboarding flow
- Request dashboard with accept/deliver workflows
- Profile management

This story ensures all changes are properly committed, merged through the branching strategy (develop → staging → main), and verified working in production.

## Acceptance Criteria

1. **AC3-8-1**: All Epic 3 changes committed to develop branch
2. **AC3-8-2**: Develop merged to staging, preview deployment verified
3. **AC3-8-3**: Staging merged to main, production deployment triggered
4. **AC3-8-4**: Production deployment successful (Vercel build passes)
5. **AC3-8-5**: Google OAuth flow works in production
6. **AC3-8-6**: Supplier can register, login, view dashboard in production
7. **AC3-8-7**: Supplier can accept request and mark delivered in production
8. **AC3-8-8**: All E2E tests pass (existing + new supplier tests)
9. **AC3-8-9**: No regression in consumer flows (guest request still works)

## Tasks / Subtasks

- [x] **Task 1: Pre-deployment Checks**
  - [x] Run `npm run lint` - ensure no errors
  - [x] Run `npm run build` - ensure build succeeds
  - [x] Run `npm run test:e2e` - ensure all tests pass
  - [x] Verify local development works with all Epic 3 features

- [x] **Task 2: Git Commit & Push to Develop**
  - [x] Review all changes with `git status` and `git diff`
  - [x] Stage all Epic 3 changes
  - [x] Create commit with descriptive message
  - [x] Push to develop branch
  - [x] Verify Vercel preview deployment for develop branch

- [x] **Task 3: Merge to Staging**
  - [x] Checkout staging branch
  - [x] Merge develop into staging
  - [x] Push staging branch
  - [x] Verify Vercel preview deployment for staging
  - [x] Test staging deployment manually:
    - [x] Google OAuth login works
    - [x] Supplier dashboard loads
    - [x] Accept request flow works

- [ ] **Task 4: Merge to Main (Production)**
  - [ ] Checkout main branch
  - [ ] Merge staging into main
  - [ ] Push main branch
  - [ ] Monitor Vercel production deployment

- [ ] **Task 5: Production Verification**
  - [ ] Navigate to https://nitoagua.vercel.app
  - [ ] Test Google OAuth login flow
  - [ ] Create supplier profile (onboarding)
  - [ ] View dashboard with pending requests
  - [ ] Accept a request with delivery window
  - [ ] Mark request as delivered
  - [ ] Edit supplier profile
  - [ ] Logout and login again
  - [ ] Verify consumer guest flow still works (no regression)

- [ ] **Task 6: E2E Test Suite Verification**
  - [ ] Run full E2E test suite against production
  - [ ] Verify existing 109 tests still pass
  - [ ] Verify new supplier tests pass
  - [ ] Document any test adjustments needed

## Dev Notes

### Git Branching Strategy

```
develop (feature development)
    ↓
staging (pre-production testing)
    ↓
main (production)
```

### Vercel Deployments

| Branch | URL |
|--------|-----|
| main | https://nitoagua.vercel.app |
| staging | https://nitoagua-staging.vercel.app (preview) |
| develop | https://nitoagua-develop.vercel.app (preview) |

### Google OAuth Production Setup

Before this story, ensure:
1. Google Cloud Console has production redirect URI configured
2. Supabase production project has Google provider enabled
3. Environment variables set in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Rollback Plan

If production issues are found:
1. Revert main to previous commit: `git revert HEAD`
2. Push to main to trigger redeploy
3. Debug issue on develop branch
4. Re-deploy when fixed

## Prerequisites

- Stories 3-1 through 3-7 completed and tested locally
- Google OAuth configured in Supabase production
- All E2E tests passing locally

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Production deployment live at https://nitoagua.vercel.app
- [ ] Supplier can complete full flow in production
- [ ] Consumer guest flow verified (no regression)
- [ ] Story status updated to `done`

---

## Dev Agent Record

### Context Reference

- [3-8-epic-deployment-and-verification.context.xml](./3-8-epic-deployment-and-verification.context.xml)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Story drafted |
| 2025-12-03 | Story Context Workflow | Context generated, status → ready-for-dev |
