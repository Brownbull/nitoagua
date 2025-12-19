# Process & Strategy

> Section 7 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: run_app.local.md, docs/sprint-artifacts/

## Branching Strategy

> From run_app.local.md:
> "Branching: feature/* → develop → staging → main"

| Branch | Purpose | Merges To |
|--------|---------|-----------|
| **main** | Production code | - |
| **staging** | Pre-production testing | main |
| **develop** | Integration branch | staging |
| **feature/*** | Story implementation | develop |

### Branch Flow

```
feature/story-X-Y  →  develop  →  staging  →  main
       ↓                ↓            ↓          ↓
   Local dev       Integration   Pre-prod   Production
```

## Deployment Strategy

| Environment | URL | Deploy Trigger |
|-------------|-----|----------------|
| **Production** | https://nitoagua.vercel.app | Merge to main |
| **Staging** | https://staging.nitoagua.vercel.app | Merge to staging |
| **Preview** | Auto-generated | Any push |

### Vercel Integration

- Auto-builds on push to any branch
- Preview deployments for PRs
- Production deployment from main branch
- Environment variables per environment (SERVICE_ROLE_KEY production-only)

## Testing Approach

### When to Test

| Phase | Testing Required |
|-------|-----------------|
| Development | Run related E2E tests locally |
| PR Review | Full E2E suite must pass |
| Staging | Smoke tests on staging environment |
| Production | Verification after deploy |

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/consumer-request.spec.ts

# Run with UI
npx playwright test --ui

# Run seeded tests only
npm run test:e2e -- --grep "@seeded"
```

## Team Decisions

| Decision | Date | Reason |
|----------|------|--------|
| Google OAuth only | 2025-12-04 | Simplifies auth, consistent UX |
| Consumer-choice offers | 2025-12-11 | Simpler than push assignment |
| Supabase Realtime | 2025-12-11 | Zero cost, instant notifications |
| Per-test seeding | 2025-12-15 | Deterministic test isolation |
| BMAD workflow for stories | 2025-12-01 | Consistent story format |

## Development Workflow

### Story Implementation

1. Create feature branch: `git checkout -b feature/story-X-Y`
2. Implement with TDD approach
3. Run related E2E tests locally
4. Push and create PR to develop
5. Wait for CI to pass
6. Merge to develop
7. Promote: develop → staging → main

### Local Development

```bash
# Start local Supabase
npx supabase start

# Start dev server
npm run dev

# Seed test data
npm run seed:local

# Run tests
npm run test:e2e
```

## Sprint Cadence

- **Epic-based sprints** - One epic per sprint
- **Story-driven development** - Each story is a deployable unit
- **Continuous integration** - Merge to develop frequently
- **Weekly staging promotion** - Staging updated at least weekly

---

## Deployment History

### Testing-2 - 2025-12-18

**Story:** testing-2-local-schema-sync
**Final Environment:** Production
**Production URL:** https://nitoagua.vercel.app

**Changes Deployed:**
- `npm run verify:local-db` - Database verification script for CI
- `npm run seed:dev-login` - Dev login test user seeding
- `docs/startup/run_app.local.md` - Comprehensive local development guide

**Workflow Implications:**
- Enables reliable local E2E testing
- Unblocks Testing-3 (playwright-utils integration)
- Improves developer onboarding experience

**Deployment Path:** develop → staging → main

---

## Sync Notes

Last process sync: 2025-12-18
Sources: run_app.local.md, BMAD workflow documentation
