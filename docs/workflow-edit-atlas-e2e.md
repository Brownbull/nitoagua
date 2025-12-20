---
stepsCompleted: [1, 2]
lastStep: 2
workflowPath: "_bmad/bmm/workflows/4-implementation/atlas-e2e"
workflowName: "atlas-e2e"
targetFormat: "standalone"
migrationRequired: true
userGoal: "Add Chrome extension mode as default, with Playwright as secondary option"
---

# Workflow Edit: atlas-e2e

## Workflow Analysis

### Target Workflow

- **Path**: `_bmad/bmm/workflows/4-implementation/atlas-e2e`
- **Name**: atlas-e2e
- **Module**: bmm (BMAD Method Module)
- **Format**: Legacy (workflow.yaml + instructions.xml)

### Structure Analysis

- **Type**: Action/Interactive workflow (generates tests, executes them)
- **Total Steps**: 9 steps (0-9 in instructions.xml)
- **Step Flow**: Linear with conditional branches
- **Files**:
  - `workflow.yaml` - Configuration and variables
  - `instructions.xml` - All step logic in single XML file

### Content Characteristics

- **Purpose**: Generate and execute persona-driven E2E tests using Atlas knowledge
- **Instruction Style**: Prescriptive with detailed step-by-step actions
- **User Interaction**: Multiple decision points (test mapping, execution mode, memory update)
- **Complexity**: High - integrates Atlas memory, Playwright, fixtures, story parsing

### Initial Assessment

#### Strengths

- Well-structured step progression
- Good Atlas integration with persona analysis
- Comprehensive AC-to-test mapping
- Pattern capture back to Atlas memory
- Detailed persona testing principles

#### Potential Issues

- Legacy XML format (single large file)
- No mode parameter for alternative execution
- Playwright-centric (hardcoded framework)
- Step 5-7 tightly coupled to Playwright

#### Format-Specific Notes

- Requires migration to standalone step-file architecture
- XML parsing may have edge cases
- Single file makes branching logic complex

### Best Practices Compliance

- **Step File Structure**: ❌ Not using step files (legacy XML)
- **Frontmatter Usage**: ⚠️ Uses workflow.yaml variables, not step frontmatter
- **Menu Implementation**: ✅ Has menu patterns in steps 3 and 7
- **Variable Consistency**: ✅ Good variable usage throughout

---

## User Goals

1. **Primary**: Make Chrome Extension the default mode
   - Default behavior: Generate human-readable test checklist
   - Claude executes manually via Chrome extension
   - Best for complex cross-persona scenarios (Epic 11-4)

2. **Secondary**: Keep Playwright as optional mode
   - Invoked with `--mode=playwright`
   - Current behavior becomes the fallback
   - Best for regression testing and CI/CD

3. **Migration**: Convert to standalone step-file architecture
   - Cleaner, more maintainable structure
   - Easier to add mode branching
   - Follows BMAD best practices

---

## Advanced Elicitation Insights

### From User Persona Focus Group

| Concern | Resolution |
|---------|------------|
| Tab management confusion | Clear tab labeling: "Tab 1: Consumer", "Tab 2: Provider" with "⚠️ Don't close" warnings |
| Timing/synchronization | Explicit "⏳ WAIT for X to appear" instructions between persona switches |
| Mistake recovery | Checkpoint markers every 3-5 steps to resume from |
| Cross-persona visibility | Progress tracking showing all personas' current state |

### From Architecture Decision Records

**Decision:** Chrome Extension = Default, Playwright = Secondary (`--mode=playwright`)

| Aspect | Chrome Extension (Default) | Playwright (Secondary) |
|--------|---------------------------|------------------------|
| Best for | Cross-persona, exploratory, realtime | Regression, CI/CD, race conditions |
| Output | Markdown checklist | .spec.ts file |
| Execution | Claude manually in browser | Automated |
| Multi-persona | Natural (multiple tabs) | Complex (multiple contexts) |

### From What If Scenarios

| Scenario | Resolution |
|----------|------------|
| 5+ personas | Group by active participant, window grouping, "close tab" instructions |
| Lost browser context | Checkpoint markers with resume instructions |
| Step fails | "❌ If fails:" instructions with retry/abort guidance |
| Race conditions | Auto-suggest `--mode=playwright` for timing-sensitive tests |

### From Cross-Functional War Room

**Checklist UX Requirements:**
- Icons: 👆 click, ⌨️ type, 👁️ verify, ⏳ wait
- Color-coded persona badges: 🔵 Consumer, 🟢 Provider, 🟠 Admin
- Explicit data-testid references for element identification
- Pull from test-data.ts fixtures for consistency
- Collapsible completed sections

