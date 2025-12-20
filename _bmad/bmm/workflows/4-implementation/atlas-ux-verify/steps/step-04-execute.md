# Step 4: Execute Verification

## Overview

Guide the user through executing the UX verification checklist via Chrome Extension.

---

## 1. EXECUTION PREPARATION

### 1.1 Environment Reminder

```
╔══════════════════════════════════════════════════════════════╗
║              CHROME EXTENSION EXECUTION MODE                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  This verification will be performed manually via Chrome     ║
║  Extension. Atlas will guide you through each check.         ║
║                                                              ║
║  Requirements:                                               ║
║  ✅ Chrome browser open                                      ║
║  ✅ Claude Chrome Extension active                           ║
║  ✅ Developer tools available (for inspecting values)        ║
║  ✅ Target application accessible: {base_url}                ║
║                                                              ║
║  Tools Needed:                                               ║
║  - Browser DevTools (F12) for inspecting CSS values          ║
║  - Browser zoom/resize for responsive testing                ║
║  - Accessibility inspector (optional)                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 1.2 Login Preparation

If test users required:

```
╔══════════════════════════════════════════════════════════════╗
║                    TEST USER CREDENTIALS                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Available test users (from Atlas memory):                   ║
║                                                              ║
║  🔵 Consumer:                                                ║
║     Email: {consumer_email}                                  ║
║     Password: {consumer_password}                            ║
║                                                              ║
║  🟢 Provider:                                                ║
║     Email: {provider_email}                                  ║
║     Password: {provider_password}                            ║
║                                                              ║
║  🟠 Admin:                                                   ║
║     Email: {admin_email}                                     ║
║     Password: {admin_password}                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 2. SCREEN-BY-SCREEN EXECUTION

For each screen in the checklist:

### 2.1 Screen Introduction

```
╔══════════════════════════════════════════════════════════════╗
║  📍 VERIFYING: {screen_name}                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  URL: {full_url}                                             ║
║  Persona: {persona_badge} {persona_name}                     ║
║  Checks: {count} items                                       ║
║                                                              ║
║  Please navigate to this URL in your browser.                ║
║                                                              ║
║  Ready? [C] Continue  [S] Skip screen  [X] Exit              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.2 Category Execution

For each verification category:

```
---
### Verifying: {category_name}

I'll guide you through {count} checks. For each:
1. I'll describe what to look for
2. You inspect the actual value
3. You report if it matches

Ready to begin? [C]ontinue

---

**Check 1 of {N}:** {check_description}

Expected: `{expected_value}`

👉 How to verify:
{verification_instructions}

What did you find?
- [P] Pass - Matches specification
- [N] Note - Minor deviation (describe)
- [F] Fail - Does not match
- [S] Skip - Not applicable

Your response:
```

### 2.3 Recording Results

After each check, update the checklist:

```
Recording result for Check {N}:
- Expected: {expected}
- Actual: {user_reported}
- Result: {P/N/F/S}
- Notes: {any_notes}
```

### 2.4 Screen Completion

After all checks for a screen:

```
╔══════════════════════════════════════════════════════════════╗
║           SCREEN VERIFICATION COMPLETE                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Screen: {screen_name}                                       ║
║                                                              ║
║  Results:                                                    ║
║  ✅ Pass: {pass_count}                                       ║
║  ⚠️ Notes: {note_count}                                      ║
║  ❌ Fail: {fail_count}                                       ║
║  ⏭️ Skip: {skip_count}                                       ║
║                                                              ║
║  Screen Status: {PASS/ISSUES_FOUND}                          ║
║                                                              ║
║  [C] Continue to next screen                                 ║
║  [R] Review this screen again                                ║
║  [X] Exit (save progress)                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 3. RESPONSIVE VERIFICATION (IF APPLICABLE)

### 3.1 Breakpoint Instructions

```
╔══════════════════════════════════════════════════════════════╗
║              RESPONSIVE VERIFICATION                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Now testing at {breakpoint_name} ({breakpoint_width})       ║
║                                                              ║
║  To set viewport width:                                      ║
║  1. Open DevTools (F12)                                      ║
║  2. Click device toggle (Ctrl+Shift+M)                       ║
║  3. Set width to {breakpoint_width}                          ║
║                                                              ║
║  OR resize browser window to approximately {breakpoint_width}║
║                                                              ║
║  Ready? [C]ontinue                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 4. ACCESSIBILITY VERIFICATION (IF APPLICABLE)

### 4.1 Accessibility Instructions

```
╔══════════════════════════════════════════════════════════════╗
║             ACCESSIBILITY VERIFICATION                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Accessibility checks require:                               ║
║                                                              ║
║  Color Contrast:                                             ║
║  - Use DevTools > Lighthouse > Accessibility                 ║
║  - Or browser extension like "WAVE" or "axe"                 ║
║                                                              ║
║  Keyboard Navigation:                                        ║
║  - Tab through all interactive elements                      ║
║  - Check focus indicators are visible                        ║
║                                                              ║
║  Screen Reader:                                              ║
║  - Optional: Use NVDA/VoiceOver to verify                    ║
║                                                              ║
║  Ready? [C]ontinue                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 5. TROUBLESHOOTING ASSISTANCE

### 5.1 Inspecting CSS Values

```
To inspect actual CSS values:

1. Right-click the element → Inspect
2. In DevTools, look at "Styles" panel
3. Find the property (e.g., `color`, `font-size`)
4. The computed value shows actual rendered value

Example:
- Element: Button
- Property: background-color
- Computed: rgb(59, 130, 246) → #3b82f6
```

### 5.2 Common Issues

```
If you encounter issues:

❓ Page won't load:
   - Check base_url is correct
   - Verify you're logged in (if required)

❓ Can't find element:
   - Element may be off-screen
   - Try scrolling or zooming out
   - Check if element is conditionally rendered

❓ Values don't match exactly:
   - Browser may compute slightly different values
   - RGB vs HEX notation is equivalent
   - Font rendering varies by platform
```

---

## 6. PROGRESS TRACKING

### 6.1 Update Checklist File

After each screen, update the saved checklist with results.

### 6.2 Progress Summary

```
╔══════════════════════════════════════════════════════════════╗
║                  VERIFICATION PROGRESS                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Completed: {completed}/{total} screens                      ║
║                                                              ║
║  ✅ {screen_1}: PASS                                         ║
║  ❌ {screen_2}: 3 issues                                     ║
║  ⬜ {screen_3}: Pending                                      ║
║  ⬜ {screen_4}: Pending                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 7. NEXT STEP

When all screens verified:
- Load and execute `step-05-complete.md`

On [X] at any point:
- Save current progress to checklist file
- Note resume point
- Exit gracefully
