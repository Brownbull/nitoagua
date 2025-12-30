# Tech Spec: Epic 12.5 - Performance Optimization

**Epic:** 12.5 - Performance Optimization
**Author:** PM (John) + Gabe
**Date:** 2025-12-28
**Status:** Draft

---

## 1. Overview

Epic 12.5 addresses application-wide performance issues affecting all user types. Users report multi-second delays on every page load and interaction, even on high-end devices (Samsung S23) and desktop browsers. This is a diagnostic-first initiative: measure and identify bottlenecks before applying targeted optimizations.

**Problem Statement:**
- All pages load slowly (multi-second delays)
- Every navigation feels "overloaded" with visible delays
- User interactions require waiting seconds for response
- Issue is present across consumer, provider, and admin interfaces
- Happening on both mobile (Samsung S23) and desktop

**Core Value:** Transform a sluggish application into a responsive, fast experience where page loads feel instant, interactions are snappy, and the PWA feels like a native app.

---

## 2. Current Technical Context

### 2.1 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.0.7 |
| React | React | 19.2.1 |
| Database | Supabase (PostgreSQL) | - |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui (Radix) | - |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Icons | lucide-react | 0.555.0 |
| Forms | react-hook-form + zod | 7.67.0 / 4.1.13 |
| Email | Resend + react-email | 6.5.2 / 5.0.5 |
| Testing | Playwright | 1.57.0 |

### 2.2 Current Route Structure

Based on build output, routes are divided into:

**Static Routes (prerendered):**
- `/request` (new request form entry)
- `/settings` (consumer settings)

**Dynamic Routes (server-rendered on demand):**
- Consumer: `/`, `/request/[id]`, `/request/[id]/confirmation`, `/request/[id]/offers`, `/track/[token]`
- Provider: `/provider/dashboard`, `/provider/offers`, `/provider/earnings`, `/provider/deliveries/[id]`, `/provider/settings/*`, `/provider/onboarding/*`
- Admin: `/admin/dashboard`, `/admin/orders`, `/admin/orders/[id]`, `/admin/providers`, `/admin/verification`

### 2.3 Key Dependencies to Audit

| Package | Size Risk | Notes |
|---------|-----------|-------|
| `lucide-react` | HIGH | Icon library - may import entire set |
| `leaflet` + `react-leaflet` | HIGH | Map library - heavy JS |
| `date-fns` | MEDIUM | Date library - tree-shakeable |
| `@radix-ui/*` | LOW | Individual packages, good tree-shaking |
| `react-email` | LOW | Dev/server only |
| `canvas-confetti` | LOW | Small, lazy-loadable |

---

## 3. Performance Audit Targets

### 3.1 Priority Pages by User Type

**Consumer (P0):**
1. Home page (`/`) - First impression, most traffic
2. Request Form (`/request`) - Core flow entry
3. Request Status (`/request/[id]`) - Frequent polling
4. Offer Selection (`/request/[id]/offers`) - Critical decision point

**Provider (P0):**
1. Dashboard (`/provider/dashboard`) - Landing page
2. Offers List (`/provider/offers`) - Frequent access
3. Request Browser (`/provider/requests`) - Core workflow
4. Earnings (`/provider/earnings`) - Data-heavy

**Admin (P1):**
1. Dashboard (`/admin/dashboard`) - Overview
2. Verification Queue (`/admin/verification`) - Frequent use
3. Orders (`/admin/orders`) - Data-heavy list

### 3.2 Target Metrics

| Metric | Current (Estimate) | Target | Tool |
|--------|-------------------|--------|------|
| Lighthouse Performance | Unknown | ≥ 80 | Lighthouse |
| First Contentful Paint (FCP) | Unknown | < 1.8s | Lighthouse |
| Largest Contentful Paint (LCP) | Unknown | < 2.5s | Lighthouse |
| Total Blocking Time (TBT) | Unknown | < 300ms | Lighthouse |
| Cumulative Layout Shift (CLS) | Unknown | < 0.1 | Lighthouse |
| Initial JS Bundle | Unknown | < 200KB | Bundle Analyzer |
| Time to Interactive (TTI) | Unknown | < 3.8s | Lighthouse |

---

## 4. Potential Optimization Areas

### 4.1 Bundle Size (Story 12.5.2)

**Suspected Issues:**
- Icon library importing entire set
- Map library loaded on non-map pages
- Unused dependencies in bundle

