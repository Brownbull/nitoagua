---
name: 'step-06-execute'
description: 'Guide through Chrome Extension test execution'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-06-execute.md'
nextStepFile: '{workflow_path}/steps/step-07-complete.md'
workflowFile: '{workflow_path}/workflow.md'
---

# Step 6: Execute Test Checklist

## STEP GOAL:

To guide the user (or Claude via Chrome Extension) through executing the test checklist, providing tips for efficient execution and handling common issues.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 This step involves MANUAL execution by human or Claude
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A GUIDE, not the executor

### Role Reinforcement:

- ✅ You are Atlas, providing execution guidance
- ✅ You help troubleshoot issues during execution
- ✅ You do NOT execute the checklist yourself

### Step-Specific Rules:

- 🎯 Focus ONLY on execution guidance
- 🚫 FORBIDDEN to mark checklist items as complete
- 💬 Available for questions during execution
- 📋 User controls when to proceed

## EXECUTION PROTOCOLS:

- 🎯 Display execution guidance
- 💬 Be available for troubleshooting
- ⏸️ Wait for user to complete execution
- 🚫 Do not proceed until user confirms completion

## CONTEXT BOUNDARIES:

- Checklist is generated and saved from Step 5
- User will execute in Windows with Chrome Extension
- This step provides guidance, not execution
- Results capture happens in Step 7

---

## Sequence of Instructions

### 1. Display Execution Briefing

```
**🚀 Ready for Test Execution**

**Checklist Location:** {{checklist_path}}

---

### Execution Environment

| Requirement | Status |
|-------------|--------|
| Windows OS | Required |
| Chrome Browser | Required |
| Claude Extension | Required |
| Checklist File Open | Required |

---

### Execution Modes

**Option A: Claude Executes via Chrome Extension**
1. Open the checklist file in Claude (Chrome Extension)
2. Tell Claude: "Execute this test checklist step by step"
3. Claude will follow each step, marking checkboxes
4. Review results when complete

**Option B: Manual Human Execution**
1. Open the checklist file
2. Open browser tabs as specified
3. Follow each step, checking boxes as you go
4. Use checkpoints to pause if needed

---

### Recommended: Claude Execution Prompt

Copy this prompt for Claude Chrome Extension:

```
Execute this E2E test checklist step by step.

For each step:
1. Perform the action described
2. Verify the expected result
3. Check the checkbox if passed
4. Note any failures

At checkpoints, confirm the state matches before continuing.
If a step fails, document it and continue to the next step.

When complete, fill in the Results section.
```

---
```

### 2. Provide Execution Tips

```
### Execution Tips

#### Tab Management
- 🔵 Keep Consumer tab on the LEFT
- 🟢 Keep Provider tab in the MIDDLE
- 🟠 Keep Admin tab on the RIGHT (if used)
- ⚠️ Don't close tabs until test complete

#### Timing & Synchronization
- ⏳ Real-time operations may have slight delays
- 🔄 Refresh if expected content doesn't appear
- ⏰ Wait 3-5 seconds after cross-persona actions

#### Checkpoint Usage
- 📍 Checkpoints are safe pause points
- 💾 If interrupted, resume from last checkpoint
- 📝 Checkpoint details show expected state

#### Handling Failures
- ❌ If a step fails, mark it and continue
- 📸 Take screenshot of failures if possible
- 📝 Note the actual vs expected in Failure Log
- 🚫 Don't try to "fix" the app during testing

#### Common Issues

| Issue | Solution |
|-------|----------|
| Element not found | Wait 2-3s, refresh, check selector |
| Login expired | Re-login, resume from checkpoint |
| Notification not received | Refresh recipient tab, wait longer |
| Page loading slowly | Increase wait times |
| Tab closed accidentally | Re-open, resume from checkpoint |
```

### 3. Display Checklist Quick Reference

```
### Checklist Quick Reference

**File:** {{checklist_path}}

**Structure:**
1. Pre-Execution Setup (login all personas)
2. AC-1 through AC-{{ac_count}} (main tests)
3. Results Section (capture outcomes)
4. Post-Execution (commit results)

**Key Sections:**
{{#each acceptance_criteria}}
- **{{ac_id}}:** {{scenario_count}} scenarios
{{/each}}

**Checkpoints:** {{checkpoint_count}} (resume points)
```

### 4. Await Execution Completion

```
---

### Execution Status

The checklist is ready for execution.

**Next Steps:**
1. Execute the checklist (via Claude or manually)
2. Mark all checkboxes with results
3. Fill in the Results Summary
4. Return here when complete

---

**When execution is complete, select [C] to continue to results capture.**

**If you encounter issues during execution, describe them and I'll help troubleshoot.**
```

### 5. Present MENU OPTIONS

Display: **Select an Option:** [H] Help/Troubleshoot [R] Review Checklist [C] Continue (Execution Complete)

#### Menu Handling Logic:

- IF H: Provide troubleshooting assistance based on user's described issue
- IF R: Display the checklist file contents for review
- IF C: Confirm execution complete, then load, read entire file, then execute `{nextStepFile}`
- IF user describes a problem: Provide targeted troubleshooting, then redisplay menu
- IF Any other comments or queries: help user respond then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- Be responsive to troubleshooting needs
- User can chat or ask questions - always respond and then redisplay menu

#### Troubleshooting Responses:

**If user reports "element not found":**
```
The element might not be visible yet. Try:
1. Wait 2-3 seconds for the page to load
2. Refresh the page
3. Check if you're on the correct page/tab
4. Verify the previous step completed successfully
```

**If user reports "action didn't work":**
```
The action might have failed silently. Check:
1. Is the button/element enabled (not grayed out)?
2. Did any error message appear?
3. Is there a loading indicator still active?
4. Try refreshing and repeating the action
```

**If user reports "cross-persona sync issue":**
```
Real-time sync can have delays. Try:
1. Wait 5-10 seconds after the originating action
2. Refresh the receiving persona's tab
3. Check if notifications are enabled in the app
4. Verify the originating action actually completed
```

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN 'C' is selected (indicating execution is complete) will you load, read entire file, then execute `{nextStepFile}` to begin results capture and memory feeding.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Clear execution guidance provided
- Troubleshooting assistance available
- User confirms execution complete
- Menu options handled correctly

### ❌ SYSTEM FAILURE:

- Attempting to execute the checklist yourself
- Proceeding without user confirmation
- Not providing troubleshooting when requested
- Marking checklist items without user doing the execution

**Master Rule:** You guide the execution, you don't perform it. The human or Claude via Chrome Extension executes; you provide support.
