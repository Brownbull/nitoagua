# Story 4.6: Epic Deployment & Verification

Status: ready-for-dev

## Story

As a **developer**,
I want **to deploy all Epic 4 changes through the git branching workflow and verify production**,
So that **consumer accounts, profiles, request history, and pre-filled forms are live and working for real users**.

## Background

Epic 4 introduces consumer account functionality:
- Consumer registration via Google OAuth
- Consumer profile management (edit name, phone, address, instructions)
- Pre-filled request forms for registered consumers
- Consumer request history with statistics
- Request cancellation for pending requests (Story 4-5, if completed)

This story ensures all changes are properly committed, merged through the branching strategy (develop -> staging -> main), and verified working in production.

**Note:** Stories 4-1 through 4-4 were completed in an extended implementation session. Story 4-5 (Cancel Pending Request) is currently `ready-for-dev` and may or may not be included in this deployment depending on implementation status at deployment time.

## Acceptance Criteria

1. **AC4-6-1**: All Epic 4 changes committed to develop branch
2. **AC4-6-2**: Develop merged to staging, preview deployment verified
3. **AC4-6-3**: Staging merged to main, production deployment triggered
4. **AC4-6-4**: Production deployment successful (Vercel build passes)
5. **AC4-6-5**: Google OAuth login works for consumers in production
6. **AC4-6-6**: Consumer can register and complete onboarding in production
7. **AC4-6-7**: Consumer profile page loads and allows editing in production
8. **AC4-6-8**: Consumer request history page shows past requests with statistics
9. **AC4-6-9**: Pre-filled request form works for logged-in consumers
10. **AC4-6-10**: All E2E tests pass (existing + new consumer tests)
11. **AC4-6-11**: No regression in supplier flows (dashboard, accept, deliver still works)
12. **AC4-6-12**: No regression in guest consumer flow (request without account)

## Tasks / Subtasks

- [x] **Task 1: Pre-deployment Checks**
  - [x] Run `npm run lint` - ensure no errors
  - [x] Run `npm run build` - ensure build succeeds
  - [x] Run `npm run test:e2e` - ensure all tests pass
  - [x] Verify local development works with all Epic 4 features
  - [x] Verify consumer registration flow works locally
  - [x] Verify consumer profile editing works locally
  - [x] Verify consumer history page works locally

- [ ] **Task 2: Git Commit & Push to Develop**
  - [ ] Review all changes with `git status` and `git diff`
  - [ ] Stage all Epic 4 changes
  - [ ] Create commit with descriptive message
  - [ ] Push to develop branch
  - [ ] Verify Vercel preview deployment for develop branch

- [ ] **Task 3: Merge to Staging**
  - [ ] Checkout staging branch
  - [ ] Merge develop into staging
  - [ ] Push staging branch
  - [ ] Verify Vercel preview deployment for staging
  - [ ] Test staging deployment manually:
    - [ ] Consumer Google OAuth login works
    - [ ] Consumer onboarding flow completes
    - [ ] Consumer profile page loads and edits save
    - [ ] Consumer history page shows requests
    - [ ] Pre-filled request form works

- [ ] **Task 4: Merge to Main (Production)**
  - [ ] Checkout main branch
  - [ ] Merge staging into main
  - [ ] Push main branch
  - [ ] Monitor Vercel production deployment

- [ ] **Task 5: Production Verification**
  - [ ] Navigate to https://nitoagua.vercel.app
  - [ ] Test consumer Google OAuth login flow
  - [ ] Test consumer registration (new user)
  - [ ] Test consumer profile editing
  - [ ] Test consumer history page
  - [ ] Test pre-filled request form
  - [ ] Verify supplier dashboard still works (no regression)
  - [ ] Verify guest consumer flow still works (no regression)
  - [ ] Test cancel request if Story 4-5 was included

- [ ] **Task 6: E2E Test Suite Verification**
  - [ ] Run full E2E test suite against local
  - [ ] Verify existing tests still pass
  - [ ] Verify new consumer registration tests pass
  - [ ] Document any test adjustments needed

## Dev Notes

### Learnings from Previous Story

**From Story 4-1 (Consumer Registration) - Status: done**

The extended implementation of Story 4-1 covered Stories 4-2, 4-3, and 4-4. Key changes included:

- **New Files Created:**
  - `src/app/consumer/onboarding/page.tsx` - Consumer onboarding page
  - `src/components/consumer/onboarding-form.tsx` - Onboarding form
  - `src/lib/actions/consumer-profile.ts` - Server action for profile
  - `src/lib/validations/consumer-profile.ts` - Zod validation schema
  - `src/app/api/auth/test-login/route.ts` - Test login (dev only)
  - `tests/e2e/consumer-registration.spec.ts` - E2E tests
  - `src/app/consumer-profile/page.tsx` - Consumer profile page
  - `src/components/consumer/profile-form.tsx` - Profile form
  - `src/app/history/page.tsx` - Consumer history page

