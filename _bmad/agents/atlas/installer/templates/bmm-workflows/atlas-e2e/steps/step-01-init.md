---
name: 'step-01-init'
description: 'Initialize Atlas context and validate E2E contract requirements'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-story.md'
workflowFile: '{workflow_path}/workflow.md'

# Atlas References
atlas_memory: '{project-root}/_bmad/agents/atlas/atlas-memory.md'
---

# Step 1: Initialize Atlas Context

## STEP GOAL:

To load Atlas memory, validate the E2E contract requirements, and verify the execution environment is ready for Chrome Extension testing.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ⚡ This is an auto-proceed step after validation passes

### Role Reinforcement:

- ✅ You are Atlas, a testing specialist with project memory
- ✅ Your memory contains all project-specific knowledge needed for testing
- ✅ You validate that required information exists before proceeding

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and validation
- 🚫 FORBIDDEN to proceed if contract validation fails
- 💬 Provide clear error messages if validation fails
- ⚡ Auto-proceed to Step 2 after successful validation

## EXECUTION PROTOCOLS:

- 🎯 Load and validate Atlas memory structure
- 🔍 Check for required contract sections
- ⚠️ Fail fast with clear guidance if contract incomplete
- ⚡ Auto-proceed on success

## CONTEXT BOUNDARIES:

- No previous context exists - this is the entry point
- Atlas memory is the source of all project-specific data
- Environment must be Windows with Chrome Extension

---

## Sequence of Instructions

### 1. Load Atlas Memory

Load the Atlas memory file from `{atlas_memory}`.

**Action:** Read the complete Atlas memory file and parse its structure.

**Extract and store:**
- Project name
- Base URL (from project config section)
- Test users (from project config section)
- E2E output path (or use default)
- Available personas (from Section 3)
- Testing patterns (from Section 5, if available)

### 2. Validate E2E Contract

Check that all required sections exist in Atlas memory.

**Required Validations:**

| Check | Requirement | Status |
|-------|-------------|--------|
| Project Config | `base_url` must be defined | ⏳ |
| Test Users | At least one test user with role, email, password | ⏳ |
| Personas | Section 3 must contain at least one persona | ⏳ |
| Output Path | Defined or use default | ⏳ |

**Validation Logic:**

```
IF base_url is missing:
  FAIL: "Atlas memory missing 'base_url' in project config. Add it to proceed."

IF test_users is empty or missing:
  FAIL: "Atlas memory missing 'test_users'. Define at least one test user per persona."

IF personas section is missing or empty:
  FAIL: "Atlas memory Section 3 (Personas) is missing or empty. Define at least one persona."

IF all checks pass:
  SUCCEED: Continue to Step 2
```

### 3. Display Initialization Summary

**On Success:**

```
✅ **Atlas E2E Initialized**

**Project:** {{project_name}}
**Base URL:** {{base_url}}
**Test Users:** {{test_user_count}} configured
**Personas:** {{persona_list}}
**Output Path:** {{e2e_output_path}}

**Environment Check:**
- Atlas Memory: ✅ Loaded
- Contract Validation: ✅ Passed
- Chrome Extension: ℹ️ Ensure active in Windows browser

Proceeding to story selection...
```

**On Failure:**

```
❌ **Atlas E2E Contract Validation Failed**

{{failure_reason}}

**To fix:**
1. Open Atlas memory: {{atlas_memory}}
2. Add the missing section/field
3. Run this workflow again

**Atlas E2E Contract Reference:**
See workflow.md for required memory structure.
```

### 4. Auto-Proceed or Halt

**If validation PASSED:**
- Display success summary
- Immediately load and execute `{nextStepFile}`

**If validation FAILED:**
- Display failure message with guidance
- HALT - do not proceed

---

## CRITICAL STEP COMPLETION NOTE

This step auto-proceeds on success. There is no menu - validation either passes and continues, or fails and halts.

ONLY WHEN validation passes will you load, read entire file, then execute `{nextStepFile}` to begin story selection.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Atlas memory loaded successfully
- All contract validations passed
- Project context extracted and stored
- Auto-proceeded to Step 2

### ❌ SYSTEM FAILURE:

- Proceeding despite validation failures
- Not providing clear error guidance
- Hardcoding values instead of reading from memory
- Skipping contract validation

**Master Rule:** If contract validation fails, HALT immediately with clear guidance. Never proceed with incomplete project context.
