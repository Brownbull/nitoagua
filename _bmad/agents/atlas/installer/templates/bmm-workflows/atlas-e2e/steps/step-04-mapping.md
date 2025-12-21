---
name: 'step-04-mapping'
description: 'Map acceptance criteria to executable test scenarios'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-04-mapping.md'
nextStepFile: '{workflow_path}/steps/step-05-generate.md'
workflowFile: '{workflow_path}/workflow.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/tasks/advanced-elicitation.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Map ACs to Test Scenarios

## STEP GOAL:

To transform each acceptance criterion into executable test scenarios, incorporating persona behaviors and identifying the complete user journey for each test.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are Atlas, translating requirements into testable scenarios
- ✅ You think like the personas - how would they actually do this?
- ✅ You identify edge cases and failure modes

### Step-Specific Rules:

- 🎯 Focus ONLY on scenario mapping
- 🚫 FORBIDDEN to generate checklist steps yet
- 💬 Collaborate on scenario completeness
- 📋 User approves final mapping before proceeding

## EXECUTION PROTOCOLS:

- 🎯 Create test scenarios for each AC
- 📖 Include happy path, edge cases, error cases
- 💾 Apply persona behaviors to scenarios
- 🚫 Do not proceed without user approval

## CONTEXT BOUNDARIES:

- Story and ACs available from Step 2
- Persona context available from Step 3
- This step creates the scenario mapping
- Checklist generation happens in Step 5

---

## Sequence of Instructions

### 1. Map Each AC to Test Scenarios

**For each Acceptance Criterion, generate:**

```
**{{ac_id}}: {{ac_description}}**

├── 🎯 **Happy Path:** {{happy_path_description}}
│   └── Personas: {{personas_involved}}
│
├── ⚠️ **Edge Cases:**
│   ├── {{edge_case_1}}
│   └── {{edge_case_2}}
│
├── ❌ **Error Cases:**
│   ├── {{error_case_1}} (expected: {{expected_behavior}})
│   └── {{error_case_2}} (expected: {{expected_behavior}})
│
└── 🎭 **Persona Behaviors:**
    ├── {{persona}}: {{realistic_behavior}}
    └── {{persona}}: {{realistic_behavior}}
```

### 2. Identify Cross-Persona Scenarios

**For ACs involving multiple personas:**

```
**Cross-Persona Flow: {{flow_name}}**

Sequence:
1. 🔵 Consumer: {{consumer_action}}
2. ⏳ System: {{system_response}}
3. 🟢 Provider: {{provider_action}}
4. 👁️ Consumer: {{consumer_verification}}

Synchronization Points:
- After step 1: Provider must see {{expected_state}}
- After step 3: Consumer must see {{expected_state}}
```

### 3. Apply Persona Behaviors

**Enhance scenarios with realistic user behaviors:**

| Persona | Behavior | Applied To |
|---------|----------|------------|
| {{persona}} | "Types slowly, makes corrections" | Form inputs |
| {{persona}} | "Checks email for confirmation" | Post-submission |
| {{persona}} | "Refreshes page when uncertain" | Loading states |
| {{persona}} | "Uses keyboard navigation" | Accessibility |

### 4. Prioritize Scenarios

**Assign priority to each scenario:**

| Priority | Criteria | Testing Depth |
|----------|----------|---------------|
| 🔴 Critical | Core user flow, blocking issues | Full coverage |
| 🟡 Important | Edge cases, usability | Key scenarios |
| 🟢 Nice-to-have | Polish, rare scenarios | If time permits |

### 5. Display Complete Mapping

**Present the full scenario mapping:**

```
**📋 Test Scenario Mapping**

**Story:** {{story_key}} - {{story_title}}
**Total ACs:** {{ac_count}}
**Total Scenarios:** {{scenario_count}}

---

{{#each acceptance_criteria}}

### {{ac_id}}: {{ac_description}}

| Type | Scenario | Priority | Personas |
|------|----------|----------|----------|
| Happy Path | {{happy_path}} | 🔴 | {{personas}} |
{{#each edge_cases}}
| Edge Case | {{scenario}} | {{priority}} | {{personas}} |
{{/each}}
{{#each error_cases}}
| Error | {{scenario}} | {{priority}} | {{personas}} |
{{/each}}

{{/each}}

---

**Summary:**
- 🔴 Critical scenarios: {{critical_count}}
- 🟡 Important scenarios: {{important_count}}
- 🟢 Nice-to-have: {{nice_to_have_count}}

**Cross-Persona Flows:** {{cross_persona_count}}
**Estimated Checkpoints:** {{checkpoint_count}}
```

### 6. Request User Review

**Ask user to review and approve:**

```
**Review the scenario mapping above.**

Questions to consider:
1. Are all acceptance criteria covered?
2. Are the edge cases realistic?
3. Should any scenarios be added or removed?
4. Is the priority assignment correct?

Would you like to:
- **Modify** any scenarios
- **Add** missing scenarios
- **Remove** unnecessary scenarios
- **Approve** and proceed to checklist generation
```

### 7. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

#### Menu Handling Logic:

- IF A: Execute `{advancedElicitationTask}` to explore additional scenarios
- IF P: Execute `{partyModeWorkflow}` for diverse perspectives
- IF C: Save approved mapping, then load, read entire file, then execute `{nextStepFile}`
- IF user wants modifications: Apply changes and redisplay mapping
- IF Any other comments or queries: help user respond then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected and scenario mapping is approved will you load, read entire file, then execute `{nextStepFile}` to begin checklist generation.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Every AC has at least one test scenario
- Edge cases identified for critical paths
- Cross-persona flows properly sequenced
- User approved the final mapping
- Priorities assigned appropriately

### ❌ SYSTEM FAILURE:

- Missing coverage for any AC
- Proceeding without user approval
- Not considering persona behaviors
- Ignoring cross-persona synchronization

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
