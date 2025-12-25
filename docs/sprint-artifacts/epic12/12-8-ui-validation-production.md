# Story 12-8: UI Validation Production (Status & Display)

| Field | Value |
|-------|-------|
| **Story ID** | 12-8 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | UI Validation Production - Status & Display |
| **Status** | drafted |
| **Priority** | P0 (Checkpoint) |
| **Points** | 2 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Validate stories 12-3 and 12-5 on production environment (https://nitoagua.vercel.app) after local validation passes.

## Prerequisites

- [ ] Story 12-7 (UI Validation Local) - done
- [ ] Changes deployed to production via develop → staging → main
- [ ] Production test users available

## Test Coverage

Same tests as Story 12-7, but running against production:

### 12-5: Remove Fake Social Proof (6 tests)
### 12-3: Negative Status States (8 tests)

## Acceptance Criteria

### AC12.8.1: Production Deployment
- [ ] All UI changes merged to main branch
- [ ] Vercel deployment successful
- [ ] No build errors

### AC12.8.2: Test Execution
- [ ] All tests from 12-7 passing on production
- [ ] Tests use production URL (`https://nitoagua.vercel.app`)
- [ ] Tests use production Supabase

### AC12.8.3: Atlas Code Review
- [ ] Run `/bmad:bmm:workflows:atlas-code-review 12-8`
- [ ] All issues addressed
- [ ] Patterns documented

## Test Commands

```bash
# Run UI validation tests against production
NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 120 npx playwright test \
  tests/e2e/consumer-home-trust-signals.spec.ts \
  tests/e2e/consumer-negative-status.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

## Definition of Done

- [ ] All 14 tests passing on production
- [ ] Atlas code review passed
- [ ] Story marked as deployed
- [ ] Phase 1 complete

---

## Test Results

_To be filled after test execution_

| Test File | Tests | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| consumer-home-trust-signals.spec.ts | 6 | | | |
| consumer-negative-status.spec.ts | 8 | | | |
| **Total** | **14** | | | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as checkpoint | Claude |
