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
| **Loading state accessibility** | `earnings-dashboard-client.tsx` | 8-6 |
| **File upload with preview** | `withdraw-client.tsx` | 8-7 |
| **Storage bucket with folder-based RLS** | `commission-receipts` bucket | 8-7 |

---

*Last verified: 2025-12-19 | Sources: Epic 3, Epic 8 retrospectives, Story 8-6 and 8-7 implementations*
