# Historical Lessons (Retrospectives)

> Section 6 of Atlas Memory
> Last Sync: 2025-12-18
> Sources: docs/sprint-artifacts/retrospectives/, epic retrospectives

## What Worked

| Lesson | Context | Epic/Story |
|--------|---------|------------|
| **Browserless MCP for navigation testing** | Parallel testing dramatically improved | Epic 3 |
| **shadcn/ui AlertDialog for confirmations** | Consistent UX, accessible by default | 3-6 |
| **Optimistic UI with Set tracking** | Fast perceived performance | 3-5 |
| **Tab preservation via `?from=` param** | Maintains context on navigation | 3-4 |
| **Per-test seeding pattern** | Deterministic, isolated tests | Epic 8 |
| **Admin client for RLS bypass** | Clean separation of concerns | 2-7, 3-1 |
| **Server component + admin client for guest access** | Guest token pages need RLS bypass on server | 10-1 |
| **Google OAuth only** | Simpler auth, no password management | ADR-004 |

## What Failed

| Failure | Root Cause | Prevention |
|---------|------------|------------|
| **Manual click testing became bottleneck** | No automated E2E coverage | Adopt Playwright early |
| **Complex table-based layouts** | Accessibility issues, poor mobile UX | Use card-based designs |
| **WebKit test flakiness** | Browser-specific timing issues | Focus on Chromium, accept some flakiness |
| **Mixed auth strategies (email + OAuth)** | Complexity without benefit | Pick one auth method early |
| **Hardcoded defaults mismatched docs** | Code used 15% commission when docs said 10% | Always check Atlas Section 4 for constants |
| **Duplicate utility functions** | Same `getPrice()` in 2 places in same file | Extract to shared utility immediately |
| **Seed data mismatched constants** | Seed used Santiago-area comunas, COMUNAS constant has Villarrica-area | Seed scripts should reference source constants, not hardcode IDs |

## Hard-Won Wisdom

### From Epic 3 Retrospective

> "Browserless MCP for parallel navigation testing - one of the best developer experience improvements of the project."

> "Pattern reuse is powerful - the offer system built on patterns from request handling, card layouts from admin verification."

### From Epic 8 Retrospective

> "Consumer-choice offers (letting consumers pick) is simpler than push assignment. Let the user decide."

> "Realtime subscriptions from Supabase are essentially free and provide instant UI updates."

## Patterns to Avoid

1. **Don't build complex table layouts** - Use cards with filtering/sorting instead
2. **Don't mix authentication methods** - Pick OAuth or email, not both
3. **Don't skip E2E tests** - Manual testing doesn't scale
4. **Don't share test state between tests** - Each test seeds its own data
5. **Don't ignore WebKit** - But don't block on its flakiness either

## Patterns to Follow

1. **Use shadcn/ui components** - Accessible, customizable, code ownership
2. **Server Actions for mutations** - Type-safe, composable
3. **Admin client pattern for elevated access** - Clear separation from user context
4. **Optimistic UI with Set tracking** - Track pending operations by ID
5. **Tab preservation with query params** - User context survives navigation
6. **Card-based dashboards** - Works on mobile, scannable on desktop
7. **Per-test seeding** - Deterministic, isolated, debuggable
8. **Centralize pricing/commission utilities** - Single source of truth in `src/lib/utils/commission.ts`
9. **Add aria-busy/aria-live for loading states** - Accessibility for period selectors, data refreshes

## Code Pattern References

| Pattern | Location | Story |
|---------|----------|-------|
| **Optimistic UI (Set tracking)** | See 04-architecture.md | 3-5 |
| **Tab Preservation (?from= param)** | See 04-architecture.md | 3-4 |
| **Centralized pricing utility** | `src/lib/utils/commission.ts` | 8-6 |
| **Dynamic import for SSR bypass** | `map-wrapper.tsx` | 8-10 |
| **Full-screen page layout override** | `provider/layout.tsx` | 8-10 |

---

## Epic 8 Retrospective (2025-12-19)

**Delivered:** 10 stories, ~160 E2E tests, ~95 unit tests

### Key Wins

- Atlas code reviews caught real issues (DRY violations, seed mismatches, z-index bugs)
- Per-test seeding scales well at 160+ tests
- Supabase Realtime + 30s polling fallback is reliable and free
- Leaflet + OpenStreetMap works well with `dynamic()` import

### Code Review Lessons (Epic 8)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| Seed data mismatch | Scripts hardcoded IDs vs constants | Reference source constants |
| Z-index battles | Stacking contexts | Hide parent layout via `usePathname()` |
| Duplicate back buttons | Prop not passed to component | `hideBackButton` prop pattern |
| Disabled features unclear | No visual indicator | `disabled` + `cursor-not-allowed` + tooltip |

