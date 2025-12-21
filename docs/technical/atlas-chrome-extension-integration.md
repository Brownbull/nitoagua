# Atlas Chrome Extension Integration Specification

**Date:** 2025-12-20
**Author:** Claude Opus 4.5
**Status:** Draft

## Overview

This document specifies the integration of the Claude Chrome Extension with two Atlas commands:

1. **atlas-e2e** (Enhanced) - Cross-persona end-to-end workflow testing
2. **atlas-ux-verify** (New) - Visual mockup validation

Both commands leverage Claude's ability to control a Chrome browser via the Claude Chrome Extension for human-like testing and verification.

---

## 1. Atlas E2E Command Enhancement

### Current State

The existing `atlas-e2e` command generates Playwright tests based on:
- Persona analysis from Atlas memory
- Workflow chain testing
- Acceptance criteria mapping

### Enhanced Capabilities

Add a new mode: **Chrome Extension Mode** for complex cross-persona scenarios.

#### Use Cases

| Scenario | Playwright | Chrome Extension |
|----------|------------|------------------|
| Single-persona tests | ✅ Best choice | ❌ Overkill |
| Cross-persona (2 users) | ✅ Multiple contexts | ⚠️ Possible |
| Cross-persona (3+ users) | ⚠️ Complex | ✅ Better UX |
| Realtime validation | ⚠️ Timing issues | ✅ Human verification |
| Race condition tests | ✅ Precise timing | ❌ Not suitable |
| Exploratory testing | ❌ Script-based | ✅ Excellent |

#### Workflow Integration

```
atlas-e2e [story-key] [--mode=playwright|chrome-extension]

--mode=playwright (default)
  → Generates Playwright test files
  → Executes automated tests
  → Reports pass/fail

--mode=chrome-extension
  → Generates human-readable test checklist
  → Provides step-by-step instructions for manual execution
  → Claude walks through the flow via Chrome
  → Reports observations and issues found
```

#### Example: Epic 11-4 Cross-Persona Test

**Checklist Format for Chrome Extension:**

```markdown
## Cross-Persona Integration Test: Request → Offer → Delivery Cycle

### Prerequisites
- [ ] Open Chrome browser with Claude extension active
- [ ] Have access to test accounts: consumer@test.com, provider@test.com, admin@nitoagua.cl

### Step 1: Consumer Submits Request
**Persona:** Doña María (Consumer)
**Browser Tab:** Tab 1

1. Navigate to https://nitoagua.vercel.app/
2. Click "Pedir Agua Ahora" button
3. Fill form:
   - Dirección: "Villarrica 123"
   - Comuna: Select "Villarrica"
   - Cantidad: "5000" litros
4. Click "Revisar Pedido"
5. Click "Confirmar Pedido"
6. **CAPTURE:** Note the request ID and tracking token
7. **VERIFY:** Confirmation screen shows "Pedido Enviado"

### Step 2: Provider Sees Request
**Persona:** Don Pedro (Provider)
**Browser Tab:** Tab 2

1. Open new tab, navigate to /login
2. Login as provider@test.com / provider.123
3. Navigate to /provider/requests
4. **VERIFY:** The request from Step 1 appears in the list
5. Click on the request card
6. **VERIFY:** Request details match what consumer entered

### Step 3: Provider Submits Offer
**Browser Tab:** Tab 2 (Continue as Provider)

1. Click "Enviar Oferta"
2. Set delivery window: Next available slot
3. Click "Confirmar Oferta"
4. **VERIFY:** Success message appears
5. Navigate to /provider/offers
6. **VERIFY:** Offer shows as "Pendiente"

### Step 4: Consumer Sees and Selects Offer
**Browser Tab:** Tab 1 (Back to Consumer)

1. Navigate to /request/{request_id}/offers?token={token}
2. **VERIFY:** Provider's offer appears in list
3. **VERIFY:** Countdown timer shows time remaining
4. Click "Seleccionar" on the offer
5. Click "Confirmar Selección"
6. **VERIFY:** "Oferta Aceptada" confirmation

### Step 5: Provider Receives Notification
**Browser Tab:** Tab 2 (Back to Provider)

1. Check notification bell icon
2. **VERIFY:** New notification about accepted offer
3. Navigate to /provider/offers
4. **VERIFY:** Offer status changed to "Aceptada"

### Step 6: Provider Marks Delivered
**Browser Tab:** Tab 2 (Continue as Provider)

1. Navigate to delivery details
2. Click "Marcar Entregado"
3. Confirm delivery
4. **VERIFY:** Status changes to "Entregado"
5. **VERIFY:** Commission logged in earnings

### Step 7: Admin Views Settlement
**Persona:** Admin
**Browser Tab:** Tab 3

1. Open new tab, navigate to /admin/login
2. Login as admin@nitoagua.cl
3. Navigate to /admin/settlements
4. **VERIFY:** Commission from this delivery appears
5. **VERIFY:** Amount matches expected (price × 10%)

### Step 8: Consumer Sees Final Status
**Browser Tab:** Tab 1 (Back to Consumer)

1. Navigate to /request/{request_id}/status
2. **VERIFY:** Shows "Entregado" status
3. **VERIFY:** Provider info displayed

---

## Test Results

| Step | Status | Notes |
|------|--------|-------|
| 1 | ⬜ | |
| 2 | ⬜ | |
| 3 | ⬜ | |
| 4 | ⬜ | |
| 5 | ⬜ | |
| 6 | ⬜ | |
| 7 | ⬜ | |
| 8 | ⬜ | |

**Overall Result:** ⬜ PASS / ⬜ FAIL

**Issues Found:**
-

**Screenshots/Evidence:**
-
```