### From Pre-mortem Analysis

| Failure Mode | Prevention |
|--------------|------------|
| Ambiguous instructions | Include exact selectors, expected text, screenshots |
| Bugs slip through | Suggest Playwright run after major changes |
| Too slow, nobody uses it | Make it genuinely BETTER for cross-persona |
| Checklists out of sync | Generate dynamically from ACs + fixtures |
| WSL/Windows path issues | Document path handling explicitly |

---

## Critical Architecture: WSL/Windows Dual Environment

### Environment Context

| Environment | Purpose | Location |
|-------------|---------|----------|
| **WSL (Ubuntu)** | Development, npm run dev, local Supabase | `/home/khujta/projects/bmad/nitoagua` |
| **Windows** | Chrome Extension execution, Claude browser control | Clone in Windows filesystem |

### Workflow for Chrome Extension Tests

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WINDOWS ENVIRONMENT                          │
│  (Chrome Extension + Claude + Windows clone of repo)                │
├─────────────────────────────────────────────────────────────────────┤
│  1. Clone repo to Windows location (one-time setup)                 │
│  2. Run atlas-e2e workflow → generates checklist                    │
│  3. Checklist saved to: docs/testing/e2e-checklists/{story}.md      │
│  4. Claude executes checklist via Chrome Extension                  │
│  5. Results captured in checklist file                              │
│  6. git add + git commit + git push to feature branch               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ git push origin feature/xyz
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           GITHUB                                    │
│  (Feature branch with checklist results)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ git pull origin feature/xyz
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        WSL ENVIRONMENT                              │
│  (Development, local server, Playwright tests)                      │
├─────────────────────────────────────────────────────────────────────┤
│  1. Pull checklist results from feature branch                      │
│  2. Review Chrome Extension test results                            │
│  3. Run Playwright tests if needed: npm run test:e2e                │
│  4. Continue development cycle                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Output Location

Checklists must be saved to a dedicated folder that syncs via git:

```
docs/
├── testing/
│   ├── e2e-checklists/           # Chrome Extension checklists
│   │   ├── 11-4-cross-persona-integration.md
│   │   ├── 10-3-offer-countdown.md
│   │   └── ...
│   └── playwright-results/        # Playwright output (gitignored)
```

### Git Workflow Requirements

The workflow must include explicit git steps:

```markdown
## Post-Execution: Save Results

1. Save checklist with results to `docs/testing/e2e-checklists/{story-key}.md`
2. Stage changes: `git add docs/testing/e2e-checklists/`
3. Commit: `git commit -m "test(e2e): Chrome Extension results for {story-key}"`
4. Push: `git push origin {current-branch}`

**Note to WSL user:** Run `git pull` to retrieve these results.
```

---

## Improvement Goals (Prioritized) - REVISED

### Design Pivot (from Advanced Elicitation)

**Key Changes:**
- ❌ Removed Playwright mode (handled by other workflows)
- ✅ Chrome Extension ONLY - generic, portable across projects
- ✅ All project-specific values from Atlas memory (not hardcoded)
- ✅ Atlas E2E Contract defines required memory structure
- ✅ Reduced to 7 steps (merged persona into context assembly)

---

## Advanced Elicitation Synthesis

### From First Principles Analysis

**Fundamental Truths:**
| Truth | Implication |
|-------|-------------|
| Atlas has project memory | All project-specific context lives there, not in workflow |
| Claude executes via Chrome Extension | Instructions must be human-readable, step-by-step |
| User personas exist in Atlas memory | Workflow queries memory, doesn't define personas |
| Stories have Acceptance Criteria | ACs drive test scenarios universally |
| Browser tabs = concurrent personas | Multi-persona tests need tab management |
| Git syncs results | Workflow must include save/commit steps |

### From Reverse Engineering

**Critical Path:**
```
START → Init Atlas → Parse Story → Load Context → Map ACs → Generate Checklist → Execute → Capture Results → Feed Memory → END
```

### From Meta-Prompting Analysis

**Portability Requirements:**
- Step file paths use `{workflow_path}` variables
- Atlas memory path uses `{atlas_memory}` variable
- Output location read from Atlas config (with fallback)
- Story format agnostic (supports .md, .yaml, .xml)
- Documents Atlas structure dependency

### From Architecture Decision Records

**Atlas E2E Contract (Required Memory Structure):**
```yaml
# REQUIRED in Atlas Memory for atlas-e2e workflow

project_config:
  base_url: required           # e.g., "https://myapp.vercel.app"
  test_users: required         # Array with role, email, password
  e2e_output_path: optional    # Default: docs/testing/e2e-checklists

section_3_personas: required
  # At least one persona with goals and behaviors

section_5_testing: optional but recommended
  # Existing patterns for consistency
```

