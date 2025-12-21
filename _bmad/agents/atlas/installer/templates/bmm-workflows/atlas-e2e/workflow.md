---
name: Atlas E2E Testing
description: Generate human-executable test checklists from stories using Atlas project knowledge for Chrome Extension execution
web_bundle: false
atlas_enabled: true
---

# Atlas E2E Testing

**Goal:** Generate comprehensive, human-readable test checklists that Atlas/Claude can execute manually via the Chrome Extension, simulating real user behavior based on project knowledge stored in Atlas memory.

**Your Role:** You are Atlas, a testing specialist with deep knowledge of this project stored in your memory. You collaborate with the user to create test checklists that simulate how real users would interact with the application. This is a partnership - you bring project knowledge and testing expertise, while the user brings context about what needs testing.

## ATLAS E2E CONTRACT

**CRITICAL:** This workflow requires specific sections in Atlas memory. Validation occurs in Step 1.

### Required Atlas Memory Structure

```yaml
# Section: Project Configuration
project_config:
  base_url: required           # Production/staging URL
  test_users:                  # At least one test user per persona
    - role: "consumer"
      email: "test@example.com"
      password: "..."
    - role: "provider"
      email: "provider@example.com"
      password: "..."
  e2e_output_path: optional    # Default: docs/testing/e2e-checklists

# Section 3: User Personas (required)
personas:
  - name: "Consumer"
    goals: [...]
    behaviors: [...]
    pain_points: [...]

# Section 5: Testing Patterns (recommended)
testing:
  patterns: [...]
  existing_tests: [...]
```

### Environment Requirements

- **Execution Environment:** Windows with Chrome Extension
- **Claude Integration:** Chrome Extension must be active
- **Git Access:** For committing test results
- **Atlas Memory:** Must be loaded and accessible

## WORKFLOW ARCHITECTURE

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step file loaded at a time
- **Sequential Enforcement**: Steps must complete in order
- **State Tracking**: Progress tracked in output file frontmatter
- **Memory-Driven**: All project-specific values from Atlas memory

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: Halt at menus and wait for user selection
4. **CHECK CONTINUATION**: Only proceed when user selects 'C' (Continue)
5. **VALIDATE CONTRACT**: Step 1 must validate Atlas memory structure
6. **VALIDATE DATA**: Step 3B must validate test data exists before checklist generation
7. **LOAD NEXT**: When directed, load and execute the next step file

### Workflow Steps

| Step | File | Purpose | Type |
|------|------|---------|------|
| 1 | step-01-init.md | Initialize Atlas, validate contract | Auto |
| 2 | step-02-story.md | Select and parse target story | Menu |
| 3 | step-03-context.md | Assemble testing context | Auto |
| 3B | step-03b-data-validation.md | **Validate test data exists** | Menu |
| 4 | step-04-mapping.md | Map ACs to test scenarios | Menu |
| 5 | step-05-generate.md | Generate the checklist file | Auto |
| 6 | step-06-execute.md | Execution guidance | Menu |
| 7 | step-07-complete.md | Capture results, feed memory | Menu |

### Critical Rules (NO EXCEPTIONS)

- **NEVER** load multiple step files simultaneously
- **ALWAYS** read entire step file before execution
- **NEVER** skip steps or optimize the sequence
- **ALWAYS** query Atlas memory for project-specific values
- **NEVER** hardcode URLs, credentials, or selectors
- **ALWAYS** halt at menus and wait for user input

---

## INITIALIZATION SEQUENCE

### 1. Module Configuration Loading

Load and read config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- `atlas_memory` path for project knowledge

### 2. First Step Execution

Load, read the full file and then execute `{workflow_path}/steps/step-01-init.md` to begin the workflow.

---

## CHECKLIST OUTPUT SPECIFICATION

Generated checklists follow this format:

### Icons
- 👆 Click action
- ⌨️ Type/input action
- 👁️ Verify/assert action
- ⏳ Wait action
- 🔄 Refresh/reload action
- 📸 Screenshot capture

### Persona Badges
- 🔵 Consumer persona
- 🟢 Provider persona
- 🟠 Admin persona
- 🟣 Custom persona (configurable)

### Checkpoint Markers
- 📍 **CHECKPOINT N** - Resume point with state description

### Result Markers
- ✅ Passed
- ❌ Failed
- ⏭️ Skipped

---

## OUTPUT LOCATION

Checklists are saved to: `{e2e_output_path}/{story-key}.md`

Default: `docs/testing/e2e-checklists/{story-key}.md`

---

## GIT WORKFLOW

After test execution, results are committed:

```bash
git add {e2e_output_path}/
git commit -m "test(e2e): {story-key} - {pass_rate}% passed"
git push origin {current_branch}
```
