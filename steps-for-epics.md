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

## Epic 4 Preparation Notes

- **Authentication changed**: Google OAuth only (not Email/Password as originally spec'd)
- **Guest flow unchanged**: Consumers can still request water without registering
- **Test login**: `ENABLE_TEST_LOGIN=true` in local .env for E2E tests
- **Stories**: 4-1 through 4-5 (features) + 4-6 (deployment)

---

*Last Updated: 2025-12-04 (Epic 3 Retrospective / Epic 4 Preparation)*
