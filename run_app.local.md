# nitoagua - Local Development

**Port:** 3005

## Quick Start

```bash
npm run dev
```

Open http://localhost:3005

## Quick Links

| Service | URL |
|---------|-----|
| **App** | http://localhost:3005 |
| **Supabase Studio** | http://127.0.0.1:55330 |
| **Mailpit (Email)** | http://127.0.0.1:55331 |

## Setup (First Time)

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

## Local Supabase (Docker)

Requires Docker running.

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset database (re-apply migrations)
npx supabase db reset

# Check status
npx supabase status
```

### Local Services (ports in 55xxx range)

| Service | URL |
|---------|-----|
| Studio | http://127.0.0.1:55330 |
| API | http://127.0.0.1:55326 |
| Database | postgresql://postgres:postgres@127.0.0.1:55327/postgres |
| Mailpit | http://127.0.0.1:55331 |

### Switch to Local Dev

Copy `.env.local.development` to `.env.local` to use local Supabase.

## Build

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Database Cleanup

Delete all water requests from the database.

```bash
# Clean LOCAL database (no confirmation needed)
npm run cleanup:local

# Clean REMOTE/Production database (requires --confirm flag)
npm run cleanup:remote -- --confirm
```

**Note:** For remote cleanup, you need a `.env.scripts` file in the project root with:

```
REMOTE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## DBeaver Connection (Local DB)

| Setting | Value |
|---------|-------|
| Host | `127.0.0.1` |
| Port | `55327` |
| Database | `postgres` |
| Username | `postgres` |
| Password | `postgres` |

## Git Branching Strategy

```
feature → develop → staging → main
```

| Branch | Purpose | URL |
|--------|---------|-----|
| `main` | Production | https://nitoagua.vercel.app |
| `staging` | Pre-production testing | https://nitoagua-git-staging-khujtaai.vercel.app |
| `develop` | Development integration | https://nitoagua-git-develop-khujtaai.vercel.app |

### Merge Flow (after code review approval)

1. Merge `develop` → `staging` (verify preview)
2. Merge `staging` → `main` (production deploy)
3. Delete feature branches after successful merge

## Current Sprint Status

**Last Updated:** 2025-12-24

### Completed Epics
| Epic | Title | Status |
|------|-------|--------|
| 1 | Foundation & Infrastructure | ✅ Complete |
| 2 | Consumer Water Request | ✅ Complete |
| 3 | Supplier Dashboard | ✅ Complete |
| 4 | User Accounts & Profiles | ✅ Complete |
| 5 | Notifications & Communication | ✅ Complete (MVP) |
| 6 | Admin Operations Panel | ✅ Complete |
| 7 | Provider Onboarding | ✅ Complete |
| 8 | Provider Offer System | ✅ Complete |
| 9 | CORFO Application | ✅ Complete |
| 10 | Consumer Offer Selection | ✅ Complete |
| 11 | Playwright Workflow Validation | ✅ Complete |

### Current Epic: 12 - Consumer UX Enhancements

| Story | Title | Status |
|-------|-------|--------|
| 12-1 | Map location pinpoint | backlog |
| 12-2 | Payment method selection | backlog |
| 12-3 | Negative status states | backlog |
| 12-4 | Urgency pricing display | backlog |
| 12-5 | Remove fake social proof | backlog |
| 12-6 | Web Push Notifications | **drafted** |

**Next Steps:**
1. Context Epic 12 (`/bmad:bmm:workflows:create-architecture`)
2. Or start with 12-6 (`/bmad:bmm:workflows:dev-story 12-6`)

### Backlogged Items (from Epic 11)
- P2: Document upload E2E testing
- P12: Withdrawal request E2E testing

---

## BMAD Suite

The project uses BMAD (Business Method for Agile Development) located in `_bmad/`.

### Key Workflows

| Workflow | Command | Purpose |
|----------|---------|---------|
| Sprint Status | `/bmad:bmm:workflows:sprint-status` | Check current sprint progress |
| Create Story | `/bmad:bmm:workflows:create-story` | Draft next story from epics |
| Dev Story | `/bmad:bmm:workflows:dev-story` | Implement a story |
| Code Review | `/bmad:bmm:workflows:code-review` | Adversarial code review |
| Deploy Story | `/bmad:bmm:workflows:deploy-story` | Deploy through branch pipeline |

### Sprint Tracking

- **Sprint Status:** `docs/sprint-artifacts/sprint-status.yaml`
- **Stories:** `docs/sprint-artifacts/epic{N}/`

### Agent Customization

Project-specific settings in `_bmad/_config/agents/bmm-dev.customize.yaml`:
- Branching strategy memories
- Deployment URL references
- Merge workflow prompts
