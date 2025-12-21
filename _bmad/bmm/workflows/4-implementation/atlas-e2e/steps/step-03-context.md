---
name: 'step-03-context'
description: 'Assemble complete testing context from Atlas memory'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-03-context.md'
nextStepFile: '{workflow_path}/steps/step-03b-data-validation.md'
workflowFile: '{workflow_path}/workflow.md'

# Atlas References
atlas_memory: '{project-root}/_bmad/agents/atlas/atlas-memory.md'
---

# Step 3: Assemble Testing Context

## STEP GOAL:

To automatically assemble all testing context from Atlas memory - personas, behaviors, project configuration, and existing patterns - creating a complete foundation for test scenario mapping.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ⚡ This is primarily an auto-assembly step with minimal user input

### Role Reinforcement:

- ✅ You are Atlas, drawing on your project memory
- ✅ You know the personas, their goals, and their behaviors
- ✅ You understand the project's testing patterns

### Step-Specific Rules:

- 🎯 Focus ONLY on context assembly from memory
- 🚫 FORBIDDEN to create test scenarios yet
- ⚡ Auto-proceed after displaying assembled context
- 📋 Present context for user confirmation

## EXECUTION PROTOCOLS:

- 🎯 Query Atlas memory for all relevant sections
- 📖 Assemble persona details for required personas
- 💾 Gather project configuration
- ⚡ Display summary and auto-proceed

## CONTEXT BOUNDARIES:

- Story is parsed from Step 2
- Personas required are identified
- This step gathers supporting context from Atlas memory
- Scenario mapping happens in Step 4

---

## Sequence of Instructions

### 1. Load Persona Details

**For each persona required by the story:**

Query Atlas memory Section 3 (Personas) and extract:

| Field | Description |
|-------|-------------|
| Name | Persona display name |
| Role | System role (consumer, provider, admin) |
| Goals | Primary goals when using the app |
| Behaviors | Typical interaction patterns |
| Pain Points | Common frustrations |
| Edge Cases | Unusual scenarios to test |

**Persona Context Template:**

```
### 🔵 {{persona_name}} ({{role}})

**Goals:**
{{#each goals}}
- {{goal}}
{{/each}}

**Typical Behaviors:**
{{#each behaviors}}
- {{behavior}}
{{/each}}

**Pain Points to Test:**
{{#each pain_points}}
- {{pain_point}}
{{/each}}

**Known Edge Cases:**
{{#each edge_cases}}
- {{edge_case}}
{{/each}}
```

### 2. Load Project Configuration

**Query Atlas memory for project config:**

| Config | Value | Source |
|--------|-------|--------|
| Base URL | {{base_url}} | Atlas project_config |
| Environment | {{environment}} | Atlas project_config |

**Test Users:**

| Role | Email | Password |
|------|-------|----------|
| {{role}} | {{email}} | {{password}} |
| ... | ... | ... |

### 3. Load Existing Test Patterns

**Query Atlas memory Section 5 (Testing) if available:**

**Existing Patterns:**
- Authentication pattern: {{auth_pattern}}
- Navigation pattern: {{nav_pattern}}
- Form submission pattern: {{form_pattern}}
- Verification pattern: {{verify_pattern}}

**Fixtures Available:**
- {{fixture_name}}: {{fixture_description}}
- ...

**Previous Test Coverage:**
- Related stories tested: {{related_tests}}
- Patterns to reuse: {{reusable_patterns}}

### 4. Identify UI Components

**From story file list, identify:**

| Component | Type | Key Selectors |
|-----------|------|---------------|
| {{component}} | {{type}} | {{selectors}} |
| ... | ... | ... |

**Note:** Selectors come from Atlas memory's feature inventory or are described contextually if not explicitly stored.

### 5. Display Assembled Context

**Present complete testing context:**

```
**🧠 Testing Context Assembled**

---

**Story:** {{story_key}} - {{story_title}}
**Environment:** {{base_url}} ({{environment}})

---

### Personas

{{#each personas}}
#### {{badge}} {{name}}
- **Login:** {{email}}
- **Goals:** {{goals_summary}}
- **Key Behaviors:** {{behaviors_summary}}
{{/each}}

---

### Project Context

**Test Users Configured:** {{test_user_count}}
**Authentication Method:** {{auth_method}}
**Key Components:** {{component_list}}

---

### Testing Patterns Available

{{#if patterns_available}}
- ✅ Authentication: {{auth_pattern}}
- ✅ Navigation: {{nav_pattern}}
- ✅ Forms: {{form_pattern}}
{{else}}
- ℹ️ No existing patterns in Atlas - will establish new patterns
{{/if}}

---

### Related Test Coverage

{{#if related_tests}}
{{#each related_tests}}
- {{test_name}}: {{coverage}}
{{/each}}
{{else}}
- ℹ️ First E2E test for this feature area
{{/if}}
```

### 6. Auto-Proceed to Mapping

**After displaying context:**

```
Context assembly complete. Proceeding to scenario mapping...
```

**Action:** Automatically load and execute `{nextStepFile}`

---

## CRITICAL STEP COMPLETION NOTE

This step auto-proceeds after displaying the assembled context. The user has already confirmed the story in Step 2, and context assembly is deterministic from Atlas memory.

WHEN context is displayed, immediately load, read entire file, then execute `{nextStepFile}` to begin test data validation.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All required persona details loaded
- Project configuration extracted
- Testing patterns identified (or noted as new)
- Context displayed clearly
- Auto-proceeded to Step 4

### ❌ SYSTEM FAILURE:

- Missing persona details without warning
- Hardcoding values instead of querying memory
- Not displaying assembled context
- Waiting for input when auto-proceed is specified

**Master Rule:** Context assembly draws entirely from Atlas memory. Never invent or assume project-specific details.
