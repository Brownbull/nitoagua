# Story 11-2: CHAIN-1 Core Transaction (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-2 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | CHAIN-1 Core Transaction (Production) |
| **Status** | drafted |
| **Points** | 3 |
| **Priority** | P0 - Critical |
| **Depends On** | Story 11-1 |

---

## User Story

**As a** platform owner,
**I want** to validate the core transaction flow (CHAIN-1) works on production,
**So that** I can confirm real users can complete the happy path.

---

## Prerequisites

- [ ] Story 11-1 complete (local tests passing)
- [ ] Production database accessible
- [ ] Test credentials exist on production

---

## Test Credentials (Production)

| Persona | Email | Password |
|---------|-------|----------|
| Consumer | consumer@nitoagua.cl | test.123 |
| Provider | supplier@nitoagua.cl | test.123 |

---

## Tasks

### Task 1: Create Production Seed Script

- [ ] 1.1 Create `scripts/production/seed-chain1-test.ts`
- [ ] 1.2 Must use SERVICE_ROLE_KEY for RLS bypass
- [ ] 1.3 Create same data pattern as local seed
- [ ] 1.4 Add cleanup function
- [ ] 1.5 Add npm script: `npm run seed:chain1:prod`

### Task 2: Run Tests Against Production

- [ ] 2.1 Run production seed: `npm run seed:chain1:prod`
- [ ] 2.2 Run same Playwright tests with production URL:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  npm run test:e2e -- tests/e2e/chain1-happy-path.spec.ts
  ```
- [ ] 2.3 Document any failures

### Task 3: Analyze and Fix Issues

For each failure:
- [ ] 3.1 Identify root cause
- [ ] 3.2 Determine: Fix now or backlog?
- [ ] 3.3 If fix now: Apply fix, re-run test
- [ ] 3.4 If backlog: Create story in sprint-status

### Task 4: Cleanup and Document

- [ ] 4.1 Run cleanup: `npm run chain1:cleanup:prod`
- [ ] 4.2 Document all issues found
- [ ] 4.3 Update RLS issues table in tech-spec

---

## Acceptance Criteria

### AC 11-2.1: Production Seed Works
- [ ] Seed script creates test data on production
- [ ] Uses SERVICE_ROLE_KEY for RLS bypass
- [ ] Cleanup script removes test data

### AC 11-2.2: Same Tests Pass
- [ ] C1, P5, P6, C2, P10 tests pass on production
- [ ] Or: Failures documented with root cause

### AC 11-2.3: Issues Actioned
- [ ] Each failure has: root cause, fix-now/backlog decision
- [ ] Critical fixes applied
- [ ] Backlog stories created for deferred fixes

---

## Definition of Done

- [ ] Production seed script created
- [ ] Tests run against production
- [ ] All issues documented
- [ ] Critical fixes applied OR backlogged
- [ ] Story status updated to `review`

---

## Dev Notes

### Production Environment Variables

```bash
# In .env.local or export
NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_KEY="eyJhbGciOi..."  # For seed scripts only
```

### Expected Issues (From Chrome Extension Testing)

| Issue | Expected Fix |
|-------|--------------|
| Provider can't create offers | Deploy RLS migration fixing role name |
| Consumer can't view requests | Add RLS policy for owner access |
| Tracking page broken | Debug and fix routing/RLS |
| Offers page permission error | Fix users table join RLS |

### Issue Template

```markdown
## Issue: [Title]
**Test:** [Which test failed]
**Expected:** [What should happen]
**Actual:** [What happened]
**Root Cause:** [Why it failed]
**Decision:** Fix now / Backlog to Epic [X]
**Fix Applied:** [Yes/No + details]
```
