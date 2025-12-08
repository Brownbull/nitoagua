# Steps for Epics

This document outlines the standard workflow for executing epics in the nitoagua project.

---

## Pre-Epic Checklist

Before starting a new epic:

- [ ] Previous epic retrospective completed
- [ ] Backlog reviewed for blocking items
- [ ] Required MCP tools installed and configured
- [ ] Test infrastructure verified (Playwright working)

---

## Epic Execution Workflow

### Phase 1: Epic Preparation

1. **Run Tech Context Workflow**
   ```
   /bmad:bmm:workflows:epic-tech-context
   ```
   - Generates technical specification for the epic
   - Creates acceptance criteria details
   - Identifies dependencies and risks

2. **Run Sprint Planning**
   ```
   /bmad:bmm:workflows:sprint-planning
   ```
   - Updates sprint-status.yaml
   - Sets story priorities
   - Confirms story order

### Phase 2: Story Execution (repeat for each story)

3. **Create Story Context**
   ```
   /bmad:bmm:workflows:story-context
   ```
   - Assembles relevant documentation
   - Pulls code snippets for reference
   - Creates context XML file

4. **Mark Story Ready**
   ```
   /bmad:bmm:workflows:story-ready
   ```
   - Moves story from TODO → IN PROGRESS

5. **Execute Development**
   ```
   /bmad:bmm:workflows:dev-story
   ```
   - Implements tasks/subtasks
   - Writes tests
   - Validates against acceptance criteria

6. **Code Review**
   ```
   /bmad:bmm:workflows:code-review
   ```
   - Senior developer review
   - Validates all ACs met
   - Checks code quality

7. **Mark Story Done**
   ```
   /bmad:bmm:workflows:story-done
   ```
   - Moves story to DONE
   - Advances queue to next story

### Phase 3: Epic Completion

8. **Final Deployment Story**
   - Each epic ends with a deployment & verification story (e.g., 3-8, 4-6)
   - Pre-deployment checks: `npm run lint`, `npm run build`, `npm run test:e2e`
   - Git workflow: develop → staging → main
   - Verify Vercel production deployment
   - Production smoke testing
   - E2E suite verification against production

9. **Run Retrospective**
   ```
   /bmad:bmm:workflows:retrospective
   ```
   - Reviews what went well
   - Identifies improvements
   - Documents lessons learned and patterns
   - Prepares for next epic

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Check current status | `/bmad:bmm:workflows:workflow-status` |
| Start new story | `/bmad:bmm:workflows:story-ready` |
| Develop story | `/bmad:bmm:workflows:dev-story` |
| Review story | `/bmad:bmm:workflows:code-review` |
| Complete story | `/bmad:bmm:workflows:story-done` |

---

## MCP Tools Available

### Supabase MCP
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__list_tables` - View schema
- `mcp__supabase__apply_migration` - Apply DDL changes
- `mcp__supabase__get_advisors` - Check security/performance

### Vercel MCP
- `mcp__vercel__list_deployments` - Check deployment status
- `mcp__vercel__get_deployment_build_logs` - Debug build issues
- `mcp__vercel__web_fetch_vercel_url` - Test deployed URLs

### Browser MCP (Playwright skill)
- `playwright-skill:playwright-skill` - UI testing automation

---

## Notes from Epic 1

- Request MCP/CLI tools when needed - Gabe will install them
- MCP tools can be added to auto-approval config for faster workflows
- Always verify Playwright setup before UI-heavy epics
- Check backlog.md for technical debt items

## Notes from Epic 3

- **Browserless MCP server** integration enabled streamlined deployment and testing
- **Google OAuth only** for all registered users (consumers and suppliers)
- **Test login mechanism** for local E2E testing (env-gated, dev only)
- **Patterns established**: Admin Client, Server Actions, Optimistic UI, AlertDialog confirmations
- **Each epic MUST end with a deployment story** following git branching workflow

## Epic 4 Completion Notes

- **All 6 stories completed** (100% completion, zero regressions)
- **Extended implementation**: Story 4-1 absorbed 4-2, 4-3, 4-4 in single session
- **Test suite grew**: From ~526 to 879 tests (353 new tests)
- **Key pattern**: Comprehensive upfront flow design enables early issue detection
- **100% follow-through** on Epic 3 retrospective action items

### Issues Identified for Resolution

| Issue | Priority | Description |
|-------|----------|-------------|
| Dashboard data freshness | CRITICAL | New requests don't appear without manual refresh |
| Tab count inconsistency | CRITICAL | Accepted/Completed counts inconsistent between tabs |
| Seeded test data | IMPORTANT | E2E integration tests skipped due to missing fixtures |
| WebKit flaky tests | NICE-TO-HAVE | ~21 intermittent failures lingering |

---

## Prep Sprint: Epic 5 Readiness

**Decision**: Complete a prep sprint before Epic 5 to address technical debt and ensure clean foundation.

### Prep Sprint Stories

| Story ID | Title | Priority | Owner |
|----------|-------|----------|-------|
| prep-5-1 | Fix Dashboard Data Freshness | CRITICAL | Charlie |
| prep-5-2 | Fix Tab Count Inconsistency | CRITICAL | Charlie |
| prep-5-3 | Seeded Test Data Setup | IMPORTANT | Dana |
| prep-5-4 | Resend/React Email Spike | IMPORTANT | Elena |
| prep-5-5 | WebKit Flaky Test Fix | NICE-TO-HAVE | Dana + Charlie |

### Prep Sprint Workflow

1. **Draft each prep story** using `/bmad:bmm:workflows:create-story`
2. **Execute through normal workflow**: drafted → ready-for-dev → in-progress → review → done
3. **Code review required** for each prep task
4. **Complete all CRITICAL items** before starting Epic 5

### Folder Structure

```
docs/sprint-artifacts/
├── prep5/
│   ├── prep-5-1-fix-dashboard-data-freshness.md
│   ├── prep-5-2-fix-tab-count-inconsistency.md
│   ├── prep-5-3-seeded-test-data-setup.md
│   ├── prep-5-4-resend-react-email-spike.md
│   └── prep-5-5-webkit-flaky-test-fix.md
```

---

## Epic 5 Preparation Notes

- **BLOCKED**: Complete prep-5 sprint first
- **Resend API**: Will need API key configured in environment
- **Notification stubs**: `console.log('[NOTIFY]...')` exists throughout API routes
- **Stories**: 5-1 (email setup), 5-2 (guest notifications), 5-3 (in-app notifications)
- **Dependencies**: Consumer profiles (4-1), request history (4-4), guest email capture (Epic 2)

---

## Current Progress

| Epic | Status | Retrospective |
|------|--------|---------------|
| Epic 1: Foundation & Infrastructure | COMPLETE | DONE |
| Epic 2: Consumer Water Request | COMPLETE | DONE |
| Epic 3: Supplier Dashboard & Request Management | COMPLETE | DONE |
| Epic 4: User Accounts & Profiles | COMPLETE | DONE |
| **Prep-5: Epic 5 Readiness** | **IN PROGRESS** | Optional |
| Epic 5: Notifications & Communication | BLOCKED | - |

**Production URL**: https://nitoagua.vercel.app

---

*Last Updated: 2025-12-05 (Epic 4 Retrospective / Prep Sprint Planning)*
