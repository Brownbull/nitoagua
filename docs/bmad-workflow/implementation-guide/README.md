# BMAD Workflow Implementation Guide

> How to implement the enhanced BMAD BMM workflow with Atlas integration and deploy-story pipeline in your own projects.

---

## Overview

This guide provides step-by-step instructions for adding the following enhancements to any BMAD-enabled project:

1. **Atlas Agent** - Project Intelligence Guardian for accumulated knowledge
2. **deploy-story Workflow** - Automated deployment pipeline with branch management
3. **Enhanced Quality Gates** - Atlas-validated gates throughout the workflow

### Prerequisites

- BMAD BMM module installed (`_bmad/bmm/`)
- Git repository with branching strategy defined
- Vercel, Netlify, or similar deployment platform (optional but recommended)
- Claude Code or compatible AI assistant

---

## Quick Navigation

| Guide | Description | Time |
|-------|-------------|------|
| [Atlas-BMAD Workflow Guide](../../_bmad/agents/atlas/docs/atlas-bmad-workflow-guide.md) | **Complete integration overview** | 15 min read |
| [Atlas Setup](./atlas-setup.md) | Install and configure Atlas agent | 30 min |
| [Deploy-Story Setup](./deploy-story-setup.md) | Add deployment workflow | 45 min |
| [Branching Configuration](./branching-config.md) | Configure for your branching strategy | 15 min |
| [Quality Gates](./quality-gates-setup.md) | Add Atlas-powered quality gates | 30 min |

---

## What You'll Get

### Before (Standard BMAD)

```
create-story → dev-story → code-review → [done]
                                            ↓
                              Manual deployment
                              Manual branch cleanup
                              No knowledge capture
```

### After (Enhanced BMAD)

```
create-story → dev-story → code-review → deploy-story → [deployed]
                               ↓              ↓
                          Atlas validates    Atlas validates
                          code quality       deployment safety
                               ↓              ↓
                          Knowledge fed      Deployment knowledge
                          to Atlas memory    captured for future
```

---

## Implementation Order

### Phase 1: Atlas Foundation (Required)

1. **Install Atlas Agent** - Copy agent files and configure
2. **Initialize Atlas Memory** - Create empty memory structure
3. **Sync Existing Knowledge** - Populate from PRD, architecture, etc.

### Phase 2: Workflow Integration (Required)

4. **Add deploy-story Workflow** - Copy and configure for your project
5. **Modify code-review** - Add deployment trigger
6. **Create Slash Command** - Enable `/deploy-story` command

### Phase 3: Quality Gates (Recommended)

7. **Add Atlas Validation Points** - Pre-deployment checks
8. **Configure Push Alerts** - Proactive issue detection
9. **Set Up Feeding Pattern** - Knowledge capture from workflows

### Phase 4: Customization (Optional)

10. **Customize Branching Strategy** - Match your git workflow
11. **Configure Deployment URLs** - Your platform's URLs
12. **Add Project-Specific Rules** - Custom validation logic

---

## File Structure After Implementation

```
your-project/
├── _bmad/
│   ├── agents/
│   │   └── atlas/                          # Atlas agent
│   │       ├── atlas.agent.yaml            # Agent definition
│   │       ├── atlas-sidecar/
│   │       │   ├── atlas-memory.md         # Knowledge store
│   │       │   ├── instructions.md         # Private instructions
│   │       │   └── knowledge/              # Additional knowledge files
│   │       ├── templates/
│   │       │   └── atlas-memory-template.md
│   │       └── docs/
│   │           ├── atlas-bmad-workflow-guide.md  # Complete integration overview
│   │           ├── atlas-setup-guide.md
│   │           └── workflow-integration-guide.md
│   │
│   └── bmm/
│       └── workflows/
│           └── 4-implementation/
│               ├── atlas-create-story/    # Atlas-enhanced story creation
│               │   ├── workflow.yaml
│               │   └── instructions.xml
│               ├── atlas-code-review/     # Atlas-enhanced code review
│               │   ├── workflow.yaml
│               │   └── instructions.xml
│               ├── atlas-retrospective/   # Atlas-enhanced retrospective
│               │   ├── workflow.yaml
│               │   └── instructions.md
│               ├── atlas-e2e/             # Persona-driven E2E testing
│               │   ├── workflow.yaml
│               │   └── instructions.xml
│               ├── code-review/
│               │   └── instructions.xml   # Modified with deploy trigger
│               └── deploy-story/          # Deployment workflow
│                   ├── workflow.yaml
│                   ├── instructions.xml
│                   └── checklist.md
│
├── .claude/
│   └── commands/
│       └── bmad/
│           ├── agents/
│           │   └── atlas.md              # Atlas slash command
│           └── bmm/
│               └── workflows/
│                   ├── atlas-create-story.md    # Atlas-enhanced workflow
│                   ├── atlas-code-review.md     # Atlas-enhanced workflow
│                   ├── atlas-retrospective.md   # Atlas-enhanced workflow
│                   ├── atlas-e2e.md             # Persona-driven E2E testing
│                   └── deploy-story.md          # Deploy slash command
│
└── docs/
    └── bmad-workflow/                    # Documentation (optional)
        ├── README.md
        ├── atlas-integration.md
        └── implementation-guide/
```

