# Manual Testing Seeds

This folder contains SQL scripts for seeding and cleaning the production database before manual multi-device testing sessions.

## Purpose

These scripts prepare a clean, consistent database state for manual testing rounds. Unlike automated E2E test seeds (in `scripts/local/`), these are designed for human testers running the full application across multiple devices.

## Available Scripts

| Script | Purpose |
|--------|---------|
| [full-cleanup.sql](./full-cleanup.sql) | Clears all transactional data, keeps user profiles |
| [seed-test-scenario.sql](./seed-test-scenario.sql) | Seeds specific scenarios for testing (optional) |

## How to Run

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the NitoAgua project
3. Navigate to **SQL Editor**
4. Copy/paste the script content
5. Click **Run**

### Option 2: Via MCP Tool

If using Claude Code with Supabase MCP:
```
Ask Claude to run the SQL from the seed file
```

### Option 3: Via psql

```bash
# Requires database connection string
psql $DATABASE_URL -f docs/testing/manual/seeds/full-cleanup.sql
```

## Test Accounts

After cleanup, these accounts remain available:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@nitoagua.cl | admin.123 | Admin panel access |
| Consumer | consumer@nitoagua.cl | consumer.123 | Mobile testing |
| Supplier | supplier@nitoagua.cl | supplier.123 | Provider testing |

## When to Run

- **Before each testing round** - Start fresh
- **After major bug fixes** - Verify fixes with clean data
- **Before demo sessions** - Clean state for stakeholders

## Related Files

- [Test Plans](../plans/) - Multi-device test plans
- [Bug Reports](../bugs/) - Bug tracking from test sessions
