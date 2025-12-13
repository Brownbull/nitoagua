# Story 6.7: Offer Expiration Cron Job

Status: review

## Story

As **the platform**,
I want **expired offers to be automatically marked as expired**,
so that **consumers don't see stale offers**.

## Acceptance Criteria

1. **AC6.7.1:** Cron job runs every minute via Vercel cron
2. **AC6.7.2:** Job marks offers with `expires_at < NOW()` as 'expired'
3. **AC6.7.3:** Affected providers notified "Tu oferta expiró"
4. **AC6.7.4:** Job logs count of expired offers
5. **AC6.7.5:** Job authenticated via CRON_SECRET

## Tasks / Subtasks

- [x] **Task 1: Cron Route** (AC: 1, 5)
  - [x] Create `src/app/api/cron/expire-offers/route.ts`
  - [x] Verify CRON_SECRET from Authorization header
  - [x] Return 401 if unauthorized

- [x] **Task 2: Expiration Logic** (AC: 2)
  - [x] Query offers WHERE status = 'active' AND expires_at < NOW()
  - [x] Batch update status to 'expired'
  - [x] Use Supabase admin client for service role access

- [x] **Task 3: Provider Notifications** (AC: 3)
  - [x] For each expired offer, get provider_id
  - [x] Create in-app notification: "Tu oferta expiró"
  - [x] Include request summary in notification

- [x] **Task 4: Logging** (AC: 4)
  - [x] Log count of expired offers
  - [x] Log execution time
  - [x] Format: `[CRON] Expired X offers in Yms`

- [x] **Task 5: Vercel Cron Configuration** (AC: 1)
  - [x] Create or update `vercel.json` with cron config
  - [x] Schedule: `* * * * *` (every minute)
  - [x] Path: `/api/cron/expire-offers`

- [x] **Task 6: Environment Variable** (AC: 5)
  - [x] Add CRON_SECRET to Vercel environment (documented for production)
  - [x] Add to .env.local for local testing
  - [x] Document in README

- [x] **Task 7: Testing** (AC: All)
  - [x] E2E tests: CRON_SECRET validation (5 passing tests)
  - [x] E2E tests: Response format validation
  - [x] E2E tests: Idempotency verification
  - [x] Manual test: Trigger via curl with secret ✓

## Dev Notes

### Architecture Context

- Cron jobs run via Vercel's cron feature
- Uses service role key (admin access) for batch updates
- Notifications use existing notification system from Epic 5

### Technical Implementation

```typescript
// src/app/api/cron/expire-offers/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const start = Date.now();

  // Find and update expired offers
  const { data: expired, error } = await supabase
    .from('offers')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())
    .select('id, provider_id, request_id');

  if (error) {
    console.error('[CRON] Error expiring offers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Create notifications for affected providers
  if (expired?.length) {
    // ... notification logic
  }

  console.log(`[CRON] Expired ${expired?.length || 0} offers in ${Date.now() - start}ms`);

  return Response.json({ expired: expired?.length || 0 });
}
```

### Vercel Cron Configuration

```json
{
  "crons": [{
    "path": "/api/cron/expire-offers",
    "schedule": "* * * * *"
  }]
}
```

### No UX Mockups Required

This is a backend-only story with no UI components.

### Prerequisites

- Story 6.1 (Admin Authentication) - establishes admin infrastructure
- Offers table exists (created in migration)
- Notification system from Epic 5

### Relevant Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/cron/expire-offers/route.ts` | Cron endpoint |
| `vercel.json` | Cron configuration |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-6.md#Story-6.7]
- [Source: docs/architecture.md#Cron-Jobs-Vercel]
- [Source: docs/epics.md#Story-6.7]

## Dev Agent Record

### Context Reference

docs/sprint-artifacts/epic6/6-7-offer-expiration-cron-job.context.xml

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Implemented cron route following tech spec pattern
- Created notifications table migration for AC6.7.3 requirement
- Used `createAdminClient()` for service role access (bypasses RLS)
- Query joins water_requests to get consumer info for notification message
- Tests verify auth (AC6.7.5), response format (AC6.7.4), and idempotency (AC6.7.1)

### Completion Notes List

- ✅ Created cron endpoint at `/api/cron/expire-offers` with CRON_SECRET auth
- ✅ Implemented batch update query: `UPDATE offers SET status='expired' WHERE status='active' AND expires_at < NOW()`
- ✅ Created `notifications` table migration for in-app provider notifications
- ✅ Notification message includes consumer name, amount, and address
- ✅ Created `vercel.json` with every-minute cron schedule
- ✅ Added CRON_SECRET to .env.local and documented in README
- ✅ 5 E2E tests passing (auth, response format, idempotency)
- ✅ Manual curl test verified: `{"expired_count":0,"duration_ms":5}`
- ⚠️ CRON_SECRET must be added to Vercel environment for production

### File List

**New Files:**
- src/app/api/cron/expire-offers/route.ts
- supabase/migrations/20251213180000_add_notifications_table.sql
- vercel.json
- tests/e2e/cron-expire-offers.spec.ts

**Modified Files:**
- src/types/database.ts (added notifications table types)
- .env.local (added CRON_SECRET)
- README.md (documented CRON_SECRET env var)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
| 2025-12-13 | Story implemented - all tasks complete | Claude Opus 4.5 |
