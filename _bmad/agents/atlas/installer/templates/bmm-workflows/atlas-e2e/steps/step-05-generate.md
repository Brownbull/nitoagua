---
name: 'step-05-generate'
description: 'Generate the human-executable test checklist'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-05-generate.md'
nextStepFile: '{workflow_path}/steps/step-06-execute.md'
workflowFile: '{workflow_path}/workflow.md'

# Template References
checklistTemplate: '{workflow_path}/templates/checklist-template.md'
personaSectionTemplate: '{workflow_path}/templates/persona-section.md'
checkpointTemplate: '{workflow_path}/templates/checkpoint.md'
---

# Step 5: Generate Test Checklist

## STEP GOAL:

To generate a complete, human-executable test checklist that Atlas/Claude can follow step-by-step using the Chrome Extension.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ⚡ This is primarily a generation step with auto-proceed

### Role Reinforcement:

- ✅ You are Atlas, creating clear, executable instructions
- ✅ You write for a human (or Claude) following steps in a browser
- ✅ You include all context needed for successful execution

### Step-Specific Rules:

- 🎯 Focus ONLY on checklist generation
- 🚫 FORBIDDEN to execute the checklist yet
- ⚡ Auto-proceed after displaying and saving checklist
- 📋 Use consistent icons and formatting

## EXECUTION PROTOCOLS:

- 🎯 Generate complete checklist from scenario mapping
- 💾 Save checklist to output path
- 📖 Include all setup, execution, and result capture
- ⚡ Display and auto-proceed

## CONTEXT BOUNDARIES:

- Scenario mapping approved from Step 4
- Project config and personas from earlier steps
- This step generates the checklist file
- Execution guidance happens in Step 6

---

## Sequence of Instructions

### 1. Determine Output Path

**Query Atlas memory for output path:**
- If `e2e_output_path` defined: Use that path
- If not defined: Use default `docs/testing/e2e-checklists`

**Full path:** `{{e2e_output_path}}/{{story_key}}.md`

### 2. Generate Checklist Header

```markdown
# E2E Test: {{story_key}} - {{story_title}}

## Test Information

| Field | Value |
|-------|-------|
| **Generated** | {{current_date}} |
| **Story** | {{story_key}} - {{story_title}} |
| **Epic** | {{epic_context}} |
| **Base URL** | {{base_url}} |
| **Personas** | {{persona_badges}} |
| **Total Scenarios** | {{scenario_count}} |
| **Estimated Time** | {{estimated_minutes}} min |

---

## Legend

| Icon | Meaning |
|------|---------|
| 👆 | Click action |
| ⌨️ | Type/input action |
| 👁️ | Verify/assert (check visually) |
| ⏳ | Wait for condition |
| 🔄 | Refresh/reload page |
| 📸 | Take screenshot (optional) |
| 📍 | Checkpoint - safe to pause here |

| Badge | Persona |
|-------|---------|
| 🔵 | Consumer |
| 🟢 | Provider |
| 🟠 | Admin |
```

### 3. Generate Pre-Execution Setup

```markdown
---

## Pre-Execution Setup

### Environment Verification
- [ ] 👁️ Chrome browser open with Claude Extension active
- [ ] 👁️ Extension icon visible in toolbar
- [ ] 👁️ Network connection stable

### Tab Setup

{{#each personas_required}}
#### {{badge}} Tab {{tab_number}}: {{persona_name}}

1. [ ] 👆 Open new browser tab
2. [ ] ⌨️ Navigate to: `{{base_url}}`
3. [ ] 👁️ Verify: Login page loads
4. [ ] ⌨️ Enter email: `{{test_email}}`
5. [ ] ⌨️ Enter password: `{{test_password}}`
6. [ ] 👆 Click "Sign In" button
7. [ ] 👁️ Verify: Dashboard/home page loads
8. [ ] 👁️ Verify: Logged in as {{persona_name}}

**⚠️ Keep this tab open throughout testing**

{{/each}}

📍 **CHECKPOINT 0** - All personas logged in, tabs arranged side by side

---
```

### 4. Generate AC Test Sections

**For each Acceptance Criterion:**

