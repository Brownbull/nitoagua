---
title: UX Verification - {scope_description}
generated: {timestamp}
base_url: {base_url}
ux_spec: {ux_spec_path}
status: pending
verified_by: {user_name}
---

# UX Verification Checklist

**Scope:** {scope_description}
**Generated:** {date}
**Base URL:** {base_url}
**Specification:** {ux_spec_path}

---

## Verification Legend

### Action Icons
| Icon | Meaning |
|------|---------|
| 👁️ | Visual check (color, typography, spacing) |
| 📐 | Layout check (alignment, grid, responsive) |
| 🎨 | Design system check (component usage, tokens) |
| 📱 | Responsive check (breakpoint behavior) |
| ♿ | Accessibility check (contrast, labels, ARIA) |
| 🔄 | Interaction check (hover, focus, transitions) |
| 👆 | Navigate to URL |

### Severity Levels
| Level | Meaning |
|-------|---------|
| 🔴 | Critical - Fundamentally wrong, blocks release |
| 🟠 | Major - Noticeable deviation, should fix |
| 🟡 | Minor - Small deviation, nice to fix |
| 🟢 | Pass - Matches specification |

### Result Markers
| Marker | Meaning |
|--------|---------|
| ✅ | Pass - Matches specification |
| ⚠️ | Note - Minor deviation (documented) |
| ❌ | Fail - Does not match specification |
| ⏭️ | Skip - Not applicable |

### Persona Badges
| Badge | Persona |
|-------|---------|
| 🔵 | Consumer |
| 🟢 | Provider |
| 🟠 | Admin |

---

## Design System Reference

### Color Palette

| Token | Hex | Preview | Usage |
|-------|-----|---------|-------|
| primary | {primary_hex} | 🟦 | Main brand color |
| secondary | {secondary_hex} | ⬜ | Accent color |
| background | {bg_hex} | ⬜ | Page background |
| text | {text_hex} | ⬛ | Body text |

### Typography

| Style | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| h1 | {font} | {size} | {weight} | {lh} |
| h2 | {font} | {size} | {weight} | {lh} |
| body | {font} | {size} | {weight} | {lh} |
| caption | {font} | {size} | {weight} | {lh} |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal gaps |
| sm | 8px | Small spacing |
| md | 16px | Default spacing |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |

---

## Screens

<!-- REPEAT FOR EACH SCREEN -->

---

## 📍 SCREEN: {screen_name}

**URL:** {full_url}
**Persona:** {persona_badge} {persona_name}
**Breakpoint:** Desktop

### Setup

- [ ] 👆 Navigate to `{full_url}`
- [ ] 👁️ Confirm page loads without errors

---

### Color Verification

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | 👁️ Primary button color | `{expected}` | _____ | 🟡 | ⬜ |
| 2 | 👁️ Background color | `{expected}` | _____ | 🟡 | ⬜ |
| 3 | 👁️ Text color | `{expected}` | _____ | 🟡 | ⬜ |

---

### Typography Verification

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | 👁️ Heading font | `{expected}` | _____ | 🟠 | ⬜ |
| 2 | 👁️ Heading size | `{expected}` | _____ | 🟡 | ⬜ |
| 3 | 👁️ Body font | `{expected}` | _____ | 🟠 | ⬜ |
| 4 | 👁️ Body size | `{expected}` | _____ | 🟡 | ⬜ |

---

### Spacing & Layout Verification

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | 📐 Content max-width | `{expected}` | _____ | 🟡 | ⬜ |
| 2 | 📐 Section spacing | `{expected}` | _____ | 🟡 | ⬜ |
| 3 | 📐 Content alignment | `{expected}` | _____ | 🟠 | ⬜ |

---

### Component Verification

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | 🎨 Button variant | {expected} | _____ | 🟠 | ⬜ |
| 2 | 🎨 Card styling | {expected} | _____ | 🟠 | ⬜ |
| 3 | 🔄 Hover state | {expected} | _____ | 🟡 | ⬜ |

---

### Responsive Checks

#### Mobile (< 640px)

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | 📱 Single column layout | Yes | _____ | 🔴 | ⬜ |
| 2 | 📱 Navigation collapsed | Yes | _____ | 🔴 | ⬜ |
| 3 | 📱 Touch targets ≥ 44px | Yes | _____ | 🟠 | ⬜ |

---

### Accessibility Checks

| # | Check | Expected | Actual | Severity | Result |
|---|-------|----------|--------|----------|--------|
| 1 | ♿ Color contrast | ≥ 4.5:1 | _____ | 🔴 | ⬜ |
| 2 | ♿ Focus visible | Yes | _____ | 🔴 | ⬜ |
| 3 | ♿ Alt text on images | Yes | _____ | 🟠 | ⬜ |
| 4 | ♿ Form labels | Yes | _____ | 🟠 | ⬜ |

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

**Screen Status:** ⬜ Pending

---

<!-- END SCREEN REPEAT -->

---

## 📊 VERIFICATION SUMMARY

### Overall Results

| Metric | Value |
|--------|-------|
| Total Screens | __ |
| Total Checks | __ |
| Pass Rate | __% |
| Status | ⬜ Pending |

### Results by Screen

| Screen | Pass | Fail | Skip | Status |
|--------|------|------|------|--------|
| | _/_ | _/_ | _/_ | ⬜ |
| | _/_ | _/_ | _/_ | ⬜ |
| **TOTAL** | _/_ | _/_ | _/_ | ⬜ |

### Results by Category

| Category | Pass | Fail | Rate |
|----------|------|------|------|
| Color | _/_ | _/_ | __% |
| Typography | _/_ | _/_ | __% |
| Layout | _/_ | _/_ | __% |
| Components | _/_ | _/_ | __% |
| Responsive | _/_ | _/_ | __% |
| Accessibility | _/_ | _/_ | __% |

### Issues Found

#### 🔴 Critical Issues
_None_

#### 🟠 Major Deviations
_None_

#### 🟡 Minor Notes
_None_

---

### Notes

_Space for verification notes and observations_

---

**Verification Completed:** _____
**Verified By:** {user_name}
**Overall Status:** ⬜ Pending