### From Feynman Technique

**Simple Explanation:**
> Atlas E2E creates a checklist - like a recipe for testing. It reads your story, asks Atlas about your project, and generates step-by-step instructions. You follow them in the browser, mark what passed/failed, and Atlas remembers for next time.

---

## Final Architecture (7 Steps)

| Step | Name | Purpose | User Input |
|------|------|---------|------------|
| 1 | Init | Load Atlas, validate contract, verify Windows/Chrome | None |
| 2 | Story | Select and parse target story | Story selection |
| 3 | Context | Assemble persona + patterns + project config | None (auto) |
| 4 | Mapping | Map ACs to test scenarios | Review/approve |
| 5 | Generate | Create checklist file | None (auto) |
| 6 | Execute | Guide through Chrome Extension execution | Manual testing |
| 7 | Complete | Capture results, feed Atlas memory | Mark results |

## Checklist Output Format

```markdown
# E2E Test: {story-key} - {story-title}

## Test Info
- **Generated:** {date}
- **Story:** {story-key}
- **Personas:** 🔵 Consumer, 🟢 Provider
- **Base URL:** {from Atlas memory}

## Pre-Execution Setup
1. Open Chrome with Claude Extension active
2. Open Tab 1: {base_url} → Login as {consumer_email}
3. Open Tab 2: {base_url} → Login as {provider_email}

---

## AC-1: {acceptance criterion text}

### 🔵 Tab 1: Consumer
- [ ] 👆 Click "Request Water" button
- [ ] ⌨️ Type "123 Main St" in address field
- [ ] 👆 Click "Submit"
- [ ] 👁️ Verify: "Request submitted" message appears

### 🟢 Tab 2: Provider
- [ ] ⏳ Wait for notification (up to 30s)
- [ ] 👁️ Verify: New request appears in list
- [ ] 👆 Click "View Request"

📍 **CHECKPOINT 1** - Both tabs should show the new request

---

## Results
- [ ] All steps passed
- [ ] Failures noted below

### Failure Notes
{space for notes}

---

## Post-Execution
1. Save this file with results
2. git add docs/testing/e2e-checklists/
3. git commit -m "test(e2e): {story-key} results"
4. git push origin {branch}
```

---

## Implementation Tasks

### CRITICAL (Must Complete)

1. **Create workflow.md** - Entry point with Atlas contract documentation
2. **Create 7 step files** - Following new architecture
3. **Create checklist templates** - Header, persona section, checkpoint
4. **Validate contract logic** - Step 1 fails fast if Atlas incomplete

### IMPORTANT (Should Complete)

5. **Story parser** - Support multiple formats (.md, .yaml)
6. **Persona badge system** - Dynamic colors from Atlas
7. **Checkpoint placement** - Auto-insert every 3-5 steps

### NICE-TO-HAVE

8. **Progress tracking** - Visual indicators in checklist
9. **Failure guidance** - Retry/abort instructions per step

---

## Improvement Log

### Completed Changes

| Change | Files Modified | Status |
|--------|----------------|--------|
| Migrated to step-file architecture | workflow.md, 7 step files | ✅ Complete |
| Created checklist templates | 3 template files | ✅ Complete |
| Backed up legacy files | _legacy/ folder | ✅ Complete |
| Removed Playwright mode | N/A (clean design) | ✅ Complete |
| Added Atlas E2E Contract | workflow.md | ✅ Complete |
| Defined portable architecture | All files | ✅ Complete |

### New File Structure

```
_bmad/bmm/workflows/4-implementation/atlas-e2e/
├── workflow.md                    # Entry point with contract
├── steps/
│   ├── step-01-init.md           # Atlas init + validation
│   ├── step-02-story.md          # Story selection
│   ├── step-03-context.md        # Context assembly
│   ├── step-04-mapping.md        # AC-to-scenario mapping
│   ├── step-05-generate.md       # Checklist generation
│   ├── step-06-execute.md        # Execution guidance
│   └── step-07-complete.md       # Results + memory feed
├── templates/
│   ├── checklist-template.md     # Full checklist structure
│   ├── persona-section.md        # Per-persona steps
│   └── checkpoint.md             # Resume checkpoints
└── _legacy/
    ├── instructions.xml          # Original (backup)
    └── workflow.yaml             # Original (backup)
```

---

_Analysis completed on 2025-12-20_
_Advanced Elicitation completed on 2025-12-20_
_Synthesis applied on 2025-12-20_
_Implementation completed on 2025-12-20_
