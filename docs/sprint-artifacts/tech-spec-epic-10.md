# Tech Spec: Epic 10 - Consumer Offer Selection

**Epic:** 10 - Consumer Offer Selection
**Author:** Atlas-Enhanced Workflow
**Date:** 2025-12-19
**Status:** Draft

---

## 1. Overview

Epic 10 implements the consumer-side of the Consumer-Choice Offer Model (ADR-006), enabling consumers to view, compare, and select from multiple provider offers on their water requests. This is the counterpart to Epic 8 (Provider Offer System) and completes the offer lifecycle.

**Core Value:** Consumers get choice and control by viewing multiple offers with different delivery windows, then actively selecting their preferred provider. No more passive waiting - active selection empowers consumers and preserves trust relationships with known providers.

**Context from PRD:**
- FR45-FR48: Consumer offer viewing and selection
- FR14, FR22, FR23: Request status with offer context
- UX Principle: "Asymmetric Simplicity" - Ultra-simple consumer experience

---

## 2. Objectives & Scope

### In Scope

- **10-1:** Offer list view on request status page with real-time updates
- **10-2:** Offer selection flow with confirmation modal and state transitions
- **10-3:** Client-side countdown timers showing offer expiration
- **10-4:** Request timeout notification when no offers received after 4 hours
- **10-5:** Enhanced request status page showing selected offer details

### Out of Scope

- Provider-side offer management (Epic 8 - COMPLETE)
- Price differentiation (all offers same base price for MVP)
- Offer negotiation or counter-offers
- Provider ratings or reviews (v3+)
- Payment processing (external)

---

## 3. System Architecture Alignment

### Relevant ADRs

| ADR | Decision | Application |
|-----|----------|-------------|
| **ADR-006** | Consumer-Choice over Push Assignment | Epic 10 core implementation |
| **ADR-007** | Supabase Realtime | Live offer updates |
| **ADR-005** | Server Actions pattern | `selectOffer()` action |
| **ADR-001** | Next.js 15 App Router | Consumer route structure |

### Pattern Reuse from Previous Epics

| Pattern | First Used | Reuse in Epic 10 |
|---------|------------|------------------|
| Countdown Timer Hook | Epic 8 (8-3) | Offer expiration display |
| Realtime Subscriptions | Epic 8 (8-1) | Consumer offer updates |
| Server Actions | Epic 3 (3-1) | `selectOffer()` action |
| Status Badges | Epic 2 | Offer/request status display |
| AlertDialog Confirmation | Epic 3 (3-6) | Offer selection confirmation |

---

## 4. Detailed Design

### 4.1 Services & Modules

| Component | Location | Purpose |
|-----------|----------|---------|
| Offer List Page | `src/app/(consumer)/request/[id]/offers/page.tsx` | Consumer offer viewing |
| Offer List Component | `src/components/consumer/offer-list.tsx` | Offer cards container |
| Offer Card Component | `src/components/consumer/offer-card.tsx` | Single offer display |
| Select Offer Action | `src/lib/actions/offers.ts` | Add `selectOffer()` |
| Countdown Timer | `src/components/shared/countdown-timer.tsx` | **Exists from Epic 8** |
| Request Timeout Cron | `src/app/api/cron/request-timeout/route.ts` | 4-hour timeout check |

### 4.2 Data Models

#### Existing Tables (No Changes Required)

```sql
-- offers table (from Epic 8)
-- Fields used: id, request_id, provider_id, delivery_window_start,
--              delivery_window_end, expires_at, status, created_at, accepted_at

-- water_requests table
-- Fields used: id, status, consumer_id, tracking_token, provider_id
```

#### Status Enum Extension

```sql
-- Add 'no_offers' status to water_requests
ALTER TABLE water_requests
DROP CONSTRAINT IF EXISTS water_requests_status_check;

ALTER TABLE water_requests
ADD CONSTRAINT water_requests_status_check
CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled', 'no_offers'));
```

### 4.3 APIs & Interfaces

#### Server Action: selectOffer

```typescript
// src/lib/actions/offers.ts

'use server';

export async function selectOffer(offerId: string): Promise<ActionResult> {
  // 1. Authenticate consumer
  const user = await requireAuth();

  // 2. Validate offer exists, is active, and belongs to user's request
  const { data: offer } = await supabase
    .from('offers')
    .select(`
      *,
      water_requests!inner(id, consumer_id, tracking_token, status)
    `)
    .eq('id', offerId)
    .eq('status', 'active')
    .single();

  if (!offer) {
    return { error: { code: 'NOT_FOUND', message: 'Oferta no encontrada o expirada' } };
  }

  // 3. Verify consumer owns the request
  if (offer.water_requests.consumer_id !== user.id) {
    return { error: { code: 'UNAUTHORIZED', message: 'No autorizado' } };
  }

  // 4. Transaction: Update offer + request + cancel others
  const { error } = await supabase.rpc('select_offer', {
    p_offer_id: offerId,
    p_request_id: offer.request_id
  });

  // 5. Notify provider (reuse Epic 8 pattern)
  await sendOfferAcceptedEmail(offer.provider_id, offer.request_id);

  // 6. Create in-app notifications
  await createNotification({
    user_id: offer.provider_id,
    type: 'offer_accepted',
    title: '¡Tu oferta fue aceptada!',
    body: 'Un cliente seleccionó tu oferta de entrega.',
    request_id: offer.request_id,
    offer_id: offerId
  });

  revalidatePath(`/request/${offer.request_id}`);

  return { data: { success: true } };
}
```

