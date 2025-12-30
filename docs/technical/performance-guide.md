# Performance Guide

This guide documents the performance optimization patterns and practices established in Epic 12.5 for the NitoAgua application.

**Last Updated:** 2025-12-29 (v2.2.0)
**Epic:** 12.5 Performance Optimization

---

## Overview

NitoAgua is a Next.js 15 application with Supabase backend. This guide covers optimization patterns for:

1. **Database Performance** - RLS policies and indexing
2. **Bundle Size** - Code splitting and dynamic imports
3. **React Rendering** - Memoization patterns
4. **Build Tools** - Development and production optimization

---

## 1. Database Performance

### 1.1 RLS Policy Optimization

**Problem:** Direct `auth.uid()` calls in RLS policies cause per-row re-evaluation.

**Solution:** Always wrap in subquery:

```sql
-- BAD (slow - re-evaluated per row)
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- GOOD (fast - evaluated once per query)
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING ((select auth.uid()) = user_id);
```

**Impact:** 10-50% faster authenticated queries.

**Applied:** 32 policies across 8 tables (Story 12.5-3).

### 1.2 Foreign Key Indexing

**Rule:** Every foreign key column should have an index.

```sql
-- Check for missing indexes
SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
  );
```

**Impact:** Faster JOINs and lookup queries.

**Applied:** 10 indexes added (Story 12.5-3).

### 1.3 Query Patterns

**Select Specific Columns:**
```typescript
// BAD
const { data } = await supabase.from('users').select('*');

// GOOD
const { data } = await supabase
  .from('users')
  .select('id, name, email, created_at');
```

**Parallel Queries:**
```typescript
// BAD - Sequential
const users = await supabase.from('users').select();
const orders = await supabase.from('orders').select();

// GOOD - Parallel
const [users, orders] = await Promise.all([
  supabase.from('users').select(),
  supabase.from('orders').select()
]);
```

---

## 2. Bundle Size Optimization

### 2.1 Dynamic Imports

**Rule:** Large libraries used on specific pages should be dynamically imported.

```typescript
// BAD - Loaded on every page
import confetti from 'canvas-confetti';

// GOOD - Loaded only when needed
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('canvas-confetti'), {
  ssr: false
});
```

**Applied to:**
- `canvas-confetti` - Success pages only
- `leaflet/react-leaflet` - Map pages only

### 2.2 Zod Locales Exclusion

**Problem:** Zod v4 bundles all locales (~200KB).

**Solution:** Exclude via webpack alias in `next.config.ts`:

```typescript
// next.config.ts
webpack: (config) => {
  config.resolve.alias['zod/v4/locales'] = false;
  return config;
}
```

**Impact:** ~200KB reduction.

### 2.3 Icon Imports

**Rule:** Import icons individually from lucide-react:

```typescript
// BAD - May include entire package
import { icons } from 'lucide-react';

// GOOD - Tree-shakeable
import { Home, Settings, User } from 'lucide-react';
```

### 2.4 Bundle Budget

A CI script validates bundle sizes:

```bash
npm run build && npm run build:check-size
```

**Current Budgets:**
- Total static chunks: < 3.5 MB
- Largest single chunk: < 250 KB

---

## 3. React Rendering Optimization

### 3.1 Memoization Patterns

**When to Use `memo`:**
- List item components
- Components receiving stable props but in re-rendering parent
- Components with expensive render logic

```typescript
// List items should always be memoized
export const ListItem = memo(function ListItem({ item }: Props) {
  return <div>{item.name}</div>;
});
```

**When to Use `useMemo`:**
- Expensive computations
- Object/array creation that's passed as props

```typescript
const computed = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**When to Use `useCallback`:**
- Event handlers passed to child components
- Functions used in dependency arrays

```typescript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 3.2 Applied Components

| Component | Optimization | Reason |
|-----------|-------------|--------|
| `CountdownTimer` | memo + useCallback | Frequent updates |
| `OfferCard` | memo | List item |
| `RequestCard` | memo + useMemo | List item + computed |
| `StatusBadge` | memo | Frequent updates |
| `NotificationItem` | memo | List item |
| `ProviderRequestCard` | memo + useMemo | List item + computed |

---

## 4. Build & Development

### 4.1 Package Manager

**Decision:** npm (not pnpm or Bun)

**Rationale:**
- Already performant (<1s dev startup, 20s build)
- 1,000+ hours of cached CI installs
- No migration risk

### 4.2 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Dev server startup | < 1s | Excellent |
| HMR response | ~53ms | Excellent |
| Production build | ~20s | Good |

### 4.3 Bundle Analysis

To analyze bundle composition:

```bash
npm run analyze
```

Opens `.next/analyze/client.html` with dependency visualization.

---

## 5. Monitoring & Validation

### 5.1 CI Checks

```bash
# After build, validate bundle size
npm run build:check-size
```

### 5.2 Page Performance

Key pages to monitor:

| Page | Target TTFB | Type |
|------|-------------|------|
| `/` | < 50ms | Static |
| `/request` | < 50ms | Static |
| `/login` | < 800ms | SSR |
| `/admin/dashboard` | < 1000ms | SSR + Auth |

### 5.3 Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance Score | > 80 |
| LCP | < 2.5s |
| FCP | < 1.8s |
| CLS | < 0.1 |

---

## 6. Anti-Patterns to Avoid

### Database
- Direct `auth.uid()` in RLS policies
- `SELECT *` queries
- Sequential data fetching
- Missing foreign key indexes

### Bundle
- Importing entire icon packages
- Static imports of large libraries
- Including unused locales/translations

### React
- Unmemoized list items
- Inline object/array creation in props
- Missing dependency arrays in hooks

---

## 7. Quick Reference

### Commands

```bash
# Analyze bundle
npm run analyze

# Check bundle budget
npm run build:check-size

# Development
npm run dev

# Production build
npm run build
```

### Key Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Webpack aliases, bundle config |
| `scripts/check-bundle-size.js` | CI budget validation |
| `docs/technical/performance-guide.md` | This document |
| `docs/sprint-artifacts/epic12.5/performance-results.md` | Optimization results |

---

*Created as part of Story 12.5-6 Performance Validation & Documentation*
