# Story 11-12: Provider Earnings (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-12 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | Provider Earnings (Production) |
| **Status** | done |
| **Points** | 2 |
| **Priority** | P1 - High |
| **Depends On** | Story 11-11 |

---

## User Story

**As a** platform owner,
**I want** to verify provider earnings works on production,
**So that** real providers can track and withdraw earnings.

---

## Tasks

### Task 1: Run Production Tests

- [x] 1.1 Create/verify prod seed for commission ledger entries
- [x] 1.2 Run provider-earnings-workflow tests against production
- [x] 1.3 Document failures

### Task 2: Fix or Backlog

- [x] 2.1 Analyze each failure
- [x] 2.2 Apply critical fixes
- [x] 2.3 Backlog non-critical issues to Epic 11A

---

## Acceptance Criteria

### AC 11-12.1: Tests Pass on Production
- [x] P11, P12 tests pass
- [x] Or: Failures documented and actioned

---

## Definition of Done

- [x] Tests run against production
- [x] Issues documented and actioned
- [x] Story status updated to `review`

---

## Dev Agent Record

### Implementation Plan
1. Run production seed script (`npm run seed:earnings:prod`)
2. Execute Playwright tests against production with proper env vars
3. Document results and fix any failures

### Debug Log
- **Seed run:** Successfully seeded 10 delivered requests + 4 ledger entries
- **Production URL:** https://nitoagua.vercel.app
- **Test run:** 12/12 tests passed in 1.8 minutes

### Test Results
**Production Test Run (2025-12-23):**

| Test File | Tests | Passed | Failed | Skipped |
|-----------|-------|--------|--------|---------|
| provider-earnings-workflow.spec.ts | 12 | 12 | 0 | 0 |

**Test Breakdown:**
- P11.1: Earnings page loads with summary card ✅
- P11.2: Earnings summary shows total, pending, settled amounts ✅
- P11.3: Period selector filters data correctly ✅
- P11.4: Delivery history shows completed deliveries ✅
- P11.5: Commission calculations displayed correctly ✅
- P12.1: Settlement button visible when balance > $0 ✅
- P12.2: Withdraw page shows commission amount and bank details ✅
- P12.3: Withdraw page shows upload area for receipt ✅
- P12.4: Submit button disabled without receipt upload ✅
- P12.5: Pending verification state shows correctly ✅
- P12.6: Navigation between earnings and withdraw pages ✅
- P11+P12: Full earnings to settlement navigation flow ✅

**Seed Data Created (Production):**
- 10 delivered water requests (gross: $455,000 CLP)
- 4 commission ledger entries (pending: $12,250 CLP)
- Provider: supplier@nitoagua.cl (verified, available)

### Completion Notes
All P11 (View Earnings Dashboard) and P12 (Request Settlement) workflow tests pass on production. No code fixes were required - the local tests from Story 11-11 work identically on production.

### File List
**New Files:**
- `tests/e2e/provider-earnings-workflow.spec.ts` (12 workflow tests - created in 11-11, committed in 11-12)

**Modified Files:**
- `docs/sprint-artifacts/epic11/11-12-provider-earnings-production.md` (this story)
- `docs/sprint-artifacts/epic11/11-11-provider-earnings-local.md` (status → done)
- `docs/sprint-artifacts/sprint-status.yaml` (status update)
- `_bmad/agents/atlas/atlas-sidecar/knowledge/05-testing.md` (Atlas memory update)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Story created | SM |
| 2025-12-23 | Production tests pass 12/12 - Status to review | Dev Agent |
| 2025-12-23 | Atlas code review - 1 HIGH fix (commit test file), File List updated | Atlas |
