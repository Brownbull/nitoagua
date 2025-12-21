---
name: 'step-03b-data-validation'
description: 'Validate test data requirements before generating checklist'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-03b-data-validation.md'
nextStepFile: '{workflow_path}/steps/step-04-mapping.md'
prevStepFile: '{workflow_path}/steps/step-03-context.md'
workflowFile: '{workflow_path}/workflow.md'

# Atlas References
atlas_memory: '{project-root}/_bmad/agents/atlas/atlas-memory.md'
---

# Step 3B: Test Data Validation

## STEP GOAL:

To analyze the story's acceptance criteria, identify what test data is required, and verify that data exists in the target environment BEFORE generating the test checklist. This prevents wasted effort when tests cannot be executed due to missing data.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 🛑 HALT if critical test data is missing until user confirms resolution

### Role Reinforcement:

- ✅ You are Atlas, with knowledge of the project's data structures
- ✅ You can analyze what data is needed from acceptance criteria
- ✅ You know (or can discover) how to seed test data for this project

### Step-Specific Rules:

- 🎯 Focus ONLY on data requirements and validation
- 🚫 FORBIDDEN to proceed with missing critical data without user acknowledgment
- 💬 Clearly communicate data requirements and how to create them
- 📋 Provide actionable seed commands when available

## EXECUTION PROTOCOLS:

- 🎯 Analyze each AC for data dependencies
- 🔍 Categorize data as REQUIRED vs NICE-TO-HAVE
- 💾 Check if seed scripts exist in the project
- ⚠️ Warn user and halt if critical data is missing
- ⚡ Auto-proceed only if all REQUIRED data is available

## CONTEXT BOUNDARIES:

- Story is parsed from Step 2
- Context assembled from Step 3
- This step validates data before scenario mapping
- Scenario mapping happens in Step 4 only after data is confirmed

---

## Sequence of Instructions

### 1. Analyze Acceptance Criteria for Data Dependencies

**For each AC, identify:**

| AC | Data Required | Type | Critical? |
|----|---------------|------|-----------|
| {{ac_id}} | {{data_description}} | {{type}} | ✅/⚠️ |

**Data Types:**
- **Entities:** User accounts, requests, offers, orders, etc.
- **States:** Pending, in-progress, expired, completed items
- **Relationships:** User-to-request, provider-to-offer, etc.
- **Time-sensitive:** Items about to expire, recently created, etc.

**Example Analysis:**

```
AC10.3.1: "Countdown shows MM:SS when < 1 hour"
  → REQUIRED: Offer with expires_at < 1 hour from now
  → Type: Time-sensitive entity
  → Critical: YES (without this, test cannot be executed)

AC10.3.4: "Expired offers show 'Expirada' badge"
  → REQUIRED: At least one expired offer
  → Type: State-specific entity
  → Critical: YES
```

### 2. Compile Data Requirements Summary

**Present data requirements to user:**

```
**📊 Test Data Requirements for {{story_key}}**

### Required Data (Must Have)

| # | Requirement | Quantity | Current Status |
|---|-------------|----------|----------------|
| 1 | {{requirement}} | {{qty}} | ⏳ Unknown |
| 2 | {{requirement}} | {{qty}} | ⏳ Unknown |

### Nice-to-Have Data (Enhances Testing)

| # | Requirement | Purpose |
|---|-------------|---------|
| 1 | {{requirement}} | {{why_useful}} |

### Time-Sensitive Requirements

⚠️ The following data has time constraints:
- {{requirement}}: Must be {{time_constraint}}
```

### 3. Check for Project Seed Scripts

**Query Atlas memory or project structure for:**

- Seed scripts location (e.g., `scripts/`, `scripts/local/`)
- Available seed commands (e.g., `npm run seed:*`)
- Test data fixtures location

**Display available seeding options:**

```
**🌱 Available Seed Commands**

| Command | Description | Data Created |
|---------|-------------|--------------|
| `{{seed_command}}` | {{description}} | {{data_list}} |
| `{{seed_command}}` | {{description}} | {{data_list}} |

**Note:** Run these in the development environment (WSL/local) before testing.
```

### 4. Determine Environment and Validation Method

**Based on target environment:**

**If LOCAL environment (localhost):**
- Seed scripts CAN be run
- Database CAN be queried directly
- Time-sensitive data CAN be created fresh

**If PRODUCTION/STAGING environment:**
- Seed scripts CANNOT be run (usually)
- Must use existing data OR create manually
- Time-sensitive data may not exist

