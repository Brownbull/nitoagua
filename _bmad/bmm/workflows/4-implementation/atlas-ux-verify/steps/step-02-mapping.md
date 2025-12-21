# Step 2: Screen and Component Mapping

## Overview

Map UX specification elements to verification checkpoints based on selected scope.

---

## 1. PARSE UX SPECIFICATION

### 1.1 Extract Design System

From UX Design Specification, extract:

**Color Palette:**
```
| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| primary | #XXXXXX | Main brand color |
| secondary | #XXXXXX | Accent color |
| ... | ... | ... |
```

**Typography:**
```
| Style | Font Family | Size | Weight | Line Height |
|-------|-------------|------|--------|-------------|
| h1 | ... | ... | ... | ... |
| body | ... | ... | ... | ... |
```

**Spacing Scale:**
```
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal gaps |
| sm | 8px | Small spacing |
| ... | ... | ... |
```

### 1.2 Extract Screen Definitions

From UX Design Specification, identify:
- Screen name
- Primary persona(s)
- Layout description
- Key components used
- Responsive behavior

### 1.3 Extract Component Specifications

From UX Design Specification, identify:
- Component name
- Visual specifications
- States (default, hover, focus, disabled)
- Accessibility requirements

---

## 2. SCOPE-BASED MAPPING

### 2.1 Full Application (Scope 1)

Generate inventory of ALL screens:

```
╔══════════════════════════════════════════════════════════════╗
║                    SCREEN INVENTORY                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Discovered {N} screens in UX Specification:                 ║
║                                                              ║
║  🔵 Consumer Screens:                                        ║
║     [ ] Home / Landing                                       ║
║     [ ] Request Form                                         ║
║     [ ] Request Status                                       ║
║     ...                                                      ║
║                                                              ║
║  🟢 Provider Screens:                                        ║
║     [ ] Dashboard                                            ║
║     [ ] Request Details                                      ║
║     ...                                                      ║
║                                                              ║
║  🟠 Admin Screens:                                           ║
║     [ ] Admin Dashboard                                      ║
║     ...                                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.2 Single Screen (Scope 2)

Focus on selected screen:

```
╔══════════════════════════════════════════════════════════════╗
║              SINGLE SCREEN VERIFICATION                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Selected Screen: {screen_name}                              ║
║  Persona: {primary_persona}                                  ║
║  URL Path: {url_path}                                        ║
║                                                              ║
║  Verification Areas:                                         ║
║  ✅ Layout and Structure                                     ║
║  ✅ Color Usage                                              ║
║  ✅ Typography                                               ║
║  ✅ Spacing and Alignment                                    ║
║  ✅ Component Rendering                                      ║
║  ✅ Responsive Behavior                                      ║
║  ✅ Accessibility                                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.3 Component Audit (Scope 3)

Inventory all components:

```
╔══════════════════════════════════════════════════════════════╗
║                  COMPONENT INVENTORY                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Design System Components ({N} total):                       ║
║                                                              ║
║  Buttons:                                                    ║
║     [ ] Primary Button                                       ║
║     [ ] Secondary Button                                     ║
║     [ ] Ghost Button                                         ║
║                                                              ║
║  Forms:                                                      ║
║     [ ] Input Field                                          ║
║     [ ] Select Dropdown                                      ║
║     [ ] Checkbox                                             ║
║                                                              ║
║  Cards:                                                      ║
║     [ ] Info Card                                            ║
║     [ ] Action Card                                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.4 Responsive Check (Scope 4)

Focus on breakpoint behavior:

```
╔══════════════════════════════════════════════════════════════╗
║                RESPONSIVE VERIFICATION                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Defined Breakpoints:                                        ║
║  - Mobile: < 640px                                           ║
║  - Tablet: 640px - 1024px                                    ║
║  - Desktop: > 1024px                                         ║
║                                                              ║
║  Screens to verify at each breakpoint:                       ║
║  {list of screens with responsive specifications}            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.5 Accessibility Audit (Scope 5)

Focus on WCAG compliance:

```
╔══════════════════════════════════════════════════════════════╗
║               ACCESSIBILITY VERIFICATION                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Target WCAG Level: {AA/AAA}                                 ║
║                                                              ║
║  Verification Areas:                                         ║
║  [ ] Color Contrast (4.5:1 for text)                         ║
║  [ ] Keyboard Navigation                                     ║
║  [ ] Focus Indicators                                        ║
║  [ ] ARIA Labels                                             ║
║  [ ] Alt Text                                                ║
║  [ ] Form Labels                                             ║
║  [ ] Heading Hierarchy                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 3. GENERATE VERIFICATION MATRIX

Create mapping of what to verify where:

```yaml
verification_matrix:
  - screen: "Home"
    url: "/consumer"
    checks:
      - category: "COLOR"
        items:
          - "Primary CTA button uses primary color"
          - "Background matches specification"
      - category: "TYPOGRAPHY"
        items:
          - "Heading uses correct font family"
          - "Body text size matches spec"
      - category: "LAYOUT"
        items:
          - "Content is centered"
          - "Spacing between sections"
```

---

## 4. USER REVIEW

```
╔══════════════════════════════════════════════════════════════╗
║               VERIFICATION MAPPING COMPLETE                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Generated verification checkpoints:                         ║
║                                                              ║
║  Screens: {N}                                                ║
║  Total Checkpoints: {M}                                      ║
║  Estimated Time: {X} minutes                                 ║
║                                                              ║
║  Categories breakdown:                                       ║
║  - Color: {count}                                            ║
║  - Typography: {count}                                       ║
║  - Layout: {count}                                           ║
║  - Components: {count}                                       ║
║  - Responsive: {count}                                       ║
║  - Accessibility: {count}                                    ║
║                                                              ║
║  [C] Continue to generate checklist                          ║
║  [E] Edit scope (add/remove items)                           ║
║  [X] Exit workflow                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 5. NEXT STEP

On [C] selection:
- Load and execute `step-03-generate.md`

On [E] selection:
- Allow user to modify verification matrix
- Return to Section 4 after edits

On [X] selection:
- Exit workflow gracefully
