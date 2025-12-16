# Story 7.11: UX Alignment Deployment & Verification

| Field | Value |
|-------|-------|
| **Story ID** | 7-11 |
| **Epic** | Epic 7: Provider Onboarding |
| **Title** | UX Alignment Deployment & Verification |
| **Status** | ready-for-dev |
| **Priority** | P1 (High) |
| **Points** | 2 |
| **Sprint** | TBD |

---

## User Story

As a **developer**,
I want **to deploy all UX alignment changes and verify production matches mockups**,
So that **the provider onboarding flow matches the approved UX design**.

---

## Background

Stories 7.7-7.10 implement UX alignment changes to match the approved mockups:
- 7.7: Personal info (photo upload, RUT, 4-step progress)
- 7.8: Documents (license required, permiso optional)
- 7.9: Vehicle info (type cards, hours, days)
- 7.10: Bank account (button selection, pre-filled RUT)

This story deploys all changes to production and verifies UX alignment.

---

## Acceptance Criteria

### Deployment Criteria

1. **AC7.11.1**: All UX alignment changes committed to develop branch
2. **AC7.11.2**: Develop merged to staging with preview verification
3. **AC7.11.3**: Staging merged to main with production deployment
4. **AC7.11.4**: E2E tests pass for updated onboarding flow
5. **AC7.11.5**: Build succeeds with no lint errors

### Production Verification - Mockup Alignment

6. **AC7.11.6**: Personal info screen matches mockup 13.2:
   - 4-segment progress bar
   - Profile photo upload with camera icon
   - RUT field with validation
   - Google account indicator
7. **AC7.11.7**: Document screen matches mockup 13.3:
   - License document required
   - Permiso sanitario optional (dashed border)
   - Upload status badges
8. **AC7.11.8**: Vehicle screen matches mockup 13.4:
   - Vehicle type cards (Moto/Auto/Camioneta)
   - Working hours dropdown
   - Working days toggle buttons
9. **AC7.11.9**: Bank screen matches mockup 13.5:
   - Account type toggle buttons
   - Pre-filled RUT (disabled)
   - "Completar registro" button

### E2E Testing

10. **AC7.11.10**: Reset provider2 test user using `npm run seed:provider2:reset`
11. **AC7.11.11**: Complete full onboarding flow with test data
12. **AC7.11.12**: All E2E tests pass in provider-registration.spec.ts
13. **AC7.11.13**: Screenshot comparison with mockups documented
14. **AC7.11.14**: Admin approval flow works for new registration

### Regression Testing

15. **AC7.11.15**: Consumer request flow works
16. **AC7.11.16**: Supplier dashboard works
17. **AC7.11.17**: Existing provider login works
18. **AC7.11.18**: Admin panel accessible

---

## Tasks / Subtasks

- [ ] **Task 1: Pre-deployment Checks**
  - [ ] Run `npm run lint` - verify no errors
  - [ ] Run `npm run build` - verify success
  - [ ] Run E2E tests - verify pass rate

- [ ] **Task 2: Git Operations**
  - [ ] Stage all UX alignment changes
  - [ ] Commit with message: "feat(epic-7): UX alignment with mockups (Stories 7.7-7.10)"
  - [ ] Push to develop branch

- [ ] **Task 3: Staging Deployment**
  - [ ] Merge develop to staging
  - [ ] Verify preview deployment
  - [ ] Test onboarding flow on staging

- [ ] **Task 4: Production Deployment**
  - [ ] Merge staging to main
  - [ ] Wait for Vercel deployment
  - [ ] Verify production build succeeds

- [ ] **Task 5: Production Verification**
  - [ ] Reset provider2: `npm run seed:provider2:reset`
  - [ ] Navigate to /provider/onboarding
  - [ ] Complete registration with test data
  - [ ] Screenshot each step for documentation
  - [ ] Compare screenshots with mockups

- [ ] **Task 6: E2E Test Execution**
  - [ ] Run full provider registration test suite
  - [ ] Document any failures
  - [ ] Fix and re-run if needed

- [ ] **Task 7: Regression Testing**
  - [ ] Test consumer home page
  - [ ] Test consumer request flow
  - [ ] Test supplier dashboard
  - [ ] Test admin panel

- [ ] **Task 8: Documentation**
  - [ ] Update story file with completion notes
  - [ ] Update sprint-status.yaml
  - [ ] Document any remaining discrepancies

---

## Technical Notes

### Test Commands

```bash
# Reset test user
npm run seed:provider2:reset

# Run E2E tests
npm run test:e2e -- provider-registration

# Run full test suite
npm run test:e2e
```

### Branching Strategy

```
develop → staging → main
   ↓         ↓        ↓
preview   preview  production
```

### Production URLs

| URL | Expected Screen |
|-----|-----------------|
| /provider/onboarding | Welcome page |
| /provider/onboarding/personal | Personal info (4-step, photo, RUT) |
| /provider/onboarding/documents | Documents (license, optional permiso) |
| /provider/onboarding/vehicle | Vehicle (type cards, hours, days) |
| /provider/onboarding/bank | Bank (toggle buttons, pre-filled RUT) |
| /provider/onboarding/review | Review summary |
| /provider/onboarding/pending | Verification status |

### Mockup Reference

`docs/ux-mockups/01-consolidated-provider-flow.html` Sections 13.2-13.5

---

## Dependencies

- **Requires:** Stories 7.7, 7.8, 7.9, 7.10 completed
- **Enables:** Epic 7 UX alignment complete

---

## File List

| Action | File |
|--------|------|
| N/A | Deployment story - verification only |

---

## Dev Agent Record

### Debug Log

(To be filled during implementation)

### Completion Notes

(To be filled after deployment)

### Screenshot Comparison

| Screen | Mockup Section | Status | Notes |
|--------|---------------|--------|-------|
| Personal Info | 13.2 | TBD | |
| Documents | 13.3 | TBD | |
| Vehicle | 13.4 | TBD | |
| Bank | 13.5 | TBD | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-15 | Story created for UX alignment deployment | Claude |
