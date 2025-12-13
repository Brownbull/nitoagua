# NitoAgua Scripts

Database seeding and cleanup scripts for local development and production testing.

## Directory Structure

```
scripts/
├── local/           # Scripts for local Supabase (Docker)
│   ├── seed-test-user.ts
│   ├── seed-admin.ts
│   ├── reset-admin.ts
│   ├── seed-test-data.ts
│   ├── seed-ui-mockups.ts
│   └── cleanup-water-requests.ts
├── production/      # Scripts for production Supabase
│   ├── seed-production-test-users.ts
│   └── cleanup-production-test-data.ts
└── README.md
```

---

## Local Development Scripts

These scripts target your local Supabase Docker instance (`http://127.0.0.1:55326`).

### Prerequisites

1. Start local Supabase:
   ```bash
   npx supabase start
   ```

2. Verify it's running:
   ```bash
   npx supabase status
   ```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run seed:local` | Create a test supplier user |
| `npm run seed:admin` | Create a test admin user |
| `npm run seed:test` | Seed E2E test data (users + water requests) |
| `npm run seed:test:clean` | Remove seeded E2E test data |
| `npm run seed:mockup` | Seed UI mockup data for development |
| `npm run seed:mockup:empty` | Clear UI mockup data |
| `npm run seed:mockup:clean` | Clean up mockup data |
| `npm run cleanup:local` | Delete all water requests (local) |

### Test User Credentials (Local)

| Role | Email | Password |
|------|-------|----------|
| Supplier | khujta@gmail.com | password.123 |
| Admin | admin@nitoagua.local | admin.123 |
| E2E Consumer | test-consumer@test.local | TestConsumer123! |
| E2E Supplier | test-supplier@test.local | TestSupplier123! |

### Script Details

#### seed-test-user.ts
Creates a test supplier user for manual local development testing.
- Email: `khujta@gmail.com`
- Password: `password.123`

#### seed-admin.ts
Creates an admin user for local admin panel testing.
- Reads credentials from `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` env vars
- Defaults: `admin@nitoagua.local` / `LocalDevPassword123!`

#### seed-test-data.ts
Seeds deterministic test data for E2E integration tests.
- Creates test supplier + consumer accounts
- Creates water requests in various states (pending, accepted, delivered, cancelled)
- Uses `seed-token-*` tracking tokens
- Idempotent (safe to run multiple times)

#### seed-ui-mockups.ts
Seeds realistic data to validate UI against mockups.
- **Populated state:** 5 providers in verification queue + 3 water requests
- **Empty state:** Cleans mockup data to test empty UI
- Uses `mockup-provider*@mockup.local` emails

#### cleanup-water-requests.ts
Deletes all water requests from the database.
- `--remote` flag targets production (requires `.env.scripts` with service role key)

---

## Production Scripts

These scripts target your production Supabase instance. They require environment variables for authentication.

### Getting Production Credentials

You can get credentials from:

1. **Supabase CLI** (if linked):
   ```bash
   npx supabase projects api-keys --project-ref spvbmmydrfquvndxpcug
   ```

2. **Supabase Dashboard**: Project Settings > API > Service Role Key

3. **Vercel Environment Variables**: Project Settings > Environment Variables

### Setting Up Production Test Users

This creates test accounts for E2E testing in production with `NEXT_PUBLIC_DEV_LOGIN=true`.

```bash
# Run with inline environment variables
SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
SUPABASE_SERVICE_KEY="eyJ..." \
npm run seed:prod:users
```

### Test User Credentials (Production)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@nitoagua.cl | admin.123 | In admin_allowed_emails |
| Consumer | consumer@nitoagua.cl | consumer.123 | Standard consumer |
| Supplier | supplier@nitoagua.cl | supplier.123 | Pre-approved supplier |

### Login URLs

- **Consumer/Supplier**: https://nitoagua.vercel.app/login
- **Admin**: https://nitoagua.vercel.app/admin/login

---

## Going Live Checklist

When ready to launch with real users, follow these steps:

### 1. Preview Cleanup (Dry Run)

See what will be deleted without actually deleting:

```bash
SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
SUPABASE_SERVICE_KEY="eyJ..." \
npm run cleanup:prod
```

This shows:
- Test users to be deleted
- Associated water requests
- Associated offers
- Admin allowlist entries

### 2. Execute Cleanup

Actually delete all test data:

```bash
SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
SUPABASE_SERVICE_KEY="eyJ..." \
npm run cleanup:prod:confirm
```

### 3. Disable Dev Login

In Vercel project settings:

1. Go to Project Settings > Environment Variables
2. Set `NEXT_PUBLIC_DEV_LOGIN` to `false` (or remove it)
3. Redeploy the application

### 4. Verify Real Admin Access

Ensure real admin emails are in `admin_allowed_emails` table:
- khujta.ai@gmail.com
- carcamo.gabriel@gmail.com

### What Gets Deleted

The cleanup script removes:
- Test auth users: admin@nitoagua.cl, consumer@nitoagua.cl, supplier@nitoagua.cl
- Their profiles in the `profiles` table
- admin@nitoagua.cl from `admin_allowed_emails`
- Any water_requests associated with test users
- Any offers associated with test users

**NOT deleted:**
- Real user accounts
- Real admin allowlist entries
- Production data created by real users

---

## Environment Variables Reference

### Local Development (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55326
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Local anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Local service role key
NEXT_PUBLIC_DEV_LOGIN=true            # Enable email/password login
```

### Production (Vercel)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://spvbmmydrfquvndxpcug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # Production anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Production service role key (server only)
NEXT_PUBLIC_DEV_LOGIN=true             # Set to false for production
```

---

## Troubleshooting

### "Missing environment variables" error

Make sure you're passing the correct environment variables inline:

```bash
SUPABASE_URL="https://..." SUPABASE_SERVICE_KEY="eyJ..." npm run seed:prod:users
```

### "User already exists" message

The scripts use upsert operations and are idempotent. Running them multiple times is safe - they'll update existing records.

### "Failed to add to admin allowlist"

The `admin_allowed_emails` table requires an `added_by` field. The scripts handle this automatically by setting it to "system".

### Service role key not working

Ensure you're using the **service_role** key, not the **anon** key. The service role key bypasses Row Level Security (RLS).
