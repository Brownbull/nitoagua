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
| Prep-5: Epic 5 Readiness | COMPLETE | DONE |
| Epic 5: Notifications & Communication | **COMPLETE (MVP DONE!)** | DONE |
| Epic 6: Consumer UX Improvements | NOT STARTED | - |
| Epic 7: Provider Onboarding & Management | NOT STARTED | - |
| Epic 8: Admin Dashboard | NOT STARTED | - |

**Production URL**: https://nitoagua.vercel.app

---

## MVP COMPLETE - Post-MVP Planning

### UX Audit Completed (2025-12-10)

Conducted comprehensive UX audit using Party Mode roast sessions:
- Consumer flow audit: [docs/ux-audit/consumer-flow-audit.md](docs/ux-audit/consumer-flow-audit.md)
- Provider flow audit: [docs/ux-audit/provider-flow-audit.md](docs/ux-audit/provider-flow-audit.md)
- Admin requirements: [docs/ux-audit/admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md)

### Post-MVP Epics Created

From audit findings, created 3 new epics (21 stories total) in [docs/epics.md](docs/epics.md):

| Epic | Title | Stories | Key Focus |
|------|-------|---------|-----------|
| 6 | Consumer UX Improvements | 6 | Map pinpoint, negative states, payment methods |
| 7 | Provider Onboarding & Management | 8 | Registration flow, earnings visibility, push model |
| 8 | Admin Dashboard | 7 | Provider verification, pricing, operations |

### Recommended Post-MVP Implementation Order

1. **Epic 7 (Stories 7.1-7.2)** - Provider onboarding is critical for scaling
2. **Epic 8 (Stories 8.1-8.4)** - Admin verification enables provider onboarding
3. **Epic 6 (Stories 6.1-6.3)** - Critical consumer UX fixes
4. **Epic 7 (Stories 7.3-7.8)** - Complete provider experience
5. **Epic 6 (Stories 6.4-6.6)** - Remaining consumer improvements
6. **Epic 8 (Stories 8.5-8.7)** - Full admin operations

### Key Decisions from UX Audit

| Decision | Detail |
|----------|--------|
| Account Model | Single Gmail = single role (Consumer OR Provider OR Admin) |
| Request Assignment | Uber-style push model with 3-5 minute acceptance window |
| Monetization | Flat commission per transaction (NO subscriptions) |
| Payment Methods | Cash-on-delivery AND bank transfer supported |
| Provider Verification | Admin review of documents required |
| Rating Enforcement | Threshold system → warnings → temp ban → permanent ban |
| Map Tracking | Providers only (route planning), NOT consumers |
| Social Proof | Remove fake stats until real data exists |

### Next Steps Options

1. **Create UX mockups** - Provider onboarding, admin dashboard, missing screens
2. **Update existing mockups** - Fix issues identified in roast
3. **Architecture review** - Technical feasibility of push model, real-time features
4. **Sprint planning** - Pick first post-MVP stories to implement
5. **Start implementation** - Begin with Epic 7 (provider onboarding)

---

## Post-MVP Epic Workflow Commands

### Starting Epic 6, 7, or 8

**Phase 1: Epic Preparation**

```bash
# 1. Generate technical specification for the epic
/bmad:bmm:workflows:epic-tech-context

# 2. Set up sprint tracking
/bmad:bmm:workflows:sprint-planning
```

**Phase 2: Story Execution (repeat for each story)**

```bash
# 3. Assemble context for the story
/bmad:bmm:workflows:story-context

# 4. Mark story as ready (TODO → IN PROGRESS)
/bmad:bmm:workflows:story-ready

# 5. Implement the story
/bmad:bmm:workflows:dev-story

# 6. Code review
/bmad:bmm:workflows:code-review

# 7. Mark story done (IN PROGRESS → DONE)
/bmad:bmm:workflows:story-done
```

**Phase 3: Epic Completion**

```bash
# 8. Run retrospective after epic completes
/bmad:bmm:workflows:retrospective
```

### Quick Status Check

```bash
# Check current workflow status at any time
/bmad:bmm:workflows:workflow-status
```

### If UX Mockups Need Updates First

```bash
# Run UX audit workflow on new/updated mockups
# (Available from PM or UX Designer agent menus)
/bmad:bmm:agents:ux-designer
# Then select: *ux-audit
```

### Recommended First Commands for Post-MVP

If starting **Epic 7 (Provider Onboarding)**:
```bash
# 1. First, run tech context for Epic 7
/bmad:bmm:workflows:epic-tech-context
# Select: Epic 7 - Provider Onboarding & Management

# 2. Then sprint planning to set up stories 7.1-7.8
/bmad:bmm:workflows:sprint-planning
```