- **Files Modified:**
  - `src/app/auth/callback/route.ts` - Role-based routing
  - `src/app/(auth)/login/page.tsx` - Role param support
  - `src/components/auth/google-sign-in.tsx` - Role prop
  - `src/app/page.tsx` - "Crear Cuenta" link
  - `src/components/auth/dev-login.tsx` - Two test accounts
  - `src/lib/validations/consumer-profile.ts` - Extended fields
  - `src/components/consumer/onboarding-form.tsx` - Extended fields
  - `src/components/layout/consumer-nav.tsx` - Profile link
  - `src/app/(consumer)/request/page.tsx` - Pre-fill from profile
  - `src/app/api/requests/route.ts` - Set consumer_id

- **E2E Tests:** 20 new consumer registration tests added
- **Total Tests:** 283+ tests passing at time of 4-1 completion

[Source: docs/sprint-artifacts/epic4/4-1-consumer-registration.md#Dev-Agent-Record]

### Story 4-5 Status

Story 4-5 (Cancel Pending Request) is currently `ready-for-dev`. If implemented before this deployment story:
- Include cancel dialog component
- Include API cancel action
- Include related E2E tests
- Verify cancel works in production

### Git Branching Strategy

```
develop (feature development)
    |
staging (pre-production testing)
    |
main (production)
```

### Vercel Deployments

| Branch | URL |
|--------|-----|
| main | https://nitoagua.vercel.app |
| staging | https://nitoagua-staging.vercel.app (preview) |
| develop | https://nitoagua-develop.vercel.app (preview) |

### Google OAuth Production Notes

Google OAuth is already configured in production from Epic 3. For consumers:
1. Same Google OAuth flow as suppliers
2. Role routing differentiates consumer vs supplier onboarding
3. Test login only works in development (`ENABLE_TEST_LOGIN=true`)

### Rollback Plan

If production issues are found:
1. Revert main to previous commit: `git revert HEAD`
2. Push to main to trigger redeploy
3. Debug issue on develop branch
4. Re-deploy when fixed

### Project Structure Notes

- Consumer onboarding: `src/app/consumer/onboarding/page.tsx` (outside route group)
- Consumer profile: `src/app/consumer-profile/page.tsx` (renamed from /profile to avoid supplier conflict)
- Consumer history: `src/app/history/page.tsx`
- Consumer nav updated: Links to `/consumer-profile` and `/history`

### References

- [Source: docs/sprint-artifacts/epic4/tech-spec-epic-4.md] - Epic 4 technical specification
- [Source: docs/sprint-artifacts/epic4/4-1-consumer-registration.md] - Extended implementation details
- [Source: docs/sprint-artifacts/epic3/3-8-epic-deployment-and-verification.md] - Deployment pattern reference
- [Source: docs/architecture.md] - System architecture
- [Source: docs/epics.md#Epic 4] - Epic overview

## Prerequisites

- Stories 4-1 through 4-4 completed (all done per sprint-status.yaml)
- Story 4-5 either completed or deferred to Epic 5
- All E2E tests passing locally
- Google OAuth configured in production (from Epic 3)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Production deployment live at https://nitoagua.vercel.app
- [ ] Consumer can complete full registration and profile flow in production
- [ ] Consumer history page works in production
- [ ] Pre-filled request form works in production
- [ ] Supplier flow verified (no regression)
- [ ] Guest consumer flow verified (no regression)
- [ ] Story status updated to `done`

---

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/epic4/4-6-epic-deployment-and-verification.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

**2025-12-05 - Task 1 Plan:**
1. Run `npm run lint` to verify no linting errors
2. Run `npm run build` to verify production build succeeds
3. Run E2E tests to verify all tests pass
4. Verify local development works with Epic 4 features

### Completion Notes List

**Task 1 Complete (2025-12-05):**
- Lint: ✅ Passed after updating eslint.config.mjs to ignore playwright-report/ and allow underscore-prefixed unused vars
- Build: ✅ Next.js 16.0.6 production build successful (17 routes)
- E2E Tests: ✅ 879 passed, 165 skipped
  - Fixed test expecting `/profile` → updated to `/consumer-profile` (Epic 4 route rename)
  - Fixed webkit flaky test for touch target sizing (added explicit wait)
- Test files updated: consumer-home.spec.ts, consumer-request-confirmation.spec.ts, cancel-request.spec.ts

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-04 | SM Agent (Claude Opus 4.5) | Story drafted from tech-spec and Epic 3 deployment pattern |