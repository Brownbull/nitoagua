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

## Epic 10 Code Review Lessons (2025-12-21)

| Story | Issue | Prevention |
|-------|-------|------------|
| 10-4 | Seed script missing test data | Add to BOTH `tests/fixtures/test-data.ts` AND `scripts/local/seed-test-data.ts` |
| 10-4 | Registered consumer email missed | Check BOTH `guest_email` and `profiles?.email` for notifications |
| 10-4 | E2E tests not using merged-fixtures | New tests: `import { test } from '../support/fixtures/merged-fixtures'` |
| 10-4 | Missing assertNoErrorState | Call `assertNoErrorState(page)` after `page.goto()` |
| 10-5 | Dead component left in codebase | Delete old component immediately when replacing |
| 10-5 | Missing database column | Migration first → update types → update code |
| 10-5 | Story AC didn't match mockup | Update ACs after mockup alignment |
| 10-5 | TypeScript types not regenerated | Run `npx supabase gen types typescript` after migrations |

### Key Patterns from Epic 10

- **Dual email source:** `const email = request.guest_email || request.profiles?.email;`
- **Seed-fixture sync:** Every test fixture constant needs matching seed data
- **Timeline component:** 4-step timelines with status-contextual labels
- **Dead code rule:** Delete unused components immediately

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

### Story 11A-1: P10 Delivery Completion (2025-12-22)

**Issue:** Delivery completion button was disabled with "Coming soon" text, blocking CHAIN-1 E2E tests.

| Fix Applied | Pattern Used |
|------------|--------------|
| **Server Action pattern** | `completeDelivery(offerId)` in `src/lib/actions/delivery.ts` |
| **AlertDialog confirmation** | Standard shadcn/ui confirmation dialog before action |
| **Commission recording** | Integrated with existing `commission_ledger` table |
| **Dual notification paths** | In-app for registered consumers, email for guests |
| **data-testid for Playwright** | `complete-delivery-button` selector for reliable tests |

**Key Lesson:** When tests find disabled/placeholder features, create a gap story (Epic 11A) to track and fix them immediately.

---

### Story 11-2: CHAIN-1 Production Testing (2025-12-22)

**Issues Found & Fixed:**

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| **SECURITY DEFINER functions vulnerable** | `select_offer` and `update_updated_at_column` lacked `SET search_path` | Always add `SET search_path = public` to SECURITY DEFINER functions |
| **Migration drift local/production** | Migrations applied via Supabase dashboard with auto-generated timestamps | Always apply migrations via `supabase db push` or commit SQL files first |
| **Test credentials in story files** | Passwords hardcoded in markdown | Store in `.env.production.local`, reference in docs |
| **Production user IDs in git** | Baseline JSON committed with UUIDs | Add baseline files to `.gitignore` |

**Security Patterns:**

1. **SECURITY DEFINER functions must include:**
   ```sql
   CREATE OR REPLACE FUNCTION my_function()
   RETURNS ...
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public  -- REQUIRED for security
   AS $$ ... $$;
   ```

2. **Run security check after DB changes:**
   ```
   mcp__supabase__get_advisors type=security
   ```

3. **Production test data hygiene:**
   - Baseline files with user IDs → `.gitignore`
   - Passwords → `.env.production.local`
   - Never commit SERVICE_ROLE_KEY references

**Key Lesson:** Run Supabase security advisors after every migration to catch `function_search_path_mutable` and `rls_disabled_in_public` warnings immediately.

---

*Last verified: 2025-12-22 | Sources: Epic 3, Epic 8 retrospectives, Story 8-6, 8-7, 8-9, 8-10, 10-4, 10-5, 11-1, 11A-1, 11-2 implementations*
