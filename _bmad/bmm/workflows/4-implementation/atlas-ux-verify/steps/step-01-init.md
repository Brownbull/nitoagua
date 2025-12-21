# Step 1: Atlas UX Verification - Initialization

## Overview

Initialize Atlas UX Verification workflow and validate all required components exist.

---

## 1. CONTRACT VALIDATION

### 1.1 Atlas Memory Check

Load Atlas memory and validate required sections:

```
REQUIRED:
- 00-project-config.md → base_url, test_users
- 03-personas.md → at least one persona defined

RECOMMENDED:
- 05-testing.md → existing test patterns
```

**If Atlas memory missing required sections:**
```
❌ ATLAS CONTRACT INVALID

Missing required sections:
- [list missing sections]

Please run Atlas sync command first:
/bmad:agents:atlas → sync

Then retry this workflow.
```

### 1.2 UX Design Specification Check

Search for UX Design Specification in priority order:

1. `{output_folder}/ux-design-specification.md`
2. `{output_folder}/ux-design.md`
3. `{output_folder}/analysis/ux-*.md`

**If UX spec not found:**
```
❌ UX DESIGN SPECIFICATION NOT FOUND

Could not locate UX Design Specification.
Expected locations:
- {output_folder}/ux-design-specification.md
- {output_folder}/ux-design.md

Please create UX specification first:
/bmad:bmm:workflows:create-ux-design

Then retry this workflow.
```

### 1.3 Environment Check

Confirm execution environment:
```
✅ Environment Ready:
- Execution Mode: Chrome Extension
- Platform: Windows
- Claude: Active via Chrome Extension
```

---

## 2. CONTEXT ASSEMBLY

### 2.1 Load Project Config

From `00-project-config.md`:
- `base_url`: Production/staging URL
- `test_users`: Credentials for each persona
- `ux_output_path`: Output location (or default)

### 2.2 Load UX Design Specification

Parse the UX Design Specification for:
- **Design System**: Color palette, typography, spacing scale
- **Component Library**: Defined components and their specifications
- **Screen Layouts**: Page-by-page layout specifications
- **Responsive Breakpoints**: Mobile, tablet, desktop definitions
- **Accessibility Requirements**: WCAG level, specific requirements

### 2.3 Load Personas

From `03-personas.md`:
- Persona names and roles
- Primary interaction patterns
- Key screens per persona

---

## 3. VERIFICATION SCOPE SELECTION

Present verification scope options:

```
╔══════════════════════════════════════════════════════════════╗
║                  UX VERIFICATION SCOPE                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  What would you like to verify?                              ║
║                                                              ║
║  [1] Full Application - All screens and components           ║
║  [2] Single Screen - One specific screen in detail           ║
║  [3] Component Audit - Design system component usage         ║
║  [4] Responsive Check - Breakpoint behavior across screens   ║
║  [5] Accessibility Audit - WCAG compliance check             ║
║                                                              ║
║  Enter selection (1-5):                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Based on selection:**
- [1] → Proceed to screen inventory in Step 2
- [2] → Ask for specific screen, then Step 2
- [3] → Component-focused verification in Step 2
- [4] → Responsive-focused verification in Step 2
- [5] → Accessibility-focused verification in Step 2

---

## 4. SESSION STATE

Store session context:

```yaml
session:
  started: {timestamp}
  base_url: {from atlas memory}
  ux_spec_path: {discovered path}
  verification_scope: {user selection}
  output_path: {ux_output_path or default}

atlas_sections_loaded:
  - 00-project-config
  - 03-personas

ux_spec:
  design_system_found: true/false
  screens_defined: [list]
  components_defined: [list]
  breakpoints_defined: [list]
```

---

## 5. USER INTERACTION POINT

```
╔══════════════════════════════════════════════════════════════╗
║                INITIALIZATION COMPLETE                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ✅ Atlas Memory Loaded                                      ║
║  ✅ UX Specification Found: {ux_spec_path}                   ║
║  ✅ Verification Scope: {scope_description}                  ║
║  ✅ Output Path: {output_path}                               ║
║                                                              ║
║  Ready to proceed to screen/component mapping.               ║
║                                                              ║
║  [C] Continue to Step 2                                      ║
║  [R] Restart with different scope                            ║
║  [X] Exit workflow                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 6. NEXT STEP

On [C] selection:
- Load and execute `step-02-mapping.md`

On [R] selection:
- Return to Section 3 (Scope Selection)

On [X] selection:
- Exit workflow gracefully