---

## 2. Atlas UX Verify Command (New)

### Purpose

Validate the running application against the approved UX mockups using Claude's visual understanding.

### Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Provider Mockups | `docs/ux-mockups/01-consolidated-provider-flow.html` | Provider UI reference |
| Consumer Mockups | `docs/ux-mockups/02-consolidated-consumer-flow.html` | Consumer UI reference |
| Admin Mockups | `docs/ux-mockups/03-consolidated-admin-flow.html` | Admin UI reference |
| UX Audit Report | `docs/ux-audit/ux-audit-report.md` | Known issues and decisions |
| Mockup Updates | `docs/ux-audit/*-mockup-updates-*.md` | Change tracking |

### Workflow Definition

```yaml
# _bmad/bmm/workflows/4-implementation/atlas-ux-verify/workflow.yaml
name: atlas-ux-verify
description: Visual mockup validation using Claude Chrome Extension
version: 1.0.0

parameters:
  persona:
    required: true
    type: string
    enum: [consumer, provider, admin]
    description: Which persona's UI to verify

  section:
    required: false
    type: string
    description: Specific section to verify (optional)

inputs:
  mockup_location: docs/ux-mockups/
  audit_location: docs/ux-audit/
  output_file: docs/testing/{persona}-ux-verification-{date}.md

steps:
  - step: 0
    goal: Load mockups and verification criteria
  - step: 1
    goal: Generate verification checklist
  - step: 2
    goal: Execute verification via Chrome Extension
  - step: 3
    goal: Document discrepancies and issues
  - step: 4
    goal: Feed learnings to Atlas memory
```

### Verification Checklist Template

