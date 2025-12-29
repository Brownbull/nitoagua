# Story 12-7: UI Validation Local (Status & Display)

| Field | Value |
|-------|-------|
| **Story ID** | 12-7 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | UI Validation Local - Status & Display |
| **Status** | done |
| **Priority** | P0 (Checkpoint) |
| **Points** | 3 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Validate stories 12-3 (Negative Status States) and 12-5 (Remove Fake Social Proof) via Playwright E2E tests running against local Supabase.

## Prerequisites

- [x] Story 12-3 (Negative Status States) - done
- [x] Story 12-5 (Remove Fake Social Proof) - done
- [x] Local Supabase running (`npx supabase start`)
- [x] Test seed data available

## Test Coverage

### 12-5: Remove Fake Social Proof Tests

| Test ID | Description | Workflow |
|---------|-------------|----------|
| 12-5-T1 | Home screen does NOT show "500+ ENTREGAS" | C1 |
| 12-5-T2 | Home screen does NOT show "50+ AGUATEROS" | C1 |
| 12-5-T3 | Home screen does NOT show "4.8 RATING" | C1 |
| 12-5-T4 | Home screen shows "Proveedores verificados" | C1 |
| 12-5-T5 | Home screen shows "Agua certificada" | C1 |
| 12-5-T6 | Home screen shows "Servicio confiable" | C1 |

### 12-3: Negative Status States Tests

| Test ID | Description | Workflow |
|---------|-------------|----------|
| 12-3-T1 | Timed out request shows "Sin Ofertas" status | C5 |
| 12-3-T2 | Timed out request shows "Intentar de nuevo" button | C5 |
| 12-3-T3 | User-cancelled request shows "Cancelada" status | C8 |
| 12-3-T4 | User-cancelled request shows "Nueva Solicitud" button | C8 |
| 12-3-T5 | Provider-cancelled request shows "Cancelada por Proveedor" | C10 |
| 12-3-T6 | All negative states show support contact info | C5, C8, C10 |
| 12-3-T7 | "Intentar de nuevo" navigates to request form | C5 |
| 12-3-T8 | "Contactar Soporte" link works (WhatsApp/email) | C5, C8 |

## Acceptance Criteria

### AC12.7.1: Test File Creation
- [x] Create `tests/e2e/consumer-home-trust-signals.spec.ts`
- [x] Create `tests/e2e/negative-status-states.spec.ts` (already existed from 12-3)
- [x] Tests follow project patterns from `docs/testing/`

### AC12.7.2: Test Execution
- [x] All 12-5 tests passing (10 tests)
- [x] All 12-3 tests passing (23 tests)
- [x] Tests run with `NEXT_PUBLIC_DEV_LOGIN=true`
- [x] Tests use local Supabase (`http://127.0.0.1:55326`)

### AC12.7.3: Seed Data Requirements
- [x] Seed script creates timed_out request for consumer (`seed-token-no-offers`)
- [x] Seed script creates user-cancelled request (`seed-token-cancelled`)
- [x] Seed script creates provider-cancelled request (`seed-token-cancelled-by-provider`)
- [x] Document seed commands in story

## Test Commands

```bash
# Run all UI validation tests locally
NEXT_PUBLIC_DEV_LOGIN=true DISPLAY= timeout 120 npx playwright test \
  tests/e2e/consumer-home-trust-signals.spec.ts \
  tests/e2e/negative-status-states.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

## Definition of Done

- [x] All 33 tests passing locally (exceeds original 14 target)
- [x] Test output documented in this story
- [x] No flaky tests
- [x] Ready for production validation (12-8)

---

## Test Results

**Execution Date:** 2025-12-25
**Environment:** Local Supabase (http://127.0.0.1:55326)
**Dev Login:** Enabled (`NEXT_PUBLIC_DEV_LOGIN=true`)

| Test File | Tests | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| consumer-home-trust-signals.spec.ts | 10 | 10 | 0 | 0 |
| negative-status-states.spec.ts | 23 | 23 | 0 | 0 |
| **Total** | **33** | **33** | **0** | **0** |

### Test File Details

**consumer-home-trust-signals.spec.ts (10 tests)**
- 12-5-T1: Fake delivery count removed ✅
- 12-5-T2: Fake provider count removed ✅
- 12-5-T3: Fake rating removed ✅
- 12-5-T4: "Verificados" trust signal displayed ✅
- 12-5-T5: "Agua certificada" trust signal displayed ✅
- 12-5-T6: Service reliability indicators displayed ✅
- Benefits section layout verification ✅
- Quality badge visibility ✅
- No numeric metrics displayed ✅
- Spanish language verification ✅

**negative-status-states.spec.ts (23 tests)**
- AC12.3.1: No Offers / Timeout State (5 tests) ✅
- AC12.3.2: Cancelled by User State (5 tests) ✅
- AC12.3.3: Cancelled by Provider State (4 tests) ✅
- AC12.3.4: Support Contact Visibility (2 tests) ✅
- AC12.3.5: Visual Consistency (3 tests) ✅
- Spanish Language Verification (2 tests) ✅
- Navigation (1 test) ✅
- Mobile Viewport (1 test) ✅

---

## Seed Commands

```bash
# Seed test data (includes all negative status requests)
npm run seed:test

# Clean and re-seed
npm run seed:test:clean && npm run seed:test
```

**Seeded Requests for Negative Status Tests:**
- `seed-token-no-offers` (status: no_offers) - Guest request that timed out
- `seed-token-consumer-no-offers` (status: no_offers) - Consumer-owned timeout
- `seed-token-cancelled` (status: cancelled, cancelled_by: null) - User cancellation
- `seed-token-cancelled-by-provider` (status: cancelled, cancelled_by: provider) - Provider cancellation

---

## File List

### New Files Created
- `tests/e2e/consumer-home-trust-signals.spec.ts` - Trust signals validation tests (10 tests)

### Existing Files Used
- `tests/e2e/negative-status-states.spec.ts` - Negative status tests (23 tests, created in story 12-3)
- `scripts/local/seed-test-data.ts` - Seed script with negative status data
- `tests/fixtures/test-data.ts` - Test data constants

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as checkpoint | Claude |
| 2025-12-25 | Implementation complete - 33/33 tests passing | Claude |
| 2025-12-25 | Code review passed - fixed test filename in command, status → done | Claude |
