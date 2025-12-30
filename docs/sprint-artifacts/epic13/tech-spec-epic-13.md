# Tech Spec: Epic 13 - Chrome Extension Final Validation

**Epic:** Epic 13 (Final Validation)
**Author:** Atlas Project Intelligence
**Date:** 2025-12-22
**Updated:** 2025-12-30
**Status:** Ready to Context

---

## 1. Overview

This epic performs **final production validation** using Chrome Extension E2E testing.

**Prerequisites:** ✅ ALL MET
- ✅ Epic 11 complete (Playwright validation - 21 stories, retrospective done 2025-12-24)
- ✅ Epic 11A complete (Testing-discovered gaps fixed)
- ✅ Epic 12 complete (Consumer UX Enhancements - 14 stories deployed)
- ✅ Epic 12.5 complete (Performance Optimization - 6 stories deployed)
- ✅ Epic 12.6 complete (Auth Session Reliability - 2 stories deployed 2025-12-30)
- ✅ All RLS issues fixed (via Epic 11 Playwright tests + migrations)
- ✅ All critical workflows verified via Playwright (200+ E2E tests)

**Why Chrome Extension Last:**
> Chrome Extension E2E on production should come LAST, after Playwright tests and manual testing verify the app works. RLS issues cascade and make entire test sessions unproductive.
> -- Lesson from Story 11-1 (2025-12-22)

**Current State:**
The original Chrome Extension attempt (Story 11-1) was blocked by RLS issues. Those have all been fixed via:
- 8 RLS migrations during Epic 11
- Role name fixes (`supplier` vs `provider`)
- Guest access token policies
- Consumer/provider visibility policies

**Production Version:** v2.4.0 (includes session handling fixes)

---

## 2. Testing Approach

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DOCUMENT (WSL)                                        │
│  - Create test instructions from workflow definitions           │
│  - git commit + git push                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: EXECUTE (Windows + Chrome Extension)                  │
│  - git fetch + git pull                                         │
│  - Run: /bmad:bmm:workflows:atlas-e2e <test-file>              │
│  - Chrome Extension executes test, generates report             │
│  - git commit + git push                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: REPORT (WSL)                                          │
│  - git pull                                                     │
│  - Review report, create fix stories if needed                  │
│  - Mark story done                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Story Breakdown

### Story 13-1: Core Transaction Validation (Chrome Extension)

**Purpose:** Final validation of CHAIN-1 using Chrome Extension

**Workflows:** C1, P5, P6, C2, P10

**Test Document:** `docs/testing/chrome-extension/11-1-core-transaction.md` (already created)

---

### Story 13-2: Trust & Visibility Validation (Chrome Extension)

**Purpose:** Final validation of trust workflows

**Workflows:** C3, C4, P7, P8, P9

---

### Story 13-3: Provider Onboarding Validation (Chrome Extension)

**Purpose:** Final validation of CHAIN-2 (Provider Onboarding)

**Workflows:** P1-P4, A1-A3

---

### Story 13-4: Platform Operations Validation (Chrome Extension)

**Purpose:** Final validation of admin operations

**Workflows:** A4-A7, P11

---

### Story 13-5: Accountability System Validation (Chrome Extension)

**Purpose:** Final validation of strike system

**Workflows:** C5, P12, P13

---

### Story 13-6: Edge Cases Validation (Chrome Extension)

**Purpose:** Final validation of edge cases and error states

---

## 4. Existing Test Documents

These were created during Epic 11 Chrome Extension attempt (2025-12-22):

| File | Status | Notes |
|------|--------|-------|
| `docs/testing/chrome-extension/11-1-core-transaction.md` | Ready to re-run | RLS issues documented there have been fixed via 8 migrations |

**Historical Context:**
- Original execution blocked by RLS issues (role name mismatch, missing policies)
- All 4 RLS issues identified in that document have been fixed
- Document serves as test script for Story 13-1 re-execution

---

## 5. Success Criteria

| Metric | Target | Current Baseline |
|--------|--------|------------------|
| All workflows validated | 25 | 25 (via Playwright) |
| Chrome Extension tests passing | 100% | Ready to execute |
| No blocking RLS issues | 0 | 0 (all fixed) |
| Final production sign-off | Yes | Pending Chrome Extension |

**Playwright Baseline (Epic 11):**
- 200+ E2E tests passing
- All 25 workflows validated programmatically
- Chrome Extension provides visual/manual confirmation

---

## 6. Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 11 complete | ✅ Complete | Chrome Extension testing |
| Epic 11A complete | ✅ Complete | Testing gaps fixed |
| Epic 12 complete | ✅ Complete | Consumer UX ready |
| Epic 12.5 complete | ✅ Complete | Performance optimized |
| Epic 12.6 complete | ✅ Complete | Session handling reliable |
| RLS issues fixed | ✅ Complete | Tests to pass |
| Chrome Extension access | ✅ Available | Windows testing |

---

*Created 2025-12-22*
*Updated 2025-12-30 - All prerequisites now met*
