---
name: 'step-07-complete'
description: 'Capture results, feed Atlas memory, and complete workflow'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/4-implementation/atlas-e2e'

# File References
thisStepFile: '{workflow_path}/steps/step-07-complete.md'
workflowFile: '{workflow_path}/workflow.md'

# Atlas References
atlas_memory: '{project-root}/_bmad/agents/atlas/atlas-memory.md'
---

# Step 7: Complete and Feed Memory

## STEP GOAL:

To capture test results, analyze patterns, feed learnings back to Atlas memory, and complete the E2E testing workflow.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 This is the FINAL step - complete the workflow properly

### Role Reinforcement:

- ✅ You are Atlas, capturing learnings for future reference
- ✅ You analyze results to extract patterns
- ✅ You update your memory with new insights

### Step-Specific Rules:

- 🎯 Focus on results capture and memory update
- 🚫 FORBIDDEN to modify test results
- 💬 Collaborate on insights extraction
- 📋 Complete the workflow cleanly

## EXECUTION PROTOCOLS:

- 🎯 Capture final test results
- 📖 Analyze for patterns and insights
- 💾 Update Atlas memory Section 5
- 🏁 Complete workflow with summary

## CONTEXT BOUNDARIES:

- Checklist executed from Step 6
- Results are in the checklist file
- This step extracts and records learnings
- Workflow ends after this step

---

## Sequence of Instructions

### 1. Read Executed Checklist

**Action:** Load the executed checklist file to capture results.

**Extract:**
- Total steps executed
- Passed count
- Failed count
- Skipped count
- Failure details
- Notes and observations

### 2. Calculate Results Summary

```
**📊 Test Execution Results**

**Story:** {{story_key}} - {{story_title}}
**Executed:** {{execution_date}}

---

### Results Summary

| Metric | Value |
|--------|-------|
| Total Steps | {{total_steps}} |
| ✅ Passed | {{passed_count}} |
| ❌ Failed | {{failed_count}} |
| ⏭️ Skipped | {{skipped_count}} |
| **Pass Rate** | {{pass_rate}}% |

---

### Overall Status

{{#if all_passed}}
✅ **PASSED** - All test scenarios passed successfully
{{else if critical_failures}}
❌ **FAILED** - Critical scenarios failed, requires fixes
{{else}}
⚠️ **PASSED WITH ISSUES** - Non-critical issues noted
{{/if}}

---

### Failures Detected

{{#if failures}}
{{#each failures}}
| **{{step}}** | {{description}} |
|--------------|-----------------|
| Expected | {{expected}} |
| Actual | {{actual}} |
| Impact | {{impact}} |

{{/each}}
{{else}}
No failures detected.
{{/if}}
```

### 3. Extract Patterns and Insights

**Analyze the test execution for learnings:**

```
**🧠 Patterns & Insights**

### Testing Patterns Observed

{{#each patterns}}
- **{{pattern_name}}:** {{pattern_description}}
{{/each}}

### Edge Cases Discovered

{{#each edge_cases}}
- {{edge_case_description}}
{{/each}}

### Potential Improvements

{{#each improvements}}
- {{improvement_suggestion}}
{{/each}}

### Timing Observations

- Average step duration: {{avg_duration}}
- Slowest operations: {{slow_operations}}
- Sync wait times needed: {{sync_waits}}
```

### 4. Prepare Atlas Memory Nugget

**Create memory nugget for Section 5 (Testing):**

```markdown
### E2E Test Record: {{story_key}}

**Date:** {{execution_date}}
**Story:** {{story_key}} - {{story_title}}
**Pass Rate:** {{pass_rate}}%

**Coverage:**
{{#each acceptance_criteria}}
- {{ac_id}}: {{status}}
{{/each}}

**Personas Tested:**
{{#each personas}}
- {{persona_name}}: {{scenario_count}} scenarios
{{/each}}

**Patterns Established:**
{{#each new_patterns}}
- {{pattern}}
{{/each}}

**Issues Found:**
{{#each issues}}
- {{issue}}
{{/each}}

**Checklist:** {{checklist_path}}
```

### 5. Request Memory Update Approval

```
**📝 Atlas Memory Update**

The following will be added to Atlas memory Section 5 (Testing Patterns):

---
{{memory_nugget}}
---

This helps future E2E tests by:
- Recording what was tested
- Capturing successful patterns
- Noting issues to watch for
- Building test coverage history
```

**Ask:** Update Atlas memory with this testing record? [Y/N]

### 6. Update Atlas Memory (if approved)

**If Y:**
- Append nugget to Atlas memory Section 5
- Update last_updated timestamp
- Confirm update

**If N:**
- Skip memory update
- Note that patterns were not recorded

### 7. Git Commit Reminder

```
### 📤 Commit Test Results

The checklist file has been updated with results.

**Commit the results:**

```bash
cd {{project_root}}
git add {{e2e_output_path}}/{{story_key}}.md
git commit -m "test(e2e): {{story_key}} - {{pass_rate}}% passed"
git push origin {{current_branch}}
```

**Note for WSL users:** These results are in the Windows clone.
Pull to WSL after pushing: `git pull origin {{current_branch}}`
```

### 8. Display Workflow Completion

```
**✅ Atlas E2E Workflow Complete**

---

### Summary

| Item | Status |
|------|--------|
| Story | {{story_key}} |
| Test Scenarios | {{scenario_count}} |
| Pass Rate | {{pass_rate}}% |
| Memory Updated | {{memory_status}} |
| Results Committed | Pending (see commands above) |

---

### Artifacts Created

- **Checklist:** {{checklist_path}}
- **Memory Nugget:** {{#if memory_updated}}Added to Section 5{{else}}Not saved{{/if}}

---

### Next Steps

1. **If failures found:**
   - Review failures with development team
   - Fix issues and re-run failed scenarios
   - Use `/bmad:bmm:workflows:correct-course` if scope changes

2. **If all passed:**
   - Story ready for code review
   - Run `/bmad:bmm:workflows:atlas-code-review`

3. **For regression testing:**
   - Save checklist for future use
   - Run periodically on staging/production

---

### Related Commands

- **New E2E test:** `/bmad:bmm:workflows:atlas-e2e`
- **Code review:** `/bmad:bmm:workflows:atlas-code-review`
- **Deploy story:** `/bmad:bmm:workflows:deploy-story`

---

*Atlas E2E Testing Workflow Complete*
*Thank you for testing thoroughly! 🧪*
```

---

## CRITICAL STEP COMPLETION NOTE

This is the FINAL step. After displaying the completion summary, the workflow ends.

No next step to load - workflow is complete.

---

## SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Results accurately captured from checklist
- Patterns and insights extracted
- Memory update offered (and applied if accepted)
- Git commit instructions provided
- Workflow completed with clear summary

### ❌ SYSTEM FAILURE:

- Modifying or fabricating test results
- Skipping memory update offer
- Not providing commit instructions
- Incomplete workflow summary

**Master Rule:** Accurate results capture is critical. Never modify, invent, or estimate test results - only record what was actually tested.
