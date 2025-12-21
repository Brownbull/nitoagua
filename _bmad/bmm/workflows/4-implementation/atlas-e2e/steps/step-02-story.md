---
name: 'step-02-story'
description: 'Select and parse target story for E2E testing'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-02-story.md'
nextStepFile: '{workflow_path}/steps/step-03-context.md'
workflowFile: '{workflow_path}/workflow.md'

# Project References
sprint_status: '{project-root}/docs/sprint-artifacts/sprint-status.yaml'
stories_folder: '{project-root}/docs/sprint-artifacts'
---

# Step 2: Select and Parse Story

## STEP GOAL:

To identify the target story for E2E testing, parse its acceptance criteria, and extract all information needed for test generation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are Atlas, with knowledge of this project's stories and epics
- ✅ You help the user select the right story to test
- ✅ You parse stories accurately regardless of format

### Step-Specific Rules:

- 🎯 Focus ONLY on story selection and parsing
- 🚫 FORBIDDEN to generate test scenarios yet
- 💬 Present story options clearly
- 📋 Support multiple story formats (.md, .yaml)

## EXECUTION PROTOCOLS:

- 🎯 Help user select target story
- 📖 Parse story file completely
- 💾 Extract all acceptance criteria
- 🚫 Do not proceed without confirmed story selection

## CONTEXT BOUNDARIES:

- Atlas memory is loaded from Step 1
- Project context (base_url, personas) is available
- Focus on story selection and parsing only
- Test scenario mapping happens in Step 4

---

## Sequence of Instructions

### 1. Check for Story Path Argument

**If user provided story path/key in workflow invocation:**
- Use the provided path
- Skip to story parsing (Section 3)

**If no story path provided:**
- Proceed to story discovery (Section 2)

### 2. Discover Available Stories

**Action:** Check sprint status and story files for testable stories.

Look for stories with status:
- `in-progress` - Currently being developed
- `review` - Ready for testing
- `ready-for-dev` - Can test existing functionality

**Present options:**

```
**Available Stories for E2E Testing:**

| # | Story | Title | Status | Epic |
|---|-------|-------|--------|------|
| 1 | {{story_key}} | {{story_title}} | {{status}} | {{epic}} |
| 2 | {{story_key}} | {{story_title}} | {{status}} | {{epic}} |
| ... | ... | ... | ... | ... |

Enter story number, story key (e.g., "10-3"), or full path:
```

**Wait for user selection.**

### 3. Load and Parse Story File

**Action:** Load the selected story file and parse its contents.

**Support multiple formats:**

**Markdown format (.md):**
```markdown
# Story Title

## User Story
As a [persona], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] AC1: ...
- [ ] AC2: ...
```

**YAML format (.yaml):**
```yaml
story_key: "X-Y"
title: "Story Title"
persona: "Consumer"
acceptance_criteria:
  - id: AC1
    description: "..."
```

### 4. Extract Story Information

**Parse and extract:**

| Field | Value |
|-------|-------|
| Story Key | {{story_key}} |
| Title | {{story_title}} |
| Persona | {{primary_persona}} |
| Epic Context | {{epic_number}} - {{epic_title}} |

**Acceptance Criteria:**

| AC ID | Description | Testable |
|-------|-------------|----------|
| AC-1 | {{ac_description}} | ✅/⚠️ |
| AC-2 | {{ac_description}} | ✅/⚠️ |
| ... | ... | ... |

**Technical Context:**
- Files involved: {{file_list}}
- Components: {{component_list}}
- API endpoints: {{endpoint_list}}

### 5. Identify Multi-Persona Requirements

**Scan acceptance criteria for multi-persona interactions:**

- Look for terms: "provider sees", "admin approves", "consumer receives"
- Identify cross-persona workflows
- Flag criteria requiring multiple browser tabs

**Multi-Persona Analysis:**

```
**Personas Required for This Story:**

🔵 Consumer - Primary persona (from user story)
{{#if provider_involved}}
🟢 Provider - Required for: {{provider_acs}}
{{/if}}
{{#if admin_involved}}
🟠 Admin - Required for: {{admin_acs}}
{{/if}}

**Cross-Persona Flows Detected:**
{{#each cross_persona_flows}}
- {{flow_description}} ({{personas_involved}})
{{/each}}
```

### 6. Display Story Summary

**Present parsed story for confirmation:**

```
**📋 Story Loaded for E2E Testing**

**Story:** {{story_key}} - {{story_title}}
**Primary Persona:** {{primary_persona}}
**Epic:** {{epic_context}}

**Acceptance Criteria:** {{ac_count}} items
{{#each acceptance_criteria}}
- **{{ac_id}}:** {{ac_summary}}
{{/each}}

**Personas Required:** {{persona_list}}
**Multi-Persona Flows:** {{flow_count}} detected

**Files to Test:**
{{#each files}}
- {{file_path}}
{{/each}}
```

### 7. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

#### Menu Handling Logic:

- IF A: Execute `{project-root}/_bmad/core/tasks/advanced-elicitation.xml`
- IF P: Execute `{project-root}/_bmad/core/workflows/party-mode/workflow.md`
- IF C: Store parsed story data, then load, read entire file, then execute `{nextStepFile}`
- IF user wants different story: Return to Section 2 for new selection
- IF Any other comments or queries: help user respond then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected and story is successfully parsed will you load, read entire file, then execute `{nextStepFile}` to begin context assembly.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Story selected by user
- Story file parsed successfully
- All acceptance criteria extracted
- Multi-persona requirements identified
- User confirmed story selection

### ❌ SYSTEM FAILURE:

- Proceeding without user confirming story
- Missing acceptance criteria in parsing
- Not identifying multi-persona requirements
- Hardcoding story details instead of parsing

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
