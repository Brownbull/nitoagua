# Atlas Memory - Application Knowledge Base (Template)

> **For Export:** This is the empty template structure for initializing Atlas in a new project.
> Copy this file to `atlas-sidecar/atlas-memory.md` and run `sync` to populate.

> Last Sync: Not yet synced
> Project: [PROJECT_NAME]

---

## 0. Project Configuration (E2E Contract)

<!-- REQUIRED for atlas-e2e workflow. See E2E Contract Requirements below. -->

### Deployment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | _[YOUR_PROD_URL]_ | Live application |
| **Staging** | _[YOUR_STAGING_URL]_ | Pre-production testing |
| **Local** | http://localhost:3000 | Development |

### Test Users (REQUIRED for E2E)

<!-- Each persona must have test credentials for atlas-e2e to generate valid checklists -->

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **[Persona 1]** | _email@example.com_ | _password_ | _Description_ |
| **[Persona 2]** | _email@example.com_ | _password_ | _Description_ |
| **[Admin]** | _admin@example.com_ | _password_ | Admin access |

### E2E Testing Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| **Output Path** | docs/testing/e2e-checklists | Where checklists are saved |
| **Execution Mode** | Chrome Extension | Manual testing via browser |

### E2E Contract Requirements

The atlas-e2e workflow requires these fields to be populated:

- ✅ `base_url` - Production/staging URL for testing
- ✅ `test_users` - At least one entry per active persona
- ⚪ `e2e_output_path` - Optional (default: docs/testing/e2e-checklists)

Run `sync` and verify these fields are populated before using atlas-e2e.

---

## 1. App Purpose & Core Principles

<!-- Synced from: PRD -->
<!-- What is this application's mission? What core principles guide all decisions? -->

_Awaiting initial sync from PRD documentation._

---

## 2. Feature Inventory + Intent

<!-- Synced from: PRD, Stories -->
<!-- What features exist? Why does each exist? How do they connect? -->

_Awaiting initial sync from feature documentation._

---

## 3. User Personas & Goals

<!-- Synced from: PRD, UX Documentation -->
<!-- Who uses this app? What are they trying to accomplish? -->

_Awaiting initial sync from user documentation._

---

## 4. Architectural Decisions & Patterns

<!-- Synced from: Architecture Documentation -->
<!-- System boundaries, data flows, tech choices, patterns adopted -->

_Awaiting initial sync from architecture documentation._

---

## 5. Testing Patterns & Coverage Expectations

<!-- Synced from: Test documentation, Stories -->
<!-- What to test, how to test, seed data strategies, workflow validations -->

_Awaiting initial sync from test documentation._

---

## 6. Historical Lessons (Retrospectives)

<!-- Synced from: Retrospective notes -->
<!-- What worked, what failed, patterns to avoid, hard-won wisdom -->

_Awaiting initial sync from retrospective documentation._

---

## 7. Process & Strategy

<!-- Synced from: Team documentation, sprint artifacts -->
<!-- Branching strategy, testing approach, team decisions on how we work -->

_Awaiting initial sync from process documentation._

---

## Workflow Chains

<!-- Key user journeys and their component steps -->

_Awaiting initial mapping of workflow chains._

---

## Sync History

| Date | Documents Synced | Notes |
|------|------------------|-------|
| _pending_ | _initial sync required_ | Atlas memory initialized |

---

## Push Alert Triggers

Active monitoring for:
- Story creation affecting existing workflows
- Code review findings without test coverage
- Architecture conflicts with documented patterns
- Strategy/process references needing alignment check