**Potential Fixes:**
- Dynamic import for Leaflet maps
- Tree-shake lucide-react icons
- Remove unused dependencies
- Route-based code splitting verification

### 4.2 Data Fetching (Story 12.5.3)

**Suspected Issues:**
- Waterfall fetches (sequential instead of parallel)
- Over-fetching (SELECT * patterns)
- Missing database indexes
- Heavy RLS policy evaluation
- No client-side caching

**Potential Fixes:**
- Parallel data fetching with Promise.all
- Select only needed columns
- Add indexes on filtered columns
- Optimize RLS policies
- Implement React Query/SWR caching

### 4.3 React Rendering (Story 12.5.4)

**Suspected Issues:**
- Excessive re-renders from context providers
- Missing memoization on expensive computations
- Inline function definitions in JSX
- Large lists without virtualization

**Potential Fixes:**
- useMemo/useCallback for expensive operations
- React.memo for pure components
- Split context providers
- Virtualize long lists (react-window)

### 4.4 Build & Dev Performance (Story 12.5.5)

**Suspected Issues:**
- Slow npm install times
- Slow hot reload

**Potential Fixes:**
- Evaluate pnpm or Bun for faster installs
- Optimize TypeScript configuration
- NOTE: This does NOT affect user-facing performance

---

## 5. Measurement Tools & Approach

### 5.1 Tools

| Tool | Purpose | When |
|------|---------|------|
| Lighthouse (Chrome DevTools) | Overall performance score | Story 12.5.1 |
| `@next/bundle-analyzer` | Bundle size analysis | Story 12.5.1 |
| Chrome DevTools Network | Waterfall analysis | Story 12.5.1 |
| Chrome DevTools Performance | JS execution profiling | Story 12.5.1 |
| React DevTools Profiler | Component render analysis | Story 12.5.1 |
| Supabase Studio Logs | Query performance | Story 12.5.1 |
| `EXPLAIN ANALYZE` | RLS policy overhead | Story 12.5.1 |

### 5.2 Test Conditions (Reproducible)

- Clear browser cache before each test
- Use Chrome Incognito mode
- Test on production (nitoagua.vercel.app)
- Mobile preset: Moto G4 (default Lighthouse mobile)
- Desktop preset: Standard Lighthouse desktop
- Network: No throttling (measure real conditions)

---

## 6. Story Dependencies

```
12.5.1 (Audit) ─────────────────────────────────┐
      │                                          │
      ├──→ 12.5.2 (Bundle) ────────────────────→│
      │                                          │
      ├──→ 12.5.3 (Data Fetching) ─────────────→├──→ 12.5.6 (Validation)
      │                                          │
      ├──→ 12.5.4 (React Rendering) ───────────→│
      │                                          │
      └──→ 12.5.5 (Build/Dev) ─────────────────→│
           (Lower priority, can skip)
```

**Critical Path:**
1. Story 12.5.1 MUST complete first (provides data for all others)
2. Stories 12.5.2, 12.5.3, 12.5.4 can run in parallel (based on findings)
3. Story 12.5.5 is optional/lower priority
4. Story 12.5.6 MUST complete last (validates all improvements)

---

## 7. Success Criteria

### 7.1 Quantitative

- [ ] Lighthouse Performance score ≥ 80 on all priority pages
- [ ] LCP < 2.5s on all priority pages
- [ ] Initial JS bundle < 200KB
- [ ] No individual page fetch time > 500ms
- [ ] Before/after metrics documented

### 7.2 Qualitative

- [ ] Samsung S23 user experience feels responsive
- [ ] Desktop Chrome user experience feels instant
- [ ] No visible "loading" states > 1s on navigation
- [ ] Interactions respond immediately (< 100ms perceived)

### 7.3 Regression Prevention

- [ ] Bundle size budget enforced in CI
- [ ] Performance documentation for future development
- [ ] Anti-patterns documented to avoid

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Root cause is Supabase cold starts | HIGH | Document, consider edge functions |
| Bundle already optimized | MEDIUM | Focus on data fetching instead |
| Fixes break existing functionality | HIGH | Run full E2E suite after each story |
| Vercel free tier limits | MEDIUM | Monitor, upgrade if needed |

---

## 9. Out of Scope

- Server-side infrastructure changes (Vercel plan upgrades)
- Database schema migrations (unless critical for performance)
- Complete rewrites of major features
- Mobile app native implementation
- CDN configuration changes

---

## 10. References

- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/query-optimization)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

---

_Tech Spec created 2025-12-28 - Performance Optimization Initiative_
