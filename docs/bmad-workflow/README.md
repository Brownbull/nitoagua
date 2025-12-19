# BMAD BMM Workflow Documentation

> Complete documentation of the BMad Method Module (BMM) workflow as implemented in this project, including Atlas agent integration points and quality gates.

## Overview

The BMAD BMM workflow is a **4-phase agile development methodology** that adapts to project complexity through a scale-adaptive system. This documentation covers:

1. [Workflow Phases](#workflow-phases) - The four main phases and their purpose
2. [Quality Gates](#quality-gates) - Decision points and validation checkpoints
3. [Context Flow](#context-flow) - How information passes between steps
4. [Atlas Integration](#atlas-integration) - Where Atlas agent enhances the workflow
5. [Future Enhancements](#future-enhancements) - Planned quality gates for PR, branches, and E2E testing

---

## Quick Navigation

| Document | Description |
|----------|-------------|
| [Workflow Overview](./workflow-overview.md) | Detailed phase-by-phase breakdown |
| [Quality Gates](./quality-gates.md) | All quality checkpoints in the workflow |
| [Atlas Integration](./atlas-integration.md) | Atlas agent touchpoints and feeding pattern |
| [Context Flow Diagram](./diagrams/) | Excalidraw diagrams showing data flow |
| [Future Roadmap](./future-roadmap.md) | Planned enhancements (PR gates, E2E gates) |

---

## Workflow Phases

```
Phase 1 (Analysis)     Phase 2 (Planning)     Phase 3 (Solutioning)    Phase 4 (Implementation)
    [Optional]            [Required]              [Conditional]            [Required]
        |                     |                        |                       |
        v                     v                        v                       v
  +-----------+        +------------+          +-------------+         +-------------+
  | Research  |------->|    PRD     |--------->| Architecture|-------->|   Sprint    |
  | Brainstorm|        | Tech-Spec  |          | Epics/Stories|        |   Cycle     |
  | Brief     |        | UX Design  |          | Gate Check  |         | Dev/Review  |
  +-----------+        +------------+          +-------------+         +-------------+
```

### Phase 1: Analysis (Optional)
- **Purpose:** Strategic exploration and validation before committing to planning
- **Workflows:** `brainstorm-project`, `research`, `product-brief`
- **Output:** Strategic context, market validation, product vision
- **Skip if:** Requirements are already clear

### Phase 2: Planning (Required)
- **Purpose:** Transform vision into actionable requirements
- **Entry Point:** `workflow-init` (routes to appropriate track)
- **Workflows:** `prd`, `tech-spec`, `create-ux-design`
- **Output:** PRD (FRs/NFRs), Tech Spec, UX Specification
- **Scale-Adaptive:** Quick Flow, BMad Method, or Enterprise Method

### Phase 3: Solutioning (Conditional)
- **Purpose:** Technical design to prevent agent conflicts
- **Required for:** BMad Method (complex), Enterprise Method
- **Skip for:** Quick Flow
- **Workflows:** `architecture`, `create-epics-and-stories`, `implementation-readiness`
- **Output:** Architecture decisions (ADRs), Epic/Story breakdown, Gate validation

### Phase 4: Implementation (Required)
- **Purpose:** Sprint-based story development
- **Principle:** One story at a time, complete lifecycle before next
- **Workflows:** `sprint-planning`, `create-story`, `dev-story`, `code-review`, `deploy-story`, `retrospective`
- **Output:** Working code, tests, completed and deployed stories

---

## Scale-Adaptive Tracks

The BMM workflow adapts to project complexity:

| Track | Story Count | Planning | Solutioning | Best For |
|-------|-------------|----------|-------------|----------|
| **Quick Flow** | 1-15 | tech-spec only | Skip | Bug fixes, simple features |
| **BMad Method** | 10-50+ | PRD + UX | Required | Products, platforms, complex features |
| **Enterprise** | 30+ | PRD + UX | Required + Extended | Multi-tenant, compliance, security |

---

## Key Agents

| Agent | Role | Primary Workflows |
|-------|------|-------------------|
| **Analyst** | Research & Analysis | brainstorm, research, product-brief |
| **PM** | Product Management | prd, create-epics-and-stories, workflow-init |
| **UX Designer** | User Experience | create-ux-design |
| **Architect** | Technical Design | architecture, implementation-readiness |
| **SM** | Scrum Master | sprint-planning, create-story, retrospective |
| **DEV** | Developer | dev-story, code-review |
| **TEA** | Test Architect | test-design, test-review, atdd, automate |
| **Atlas** | Project Intelligence | Cross-workflow advisory and memory |

---

## Atlas Agent Role

Atlas is the **Project Intelligence Guardian** - a new agent that maintains accumulated project knowledge and provides alignment validation throughout the workflow.

### Atlas Capabilities
- **Sync Memory:** Reconcile knowledge with source documents
- **Analyze Impact:** Trace workflow chains and downstream implications
- **Test Coverage:** Identify needed tests and seed data
- **Generate Seeds:** Create test data with use case documentation
- **Validate Alignment:** Check work against stories/PRD/architecture
- **Open Query:** Answer questions about the application

### Atlas Integration Points
See [Atlas Integration](./atlas-integration.md) for detailed feeding points throughout the workflow.

---

## Getting Started

1. **New Project:** Start with `workflow-init` to determine your track
2. **Understand Phases:** Read [Workflow Overview](./workflow-overview.md)
3. **Know the Gates:** Review [Quality Gates](./quality-gates.md)
4. **Integrate Atlas:** Follow [Atlas Integration](./atlas-integration.md)

---

## Related Documentation

- [BMM Core Documentation](_bmad/bmm/docs/README.md)
- [Atlas Agent Setup](_bmad/agents/atlas/docs/atlas-setup-guide.md)
- [Workflow Integration Guide](_bmad/agents/atlas/docs/workflow-integration-guide.md)
