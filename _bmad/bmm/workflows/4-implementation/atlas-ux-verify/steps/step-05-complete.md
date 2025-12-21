# Step 5: Complete Verification

## Overview

Finalize verification results, generate summary report, and feed learnings to Atlas memory.

---

## 1. COMPILE FINAL RESULTS

### 1.1 Aggregate Screen Results

Calculate overall statistics:

```yaml
verification_results:
  total_screens: {N}
  total_checks: {M}

  by_result:
    pass: {count}
    note: {count}
    fail: {count}
    skip: {count}

  by_category:
    color:
      pass: {n}
      fail: {n}
    typography:
      pass: {n}
      fail: {n}
    layout:
      pass: {n}
      fail: {n}
    components:
      pass: {n}
      fail: {n}
    responsive:
      pass: {n}
      fail: {n}
    accessibility:
      pass: {n}
      fail: {n}

  pass_rate: {percentage}%

  critical_issues: [list]
  minor_deviations: [list]
```

---

## 2. GENERATE SUMMARY REPORT

### 2.1 Update Checklist Summary Section

```markdown
---

## 📊 VERIFICATION SUMMARY

### Overall Results

| Metric | Value |
|--------|-------|
| Total Screens | {N} |
| Total Checks | {M} |
| Pass Rate | {pass_rate}% |
| Status | {PASS / ISSUES FOUND} |

### Results by Screen

| Screen | Pass | Fail | Skip | Status |
|--------|------|------|------|--------|
| {screen_1} | {n} | {n} | {n} | {status} |
| {screen_2} | {n} | {n} | {n} | {status} |
| ... | ... | ... | ... | ... |

### Results by Category

| Category | Pass | Fail | Rate |
|----------|------|------|------|
| Color | {n} | {n} | {n}% |
| Typography | {n} | {n} | {n}% |
| Layout | {n} | {n} | {n}% |
| Components | {n} | {n} | {n}% |
| Responsive | {n} | {n} | {n}% |
| Accessibility | {n} | {n} | {n}% |

### Issues Found

#### 🔴 Critical Issues
{list critical issues with screen and details}

#### 🟠 Major Deviations
{list major deviations}

#### 🟡 Minor Notes
{list minor notes}

---

**Verification Completed:** {timestamp}
**Verified By:** {user_name}
**Overall Status:** {PASS / {n} ISSUES FOUND}
```

---

## 3. DISPLAY FINAL SUMMARY

```
╔══════════════════════════════════════════════════════════════╗
║            UX VERIFICATION COMPLETE                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📊 Final Results                                            ║
║                                                              ║
║  Screens Verified: {N}                                       ║
║  Total Checks: {M}                                           ║
║  Pass Rate: {pass_rate}%                                     ║
║                                                              ║
║  ✅ Passed: {pass_count}                                     ║
║  ⚠️ Notes: {note_count}                                      ║
║  ❌ Failed: {fail_count}                                     ║
║  ⏭️ Skipped: {skip_count}                                    ║
║                                                              ║
║  Overall Status: {PASS / ISSUES FOUND}                       ║
║                                                              ║
║  Checklist saved: {output_path}                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 4. ATLAS MEMORY FEEDING

### 4.1 Update Testing Patterns (05-testing.md)

If new patterns discovered:

```yaml
ux_verification_learnings:
  date: {timestamp}
  scope: {scope_description}

  patterns_confirmed:
    - "Button colors consistent across application"
    - "Typography scale properly applied"

  issues_to_track:
    - category: "responsive"
      issue: "Mobile navigation needs adjustment"
      screens: ["Home", "Dashboard"]

  coverage_gaps:
    - "Admin screens not yet verified"
```

### 4.2 Feed to Atlas

```
╔══════════════════════════════════════════════════════════════╗
║              ATLAS MEMORY UPDATE                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Feeding verification learnings to Atlas memory...           ║
║                                                              ║
║  Updates to 05-testing.md:                                   ║
║  - UX verification coverage: {scope}                         ║
║  - Patterns confirmed: {count}                               ║
║  - Issues logged: {count}                                    ║
║                                                              ║
║  ✅ Atlas memory updated                                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 5. GIT COMMIT

### 5.1 Stage and Commit Results

```
╔══════════════════════════════════════════════════════════════╗
║                  GIT COMMIT                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Commit verification results?                                ║
║                                                              ║
║  Files to commit:                                            ║
║  - {ux_output_path}/{checklist_file}                         ║
║  - {atlas_sidecar}/knowledge/05-testing.md (if updated)      ║
║                                                              ║
║  Proposed commit message:                                    ║
║  ux(verify): {scope_key} - {pass_rate}% matches spec         ║
║                                                              ║
║  [C] Commit now                                              ║
║  [E] Edit commit message                                     ║
║  [S] Skip commit (keep files staged)                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 5.2 Execute Commit

If user selects [C]:

```bash
git add {ux_output_path}/
git add {atlas_sidecar}/knowledge/05-testing.md
git commit -m "ux(verify): {scope_key} - {pass_rate}% matches spec

Verified {N} screens, {M} checks.
- Color: {n}% pass
- Typography: {n}% pass
- Layout: {n}% pass
- Components: {n}% pass
- Responsive: {n}% pass
- Accessibility: {n}% pass

Issues: {issue_count}

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

git push origin {current_branch}
```

---

## 6. NEXT ACTIONS

### 6.1 Issue Follow-up

If issues were found:

```
╔══════════════════════════════════════════════════════════════╗
║              RECOMMENDED NEXT ACTIONS                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Issues were found during verification.                      ║
║                                                              ║
║  Recommended actions:                                        ║
║                                                              ║
║  1. Create story for critical issues:                        ║
║     /bmad:bmm:workflows:create-story                         ║
║     "Fix UX issues: {issue_summary}"                         ║
║                                                              ║
║  2. Update UX specification if intentional:                  ║
║     {ux_spec_path}                                           ║
║                                                              ║
║  3. Re-run verification after fixes:                         ║
║     /bmad:bmm:workflows:atlas-ux-verify                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 6.2 Full Pass

If all checks passed:

```
╔══════════════════════════════════════════════════════════════╗
║                 🎉 VERIFICATION PASSED!                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  All UX checks passed for {scope_description}.               ║
║                                                              ║
║  The implementation matches the UX Design Specification.     ║
║                                                              ║
║  Checklist archived at:                                      ║
║  {output_path}                                               ║
║                                                              ║
║  This verification is now part of project history.           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 7. WORKFLOW COMPLETE

```
╔══════════════════════════════════════════════════════════════╗
║           ATLAS UX VERIFICATION - WORKFLOW COMPLETE          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Session Summary:                                            ║
║  - Scope: {scope_description}                                ║
║  - Screens: {N}                                              ║
║  - Checks: {M}                                               ║
║  - Pass Rate: {pass_rate}%                                   ║
║  - Status: {COMPLETE}                                        ║
║                                                              ║
║  Artifacts:                                                  ║
║  - Checklist: {output_path}                                  ║
║  - Atlas updated: 05-testing.md                              ║
║  - Git commit: {commit_hash}                                 ║
║                                                              ║
║  Thank you for using Atlas UX Verification!                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## WORKFLOW END
