# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story's `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-02 | 1-5 | 1 | TechDebt | Low | TBD | Open | Consider migrating middleware.ts to proxy pattern (Next.js 16 deprecation warning) |
| 2025-12-02 | 1-2 | 1 | Security | Medium | TBD | Open | Fix function `update_updated_at_column` mutable search_path ([docs](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)) |
| 2025-12-02 | 1-2 | 1 | Performance | Medium | TBD | Open | Optimize RLS policies to use `(select auth.uid())` pattern for better query performance ([docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)) |
