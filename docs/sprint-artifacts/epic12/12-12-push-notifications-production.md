# Story 12-12: Push Notifications Production Validation

| Field | Value |
|-------|-------|
| **Story ID** | 12-12 |
| **Epic** | Epic 12: Consumer UX Enhancements |
| **Title** | Push Notifications Production Validation |
| **Status** | drafted |
| **Priority** | P1 (Checkpoint) |
| **Points** | 3 |
| **Sprint** | Backlog |
| **Type** | Playwright Validation |

## Purpose

Validate story 12-6 on production environment, including Edge Function deployment and real Android PWA testing.

## Prerequisites

- [ ] Story 12-11 (Push Notifications Local) - done
- [ ] Changes deployed to production
- [ ] Edge Function deployed to production Supabase
- [ ] VAPID keys configured in Vercel environment

## Test Coverage

### Automated Tests (Same as 12-11)
- 7 tests for subscription management

### Production-Specific Manual Tests

| Test ID | Description | Priority |
|---------|-------------|----------|
| 12-6-P1 | Edge Function reachable on production | HIGH |
| 12-6-P2 | Push works with production VAPID keys | HIGH |
| 12-6-P3 | Cross-device push (admin triggers, user receives) | HIGH |
| 12-6-P4 | Multiple subscriptions for same user work | MEDIUM |
| 12-6-P5 | Subscription cleanup on logout | MEDIUM |

## Acceptance Criteria

### AC12.12.1: Production Deployment
- [ ] Service worker updated on production
- [ ] Edge Function deployed
- [ ] VAPID keys in Vercel environment
- [ ] push_subscriptions table migrated

### AC12.12.2: Automated Test Execution
- [ ] All 7 tests passing on production
- [ ] Edge Function responding

### AC12.12.3: Real Device Testing
- [ ] Push notification received on Samsung Galaxy
- [ ] Tested with nitoagua.vercel.app production URL
- [ ] Results documented with screenshots

### AC12.12.4: Atlas Code Review
- [ ] Run `/bmad:bmm:workflows:atlas-code-review 12-12`
- [ ] All issues addressed
- [ ] Push patterns documented

## Test Commands

```bash
# Run push subscription tests against production
NEXT_PUBLIC_SUPABASE_URL="https://spvbmmydrfquvndxpcug.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
NEXT_PUBLIC_DEV_LOGIN=true \
DISPLAY= timeout 120 npx playwright test \
  tests/e2e/push-subscription.spec.ts \
  --project=chromium --workers=1 --reporter=list
```

## Edge Function Verification

```bash
# Test Edge Function directly
curl -X POST \
  'https://spvbmmydrfquvndxpcug.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer <service_role_key>' \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "<test_user_id>", "title": "Test", "body": "Test push"}'
```

## Definition of Done

- [ ] All automated tests passing on production
- [ ] Real push notification received on Android device
- [ ] Edge Function working in production
- [ ] Atlas code review passed
- [ ] Phase 3 complete
- [ ] Story marked as deployed

---

## Test Results

_To be filled after test execution_

### Automated Tests
| Test File | Tests | Pass | Fail | Skip |
|-----------|-------|------|------|------|
| push-subscription.spec.ts | 7 | | | |

### Manual Tests (Production)
| Test ID | Result | Notes | Date |
|---------|--------|-------|------|
| 12-6-P1 | | | |
| 12-6-P2 | | | |
| 12-6-P3 | | | |
| 12-6-P4 | | | |
| 12-6-P5 | | | |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-24 | Story created as checkpoint | Claude |
