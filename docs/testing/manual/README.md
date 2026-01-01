# Manual Testing Documentation

Human-performed testing for NitoAgua PWA. This includes multi-device testing, exploratory testing, and bug tracking from manual test sessions.

## Directory Structure

```
manual/
├── README.md                 # This file
├── plans/                    # Test plans
│   ├── live-multi-device-test-plan.md         # Round 1 (completed)
│   └── live-multi-device-test-plan-round2.md  # Round 2 (pending)
└── bugs/                     # Bug reports & evidence
    ├── live-test-bugs-2024-12-30.md           # Round 1 bugs (22 bugs)
    └── screenshots/                            # Evidence from sessions
```

## Test Sessions

| Session | Date | Version | Status | Bugs Found | Plan | Bugs |
|---------|------|---------|--------|------------|------|------|
| Round 1 | 2024-12-30 | v2.4.0 | Complete | 22 bugs | [Plan](./plans/live-multi-device-test-plan.md) | [Bugs](./bugs/live-test-bugs-2024-12-30.md) |
| Round 2 | TBD | v2.x.x | Pending | - | [Plan](./plans/live-multi-device-test-plan-round2.md) | - |

## Test Plans

### Round 1: Initial Multi-Device Testing
- **File:** [plans/live-multi-device-test-plan.md](./plans/live-multi-device-test-plan.md)
- **Status:** Complete
- **Focus:** End-to-end flows across Consumer, Provider, Admin roles

### Round 2: Post-Fix Validation + Deep Dive
- **File:** [plans/live-multi-device-test-plan-round2.md](./plans/live-multi-device-test-plan-round2.md)
- **Status:** Pending (waiting for P1 bug fixes)
- **Focus:**
  - Regression testing (verify bug fixes)
  - Admin panel UX exploration
  - Concurrent multi-user scenarios
  - Production profile testing

## Bug Reports

### Round 1 Bugs (2024-12-30)
- **File:** [bugs/live-test-bugs-2024-12-30.md](./bugs/live-test-bugs-2024-12-30.md)
- **Total Bugs:** 22
- **By Priority:**
  - P1 (Critical/High): 12 bugs
  - P2 (Medium): 7 bugs
  - P3 (Low): 3 bugs

### Key Findings from Round 1

1. **Push Notifications:** Infrastructure works (Test 5 passed), but triggers are missing for transaction events (BUG-005, 008, 013)

2. **Admin Panel Issues:** 6 bugs related to admin (BUG-002, 006, 007, 011, 017, 020) - needs significant attention

3. **Realtime/Sync Issues:** Data not updating across views (BUG-002, 011, 022)

4. **Missing Features:** "En Camino" status, ratings, dispute system (BUG-009, 014, 015, 016)

## How to Run Manual Tests

### Prerequisites
- 3 devices: Computer (Admin), Computer/Tablet (Provider), Phone (Consumer)
- Test accounts: admin@nitoagua.cl, supplier@nitoagua.cl, consumer@nitoagua.cl
- Production URL: https://nitoagua.vercel.app

### Process
1. Review test plan for the round you're executing
2. Set up devices with appropriate accounts
3. Follow test steps, marking pass/fail
4. Document bugs in the bug report file
5. Take screenshots for evidence (save to screenshots/)

## Bug Report Template

When documenting new bugs, use this format:

```markdown
### BUG-XXX: [Title]

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 |
| **Device** | Android Phone / Computer / etc. |
| **Test Step** | X.X |
| **URL/Route** | /path |

**Description:**
[What's wrong]

**Steps to Reproduce:**
1. ...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]
```

## Related Documentation

- [Automated E2E Tests](/tests/e2e/) - Playwright test suite
- [E2E Testing Patterns](/docs/technical/e2e-testing-patterns.md)
- [Test Data Seeding Guide](../test-data-seeding-guide.md)
