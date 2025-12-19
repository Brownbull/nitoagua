# Story testing-3: Playwright Utils Integration

| Field | Value |
|-------|-------|
| **Status** | ready-for-dev |
| **Priority** | MEDIUM |
| **Epic** | Testing & Quality |
| **Depends On** | None (foundation story) |

## Story

As a **developer**,
I want **@seontechnologies/playwright-utils integrated into the test framework**,
So that **Epic 10 can use TestArch workflows with enhanced testing capabilities**.

## Context

The `@seontechnologies/playwright-utils` package has been installed (Epic 8). This story completes the integration by:
1. Creating merged fixtures file (DONE)
2. Documenting usage patterns (DONE)
3. Validating the integration works
4. Migrating one existing test as proof-of-concept

## Acceptance Criteria

1. **AC3.1**: Merged fixtures file exists at `tests/support/fixtures/merged-fixtures.ts`
2. **AC3.2**: Documentation exists at `docs/testing/playwright-utils-integration.md`
3. **AC3.3**: At least one existing test migrated to use merged fixtures
4. **AC3.4**: `npm run test:e2e` passes with merged fixtures
5. **AC3.5**: Log output visible in Playwright HTML report

## Tasks / Subtasks

- [x] **Task 1: Create merged fixtures** (AC: 1)
  - [x] Create `tests/support/fixtures/merged-fixtures.ts`
  - [x] Import and merge: log, recurse, interceptNetworkCall, networkErrorMonitor
  - [x] Export combined test object with all fixtures

- [x] **Task 2: Document integration** (AC: 2)
  - [x] Create `docs/testing/playwright-utils-integration.md`
  - [x] Document available fixtures
  - [x] Document usage patterns
  - [x] Document migration strategy

- [ ] **Task 3: Validate integration** (AC: 3, 4)
  - [ ] Pick simple existing test (e.g., `consumer-home.spec.ts`)
  - [ ] Migrate import to merged-fixtures
  - [ ] Add `log.step()` calls for key actions
  - [ ] Run test and verify passes

- [ ] **Task 4: Verify report integration** (AC: 5)
  - [ ] Run `npm run test:e2e -- tests/e2e/consumer-home.spec.ts`
  - [ ] Open Playwright HTML report
  - [ ] Verify log steps appear in report

## Dev Notes

### Files Created

- `tests/support/fixtures/merged-fixtures.ts` - Merged fixture exports
- `docs/testing/playwright-utils-integration.md` - Integration guide

### TestArch Integration for Epic 10

When starting Epic 10, use these workflows:

| Story | TestArch Workflow | Description |
|-------|-------------------|-------------|
| 10-1 | `testarch-atdd` | Generate E2E tests first |
| 10-2 | `testarch-automate` | Expand after implementation |
| 10-5 | `testarch-test-review` | Audit all new tests |

### Available Utilities

| Utility | Import | Purpose |
|---------|--------|---------|
| `log` | `@seontechnologies/playwright-utils/log/fixtures` | Structured logging |
| `recurse` | `@seontechnologies/playwright-utils/recurse/fixtures` | Polling |
| `interceptNetworkCall` | `@seontechnologies/playwright-utils/intercept-network-call/fixtures` | Network spy |
| `networkErrorMonitor` | `@seontechnologies/playwright-utils/network-error-monitor/fixtures` | Error detection |

### Future Utilities (add when needed)

- `apiRequest` - For API-only tests
- `authSession` - For complex auth scenarios
- `networkRecorder` - For HAR-based offline testing
- `burnIn` - For CI test selection

## References

- Package: https://github.com/seontechnologies/playwright-utils
- BMAD TestArch: `_bmad/bmm/testarch/knowledge/overview.md`
- Integration Guide: `docs/testing/playwright-utils-integration.md`

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-17 | Claude | Story created, Tasks 1-2 completed |
