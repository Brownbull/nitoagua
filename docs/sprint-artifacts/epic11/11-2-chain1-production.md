# Story 11-2: CHAIN-1 Core Transaction (Production)

| Field | Value |
|-------|-------|
| **Story ID** | 11-2 |
| **Epic** | Epic 11 - Playwright Workflow Validation |
| **Title** | CHAIN-1 Core Transaction (Production) |
| **Status** | done |
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

- [x] Story 11-1 complete (local tests passing)
- [x] Production database accessible
- [x] Test credentials exist on production

---

## Test Credentials (Production)

| Persona | Email | Notes |
|---------|-------|-------|
| Consumer | consumer@nitoagua.cl | See `.env.production.local` for password |
| Provider | supplier@nitoagua.cl | See `.env.production.local` for password |

> **Security Note:** Passwords stored in `.env.production.local` (not in git)

---

## Tasks

### Task 1: Create Production Seed Script ✅

- [x] 1.1 Created `scripts/production/chain1-test-setup.ts` (existing script adapted)
- [x] 1.2 Uses SERVICE_ROLE_KEY for RLS bypass
- [x] 1.3 Same data pattern as local seed (consumer/supplier with proper roles)
- [x] 1.4 Cleanup function in `scripts/production/chain1-test-cleanup.ts`
- [x] 1.5 Added npm scripts: `seed:chain1:prod`, `chain1:cleanup:prod`

### Task 2: Run Tests Against Production ✅

- [x] 2.1 Production seed run successfully
- [x] 2.2 Ran Playwright tests with production environment:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  NEXT_PUBLIC_DEV_LOGIN=true \
  npx playwright test tests/e2e/chain1-happy-path.spec.ts
  ```
- [x] 2.3 Initial failures documented (see Issues Fixed below)

### Task 3: Analyze and Fix Issues ✅

Issues identified and FIXED:
- [x] 3.1 Identified root causes (see Issues Fixed section)
- [x] 3.2 All issues: Fix now decision
- [x] 3.3 Applied 7 migrations to production
- [x] 3.4 All tests passing after fixes

### Task 4: Cleanup and Document ✅

- [x] 4.1 Test data remains for verification (cleanup optional)
- [x] 4.2 All issues documented below
- [x] 4.3 RLS fixes documented

---

## Acceptance Criteria

### AC 11-2.1: Production Seed Works ✅
- [x] Seed script creates test data on production
- [x] Uses SERVICE_ROLE_KEY for RLS bypass
- [x] Cleanup script available

### AC 11-2.2: Same Tests Pass ✅
- [x] C1, P5, P6, C2, P10 tests ALL PASSING on production
- [x] All 5 tests pass in 15.5s

### AC 11-2.3: Issues Actioned ✅
- [x] Each failure had: root cause identified, fix-now decision
- [x] All critical fixes applied via migrations
- [x] No backlog needed - all issues resolved

---

## Definition of Done

- [x] Production seed script created
- [x] Tests run against production
- [x] All issues documented (see below)
- [x] Critical fixes applied
- [x] Story status updated to `review`

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

---

## Issues Fixed

### Issue 1: Consumer can't see offers on their request
**Test:** C2 - Consumer accepts offer
**Expected:** Consumer should see "Ofertas activas" with provider's offer
**Actual:** Page showed "Esperando ofertas" even after offer created
**Root Cause:** Profiles RLS blocked consumer from joining to supplier profile data
**Decision:** Fix now
**Fix Applied:** Created `can_view_supplier_profile()` SECURITY DEFINER function + new RLS policy

### Issue 2: Provider offers not being created (RLS silent failure)
**Test:** P6 - Provider submits offer
**Expected:** Offer INSERT should succeed
**Actual:** INSERT silently failed, no offer in database
**Root Cause:** Offers RLS policy checked `role = 'provider'` but profiles use `role = 'supplier'`
**Decision:** Fix now
**Fix Applied:** Migration `fix_offers_rls_role_name` corrects role check

### Issue 3: Missing in_transit_at column
**Test:** Multiple tests failing with DB error
**Expected:** Column should exist
**Actual:** "column water_requests.in_transit_at does not exist"
**Root Cause:** Production missing migration
**Decision:** Fix now
**Fix Applied:** Applied migration `add_in_transit_at_column`

### Issue 4: Missing message column on offers
**Test:** P6 - Provider submits offer
**Expected:** Offer message should save
**Actual:** Column didn't exist
**Root Cause:** Production missing migration
**Decision:** Fix now
**Fix Applied:** Applied migration `add_offers_message_column`

### Issue 5: RLS policies using auth.users incorrectly
**Test:** Admin-related flows
**Expected:** Admin policies should work
**Actual:** 42501 permission denied on auth.users access
**Root Cause:** RLS policies queried auth.users directly instead of using auth.jwt()
**Decision:** Fix now
**Fix Applied:** Applied migration `fix_rls_auth_users_reference`

---

## Migrations Applied to Production

1. `add_water_requests_comuna_id` - Added comuna_id column
2. `add_in_transit_at_column` - Added in_transit_at timestamp
3. `add_offers_message_column` - Added message column to offers
4. `add_no_offers_status` - Added no_offers request status
5. `fix_rls_auth_users_reference` - Fixed auth.users → auth.jwt() pattern
6. `fix_offers_rls_role_name` - Fixed role = 'supplier' (not 'provider')
7. `fix_profiles_rls_for_consumers` - SECURITY DEFINER function for profile access
8. `fix_function_search_path_security` - Fixed search_path on SECURITY DEFINER functions (Code Review)

---

## Dev Agent Record

### Files Changed

| File | Action | Notes |
|------|--------|-------|
| `scripts/production/chain1-test-setup.ts` | Modified | Production seed script |
| `scripts/production/chain1-test-cleanup.ts` | Created | Cleanup script for test data |
| `package.json` | Modified | Added npm scripts for chain1 testing |
| `supabase/migrations/20251222100000_fix_profiles_rls_for_consumers.sql` | Created | RLS fix for consumer profile access |
| `supabase/migrations/20251222200000_fix_function_search_path_security.sql` | Created | Security fix for DEFINER functions |
| `supabase/migrations/20251219200000_add_select_offer_function.sql` | Modified | Added search_path |
| `docs/sprint-artifacts/epic11/11-2-chain1-production.md` | Modified | This story file |

### Code Review Fixes (2025-12-22)

- **Migration drift identified**: Local/production timestamps mismatched
- **Security fix applied**: Added `SET search_path = public` to SECURITY DEFINER functions
- **Passwords removed**: Test credentials moved to `.env.production.local`
- **Baseline gitignored**: `.chain1-baseline.json` excluded from version control

---

## Final Test Results

```
Running 5 tests using 1 worker

  ✓  1 [chromium] › chain1-happy-path.spec.ts › C1 - Consumer creates water request (3.0s)
  ✓  2 [chromium] › chain1-happy-path.spec.ts › P5 - Provider sees request in dashboard (1.9s)
  ✓  3 [chromium] › chain1-happy-path.spec.ts › P6 - Provider submits offer (3.0s)
  ✓  4 [chromium] › chain1-happy-path.spec.ts › C2 - Consumer accepts offer (3.2s)
  ✓  5 [chromium] › chain1-happy-path.spec.ts › P10 - Provider completes delivery (3.5s)

  5 passed (15.5s)
```

**CHAIN-1 Happy Path: COMPLETE ✅**
