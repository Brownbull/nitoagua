# Step 3: Generate Verification Checklist

## Overview

Generate the human-readable verification checklist for Chrome Extension execution.

---

## 1. CHECKLIST STRUCTURE

### 1.1 File Header

```markdown
---
title: UX Verification - {scope_description}
generated: {timestamp}
base_url: {base_url}
ux_spec: {ux_spec_path}
status: pending
---

# UX Verification Checklist

**Scope:** {scope_description}
**Generated:** {date}
**Specification:** {ux_spec_path}

---

## Verification Legend

### Action Icons
- 👁️ Visual check
- 📐 Layout/alignment check
- 🎨 Design system token check
- 📱 Responsive check
- ♿ Accessibility check
- 🔄 State/interaction check
- 👆 Navigate to URL

### Severity
- 🔴 Critical deviation
- 🟠 Major deviation
- 🟡 Minor deviation
- 🟢 Matches specification

### Results
- ✅ Pass - Matches spec
- ⚠️ Note - Minor deviation
- ❌ Fail - Does not match
- ⏭️ Skip - Not applicable
```

---

## 2. GENERATE SCREEN SECTIONS

For each screen in verification matrix:

```markdown
---

## 📍 SCREEN: {screen_name}

**URL:** {base_url}{path}
**Persona:** {persona_badge} {persona_name}
**Breakpoint:** Desktop (default)

### Setup
- [ ] 👆 Navigate to `{full_url}`
- [ ] 👁️ Confirm page loads without errors

---

### Color Verification

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | 👁️ Primary button color | `{primary_color}` | _____  | ⬜ |
| 2 | 👁️ Background color | `{bg_color}` | _____ | ⬜ |
| 3 | 👁️ Text color | `{text_color}` | _____ | ⬜ |

---

### Typography Verification

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | 👁️ Heading font family | `{heading_font}` | _____ | ⬜ |
| 2 | 👁️ Heading font size | `{heading_size}` | _____ | ⬜ |
| 3 | 👁️ Body font family | `{body_font}` | _____ | ⬜ |
| 4 | 👁️ Body font size | `{body_size}` | _____ | ⬜ |

---

### Spacing & Layout Verification

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | 📐 Content max-width | `{max_width}` | _____ | ⬜ |
| 2 | 📐 Section spacing | `{spacing}` | _____ | ⬜ |
| 3 | 📐 Element alignment | `{alignment}` | _____ | ⬜ |

---

### Component Verification

| # | Check | Expected State | Actual | Result |
|---|-------|----------------|--------|--------|
| 1 | 🎨 Button uses correct variant | Primary/Secondary | _____ | ⬜ |
| 2 | 🎨 Card matches component spec | As defined | _____ | ⬜ |
| 3 | 🔄 Hover state on button | `{hover_spec}` | _____ | ⬜ |

---

### Responsive Checks (if applicable)

#### Mobile ({mobile_breakpoint})

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | 📱 Layout adapts to single column | Yes | _____ | ⬜ |
| 2 | 📱 Navigation collapses | Hamburger menu | _____ | ⬜ |
| 3 | 📱 Touch targets ≥ 44px | Yes | _____ | ⬜ |

---

### Accessibility Checks

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | ♿ Color contrast ratio | ≥ 4.5:1 | _____ | ⬜ |
| 2 | ♿ Focus indicator visible | Yes | _____ | ⬜ |
| 3 | ♿ Images have alt text | Yes | _____ | ⬜ |
| 4 | ♿ Form fields have labels | Yes | _____ | ⬜ |

---

### Screen Summary

| Category | Pass | Fail | Notes |
|----------|------|------|-------|
| Color | _/_ | _/_ | |
| Typography | _/_ | _/_ | |
| Layout | _/_ | _/_ | |
| Components | _/_ | _/_ | |
| Responsive | _/_ | _/_ | |
| Accessibility | _/_ | _/_ | |

**Screen Status:** ⬜ Pending / ✅ Pass / ❌ Issues Found

---
```

---

## 3. GENERATE SUMMARY SECTION

At end of checklist:

```markdown
---

## 📊 VERIFICATION SUMMARY

### Overall Results

| Screen | Pass | Fail | Skip | Status |
|--------|------|------|------|--------|
| {screen_1} | _/_ | _/_ | _/_ | ⬜ |
| {screen_2} | _/_ | _/_ | _/_ | ⬜ |
| ... | ... | ... | ... | ... |
| **TOTAL** | _/_ | _/_ | _/_ | ⬜ |

### Category Summary

| Category | Pass | Fail | Rate |
|----------|------|------|------|
| Color | _/_ | _/_ | __% |
| Typography | _/_ | _/_ | __% |
| Layout | _/_ | _/_ | __% |
| Components | _/_ | _/_ | __% |
| Responsive | _/_ | _/_ | __% |
| Accessibility | _/_ | _/_ | __% |

### Critical Issues

| # | Screen | Category | Issue |
|---|--------|----------|-------|
| | | | |

### Notes

_Space for verification notes and observations_

---

**Verification Completed:** {date}
**Verified By:** {user_name}
**Overall Status:** ⬜ Pending
```

---

## 4. SAVE CHECKLIST

### 4.1 Determine Output Path

```
Output: {ux_output_path}/{scope_key}-ux-verification.md

Default: docs/testing/ux-checklists/{scope_key}-ux-verification.md
```

### 4.2 Write File

Save generated checklist to output path.

---

## 5. USER CONFIRMATION

```
╔══════════════════════════════════════════════════════════════╗
║              CHECKLIST GENERATED SUCCESSFULLY                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ✅ Checklist Created                                        ║
║                                                              ║
║  Location: {output_path}                                     ║
║  Screens: {N}                                                ║
║  Total Checks: {M}                                           ║
║                                                              ║
║  Categories:                                                 ║
║  - Color: {count} checks                                     ║
║  - Typography: {count} checks                                ║
║  - Layout: {count} checks                                    ║
║  - Components: {count} checks                                ║
║  - Responsive: {count} checks                                ║
║  - Accessibility: {count} checks                             ║
║                                                              ║
║  [C] Continue to execution                                   ║
║  [V] View generated checklist                                ║
║  [R] Regenerate with changes                                 ║
║  [X] Exit (save checklist for later)                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 6. NEXT STEP

On [C] selection:
- Load and execute `step-04-execute.md`

On [V] selection:
- Display checklist contents
- Return to Section 5

On [R] selection:
- Return to Step 2 for scope adjustment

On [X] selection:
- Confirm checklist is saved
- Exit workflow gracefully