If starting **Epic 8 (Admin Dashboard)** first (recommended if admin verification needed):
```bash
# 1. Run tech context for Epic 8
/bmad:bmm:workflows:epic-tech-context
# Select: Epic 8 - Admin Dashboard

# 2. Sprint planning for stories 8.1-8.7
/bmad:bmm:workflows:sprint-planning
```

If starting **Epic 6 (Consumer UX)** for quick wins:
```bash
# 1. Story 6.1 is low effort - can start directly
/bmad:bmm:workflows:story-context
# Select: Story 6.1 - Remove Premature Social Proof
```

---

## UX Audit Workflow Added

Created reusable workflow for future mockup reviews:
- Location: `.bmad/bmm/workflows/2-plan-workflows/ux-audit/`
- Trigger: Added to PM and UX Designer agent menus
- Pattern: Party mode roast → gather clarifications → structured audit document

---

## V2 Development: Full-Fledged App from Mockups

### Current Status (2025-12-11)

**UX Mockups Complete:**

| Flow | File | Screens |
|------|------|---------|
| Consumer | [00-consolidated-consumer-flow.html](docs/ux-mockups/00-consolidated-consumer-flow.html) | 15+ screens |
| Provider | [01-consolidated-provider-flow.html](docs/ux-mockups/01-consolidated-provider-flow.html) | 13+ screens |
| Admin | [02-admin-dashboard.html](docs/ux-mockups/02-admin-dashboard.html) | 13 screens (11 + Map + Templates) |

**Supporting Documentation:**
- Consumer audit: [consumer-flow-audit.md](docs/ux-audit/consumer-flow-audit.md)
- Provider audit: [provider-flow-audit.md](docs/ux-audit/provider-flow-audit.md)
- Admin requirements: [admin-flow-requirements.md](docs/ux-audit/admin-flow-requirements.md)
- Theme system: [theme-mockups.md](docs/ux-audit/theme-mockups.md)

### V2 Planning Workflow Commands

**Goal:** Transform completed mockups into a full-fledged production application with PRD, Architecture, and implementation-ready epics.

---

#### Phase 0: Research (Optional)

If you need to do additional research before PRD:

```bash
# Domain research for regulatory/compliance requirements
/bmad:bmm:workflows:domain-research

# Market research or competitive analysis
/bmad:bmm:workflows:research
```

---

#### Phase 1: Product Requirements Document (PRD)

Create a new PRD that incorporates all UX audit findings and mockups:

```bash
# Create comprehensive PRD from mockups and audit docs
/bmad:bmm:workflows:prd
```

**Input for PRD workflow:**
- Reference all 3 mockup files as visual requirements
- Reference audit documents for business rules and flows
- Reference theme-mockups.md for visual design system
- Existing PRD (docs/prd.md) as MVP baseline

**Expected Output:**
- Updated `docs/prd.md` (or `docs/prd-v2.md`)
- Full functional requirements for Consumer, Provider, Admin flows
- NFRs updated for multi-role platform
- Clear scope definition (MVP baseline + new features)

---

#### Phase 2: UX Design Validation (Optional)

If mockups need any additional screens or refinements:

```bash
# Interactive UX design workflow
/bmad:bmm:workflows:create-ux-design
```

Or for direct access to UX Designer agent:

```bash
# Direct agent access for mockup updates
/bmad:bmm:agents:ux-designer
```

---

#### Phase 3: Architecture

Create architecture document that supports all three flows:

```bash
# Architecture design workflow
/bmad:bmm:workflows:architecture
```

**Key Architecture Decisions Needed:**
- Admin panel route structure (`/admin/*`)
- Provider verification document storage (Supabase Storage)
- Push notification infrastructure (request assignment model)
- Real-time updates (Supabase Realtime vs polling)
- Commission tracking and settlement system
- Multi-role auth model (single Gmail = single role)

**Reference Documents:**
- Provider audit section on "Push-style request model"
- Admin requirements on "Secret Entry Point" and "Role-based access"
- Theme mockups for CSS custom properties system

---

#### Phase 4: Epic & Story Creation

Create implementation-ready epics and stories from PRD:

```bash
# Generate epics and stories from PRD
/bmad:bmm:workflows:create-epics-and-stories
```

**Suggested Epic Structure for V2:**

| Epic | Title | Dependencies |
|------|-------|--------------|
| 6 | Consumer UX Improvements | None (MVP baseline exists) |
| 7 | Provider Onboarding & Registration | Epic 8 (needs admin verification) |
| 8 | Admin Dashboard Core | None |
| 9 | Admin Operations & Monitoring | Epic 8 |
| 10 | Provider Work Management | Epic 7 |
| 11 | Commission & Payments | Epic 7, Epic 8 |
| 12 | Theme System & Visual Polish | None |

