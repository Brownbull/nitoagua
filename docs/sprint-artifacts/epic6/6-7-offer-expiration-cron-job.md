# Story 6.7: Offer Expiration Cron Job

Status: ready-for-dev

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

- [ ] **Task 1: Cron Route** (AC: 1, 5)
  - [ ] Create `src/app/api/cron/expire-offers/route.ts`
  - [ ] Verify CRON_SECRET from Authorization header
  - [ ] Return 401 if unauthorized

- [ ] **Task 2: Expiration Logic** (AC: 2)
  - [ ] Query offers WHERE status = 'active' AND expires_at < NOW()
  - [ ] Batch update status to 'expired'
  - [ ] Use Supabase admin client for service role access

- [ ] **Task 3: Provider Notifications** (AC: 3)
  - [ ] For each expired offer, get provider_id
  - [ ] Create in-app notification: "Tu oferta expiró"
  - [ ] Include request summary in notification

- [ ] **Task 4: Logging** (AC: 4)
  - [ ] Log count of expired offers
  - [ ] Log execution time
  - [ ] Format: `[CRON] Expired X offers in Yms`

- [ ] **Task 5: Vercel Cron Configuration** (AC: 1)
  - [ ] Create or update `vercel.json` with cron config
  - [ ] Schedule: `* * * * *` (every minute)
  - [ ] Path: `/api/cron/expire-offers`

- [ ] **Task 6: Environment Variable** (AC: 5)
  - [ ] Add CRON_SECRET to Vercel environment
  - [ ] Add to .env.local for local testing
  - [ ] Document in README

- [ ] **Task 7: Testing** (AC: All)
  - [ ] Unit test: Expiration query logic
  - [ ] Unit test: CRON_SECRET validation
  - [ ] Integration test: Full cron execution with test data
  - [ ] Manual test: Trigger via curl with secret

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

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Story drafted from tech spec and epics | SM Agent |