---

## Quick Start (Copy-Paste)

For projects that want to quickly add these features, copy these folders from nitoagua:

```bash
# From nitoagua project root, copy to your project:

# 1. Atlas Agent
cp -r _bmad/agents/atlas/ /path/to/your-project/_bmad/agents/

# 2. Atlas-Enhanced Workflows
cp -r _bmad/bmm/workflows/4-implementation/atlas-create-story/ \
      /path/to/your-project/_bmad/bmm/workflows/4-implementation/
cp -r _bmad/bmm/workflows/4-implementation/atlas-code-review/ \
      /path/to/your-project/_bmad/bmm/workflows/4-implementation/
cp -r _bmad/bmm/workflows/4-implementation/atlas-retrospective/ \
      /path/to/your-project/_bmad/bmm/workflows/4-implementation/
cp -r _bmad/bmm/workflows/4-implementation/atlas-e2e/ \
      /path/to/your-project/_bmad/bmm/workflows/4-implementation/

# 3. Deploy-story Workflow
cp -r _bmad/bmm/workflows/4-implementation/deploy-story/ \
      /path/to/your-project/_bmad/bmm/workflows/4-implementation/

# 4. Slash Commands
cp .claude/commands/bmad/agents/atlas.md \
   /path/to/your-project/.claude/commands/bmad/agents/
cp .claude/commands/bmad/bmm/workflows/atlas-create-story.md \
   /path/to/your-project/.claude/commands/bmad/bmm/workflows/
cp .claude/commands/bmad/bmm/workflows/atlas-code-review.md \
   /path/to/your-project/.claude/commands/bmad/bmm/workflows/
cp .claude/commands/bmad/bmm/workflows/atlas-retrospective.md \
   /path/to/your-project/.claude/commands/bmad/bmm/workflows/
cp .claude/commands/bmad/bmm/workflows/atlas-e2e.md \
   /path/to/your-project/.claude/commands/bmad/bmm/workflows/
cp .claude/commands/bmad/bmm/workflows/deploy-story.md \
   /path/to/your-project/.claude/commands/bmad/bmm/workflows/

# 5. Documentation (optional)
cp -r docs/bmad-workflow/ /path/to/your-project/docs/
```

Then customize:
1. Update branching strategy in `deploy-story/workflow.yaml`
2. Update deployment URLs
3. Sync Atlas memory with your project's documentation

## Atlas-Enhanced Workflows

The following Atlas-enhanced workflow variants are available:

| Workflow | Command | Description |
|----------|---------|-------------|
| **atlas-create-story** | `/bmad:bmm:workflows:atlas-create-story` | Story creation with workflow chain analysis and push alerts |
| **atlas-code-review** | `/bmad:bmm:workflows:atlas-code-review` | Code review with architectural validation and pattern compliance |
| **atlas-retrospective** | `/bmad:bmm:workflows:atlas-retrospective` | Retrospective with lesson feeding and pattern validation |
| **atlas-e2e** | `/bmad:bmm:workflows:atlas-e2e` | Persona-driven E2E test generation and execution |

These workflows gracefully fall back to standard behavior if Atlas is not installed.

---

## Support

- [BMAD Discord Community](https://discord.gg/gk8jAdXWmj)
- [GitHub Issues](https://github.com/bmad-code-org/BMAD-METHOD/issues)
- [YouTube Tutorials](https://www.youtube.com/@BMadCode)

---

## Next Steps

Start with [Atlas Setup](./atlas-setup.md) to install the foundation.