---

#### Phase 5: Implementation Readiness

Validate all artifacts are aligned before starting development:

```bash
# Comprehensive readiness check
/bmad:bmm:workflows:implementation-readiness
```

**Checklist:**
- [ ] PRD covers all mockup screens
- [ ] Architecture addresses all technical decisions
- [ ] Epics have acceptance criteria traceable to PRD
- [ ] Dependencies between epics are documented
- [ ] No gaps between mockups and PRD

---

#### Phase 6: Sprint Planning & Execution

Once implementation-ready, follow standard epic workflow:

```bash
# 1. Generate tech context for first epic
/bmad:bmm:workflows:epic-tech-context

# 2. Set up sprint tracking
/bmad:bmm:workflows:sprint-planning

# 3. Then story-by-story execution (see Phase 2 in Epic Execution Workflow above)
```

---

### V2 Quick Start Commands

**Option A: Full Planning Cycle (Recommended)**

```bash
# Step 1: Create V2 PRD
/bmad:bmm:workflows:prd
# → Input: mockups + audit docs + existing PRD as baseline

# Step 2: Architecture design
/bmad:bmm:workflows:architecture
# → Reference: New PRD + mockups

# Step 3: Create epics and stories
/bmad:bmm:workflows:create-epics-and-stories
# → Reference: New PRD

# Step 4: Validate readiness
/bmad:bmm:workflows:implementation-readiness

# Step 5: Start first epic
/bmad:bmm:workflows:epic-tech-context
```

**Option B: Incremental Approach (Start with Admin)**

If you want to start with Epic 8 (Admin Dashboard) since mockups are complete:

```bash
# Step 1: Create tech spec for Admin epic only
/bmad:bmm:workflows:epic-tech-context
# → Select: Epic 8 - Admin Dashboard

# Step 2: Create stories for Epic 8
/bmad:bmm:workflows:create-story
# → Reference: admin-flow-requirements.md + 02-admin-dashboard.html

# Step 3: Sprint planning
/bmad:bmm:workflows:sprint-planning

# Step 4: Start implementation
/bmad:bmm:workflows:story-context
```

**Option C: Roast & Polish First**

If you want to validate mockups against implementation before new PRD:

```bash
# Party mode roast session
/bmad:core:workflows:party-mode
# → Topic: "Compare current implementation to mockups"

# Brainstorm improvements
/bmad:core:workflows:brainstorming
# → Topic: "V2 features prioritization"
```

---

### Reference: Mockup-to-Implementation Mapping

| Mockup Section | Admin Dashboard HTML | PRD Section | Epic |
|----------------|---------------------|-------------|------|
| 1. Login | Section 1 | FR-Admin-Auth | 8.1 |
| 2. Dashboard | Section 2 | FR-Admin-Dashboard | 8.7 |
| 3. Verification Queue | Section 3 | FR-Provider-Verification | 8.2 |
| 4. Provider Directory | Section 4 | FR-Provider-Management | 8.3 |
| 5. Pricing Config | Section 5 | FR-Pricing | 8.4 |
| 6. Live Orders | Section 6 | FR-Order-Monitoring | 8.5 |
| 6C. Map View | Section 6C | FR-Order-Map | 8.5 |
| 7. Problem Queue | Section 7 | FR-Problem-Resolution | 8.6 |
| 8. Order History | Section 8 | FR-Order-History | 8.6 |
| 9. Consumer Directory | Section 9 | FR-Consumer-Management | 8.6 |
| 10. Financial Reports | Section 10 | FR-Financial | 8.7 |
| 11. Settings | Section 11 | FR-System-Config | 8.4 |
| 11B. Notifications | Section 11B | FR-Notification-Templates | 8.4 |

---

### Key Business Decisions Documented

From UX audit party mode sessions:

| Decision | Value | Source |
|----------|-------|--------|
| Commission Model | Flat % per transaction | provider-flow-audit.md |
| Acceptance Window | 3-5 minutes | provider-flow-audit.md |
| Photo Confirmation | Optional (trust-based) | provider-flow-audit.md |
| Rating Thresholds | Warning <4.0, Suspend <3.5, Ban <3.0 | admin-flow-requirements.md |
| Cash Settlement | Provider pays platform separately | provider-flow-audit.md |
| Admin Entry | Hidden URL /admin | admin-flow-requirements.md |
| Withdrawal Time | 1-2 business days | provider-flow-audit.md |

---

*Last Updated: 2025-12-11 (UX Mockups Complete / V2 Planning Commands Added)*