**Display environment guidance:**

```
**🌍 Target Environment: {{base_url}}**

{{#if local}}
✅ Local environment detected
- You can run seed scripts before testing
- Fresh test data can be created

**Recommended:** Run `{{seed_command}}` before executing the checklist.
{{else}}
⚠️ Remote environment detected ({{environment_type}})
- Seed scripts typically cannot run on production
- Tests depend on existing data

**Options:**
1. Test on local environment first with seeded data
2. Manually create required data in production
3. Skip data-dependent tests (mark as SKIPPED)
{{/if}}
```

### 5. Data Readiness Check

**Present decision point:**

```
**📋 Data Readiness Check**

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| {{requirement_1}} | ❓ Unverified | {{action}} |
| {{requirement_2}} | ❓ Unverified | {{action}} |

**Before proceeding, confirm:**
1. Required test data exists in target environment, OR
2. You will seed the data before test execution, OR
3. You acknowledge some tests will be SKIPPED

---

**Select an option:**

[S] Seed data now - Run seed command(s) before continuing
[V] Verify manually - I'll check the database/app manually
[A] Acknowledge gaps - Proceed knowing some tests may be skipped
[C] Continue - Data is ready, proceed to scenario mapping
```

### 6. Handle User Selection

#### If 'S' (Seed Data):

```
**🌱 Seeding Test Data**

Run the following command(s) in your development environment:

```bash
{{seed_command}}
```

**After seeding completes, select:**
[C] Continue - Data seeded, proceed to scenario mapping
[V] Verify - Let me check the data first
```

#### If 'V' (Verify Manually):

```
**🔍 Manual Verification Checklist**

Check the following in your app/database:

{{#each requirements}}
- [ ] {{requirement}}: Navigate to {{where_to_check}} and verify {{what_to_look_for}}
{{/each}}

**After verification, select:**
[C] Continue - Data verified, proceed to scenario mapping
[A] Acknowledge - Some data missing, will skip those tests
```

#### If 'A' (Acknowledge Gaps):

```
**⚠️ Proceeding with Known Data Gaps**

The following tests may be SKIPPED due to missing data:

| AC | Affected Scenarios | Data Missing |
|----|--------------------|--------------|
| {{ac}} | {{scenarios}} | {{missing_data}} |

These will be marked as "⏭️ SKIPPED - No test data" in the checklist.

**Proceeding to scenario mapping...**
```

#### If 'C' (Continue):

- Store data validation status
- Note any acknowledged gaps
- Proceed to Step 4

### 7. Update Checklist Generation Context

**Pass to Step 4:**

```yaml
data_validation:
  status: "{{validated|partial|skipped}}"
  requirements_met: {{count}}
  requirements_skipped: {{count}}
  skipped_acs: [{{ac_list}}]
  seed_commands_available: [{{commands}}]
  notes: "{{any_notes}}"
```

### 8. Proceed or Halt

**If user selected 'C' (Continue):**
- Display confirmation
- Load and execute `{nextStepFile}`

**If user selected 'S' and is seeding:**
- Wait for user to complete seeding
- Redisplay menu

**If issues remain unresolved:**
- Keep prompting until user makes a decision
- Never proceed without explicit user acknowledgment

---

## CRITICAL STEP COMPLETION NOTE

This step requires user input - it does NOT auto-proceed. The user must confirm data readiness before moving to scenario mapping. This prevents generating checklists that cannot be executed.

ONLY WHEN user selects 'C' (Continue) and confirms data readiness will you load, read entire file, then execute `{nextStepFile}`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All acceptance criteria analyzed for data dependencies
- Data requirements clearly communicated
- Seed commands provided if available
- User explicitly confirmed data readiness or acknowledged gaps
- Gaps are documented for checklist generation

### ❌ SYSTEM FAILURE:

- Proceeding without user confirmation of data readiness
- Not analyzing ACs for data dependencies
- Not providing seed commands when available
- Auto-proceeding when data is clearly missing
- Generating checklist for tests that cannot be executed

**Master Rule:** Never generate a test checklist that will fail due to missing data. Either ensure data exists, or explicitly mark tests as skipped.

---

## LESSON FROM FIELD TESTING

> **2025-12-20:** Chrome Extension E2E test for Story 10-3 (Countdown Timer) was executed on production but ALL 23 scenarios were SKIPPED because no seed data existed. The test consumer had no water requests with pending offers. This step prevents that wasted effort by validating data BEFORE generating the checklist.