#### Database Function: select_offer

```sql
-- Atomic offer selection with proper state transitions
CREATE OR REPLACE FUNCTION select_offer(
  p_offer_id UUID,
  p_request_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update selected offer
  UPDATE offers
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_offer_id;

  -- Cancel all other offers on this request
  UPDATE offers
  SET status = 'request_filled'
  WHERE request_id = p_request_id
    AND id != p_offer_id
    AND status = 'active';

  -- Update request with provider assignment
  UPDATE water_requests
  SET
    status = 'accepted',
    provider_id = (SELECT provider_id FROM offers WHERE id = p_offer_id),
    delivery_window_start = (SELECT delivery_window_start FROM offers WHERE id = p_offer_id),
    delivery_window_end = (SELECT delivery_window_end FROM offers WHERE id = p_offer_id)
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.4 Realtime Subscriptions

```typescript
// src/hooks/use-consumer-offers.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Offer } from '@/types/database';

export function useConsumerOffers(requestId: string) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    async function fetchOffers() {
      const { data } = await supabase
        .from('offers')
        .select(`
          *,
          profiles:provider_id(name, avatar_url)
        `)
        .eq('request_id', requestId)
        .in('status', ['active', 'expired'])
        .order('delivery_window_start', { ascending: true });

      setOffers(data ?? []);
      setLoading(false);
    }

    fetchOffers();

    // Realtime subscription
    const channel = supabase
      .channel(`consumer-offers-${requestId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `request_id=eq.${requestId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch full offer with profile
          fetchOffers();
        } else if (payload.eventType === 'UPDATE') {
          setOffers(prev => prev.map(o =>
            o.id === payload.new.id ? { ...o, ...payload.new } : o
          ));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  return { offers, loading };
}
```

### 4.5 Component Structure

#### Offer Card

```typescript
// src/components/consumer/offer-card.tsx

interface OfferCardProps {
  offer: Offer;
  onSelect: (offerId: string) => void;
  isSelecting: boolean;
}

export function OfferCard({ offer, onSelect, isSelecting }: OfferCardProps) {
  const isExpired = new Date(offer.expires_at) < new Date();

  return (
    <Card className={cn(isExpired && 'opacity-50')}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={offer.profiles?.avatar_url} />
            <AvatarFallback>{offer.profiles?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{offer.profiles?.name}</CardTitle>
            <CardDescription>
              Entrega: {formatDeliveryWindow(offer.delivery_window_start, offer.delivery_window_end)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <CountdownTimer
            expiresAt={offer.expires_at}
            expiredText="Expirada"
          />
          <Button
            onClick={() => onSelect(offer.id)}
            disabled={isExpired || isSelecting}
          >
            {isSelecting ? 'Seleccionando...' : 'Seleccionar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Offer list load | < 1s | Time to first offer display |
| Realtime update latency | < 500ms | New offer appearance |
| Selection confirmation | < 2s | End-to-end transaction |
| Countdown accuracy | ±1s | Timer vs server time |

### 5.2 Security

- **RLS Policies:** Consumers can only view/select offers on their own requests
- **Guest Access:** Tracking token validates guest consumer access
- **CSRF Protection:** Server Actions include CSRF tokens
- **Rate Limiting:** Max 5 offer selections per minute per user

### 5.3 Reliability

- **Graceful Degradation:** If Realtime fails, poll every 30 seconds
- **Optimistic UI:** Show selection immediately, revert on error
- **Transaction Safety:** Offer selection is atomic (database function)
- **Expired Offer Handling:** Client-side expiration + server validation

### 5.4 Observability

- **Logging:** Log offer selections with request_id, offer_id, latency
- **Metrics:** Track selection rate, timeout rate, average time to selection
- **Alerts:** Monitor failed selections and timeout notifications

---

## 6. Dependencies & Integrations

### Epic Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Epic 8 - Provider Offer System | ✅ Complete | Offers to view/select |
| Epic 6 - Admin Panel | ✅ Complete | Offer validity config |
| Epic 5 - Email Notifications | ✅ Complete | Timeout notifications |
| Epic 2 - Consumer Request Flow | ✅ Complete | Request status page |

### Package Dependencies

```json
{
  "existing_packages": [
    "date-fns",        // Countdown calculations
    "date-fns-tz",     // Chile timezone handling
    "@supabase/supabase-js"  // Realtime subscriptions
  ],
  "no_new_packages_required": true
}
```

### External Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Supabase Realtime | Live offer updates | ✅ Already configured |
| Resend Email | Timeout notifications | ✅ Already configured |
| Vercel Cron | Request timeout job | Needs configuration |

---

## 7. Acceptance Criteria & Traceability

### AC-to-Spec Mapping

| AC ID | Description | Spec Section | Components |
|-------|-------------|--------------|------------|
| AC10.1.1 | Consumer views offer list | 4.4 | offer-list.tsx |
| AC10.1.2 | Offers sorted by delivery window | 4.4 | useConsumerOffers |
| AC10.1.3 | Real-time offer updates | 4.4 | Realtime subscription |
| AC10.2.1 | Confirmation modal | 4.5 | AlertDialog |
| AC10.2.2 | Atomic offer selection | 4.3 | select_offer() |
| AC10.2.3 | Other offers cancelled | 4.3 | status=request_filled |
| AC10.3.1 | Countdown timer display | 4.5 | CountdownTimer |
| AC10.3.2 | Expired offer styling | 4.5 | OfferCard opacity |
| AC10.4.1 | 4-hour timeout check | 4.3 | Cron job |
| AC10.4.2 | Email notification | 6 | Resend integration |
| AC10.5.1 | Selected offer on status | 4.5 | Status page update |

### Feature Coverage (Atlas Traceability)

| Feature | Story | Status |
|---------|-------|--------|
| Offer List View | 10-1 | Pending |
| Select Provider Offer | 10-2 | Pending |
| Countdown Timer | 10-3 | Pending (reuses Epic 8 hook) |
| Request Timeout | 10-4 | Pending |
| Status with Offer Context | 10-5 | Pending |

### Coverage Gaps: None

All Epic 10 features map to existing architecture patterns from Epics 6-8.

---

## 8. Risks & Assumptions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Realtime connection drops | Medium | High | 30-second polling fallback |
| Race condition on selection | Low | High | Atomic database function |
| Timezone confusion | Low | Medium | Server-side UTC, client display |
| Consumer abandons selection | Medium | Low | Offers auto-expire via cron |

### Assumptions

1. Epic 8 provider offer flow is complete and tested
2. Supabase Realtime is stable in production
3. Consumers have email or account for notifications
4. 4-hour timeout is appropriate for rural Chile context

### Open Questions

1. Should expired offers remain visible or be hidden?
   - **Recommendation:** Show with "Expirada" badge, gray styling
2. What happens if consumer goes offline during selection?
   - **Recommendation:** Optimistic UI with error recovery
3. Should we notify providers when their offers are cancelled (request_filled)?
   - **Recommendation:** Yes, in-app notification only

---

## 9. Test Strategy

### Unit Tests

- `selectOffer()` action validation
- Countdown timer calculations
- Offer sorting logic

### Integration Tests

- Realtime subscription updates
- Database function atomicity
- Email notification delivery

### E2E Tests (Playwright)

| Test | Description | Priority |
|------|-------------|----------|
| `consumer-offers-view.spec.ts` | View offer list with realtime updates | High |
| `consumer-select-offer.spec.ts` | Select offer and verify state changes | High |
| `consumer-offer-countdown.spec.ts` | Verify countdown display and expiration | Medium |
| `consumer-request-timeout.spec.ts` | 4-hour timeout notification | Medium |
| `consumer-status-with-offer.spec.ts` | Verify status page shows selected offer | High |

### Test Data Seeding

```typescript
// tests/fixtures/offer-selection.ts
export async function seedOffersForSelection(requestId: string) {
  // Create 3 active offers with different windows
  // Create 1 expired offer for styling test
}
```

---

## 10. Implementation Notes

### Story Order Recommendation

1. **10-1** - Offer List View (foundation)
2. **10-3** - Countdown Timer (reuses Epic 8, quick win)
3. **10-2** - Select Offer (core transaction)
4. **10-5** - Status with Offer Context (integration)
5. **10-4** - Request Timeout (cron job, can run parallel)

### Code Review Focus Areas

- Realtime subscription cleanup on unmount
- Atomic transaction correctness
- Timezone handling consistency
- Spanish copy accuracy

### Patterns from Atlas Lessons

| Lesson | Application |
|--------|-------------|
| Per-test seeding | Each E2E test seeds its own offers |
| Optimistic UI with Set tracking | Track pending selection state |
| AlertDialog for confirmations | Selection confirmation modal |
| Centralized utilities | Reuse `formatDeliveryWindow()` |

---

*Generated by Atlas-Enhanced Epic Tech Context Workflow*
*Date: 2025-12-19*
*For: Gabe*