```markdown
## AC-{{ac_number}}: {{ac_description}}

**Priority:** {{priority_badge}}
**Personas:** {{personas_involved}}

{{#each scenarios}}

### Scenario: {{scenario_name}}

{{#each steps}}
{{#if persona_switch}}
---
### {{persona_badge}} Tab {{tab_number}}: {{persona_name}}
{{/if}}

{{step_number}}. [ ] {{icon}} {{action_description}}
   {{#if expected_result}}
   - Expected: {{expected_result}}
   {{/if}}
   {{#if notes}}
   - Note: {{notes}}
   {{/if}}

{{/each}}

{{#if checkpoint}}
📍 **CHECKPOINT {{checkpoint_number}}** - {{checkpoint_description}}

<details>
<summary>Checkpoint State (expand if resuming)</summary>

- Tab 1 ({{persona_1}}): {{tab_1_state}}
- Tab 2 ({{persona_2}}): {{tab_2_state}}
- Data created: {{data_state}}

</details>
{{/if}}

{{/each}}

---
```

### 5. Generate Cross-Persona Synchronization

**For multi-persona scenarios, include explicit sync points:**

```markdown
### ⚠️ Cross-Persona Synchronization

**Switching from {{persona_a}} to {{persona_b}}:**

1. [ ] 👁️ In {{persona_a}} tab: Verify {{expected_state}}
2. [ ] ⏳ Wait 3-5 seconds for system sync
3. [ ] 👆 Switch to {{persona_b}} tab
4. [ ] 🔄 Refresh the page (recommended)
5. [ ] 👁️ Verify: {{persona_b}} sees {{expected_content}}

**If not visible after refresh:**
- Wait 10 more seconds
- Refresh again
- If still not visible, note as potential issue
```

### 6. Generate Results Section

```markdown
---

## Test Results

### Summary

| Metric | Value |
|--------|-------|
| **Executed On** | _________________ |
| **Executed By** | _________________ |
| **Total Steps** | {{total_steps}} |
| **Passed** | _____ |
| **Failed** | _____ |
| **Skipped** | _____ |
| **Pass Rate** | _____% |

### Overall Result

- [ ] ✅ **PASSED** - All critical scenarios passed
- [ ] ⚠️ **PASSED WITH ISSUES** - Minor issues noted
- [ ] ❌ **FAILED** - Critical scenarios failed

---

### Failure Log

| Step | Description | Expected | Actual | Screenshot |
|------|-------------|----------|--------|------------|
| | | | | |
| | | | | |

### Notes & Observations

```
(Add any observations, edge cases discovered, or suggestions)



```

---

## Post-Execution

### Save Results
1. [ ] Update the checkboxes above with results
2. [ ] Fill in the Summary table
3. [ ] Document any failures in the Failure Log
4. [ ] Add notes and observations

### Commit Results
```bash
git add {{e2e_output_path}}/
git commit -m "test(e2e): {{story_key}} - executed"
git push origin {{current_branch}}
```

---

*Generated by Atlas E2E Workflow*
*Checklist Version: 1.0*
```

### 7. Save Checklist to File

**Action:** Write the complete checklist to `{{e2e_output_path}}/{{story_key}}.md`

### 8. Display Generation Summary

```
**✅ Checklist Generated**

**File:** {{output_path}}
**Total Steps:** {{step_count}}
**Checkpoints:** {{checkpoint_count}}
**Estimated Time:** {{estimated_minutes}} minutes

**Structure:**
- Pre-Execution Setup: {{setup_steps}} steps
{{#each acceptance_criteria}}
- {{ac_id}}: {{scenario_count}} scenarios, {{step_count}} steps
{{/each}}
- Results Capture: Ready

**Ready for Chrome Extension execution.**

Proceeding to execution guidance...
```

### 9. Auto-Proceed to Execution

**Action:** After displaying summary, automatically load and execute `{nextStepFile}`

---

## CRITICAL STEP COMPLETION NOTE

This step auto-proceeds after generating and saving the checklist. The checklist is now ready for execution.

WHEN checklist is saved and summary displayed, immediately load, read entire file, then execute `{nextStepFile}` for execution guidance.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Checklist file created at correct path
- All scenarios from mapping included
- Checkpoints placed every 3-5 steps
- Clear, executable instructions
- Results section included

### ❌ SYSTEM FAILURE:

- Missing any mapped scenarios
- Unclear or ambiguous instructions
- Missing checkpoint markers
- Hardcoded values instead of from context
- Not saving the file

**Master Rule:** The checklist must be complete and self-contained. Anyone with browser access should be able to execute it.