### Process Adopted

- **@health tests first** - Database health checks run before E2E suite
- **Tech spec before stories** - Run `atlas-epic-tech-context` workflow
- **Full-screen pages** - Hide parent layout via `usePathname()` conditional

---

---

## Epic 10 Code Review Lessons (2025-12-21)

### Story 10-4: Request Timeout Notification

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Seed script missing test data** | Test fixtures defined data that seed script didn't create | **Always add to both**: `tests/fixtures/test-data.ts` AND `scripts/local/seed-test-data.ts` |
| **Registered consumer email missed** | Cron route only checked `guest_email`, not `profiles.email` | For features affecting both guest AND registered users, verify BOTH email sources |
| **E2E tests not following Atlas patterns** | Epic 10 tests didn't use merged-fixtures | New tests MUST use `import { test, expect } from '../support/fixtures/merged-fixtures'` |
| **Missing assertNoErrorState** | Tests passed when page showed error states | Call `assertNoErrorState(page)` after `page.goto()` before content assertions |

### Patterns Confirmed

1. **Dual email source for notifications**: When sending emails that could go to guests OR registered users:
   ```typescript
   const email = request.guest_email || request.profiles?.email;
   ```

2. **Seed-fixture synchronization**: Every constant in `tests/fixtures/test-data.ts` MUST have matching data seeded by `scripts/local/seed-test-data.ts`

3. **Atlas Section 5 test patterns**: All new tests use merged fixtures + log fixture + assertNoErrorState

---

### Story 10-5: Request Status with Offer Context

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **Dead component left in codebase** | Created new `timeline-tracker.tsx` but didn't delete old `status-tracker.tsx` | When replacing components, **delete the old one immediately** to avoid dead code |
| **Missing database column** | Code referenced `in_transit_at` but no migration existed | When adding timestamp columns for status tracking, **create the migration first**, then update types, then update code |
| **Story AC didn't match mockup implementation** | AC said "Solicitado → Aceptado" but mockups showed richer labels | **Update ACs after mockup alignment** - the mockups are the source of truth for UX |
| **Story File List incomplete** | New components created weren't added to File List | During implementation, **update File List in real-time** as files are created |
| **TypeScript types not regenerated** | Added column to migration but database.ts not updated | After adding columns, **always update `src/types/database.ts`** (or regenerate with `npx supabase gen types typescript`) |

### Patterns Confirmed

1. **Timeline component pattern**: Use 4-step timelines with contextual labels that change based on status (pending shows offer-focused steps, accepted+ shows delivery-focused steps)

2. **Component extraction for reuse**: When building status pages, create:
   - `TimelineTracker` - reusable timeline with steps
   - `StatusCard` - status-specific styling with children slots
   - `GradientHeader` - branded headers for key pages

3. **Dead code elimination**: When a code review finds unused components, delete them immediately - they add confusion and maintenance burden

---

---

### Story 11-1: Chrome Extension E2E Testing (2025-12-22)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **RLS blocked offer creation** | Policy checks `role = 'provider'` but profiles use `role = 'supplier'` | Run migrations on production; verify role names match across policies |
| **Consumer can't view own requests** | Missing/incorrect RLS policy | Test RLS policies with Playwright before production E2E |
| **Tracking page broken** | Unknown RLS or routing issue | Debug guest access flows early |
| **Chrome Extension E2E too fragile for early testing** | Cascading failures when RLS/permissions fail | Use Chrome Extension E2E only on polished apps |

### Patterns for Chrome Extension E2E Testing

1. **Prerequisites for Chrome Extension E2E on production:**
   - All RLS policies verified via Playwright tests
   - Manual testing confirms happy path works
   - No known blocking issues in core flows

2. **Testing progression (recommended order):**
   - **First**: Playwright tests (fast iteration, catches RLS issues)
   - **Second**: Manual testing (catches UX issues)
   - **Last**: Chrome Extension E2E (final production validation)

3. **When Chrome Extension E2E fails early, stop and fix:**
   - Don't try to work around RLS issues with admin scripts
   - Fix the root cause first, then resume testing
   - Each workaround compounds complexity and wastes time

4. **Admin scripts are for debugging, not testing:**
   - Scripts like `create-test-offer.ts` help diagnose issues
   - But they shouldn't be used to "complete" an E2E test
   - If you need admin bypass, the test is blocked, not passed

---

*Last verified: 2025-12-22 | Sources: Epic 3, Epic 8 retrospectives, Story 8-6, 8-7, 8-9, 8-10, 10-4, 10-5, 11-1 implementations*
