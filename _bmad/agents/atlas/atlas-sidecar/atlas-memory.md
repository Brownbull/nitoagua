# Atlas Memory - Application Knowledge Base

> Last Sync: 2025-12-18
> Project: nitoagua

---

## IMPORTANT: Use Sharded Knowledge

This file is a **legacy reference**. Atlas now uses sharded knowledge stored in `knowledge/` folder:

| Fragment | Content |
|----------|---------|
| [01-purpose.md](knowledge/01-purpose.md) | App mission, principles, target market, currency |
| [02-features.md](knowledge/02-features.md) | Feature inventory with intent and connections |
| [03-personas.md](knowledge/03-personas.md) | User personas, goals, behaviors |
| [04-architecture.md](knowledge/04-architecture.md) | Tech stack, patterns, decisions |
| [05-testing.md](knowledge/05-testing.md) | Test strategy, seeds, coverage expectations |
| [06-lessons.md](knowledge/06-lessons.md) | Retrospective insights, patterns to avoid/follow |
| [07-process.md](knowledge/07-process.md) | Branching, deployment, team decisions |
| [08-workflow-chains.md](knowledge/08-workflow-chains.md) | User journeys and dependencies |
| [09-sync-history.md](knowledge/09-sync-history.md) | Sync log, drift tracking |

**Consult `atlas-index.csv` to identify which fragments to load for any given task.**

---

## Quick Reference (Cached)

### Critical Facts

| Fact | Value | Source |
|------|-------|--------|
| **Target Market** | Rural Chile (Villarrica pilot) | prd.md:11 |
| **Currency** | CLP (Chilean Peso, no decimals) | architecture.md:675 |
| **Primary Language** | Spanish (Chilean) | prd.md:198 |
| **Consumer Persona** | Doña María, 58yo, NOT tech-savvy | ux-spec:13 |
| **Provider Persona** | Don Pedro, 42yo, tech-comfortable | ux-spec:16 |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth only) |
| Email | Resend + React Email |
| Deploy | Vercel |

### MVP Status

**Complete** (Epic 5 finished 2025-12-08)

All core flows working:
- ✅ Guest water requests
- ✅ Registered user requests
- ✅ Provider dashboard
- ✅ Email notifications
- ✅ In-app notifications
- ✅ Request tracking

**Production URL:** https://nitoagua.vercel.app

---

## Sync History

| Date | Documents Synced | Notes |
|------|-----------------|-------|
| 2025-12-18 | PRD, Architecture, UX Spec, Epics, Retrospectives (1-5) | Initial full sync - all 9 fragments populated |

---

## Push Alert Triggers

Active monitoring for:
- Story creation affecting existing workflows
- Code review findings without test coverage
- Architecture conflicts with documented patterns
- Strategy/process references needing alignment check
