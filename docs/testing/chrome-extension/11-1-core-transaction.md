# 11-1 Core Transaction Flow - Chrome Extension Test

## Overview
- **Purpose:** Validate CHAIN-1 happy path delivery
- **Personas:** Consumer, Provider
- **URL:** https://nitoagua.vercel.app
- **Time:** ~15-20 minutes

## Credentials
| Role | Email | Password |
|------|-------|----------|
| Consumer | consumer@nitoagua.cl | test.123 |
| Provider | supplier@nitoagua.cl | test.123 |

---

## Step 1: Consumer Requests Water (C1)

**Login as:** consumer@nitoagua.cl
**URL:** https://nitoagua.vercel.app

**Actions:**
1. Click "Pedir Agua" on home screen
2. Fill: Comuna, cantidad (ej: 1000L), urgencia, telefono
3. Click "Confirmar Pedido"

**Expected:**
- Request confirmed
- Tracking code shown
- Status: "Buscando ofertas"

**Screenshot:** Confirmation screen

---

## Step 2: Provider Sees Request (P5)

**Login as:** supplier@nitoagua.cl
**URL:** https://nitoagua.vercel.app/provider

**Actions:**
1. Go to "Solicitudes" / request browser
2. Find consumer's request
3. Verify: location, amount, urgency visible

**Expected:**
- Request appears in list
- All info visible

**Screenshot:** Request in provider dashboard

---

## Step 3: Provider Submits Offer (P6)

**Continue as:** supplier@nitoagua.cl

**Actions:**
1. Click request to view details
2. Click "Hacer Oferta"
3. Verify auto-calculated price
4. Confirm submission

**Expected:**
- Offer submitted
- Appears in "Mis Ofertas"

**Screenshot:** Offer confirmation

---

## Step 4: Consumer Accepts Offer (C2)

**Login as:** consumer@nitoagua.cl
**URL:** https://nitoagua.vercel.app (tracking page)

**Actions:**
1. View request status
2. See offers received
3. Verify provider name visible
4. Click "Aceptar"

**Expected:**
- Offer accepted
- Status: "Aceptado" / "En camino"

**Screenshot:** Accepted state

---

## Step 5: Provider Completes Delivery (P10)

**Login as:** supplier@nitoagua.cl
**URL:** https://nitoagua.vercel.app/provider

**Actions:**
1. Find accepted delivery
2. Click "Marcar Entregado"
3. Confirm

**Expected:**
- Delivery complete
- Commission logged

**Screenshot:** Completion screen

---

## Report Template

### Execution Summary
- **Date:** ___________
- **Tester:** ___________
- **Browser:** Chrome + Claude Extension

### Results

| Step | Workflow | Result | Notes |
|------|----------|--------|-------|
| 1 | C1: Request Water | [ ] Pass / [ ] Fail | |
| 2 | P5: Browse Requests | [ ] Pass / [ ] Fail | |
| 3 | P6: Submit Offer | [ ] Pass / [ ] Fail | |
| 4 | C2: Accept Offer | [ ] Pass / [ ] Fail | |
| 5 | P10: Complete Delivery | [ ] Pass / [ ] Fail | |

### Issues Found

| # | Severity | Description | Workflow |
|---|----------|-------------|----------|
| 1 | Critical / Medium / Low | | |

### UX Friction Points

| # | Description | Recommendation |
|---|-------------|----------------|
| 1 | | |

### Overall Assessment
- [ ] CHAIN-1 fully functional
- [ ] Minor issues found
- [ ] Critical blockers found