```markdown
# UX Verification: {Persona} Flow

**Date:** {date}
**Mockup Version:** {version}
**Environment:** {url}
**Verifier:** Claude via Chrome Extension

## Pre-verification Setup

- [ ] Open mockup HTML in browser tab 1
- [ ] Open running application in browser tab 2
- [ ] Position windows side-by-side for comparison

## Verification Checklist

### Section 1: Navigation / Header

| Element | Mockup | App | Match | Notes |
|---------|--------|-----|-------|-------|
| Logo position | | | ⬜ | |
| Logo design | | | ⬜ | |
| Navigation items | | | ⬜ | |
| Notification bell | | | ⬜ | |
| User avatar | | | ⬜ | |

### Section 2: {Specific Section}

| Element | Mockup | App | Match | Notes |
|---------|--------|-----|-------|-------|
| ... | | | ⬜ | |

## Color Verification

| Element | Mockup Color | App Color | Match |
|---------|--------------|-----------|-------|
| Primary button | | | ⬜ |
| Secondary button | | | ⬜ |
| Header background | | | ⬜ |
| Accent color | | | ⬜ |

## Typography Verification

| Element | Mockup | App | Match |
|---------|--------|-----|-------|
| Headings | | | ⬜ |
| Body text | | | ⬜ |
| Button text | | | ⬜ |
| Labels | | | ⬜ |

## Spacing / Layout

| Aspect | Match | Notes |
|--------|-------|-------|
| Margins | ⬜ | |
| Padding | ⬜ | |
| Grid alignment | ⬜ | |
| Component spacing | ⬜ | |

## Responsive Behavior

| Viewport | Match | Notes |
|----------|-------|-------|
| Mobile (375px) | ⬜ | |
| Tablet (768px) | ⬜ | |
| Desktop (1280px) | ⬜ | |

## Discrepancies Found

| ID | Element | Expected | Actual | Severity | Story Reference |
|----|---------|----------|--------|----------|-----------------|
| 1 | | | | | |

## Recommendations

### Must Fix (Before Release)
1.

### Should Fix (Next Sprint)
1.

### Nice to Have
1.

## Summary

| Category | Pass | Fail | N/A |
|----------|------|------|-----|
| Navigation | | | |
| Colors | | | |
| Typography | | | |
| Layout | | | |
| Responsive | | | |
| **Total** | | | |

**Overall UX Alignment:** X%
```

---

## 3. Implementation Plan

### Phase 1: Documentation & Templates

1. Create workflow YAML files
2. Create instruction XML files
3. Create slash command definitions
4. Create verification templates

### Phase 2: Atlas Memory Updates

1. Add Section 5 entry for Chrome Extension testing patterns
2. Add Section 3 entry for UX verification workflow

### Phase 3: Integration Testing

1. Test atlas-e2e with Story 11-4 (cross-persona)
2. Test atlas-ux-verify with provider flow
3. Document learnings

### File Structure

```
_bmad/
├── agents/atlas/installer/templates/
│   └── slash-commands/
│       ├── atlas-e2e.md (update)
│       └── atlas-ux-verify.md (new)
├── bmm/workflows/4-implementation/
│   ├── atlas-e2e/
│   │   ├── workflow.yaml (update)
│   │   ├── instructions.xml (update)
│   │   └── chrome-extension-checklist-template.md (new)
│   └── atlas-ux-verify/ (new)
│       ├── workflow.yaml
│       ├── instructions.xml
│       ├── checklist.md
│       └── templates/
│           ├── verification-checklist.md
│           └── discrepancy-report.md
```

---

## 4. Usage Examples

### Atlas E2E with Chrome Extension

```
User: /atlas-e2e 11-4-cross-persona-integration-tests --mode=chrome-extension

Claude: Loading Story 11-4 for cross-persona testing...

I'll generate a manual verification checklist for the complete V2 flow.

**Test: Complete Request → Offer → Delivery Cycle**

This test requires 3 browser tabs for Consumer, Provider, and Admin personas.

Shall I walk you through the test now, or generate the checklist for later?
```

### Atlas UX Verify

```
User: /atlas-ux-verify provider

Claude: Loading Provider UX mockups and verification criteria...

**Provider Flow UX Verification**

I'll compare the running application against the approved mockups.

Starting with Section 1: Provider Dashboard Header...

[Claude navigates to the app and compares element by element]
```

---

## 5. Benefits

| Benefit | atlas-e2e (Chrome) | atlas-ux-verify |
|---------|-------------------|-----------------|
| Human-like testing | ✅ | - |
| Visual validation | - | ✅ |
| Cross-persona flows | ✅ | - |
| Mockup compliance | - | ✅ |
| Realtime issues | ✅ | - |
| Design drift detection | - | ✅ |
| Exploratory testing | ✅ | ✅ |
| Documentation | ✅ Auto-generated | ✅ Auto-generated |

---

## 6. Next Steps

1. [ ] Review and approve this specification
2. [ ] Create workflow files for atlas-ux-verify
3. [ ] Update atlas-e2e to support --mode flag
4. [ ] Test with Epic 11-4 story
5. [ ] Test with Provider UX verification
6. [ ] Document patterns in Atlas memory
