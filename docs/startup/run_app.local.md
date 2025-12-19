# Running NitoAgua Locally

This guide explains how to set up and run NitoAgua on your local development machine.

## Prerequisites

1. **Node.js 18+** - Required for Next.js
2. **Docker** - Required for local Supabase
3. **Supabase CLI** - `npm install -g supabase` or use `npx supabase`

## Quick Start

```bash
# 1. Start local Supabase (Docker required)
npx supabase start

# 2. Verify database schema
npm run verify:local-db

# 3. Seed test data
npm run seed:dev-login    # Dev login users (admin, consumer, supplier)
npm run seed:test         # E2E test data (users + water requests)
npm run seed:mockup       # UI mockup data for development

# 4. Start the dev server
npm run dev

# 5. Access the app
# Consumer/Provider: http://localhost:3005/login
# Admin: http://localhost:3005/admin/login
```

## Test User Credentials

With `NEXT_PUBLIC_DEV_LOGIN=true` (default for local), use these credentials:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@nitoagua.cl | admin.123 | Access admin panel |
| Consumer | consumer@nitoagua.cl | consumer.123 | Standard consumer |
| Supplier | supplier@nitoagua.cl | supplier.123 | Pre-approved supplier |
| New Supplier | provider2@nitoagua.cl | provider2.123 | For onboarding flow tests |

## Database Reset

When migrations change or you encounter schema issues:

```bash
# Full reset (destroys all local data)
npx supabase db reset

# Verify schema is correct
npm run verify:local-db

# Re-seed test data
npm run seed:dev-login
npm run seed:test
npm run seed:mockup
```

**Expected output from `npx supabase db reset`:**
```
Resetting local database...
Recreating database...
Initialising schema...
Seeding globals from roles.sql...
Applying migration 001_initial_schema.sql...
Applying migration 20251212171400_v2_admin_auth.sql...
[... more migrations ...]
Finished supabase db reset on branch develop.
```

---

## Troubleshooting

### Common Error: 404 on Table Access

**Symptoms:**
```
GET .../provider_service_areas?... 404 (Not Found)
```

**Cause:** Missing tables - migrations not applied correctly.

**Solution:**
```bash
npx supabase db reset
npm run verify:local-db
```

### Common Error: 403 Forbidden on API Calls

**Symptoms:**
```
GET .../notifications?... 403 (Forbidden)
[Notifications] Error: permission denied for table users
```

**Cause:** RLS policies are blocking access, often because:
1. User doesn't have the required role
2. User ID doesn't match the record's owner
3. Missing authentication token

**Solution:**
1. Ensure you're logged in with correct test user
2. Check RLS policies match the user's role
3. Run `npx supabase db reset` to reapply migrations with correct RLS

### Common Error: "Dev provider not found"

**Symptoms:**
```
Error: Dev provider supplier@nitoagua.cl not found.
Run 'npm run seed:local' first to create test users.
```

**Cause:** Dev login users not seeded.

**Solution:**
```bash
npm run seed:dev-login
```

### Common Error: Migration Drift

**Symptoms:**
- Different behavior between local and production
- `npx supabase migration list` shows unsynced migrations

**Diagnosis:**
```bash
# Check migration status
npx supabase migration list

# Compare schemas
npx supabase db diff
```

**Solution:**
```bash
# Pull latest migrations from git
git pull

# Reset local database
npx supabase db reset
```

### Verifying Local Schema

Always verify schema after reset:

```bash
npm run verify:local-db
```

Expected output:
```
🔍 Local Database Verification
   URL: http://127.0.0.1:55326
   Tables to check: 11

   ✅ profiles (200 OK)
   ✅ water_requests (200 OK)
   ✅ admin_settings (200 OK)
   ✅ admin_allowed_emails (200 OK)
   ✅ provider_documents (200 OK)
   ✅ commission_ledger (200 OK)
   ✅ withdrawal_requests (200 OK)
   ✅ offers (200 OK)
   ✅ notifications (200 OK)
   ✅ comunas (200 OK)
   ✅ provider_service_areas (200 OK)

==================================================
✅ All required tables exist!
```

---

## Seed Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run seed:dev-login` | Create dev login users (admin, consumer, supplier) |
| `npm run seed:test` | Create E2E test data (deterministic users + requests) |
| `npm run seed:mockup` | Create UI mockup data for development |
| `npm run seed:admin` | Create local admin user |
| `npm run seed:offers` | Create offer test data (requires dev-login first) |
| `npm run seed:earnings` | Create earnings test data (requires dev-login first) |

### Cleanup Commands

| Command | Purpose |
|---------|---------|
| `npm run seed:dev-login:clean` | Remove dev login users |
| `npm run seed:test:clean` | Remove E2E test data |
| `npm run seed:mockup:clean` | Remove mockup data |
| `npm run cleanup:local` | Delete all water requests |

---

## Supabase Commands Reference

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Check status
npx supabase status

# Open Supabase Studio (GUI)
# After start, go to: http://127.0.0.1:55330

# Reset database (destroys all data)
npx supabase db reset

# View migration status
npx supabase migration list

# Compare with production
npx supabase db diff --linked
```

---

## Environment Variables

For local development, create `.env.local`:

```bash
# Supabase (local defaults)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55326
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Enable dev login for testing
NEXT_PUBLIC_DEV_LOGIN=true

# Google Maps (optional for local)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

---

## Running E2E Tests

```bash
# Verify database first
npm run verify:local-db

# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test tests/e2e/consumer-request.spec.ts
```
