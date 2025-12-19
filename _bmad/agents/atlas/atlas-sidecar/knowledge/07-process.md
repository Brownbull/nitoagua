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
| Atlas-enhanced code reviews | 2025-12-19 | Catches issues before production |
| Seed scripts reference constants | 2025-12-19 | Prevents data mismatches |
| Tech spec before stories | 2025-12-19 | Ensures architectural alignment |

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

## Recent Deployments

| Story | Date | Key Changes |
|-------|------|-------------|
| Testing-3 | 2025-12-19 | Merged Playwright fixtures, persona validation tests |
| Testing-2 | 2025-12-18 | `verify:local-db`, `seed:dev-login`, local dev guide |

> Full deployment details in `docs/sprint-artifacts/` - Atlas tracks patterns, not full logs.

---

## Process Updates (Epic 8 Retrospective)

| Practice | Adopted | Description |
|----------|---------|-------------|
| Seed constants | 2025-12-19 | Seed scripts MUST reference source constants (COMUNAS, etc.) |
| Atlas code reviews | 2025-12-19 | Validate against Section 4/6 patterns, capture learnings |
| Tech spec first | 2025-12-19 | Run `atlas-epic-tech-context` before drafting stories |

---

*Last verified: 2025-12-19 | Sources: run_app.local.md, sprint-artifacts, Epic 8 Retrospective*
