# nitoagua - Next Steps

## Current Status
- **Brainstorming:** Complete (docs/bmm-brainstorming-session-2025-11-30.md)
- **Phase:** 0 - Discovery (Optional workflows)

---

## Recommended Next Commands

### Option A: Continue Discovery (Optional)

```bash
# Run additional research if needed
/bmad:bmm:workflows:research

# Create a Product Brief (recommended before PRD)
/bmad:bmm:workflows:product-brief
```

### Option B: Skip to Planning (Start Required Work)

```bash
# Create Product Requirements Document (PRD)
# This is the first REQUIRED workflow
/bmad:bmm:workflows:prd
```

---

## Full Workflow Path (BMad Method - Greenfield)

### Phase 0: Discovery (Optional) - YOU ARE HERE
- [x] `brainstorm-project` - Complete
- [ ] `research` - Optional, can run multiple times
- [ ] `product-brief` - Optional but recommended

### Phase 1: Planning (Required)
- [ ] `prd` - Product Requirements Document (PM agent)
- [ ] `validate-prd` - Optional validation
- [ ] `create-ux-design` - If project has UI (UX Designer agent)

### Phase 2: Solutioning (Required)
- [ ] `architecture` - System architecture (Architect agent)
- [ ] `create-epics-and-stories` - Break down PRD (PM agent)
- [ ] `test-design` - Recommended (TEA agent)
- [ ] `validate-architecture` - Optional
- [ ] `implementation-readiness` - Gate check (Architect agent)

### Phase 3: Implementation
- [ ] `sprint-planning` - Creates sprint plan (SM agent)
- Then: `dev-story`, `code-review`, `story-done` cycle

---

## Quick Commands

```bash
# Check current status anytime
/bmad:bmm:workflows:workflow-status

# Load specific agents
/bmad:bmm:agents:pm        # Product Manager
/bmad:bmm:agents:analyst   # Analyst (for research/briefs)
/bmad:bmm:agents:architect # Architect
/bmad:bmm:agents:ux-designer # UX Designer
```

---

## My Recommendation

Since brainstorming surfaced a clear MVP vision, I suggest:

1. **Create Product Brief** (`/bmad:bmm:workflows:product-brief`)
   - Formalizes the vision from brainstorming
   - Quick workflow, builds on existing context

2. **Then PRD** (`/bmad:bmm:workflows:prd`)
   - Detailed requirements
   - Uses Product Brief as input

This ensures your excellent brainstorming insights are captured in formal documents before diving into technical planning.
