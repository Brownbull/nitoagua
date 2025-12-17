# Environment & Seeding Strategy

This document describes how local development, testing, and production environments are configured, and how seed scripts work across environments.

---

## Environment Configuration

### Local Development (Default)

**Purpose**: Day-to-day development and running E2E tests locally.

**Configuration**: `.env.local` points to local Supabase:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55326
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
NEXT_PUBLIC_DEV_LOGIN=true
```

**Supabase**: Run `npx supabase start` to start local instance.

**Seed scripts**: Use `npm run seed:*` commands (target local by default).

---

### Production Testing (Optional)

**Purpose**: Testing against production database (e.g., verifying deployed features, manual QA).

**Configuration**: Create `.env.production.local` (gitignored):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://spvbmmydrfquvndxpcug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
NEXT_PUBLIC_DEV_LOGIN=true
```

**To run app against production**:
```bash
# Copy production config
cp .env.production.local .env.local

# Run the app
npm run dev

# When done, restore local config
cp .env.local.backup .env.local
```

**Seed scripts**: Use `npm run seed:*:prod` commands (target production).

---

### Deployed Application (Vercel)

**Purpose**: Live production application.

**Configuration**: Environment variables set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL` → production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → production anon key
- `SUPABASE_SERVICE_ROLE_KEY` → production service role key (server-only)
- `NEXT_PUBLIC_DEV_LOGIN` → `false` (disabled in production)

---

## Seed Script Strategy

### Naming Convention

| Command | Target | Description |
|---------|--------|-------------|
| `npm run seed:<name>` | Local | Seeds to local Supabase (default) |
| `npm run seed:<name>:prod` | Production | Seeds to production Supabase |
| `npm run seed:<name>:clean` | Local | Cleans local seeded data |
| `npm run seed:<name>:prod:clean` | Production | Cleans production seeded data |

### Available Seed Scripts

| Script | Purpose | Test Users Affected |
|--------|---------|---------------------|
| `seed:local` | Create dev login users (supplier, consumer, admin) | All |
| `seed:test` | Create water requests in various states | consumer@nitoagua.cl |
| `seed:offers` | Create offers for provider testing | supplier@nitoagua.cl |
| `seed:earnings` | Create delivered requests + commission ledger | supplier@nitoagua.cl |
| `seed:mockup` | Create UI mockup data | supplier@nitoagua.cl |
| `seed:admin` | Create/reset admin user | admin@nitoagua.cl |

### Safety Guarantees

1. **Idempotent**: All seed scripts use `upsert` - safe to run multiple times
2. **Scoped**: Only affects test users (supplier@, consumer@, admin@nitoagua.cl)
3. **Reversible**: Every seed has a corresponding `:clean` command
4. **Deterministic**: Uses fixed UUIDs for consistent test references

### Test Users

These users exist in both local and production environments:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `supplier@nitoagua.cl` | `supplier.123` | supplier | Provider testing |
| `consumer@nitoagua.cl` | `consumer.123` | consumer | Consumer testing |
| `admin@nitoagua.cl` | `admin.123` | admin | Admin panel testing |
| `provider2@nitoagua.cl` | `provider2.123` | supplier | Multi-provider tests |

**Important**: These are TEST ACCOUNTS only. Never use for real data.

---

## Implementation Details

### How Seed Scripts Detect Environment

Scripts check for environment variables:
```typescript
const PROD_CONFIG = {
  url: process.env.SUPABASE_URL || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_KEY || "",
};

const useProduction = !!(PROD_CONFIG.url && PROD_CONFIG.serviceRoleKey);
const CONFIG = useProduction ? PROD_CONFIG : LOCAL_CONFIG;
```

### npm Script Setup

```json
{
  "scripts": {
    "seed:earnings": "npx ts-node scripts/local/seed-earnings-tests.ts",
    "seed:earnings:clean": "npx ts-node scripts/local/seed-earnings-tests.ts --clean",
    "seed:earnings:prod": "source .env.production.local && npx ts-node scripts/local/seed-earnings-tests.ts",
    "seed:earnings:prod:clean": "source .env.production.local && npx ts-node scripts/local/seed-earnings-tests.ts --clean"
  }
}
```

---

## Workflow Examples

### 1. Local Development (Most Common)

```bash
# Start local Supabase
npx supabase start

# Seed test data
npm run seed:local
npm run seed:test
npm run seed:earnings

# Run app
npm run dev

# Run E2E tests
NEXT_PUBLIC_DEV_LOGIN=true npm run test:e2e
```

### 2. Testing Production Features

```bash
# Seed data to production
npm run seed:earnings:prod

# Test on deployed site
# Go to https://nitoagua.vercel.app and log in as supplier@nitoagua.cl

# Clean up when done
npm run seed:earnings:prod:clean
```

### 3. Local App Against Production DB (Debugging)

```bash
# Backup local config
cp .env.local .env.local.backup

# Switch to production
cp .env.production.local .env.local

# Run app against production
npm run dev

# Restore when done
cp .env.local.backup .env.local
```

---

## Security Notes

1. **Never commit production keys** - `.env.production.local` is gitignored
2. **Local demo keys are safe** - Standard Supabase demo keys only work on localhost
3. **Service role key is server-only** - Never exposed to browser
4. **Test users are isolated** - Seed scripts only affect designated test accounts

---

## Related Documentation

- [Test Data Seeding Guide](./test-data-seeding-guide.md)
- [E2E Testing Patterns](../technical/e2e-testing-patterns.md)
