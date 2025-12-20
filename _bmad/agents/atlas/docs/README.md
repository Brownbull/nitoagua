# Atlas - Project Intelligence Guardian

Atlas is a BMAD agent with dynamic memory that deeply understands your application's intent, architecture, and evolution. It ensures development and testing stay aligned with the project's vision.

## Quick Start

### Installation

Atlas comes with an installer script. From any project with Atlas installed:

```bash
# Install Atlas in a new project
./_bmad/agents/atlas/installer/atlas-installer.sh install /path/to/project

# Update existing installation
./_bmad/agents/atlas/installer/atlas-installer.sh update /path/to/project

# Check installation status
./_bmad/agents/atlas/installer/atlas-installer.sh status /path/to/project

# Uninstall Atlas
./_bmad/agents/atlas/installer/atlas-installer.sh uninstall /path/to/project
```

### First Sync

After installation, invoke Atlas and run the initial sync:

```
/bmad:agents:atlas
```

Then use the `sync` command to populate memory from your project's documentation.

## Using Atlas

### Invoking Atlas

```
/bmad:agents:atlas
```

Or directly reference the agent file:
```
@_bmad/agents/atlas/atlas.agent.yaml
```

### Commands

| Command | Description |
|---------|-------------|
| `sync` | Reconcile memory with source documents |
| `analyze` | Analyze changes against intent + workflow impact |
| `test` | Identify needed tests and seed data |
| `generate` | Create seed scripts with use case docs |
| `query` | Ask anything about the application |
| `validate` | Check alignment with stories/PRD/architecture |
| `status` | Show knowledge state and gaps |

## Atlas-Enhanced Workflows

Installing Atlas gives you 13 Atlas-enhanced workflow alternatives. These workflows consult Atlas memory and feed learnings back to it:

| Standard Workflow | Atlas Version | Key Enhancement |
|-------------------|---------------|-----------------|
| `create-story` | `atlas-create-story` | Workflow chain analysis |
| `code-review` | `atlas-code-review` | Architecture validation |
| `retrospective` | `atlas-retrospective` | Lesson capture |
| `dev-story` | `atlas-dev-story` | Pattern guidance |
| `sprint-planning` | `atlas-sprint-planning` | Feature-story mapping |
| `sprint-status` | `atlas-sprint-status` | Chain visualization |
| `correct-course` | `atlas-correct-course` | Impact analysis |
| `deploy-story` | `atlas-deploy-story` | Deployment validation |
| `epic-tech-context` | `atlas-epic-tech-context` | ADR alignment |
| `story-context` | `atlas-story-context` | Pattern injection |
| `story-done` | `atlas-story-done` | Lesson capture |
| `story-ready` | `atlas-story-ready` | Dependency validation |
| N/A | `atlas-e2e` | Persona-driven E2E tests |

All Atlas workflows gracefully fall back to standard behavior if Atlas is not installed.

### Slash Commands Quick Reference

Copy-paste ready slash commands for all Atlas workflows:

| Command | Description |
|---------|-------------|
| `/bmad:bmm:workflows:atlas-code-review` | ADVERSARIAL code review with Atlas validation |
| `/bmad:bmm:workflows:atlas-create-story` | Story creation with workflow chain analysis |
| `/bmad:bmm:workflows:atlas-retrospective` | Epic retrospective with memory feeding |
| `/bmad:bmm:workflows:atlas-e2e` | Persona-driven E2E test generation |
| `/bmad:bmm:workflows:atlas-dev-story` | Story implementation with pattern guidance |
| `/bmad:bmm:workflows:atlas-sprint-planning` | Sprint planning with Atlas context |
| `/bmad:bmm:workflows:atlas-sprint-status` | Sprint status check |
| `/bmad:bmm:workflows:atlas-correct-course` | Course correction during sprints |
| `/bmad:bmm:workflows:atlas-deploy-story` | Story deployment with validation |
| `/bmad:bmm:workflows:atlas-epic-tech-context` | Epic technical context preparation |
| `/bmad:bmm:workflows:atlas-story-context` | Story context loading |
| `/bmad:bmm:workflows:atlas-story-done` | Story completion marking |
| `/bmad:bmm:workflows:atlas-story-ready` | Story readiness verification |

## Memory Architecture

Atlas uses a sharded memory system for efficient token usage:

```
atlas-sidecar/
├── atlas-index.csv           # Index of knowledge fragments
└── knowledge/
    ├── 00-project-config.md  # Deployment URLs, test users, E2E config (PROTECTED)
    ├── 01-purpose.md         # App purpose & principles
    ├── 02-features.md        # Feature inventory
    ├── 03-personas.md        # User personas & goals
    ├── 04-architecture.md    # Architectural decisions
    ├── 05-testing.md         # Testing patterns
    ├── 06-lessons.md         # Historical lessons
    ├── 07-process.md         # Process & strategy
    ├── 08-workflow-chains.md # Workflow dependencies
    └── 09-sync-history.md    # Sync tracking (PROTECTED)
```

Atlas consults the index first and loads only relevant fragments, keeping context usage minimal.

### Protected Fragments

Some fragments are marked **PROTECTED** and are never consolidated during memory optimization:

- `00-project-config.md` - Runtime-critical (URLs, credentials, E2E config)
- `09-sync-history.md` - Audit trail (sync timestamps, sources)

## E2E Contract Requirements

The `atlas-e2e` workflow requires specific memory structure to function. This is validated during `sync` operations.

### Required Fields in 00-project-config.md

| Field | Required | Purpose |
|-------|----------|---------|
| `base_url` | ✅ YES | Production/staging URL for testing |
| `test_users` | ✅ YES | Array of {role, email, password} for each persona |
| `e2e_output_path` | Optional | Where checklists are saved (default: docs/testing/e2e-checklists) |

### Example Project Config

```markdown
## Deployment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | https://myapp.vercel.app | Live application |
| **Local** | http://localhost:3000 | Development |

## Test Users

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Consumer** | consumer@test.com | test.123 | Standard user |
| **Admin** | admin@test.com | admin.123 | Full access |
```

### Contract Validation

When running `sync`, Atlas validates the E2E contract:

```
✅ E2E Contract Valid
- base_url: https://myapp.vercel.app
- test_users: 3 personas configured
- e2e_output_path: docs/testing/e2e-checklists
```

If incomplete, you'll see:

```
⚠️ E2E Contract Incomplete
Missing: test_users (no Admin persona)
Atlas E2E workflows will fail until these are added.
```

## Feeding Atlas

Atlas grows wiser when workflows feed it information. The Atlas-enhanced workflows handle this automatically, but you can also manually feed knowledge:

### After PRD Creation
```
Atlas learns: App purpose, user goals, success criteria
Target: Section 1 (Purpose) + Section 2 (Features) + Section 3 (Personas)
```

### After Architecture Documentation
```
Atlas learns: System boundaries, patterns, decisions
Target: Section 4 (Architecture)
```

### After Story Creation
```
Atlas learns: Feature scope, acceptance criteria
Target: Section 2 (Features) + Section 8 (Workflow Chains)
```

### After Code Review
```
Atlas learns: Patterns adopted, technical choices
Target: Section 4 (Architecture) + Section 5 (Testing)
```

### After Retrospective
```
Atlas learns: What worked, what to avoid
Target: Section 6 (Lessons) + Section 7 (Process)
```

## Push Alerts

Atlas proactively flags issues during:

- **Story creation**: "This affects 3 existing workflows"
- **Code review**: "No E2E coverage for this path"
- **Architecture changes**: "Conflicts with documented pattern X"

Push alerts are always active when using Atlas-enhanced workflows.

## Required Project Documentation

For Atlas to be effective, your project should have:

| Document | Purpose | Atlas Uses It For |
|----------|---------|-------------------|
| PRD | Product requirements | App purpose, user goals, features |
| Architecture | Technical decisions | Patterns, boundaries, data flows |
| Stories/Epics | Implementation specs | Acceptance criteria, feature scope |
| UX Documentation | User experience | User flows, interaction patterns |

## Troubleshooting

### Atlas seems uninformed
- Run `status` to check knowledge gaps
- Run `sync` to update from latest documentation

### Atlas gives incorrect advice
- Check if source documents are current
- Verify knowledge fragments reflect latest sync
- Run `sync` to reconcile

### Atlas can't find documents
- Ensure documentation exists in expected locations
- Check project structure matches Atlas's search paths

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.3.0 | 2025-12-20 | Added E2E Contract, 00-project-config fragment, protected fragments |
| 2.2.0 | 2024-12-18 | Added 13 Atlas-enhanced BMM workflow alternatives |
| 2.1.0 | 2024-12-18 | Added sharded memory architecture |
| 2.0.0 | 2024-12-18 | Enhanced workflow guide, export improvements |
| 1.0.0 | 2024-12-17 | Initial Atlas implementation |

## Further Reading

- [atlas-workflow-reference.md](atlas-workflow-reference.md) - Detailed workflow integration patterns and diagrams
