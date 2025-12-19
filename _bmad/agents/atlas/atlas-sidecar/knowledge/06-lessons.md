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

## Code Pattern Examples

### Optimistic UI (from 3-5)
```typescript
const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

const handleAction = async (id: string) => {
  setPendingActions(prev => new Set([...prev, id]));
  try {
    await performAction(id);
  } finally {
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
};
```

### Tab Preservation (from 3-4)
```typescript
// On navigation away
router.push(`/details/${id}?from=pending`);

// On return
const from = searchParams.get('from');
if (from) setActiveTab(from);
```

---

## Sync Notes

Last lessons sync: 2025-12-18
Retrospectives reviewed: Epic 3, Epic 8
