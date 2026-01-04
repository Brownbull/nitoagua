# Manual Testing Documentation

Human-performed testing for NitoAgua PWA. This includes multi-device testing, exploratory testing, and bug tracking from manual test sessions.

## Directory Structure

```
manual/
├── README.md                 # This file
├── plans/                    # Test plans
│   ├── live-multi-device-test-plan.md         # Round 1 (completed)
│   └── live-multi-device-test-plan-round2.md  # Round 2 (current)
├── bugs/                     # Bug reports & evidence
│   ├── live-test-bugs-2024-12-30.md           # Round 1 bugs (22 bugs - all fixed)
│   ├── live-test-bugs-round2-2026-01-04.md    # Round 2 bugs
│   └── screenshots/                            # Evidence from sessions
└── seeds/                    # Database seeding for manual tests
    ├── README.md                              # Seeding instructions
    ├── full-cleanup.sql                       # Clear all transactional data
    └── seed-test-scenario.sql                 # Optional pre-populated scenarios
```

## Test Sessions

| Session | Date | Version | Status | Bugs Found | Plan | Bugs |
|---------|------|---------|--------|------------|------|------|
| Round 1 | 2024-12-30 | v2.4.0 | Complete | 22 bugs (all fixed) | [Plan](./plans/live-multi-device-test-plan.md) | [Bugs](./bugs/live-test-bugs-2024-12-30.md) |
| Round 2 | 2026-01-04 | v2.7.0 | In Progress | - | [Plan](./plans/live-multi-device-test-plan-round2.md) | [Bugs](./bugs/live-test-bugs-round2-2026-01-04.md) |

## Quick Start

### Before Testing: Database Cleanup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Run [seeds/full-cleanup.sql](./seeds/full-cleanup.sql)
3. Verify all counts are 0

### Test Accounts

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| Admin | admin@nitoagua.cl | admin.123 | /admin/login |
| Consumer | consumer@nitoagua.cl | consumer.123 | /login |
| Supplier | supplier@nitoagua.cl | supplier.123 | /login |

### Device Setup

| Device | Role | Purpose |
|--------|------|---------|
| Computer 1 | Admin | Admin panel operations |
| Computer 2 | Provider | Offer management, deliveries |
| Android Phone | Consumer | Mobile UX, push notifications |

## Test Plans

### Round 1: Initial Multi-Device Testing (Complete)
- **File:** [plans/live-multi-device-test-plan.md](./plans/live-multi-device-test-plan.md)
- **Status:** Complete - 22 bugs found
- **Focus:** End-to-end flows across Consumer, Provider, Admin roles

### Round 2: Post-Fix Validation (Current)
- **File:** [plans/live-multi-device-test-plan-round2.md](./plans/live-multi-device-test-plan-round2.md)
- **Status:** In Progress
- **Focus:**
  - Regression testing (verify all 22 bug fixes)
  - New features: Rating system, En Camino status, Dispute flow
  - Concurrent multi-user scenarios
  - Edge cases: Offer expiration, request timeout

## Database Seeding

The [seeds/](./seeds/) folder contains SQL scripts for preparing the database:

| Script | Purpose | When to Use |
|--------|---------|-------------|
| [full-cleanup.sql](./seeds/full-cleanup.sql) | Clear all transactional data | Before each test round |
| [seed-test-scenario.sql](./seeds/seed-test-scenario.sql) | Pre-populate specific scenarios | When testing specific features |

See [seeds/README.md](./seeds/README.md) for detailed instructions.

## Bug Report Template

When documenting new bugs, use this format:

```markdown
### BUG-R2-XXX: [Title]

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P0 / P1 / P2 / P3 |
| **Device** | Android Phone / Computer / etc. |
| **Test Step** | X.X |
| **URL/Route** | /path |

**Description:**
[What's wrong]

**Steps to Reproduce:**
1. ...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshot:** (if applicable)
```

## Related Documentation

- [Automated E2E Tests](/tests/e2e/) - Playwright test suite
- [E2E Testing Patterns](/docs/technical/e2e-testing-patterns.md)
- [Test Data Seeding Guide](../test-data-seeding-guide.md)
