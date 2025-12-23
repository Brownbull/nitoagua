# Tech Spec: Epic 13 - Chrome Extension Final Validation

**Epic:** Epic 13 (Final Validation)
**Author:** Atlas Project Intelligence
**Date:** 2025-12-22
**Status:** Backlog

---

## 1. Overview

This epic performs **final production validation** using Chrome Extension E2E testing.

**Prerequisites:**
- Epic 11 complete (Playwright validation passing)
- All RLS issues fixed
- All critical workflows verified via Playwright

**Why Chrome Extension Last:**
> Chrome Extension E2E on production should come LAST, after Playwright tests and manual testing verify the app works. RLS issues cascade and make entire test sessions unproductive.
> -- Lesson from Story 11-1 (2025-12-22)

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

These were created during Epic 11 Chrome Extension attempt:

| File | Status |
|------|--------|
| `docs/testing/chrome-extension/11-1-core-transaction.md` | Created, partial execution |

---

## 5. Success Criteria

| Metric | Target |
|--------|--------|
| All workflows validated | 25 |
| Chrome Extension tests passing | 100% |
| No blocking RLS issues | 0 |
| Final production sign-off | Yes |

---

## 6. Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 11 complete | Required | Chrome Extension testing |
| RLS issues fixed | Required | Tests to pass |
| Chrome Extension access | Required | Windows testing |

---

*Created 2025-12-22*
*This epic runs AFTER Epic 11 (Playwright validation)*
