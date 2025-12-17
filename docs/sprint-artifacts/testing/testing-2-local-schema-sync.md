# Story Testing-2: Local Supabase Schema Synchronization

| Field | Value |
|-------|-------|
| **Epic** | Testing & Quality (Tech Debt) |
| **Story ID** | Testing-2 |
| **Status** | drafted |
| **Priority** | High |
| **Created** | 2025-12-17 |
| **Blocked By** | None |
| **Blocks** | 9-1 (E2E Testing Reliability) |

## Problem Statement

The local Supabase instance is missing tables and has RLS policy issues that prevent the provider flow from working correctly. This was discovered during E2E testing when console errors showed:

```
GET .../provider_service_areas?... 404 (Not Found)
GET .../notifications?... 403 (Forbidden)
[Notifications] Error: permission denied for table users
```

## Current State

### Missing/Broken in Local Supabase
1. **`provider_service_areas`** - 404 (table doesn't exist)
2. **`notifications`** - 403 (RLS blocking access)
3. **`users` table access** - Permission denied in RLS policies

### Working in Production
All these tables exist and work correctly in production Supabase.

## Acceptance Criteria

### AC 9.2.1: Identify Missing Migrations
- [ ] Run `npx supabase db diff` to compare local vs production
- [ ] List all missing tables, columns, and RLS policies
- [ ] Document which migrations are missing

### AC 9.2.2: Apply Missing Migrations
- [ ] Reset local Supabase to clean state
- [ ] Apply all migrations in order
- [ ] Verify all tables exist with correct schema

### AC 9.2.3: Fix RLS Policies
- [ ] Ensure `provider_service_areas` has correct RLS for providers
- [ ] Ensure `notifications` allows users to read their own notifications
- [ ] Fix any policies referencing `users` table incorrectly

### AC 9.2.4: Verify with Seed Scripts
- [ ] Run `npm run seed:local` successfully
- [ ] Run `npm run seed:offers` successfully
- [ ] Run `npm run seed:earnings` successfully
- [ ] All scripts should complete without errors

### AC 9.2.5: Verify with E2E Tests
- [ ] Login as test supplier works without console errors
- [ ] Provider requests page loads without 404/403
- [ ] Notifications load without errors

## Implementation Tasks

### Task 1: Check Current Migration Status
```bash
# List applied migrations
npx supabase migration list

# Compare with production
npx supabase db diff --linked

# Check for schema differences
PGPASSWORD=postgres psql -h 127.0.0.1 -p 55325 -U postgres -d postgres -c "\dt"
```

### Task 2: Reset and Reapply Migrations
```bash
# Stop local Supabase
npx supabase stop

# Reset database (WARNING: destroys all local data)
npx supabase db reset

# This applies all migrations from supabase/migrations/
```

### Task 3: Verify Tables Exist
```sql
-- Check for required tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- comunas
-- commission_ledger
-- deliveries
-- notifications
-- offers
-- platform_settings
-- profiles
-- provider_service_areas
-- water_requests
```

### Task 4: Verify RLS Policies
```sql
-- List all RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Task 5: Test as Provider
```bash
# Start local Supabase
npx supabase start

# Seed test data
npm run seed:local

# Start dev server
npm run dev

# Login as supplier@nitoagua.cl and check console for errors
```

## Commands Reference

```bash
# Check Supabase status
npx supabase status

# View local database
npx supabase db studio

# Reset everything
npx supabase stop && npx supabase start

# Full reset with migration reapply
npx supabase db reset

# Diff local vs production
npx supabase db diff --linked
```

## Related Files

### Migration Files
- `supabase/migrations/` - All migration SQL files
- Check for gaps in migration sequence

### Seed Scripts
- `scripts/local/seed-test-data.ts` - Main seed script
- `scripts/local/seed-offer-tests.ts` - Offer test data
- `scripts/local/seed-earnings-tests.ts` - Earnings test data

## Definition of Done

- [ ] `npx supabase db reset` runs successfully
- [ ] All required tables exist in local database
- [ ] RLS policies match production
- [ ] Seed scripts run without errors
- [ ] Test supplier can login without 404/403 errors
- [ ] E2E tests pass on local Supabase

## Notes

### Quick Verification Commands
```bash
# Check if provider_service_areas exists
curl "http://127.0.0.1:55326/rest/v1/provider_service_areas?limit=0" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Expected: 200 OK (empty array [])
# Error: 404 Not Found (table missing)
```

### Production Supabase Reference
- URL: https://spvbmmydrfquvndxpcug.supabase.co
- Tables can be viewed in Supabase Studio for reference
