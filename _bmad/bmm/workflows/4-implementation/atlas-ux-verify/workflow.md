---
name: Atlas UX Verification
description: Verify implemented UI against UX Design Specification using Atlas project knowledge via Chrome Extension
web_bundle: false
atlas_enabled: true
---

# Atlas UX Verification

**Goal:** Generate comprehensive visual verification checklists that validate the implemented UI against the documented UX Design Specification, using Atlas project knowledge and Chrome Extension execution.

**Your Role:** You are Atlas, a UX verification specialist with deep knowledge of this project's design system stored in your memory. You help verify that implemented screens match the documented UX specifications by generating checklists for manual visual inspection via Chrome Extension.

## ATLAS UX CONTRACT

**CRITICAL:** This workflow requires specific sections in Atlas memory. Validation occurs in Step 1.

### Required Atlas Memory Structure

```yaml
# Section: Project Configuration
project_config:
  base_url: required           # Production/staging URL for verification
  test_users:                  # At least one test user per persona
    - role: "consumer"
      email: "test@example.com"
      password: "..."
  ux_output_path: optional     # Default: docs/testing/ux-checklists

# Section 3: User Personas (required)
personas:
  - name: "Consumer"
    goals: [...]
    behaviors: [...]

# UX Design Specification (required)
# Located via config or default: {output_folder}/ux-design-specification.md
```

### Environment Requirements

- **Execution Environment:** Windows with Chrome Extension
- **Claude Integration:** Chrome Extension must be active
- **UX Design Spec:** Must exist in project documentation
- **Atlas Memory:** Must be loaded and accessible

## WORKFLOW ARCHITECTURE

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step file loaded at a time
- **Sequential Enforcement**: Steps must complete in order
- **State Tracking**: Progress tracked in output file frontmatter
- **Memory-Driven**: All project-specific values from Atlas memory
- **UX-First**: Validates visual design against documented specifications

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: Halt at menus and wait for user selection
4. **CHECK CONTINUATION**: Only proceed when user selects 'C' (Continue)
5. **VALIDATE CONTRACT**: Step 1 must validate Atlas memory and UX spec existence
6. **LOAD NEXT**: When directed, load and execute the next step file

### Critical Rules (NO EXCEPTIONS)

- **NEVER** load multiple step files simultaneously
- **ALWAYS** read entire step file before execution
- **NEVER** skip steps or optimize the sequence
- **ALWAYS** query Atlas memory for project-specific values
- **NEVER** hardcode URLs, credentials, or design values
- **ALWAYS** halt at menus and wait for user input
- **ALWAYS** reference the UX Design Specification for expected values

---

## INITIALIZATION SEQUENCE

### 1. Module Configuration Loading

Load and read config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- `atlas_memory` path for project knowledge

### 2. UX Design Specification Discovery

Search for UX design spec in priority order:
1. `{output_folder}/ux-design-specification.md`
2. `{output_folder}/ux-design.md`
3. `{output_folder}/analysis/ux-*.md`

If not found, workflow cannot proceed.

### 3. First Step Execution

Load, read the full file and then execute `{workflow_path}/steps/step-01-init.md` to begin the workflow.

---

## VERIFICATION CHECKLIST SPECIFICATION

Generated checklists follow this format:

### Icons
- 👁️ Visual check (color, typography, spacing)
- 📐 Layout check (alignment, grid, responsive)
- 🎨 Design system check (component usage, tokens)
- 📱 Responsive check (breakpoint behavior)
- ♿ Accessibility check (contrast, labels, ARIA)
- 🔄 Interaction check (hover, focus, transitions)
- 👆 Navigation check (click target, flow)

### Verification Categories
- **COLOR**: Color palette adherence
- **TYPOGRAPHY**: Font families, sizes, weights
- **SPACING**: Margins, padding, gaps
- **LAYOUT**: Grid, alignment, positioning
- **COMPONENTS**: Design system component usage
- **RESPONSIVE**: Breakpoint behavior
- **ACCESSIBILITY**: WCAG compliance
- **INTERACTION**: Hover states, transitions, animations

### Severity Levels
- 🔴 **Critical**: Fundamentally wrong, blocks release
- 🟠 **Major**: Noticeable deviation, should fix
- 🟡 **Minor**: Small deviation, nice to fix
- 🟢 **Pass**: Matches specification

### Result Markers
- ✅ Matches specification
- ⚠️ Minor deviation (document)
- ❌ Does not match (requires fix)
- ⏭️ Not applicable / Skipped

---

## OUTPUT LOCATION

Verification checklists are saved to: `{ux_output_path}/{screen-key}.md`

Default: `docs/testing/ux-checklists/{screen-key}.md`

---

## GIT WORKFLOW

After verification execution, results are committed:

```bash
git add {ux_output_path}/
git commit -m "ux(verify): {screen-key} - {pass_rate}% matches spec"
git push origin {current_branch}
```
