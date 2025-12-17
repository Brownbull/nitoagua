# Test Data Seeding Guide

A comprehensive guide for developers and testers to understand and use the test data seeding infrastructure in NitoAgua.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Available Seed Scripts](#available-seed-scripts)
4. [Test Scenarios](#test-scenarios)
5. [Test Fixtures](#test-fixtures)
6. [Adding New Scenarios](#adding-new-scenarios)
7. [Environment Configuration](#environment-configuration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

NitoAgua uses a modular seeding system to create deterministic test data for:

- **E2E Testing**: Playwright tests that require pre-existing data
- **UI Development**: Mockup data for visual testing and screenshots
- **Manual QA**: Reproducible scenarios for testing specific flows
- **Demo/Staging**: Realistic data for stakeholder reviews

### Key Principles

1. **Idempotent**: All seed scripts can run multiple times without duplicating data
2. **Deterministic**: UUIDs and tracking tokens are fixed for reliable test references
3. **Isolated**: Different seeders target different data sets to avoid conflicts
4. **Documented**: Fixtures export constants that tests can import directly

---

## Quick Start

### Prerequisites

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Verify connection
npx supabase status
```

### Common Workflows

```bash
# 1. Basic E2E testing setup
npm run seed:local        # Create dev login users
npm run seed:test         # Create water requests in various states

# 2. Provider offer testing
npm run seed:offers       # Create offers for withdrawal/history tests

# 3. UI mockup screenshots
npm run seed:mockup       # Create data matching Figma mockups

# 4. Clean slate
npm run seed:test:clean   # Remove test data
npm run seed:offers:clean # Remove offer test data
npm run seed:mockup:clean # Remove mockup data
```

---

## Available Seed Scripts

### Local Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev Login Users** | `npm run seed:local` | Creates test users for dev login (supplier, consumer, admin) |
| **Admin User** | `npm run seed:admin` | Creates/resets admin user credentials |
| **E2E Test Data** | `npm run seed:test` | Seeds water requests in all states for E2E tests |
| **E2E Test Cleanup** | `npm run seed:test:clean` | Removes seeded E2E test data |
| **Offer Test Data** | `npm run seed:offers` | Seeds offers for Stories 8-3, 8-4 testing |
| **Offer Test Cleanup** | `npm run seed:offers:clean` | Removes seeded offer test data |
| **UI Mockups** | `npm run seed:mockup` | Seeds data matching design mockups |
| **Empty Mockups** | `npm run seed:mockup:empty` | Seeds minimal data for empty-state screenshots |
| **Mockup Cleanup** | `npm run seed:mockup:clean` | Removes mockup data |
| **Provider2 Test** | `npm run seed:provider2` | Creates second provider for multi-provider tests |
| **Earnings Test Data** | `npm run seed:earnings` | Seeds delivered requests and commission ledger for earnings dashboard |
| **Earnings Cleanup** | `npm run seed:earnings:clean` | Removes seeded earnings test data |

### Cleanup Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Local Cleanup** | `npm run cleanup:local` | Removes all water requests (local) |
| **Remote Cleanup** | `npm run cleanup:remote` | Removes all water requests (production) |
| **Production Cleanup** | `npm run cleanup:prod:confirm` | Removes production test data (requires confirm) |

---

## Test Scenarios

### Scenario 1: Consumer Request Flow (Guest)

**Use case**: Test the guest consumer journey from request creation to tracking.

```bash
npm run seed:test
```

**Data created**:
| Tracking Token | Status | Description |
|----------------|--------|-------------|
| `seed-token-pending` | pending | Guest pending request |
| `seed-token-accepted` | accepted | Request with delivery window |
| `seed-token-delivered` | delivered | Completed delivery |
| `seed-token-cancelled` | cancelled | Cancelled request |

**Test file**: `tests/e2e/consumer-tracking.spec.ts`

### Scenario 2: Consumer Request Flow (Authenticated)

**Use case**: Test authenticated consumer with request history.

```bash
npm run seed:test
```

**Data created**:
| Tracking Token | Status | Owner |
|----------------|--------|-------|
| `seed-token-consumer-pending` | pending | test-consumer@test.local |
| `seed-token-consumer-delivered` | delivered | test-consumer@test.local |

**Test file**: `tests/e2e/cancel-request.spec.ts`

### Scenario 3: Provider Offer Management

**Use case**: Test provider offer submission, withdrawal, and history.

```bash
npm run seed:local   # Create dev login provider
npm run seed:offers  # Create offers in various states
```

**Data created**:
| Offer ID (suffix) | Status | Use Case |
|-------------------|--------|----------|
| `...888888881` | active | Can be withdrawn |
| `...888888882` | active | Urgent request offer |
| `...888888883` | cancelled | Re-submission testing |
| `...888888884` | accepted | "Ver Entrega" button |
| `...888888885` | expired | History section |

**Test files**:
- `tests/e2e/provider-withdraw-offer.spec.ts`
- `tests/e2e/provider-active-offers.spec.ts`

### Scenario 4: Supplier Dashboard

**Use case**: Test supplier seeing and accepting requests.

```bash
npm run seed:local  # Create supplier
npm run seed:test   # Create pending requests
```

**Login as**: `supplier@nitoagua.cl` (with dev login enabled)

### Scenario 5: Admin Operations

**Use case**: Test admin dashboard and provider verification.

```bash
npm run seed:admin  # Create admin user
```

**Login as**: `admin@nitoagua.cl` (credentials in script output)

### Scenario 6: UI Mockup Screenshots

**Use case**: Generate screenshots matching Figma designs.

```bash
npm run seed:mockup        # Full data state
npm run seed:mockup:empty  # Empty states
```

### Scenario 7: Provider Earnings Dashboard

**Use case**: Test earnings summary, commission breakdown, and delivery history (Story 8-6).

```bash
npm run seed:local     # Create dev login provider
npm run seed:earnings  # Create delivered requests and ledger entries
```

**Data created**:

| Period | Deliveries | Gross Income | Payment Methods |
|--------|------------|--------------|-----------------|
| Today | 3 | $100,000 CLP | Cash + Transfer |
| This Week | 4 | $130,000 CLP | Mixed |
| This Month | 10 | $455,000 CLP | Mixed |

**Commission Ledger**:
| Entry Type | Amount | Description |
|------------|--------|-------------|
| Owed | $3,000 | 100L delivery commission |
| Owed | $11,250 | 5000L delivery commission |
| Owed | $3,000 | 100L delivery commission |
| Paid | $5,000 | Manual payment |
| **Pending** | **$12,250** | Net pending commission |

**Test files**:
- `tests/e2e/provider-earnings-seeded.spec.ts`

**Verified UI elements**:
- Period selector (Hoy / Semana / Mes)
- Net earnings hero card
- Commission breakdown (gross - commission = net)
- Entregas count
- Cash vs Transfer breakdown
- Pending commission with "Pagar" button
- Activity list showing completed deliveries

---

## Test Fixtures

Import test data constants directly into your E2E tests:

```typescript
// tests/e2e/my-test.spec.ts
import {
  TRACKING_TOKENS,
  REQUEST_IDS,
  TEST_SUPPLIER,
  TEST_CONSUMER,
  OFFER_TEST_DATA
} from '../fixtures/test-data';

test('should display pending request', async ({ page }) => {
  await page.goto(`/track/${TRACKING_TOKENS.pending}`);
  await expect(page.getByText('Pendiente')).toBeVisible();
});
```

### Available Exports

**From `tests/fixtures/test-data.ts`:**

```typescript
// User profiles
TEST_SUPPLIER        // { id, email, password, profile }
TEST_CONSUMER        // { id, email, password, profile }

// Tracking tokens by status
TRACKING_TOKENS.pending
TRACKING_TOKENS.consumerPending
TRACKING_TOKENS.accepted
TRACKING_TOKENS.delivered
TRACKING_TOKENS.consumerDelivered
TRACKING_TOKENS.cancelled

// Request IDs by status
REQUEST_IDS.pending
REQUEST_IDS.accepted
// ... etc

// Offer test data (for Stories 8-3, 8-4)
OFFER_TEST_DATA.requests.pendingWithActiveOffer
OFFER_TEST_DATA.offers.activeOffer1
OFFER_TEST_DATA.offers.cancelledOffer
OFFER_TEST_DATA.serviceAreas

// Earnings test data (for Story 8-6)
EARNINGS_TEST_DATA.expectedTotals.month    // { deliveries: 10, gross: 455000, ... }
EARNINGS_TEST_DATA.expectedTotals.week     // { deliveries: 7, gross: 255000, ... }
EARNINGS_TEST_DATA.expectedTotals.today    // { deliveries: 3, gross: 100000, ... }
EARNINGS_TEST_DATA.pendingCommission       // 12250 (CLP)
EARNINGS_TEST_REQUEST_IDS                  // Array of seeded request UUIDs
EARNINGS_TEST_LEDGER_IDS                   // Array of seeded ledger entry UUIDs
```

---

## Adding New Scenarios

### Step 1: Design the Test Data

Document what data is needed:

```markdown
## New Scenario: Multi-Provider Competition

**User story**: As a consumer, I want to see multiple provider offers.

**Required data**:
- 1 pending request
- 2+ providers with offers on that request
- Offers with different prices/delivery windows
```

### Step 2: Create the Seed Script

Create a new file in `scripts/local/`:

```typescript
// scripts/local/seed-multi-provider.ts
#!/usr/bin/env npx ts-node

import { createClient } from "@supabase/supabase-js";

const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // local demo key
};

// Use deterministic UUIDs with a unique prefix
const MULTI_PROVIDER_REQUEST = {
  id: "99999999-9999-9999-9999-999999999901",
  tracking_token: "multi-provider-test-1",
  // ... other fields
};

async function main() {
  const isClean = process.argv.includes("--clean");

  const supabase = createClient(
    LOCAL_CONFIG.url,
    LOCAL_CONFIG.serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  if (isClean) {
    await cleanup(supabase);
  } else {
    await seed(supabase);
  }
}

async function seed(supabase) {
  console.log("🌱 Seeding multi-provider test data...");
  // Use upsert for idempotency
  await supabase.from("water_requests").upsert(MULTI_PROVIDER_REQUEST, { onConflict: "id" });
}

async function cleanup(supabase) {
  console.log("🗑️ Cleaning multi-provider test data...");
  await supabase.from("water_requests").delete().eq("id", MULTI_PROVIDER_REQUEST.id);
}

main();
```

### Step 3: Add npm Scripts

```json
// package.json
{
  "scripts": {
    "seed:multi-provider": "npx ts-node scripts/local/seed-multi-provider.ts",
    "seed:multi-provider:clean": "npx ts-node scripts/local/seed-multi-provider.ts --clean"
  }
}
```

### Step 4: Add Test Fixtures

```typescript
// tests/fixtures/test-data.ts

// Add at the end of the file:
export const MULTI_PROVIDER_TEST_DATA = {
  request: {
    id: "99999999-9999-9999-9999-999999999901",
    tracking_token: "multi-provider-test-1",
  },
  providers: [
    { id: "...", name: "Provider A" },
    { id: "...", name: "Provider B" },
  ],
} as const;
```

### Step 5: Document in This Guide

Add a new entry to the [Test Scenarios](#test-scenarios) section above.

---

## Environment Configuration

### Local Supabase

All local seed scripts use hardcoded credentials for the Supabase local demo:

```typescript
const LOCAL_CONFIG = {
  url: "http://127.0.0.1:55326",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
};
```

### Production/Staging

Production scripts require environment variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
```

**Warning**: Production seed scripts require explicit confirmation flags.

### Dev Login

To enable dev login buttons on the login page:

```bash
NEXT_PUBLIC_DEV_LOGIN=true npm run dev
```

---

## Troubleshooting

### "Connection refused" errors

```bash
# Ensure Supabase is running
npx supabase status

# If not running, start it
npx supabase start
```

### "User not found" errors

```bash
# Seed base users first
npm run seed:local

# Then seed additional data
npm run seed:test
```

### Tests skipping with "No data available"

Tests skip gracefully when seeded data isn't present. Run the appropriate seed script:

```bash
# For consumer tracking tests
npm run seed:test

# For offer tests
npm run seed:offers

# For earnings dashboard tests
npm run seed:earnings
```

### Duplicate key errors

Seed scripts use `upsert` for idempotency, but if you see constraint errors:

```bash
# Clean and re-seed
npm run seed:test:clean && npm run seed:test
```

### TypeScript compilation errors

If ts-node fails, check the script syntax. Common issues:

```bash
# Ignore Node.js ESM warning (cosmetic)
# "Module type of file... is not specified"

# If imports fail, ensure the script uses CommonJS patterns
# or add proper type annotations
```

---

## Related Documentation

- [E2E Testing Patterns](../technical/e2e-testing-patterns.md)
- [Story prep-5-3: Seeded Test Data Setup](../sprint-artifacts/epic5-prep5/prep-5-3-seeded-test-data-setup.md)
- [Architecture Documentation](../architecture.md)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-17 | Added Scenario 7: Provider Earnings Dashboard with seed:earnings scripts | Claude Opus 4.5 |
| 2025-12-16 | Initial guide created | Claude Opus 4.5 |
