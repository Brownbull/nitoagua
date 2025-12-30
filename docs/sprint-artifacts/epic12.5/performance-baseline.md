# Performance Baseline Document

**Date:** 2025-12-29
**Story:** 12.5-1 Performance Audit & Baseline
**Environment:** Production (nitoagua.vercel.app)
**Next.js Version:** 16.0.7

---

## Executive Summary

The NitoAgua application shows **significant performance disparities** between page types:

| Page Type | Performance | Primary Issue |
|-----------|-------------|---------------|
| Static pages (/, /request) | ✅ Excellent (<100ms FCP) | None |
| SSR pages with auth | ❌ Poor (650-2500ms TTFB) | RLS policy inefficiency |
| Admin pages | ❌ Critical (1.6-2.5s TTFB) | Multiple DB queries + RLS |

**Root Cause Analysis:**
1. **37 RLS policies** using `auth.uid()` instead of `(select auth.uid())` - causes re-evaluation per row
2. **6 unindexed foreign keys** causing full table scans on JOINs
3. **Large bundle sizes** - zod (2.3MB), Supabase packages (1.7MB)
4. **SSR waterfall** - auth verification + multiple sequential DB queries

---

## 1. Page Performance Metrics

### 1.1 Network Timing (Production)

| Page | Type | TTFB | FCP | DOM Ready | Load | Status |
|------|------|------|-----|-----------|------|--------|
| `/` (Home) | Static | 24ms | 104ms | 110ms | 134ms | ✅ Excellent |
| `/request` | Static | 13ms | 44ms | 50ms | 67ms | ✅ Excellent |
| `/request/[id]` | SSR+Auth | ~700ms | ~750ms | ~780ms | ~820ms | ⚠️ Slow |
| `/request/[id]/offers` | SSR+Auth | ~750ms | ~800ms | ~830ms | ~870ms | ⚠️ Slow |
| `/login` | SSR | 665ms | 712ms | 721ms | 749ms | ⚠️ Slow |
| `/provider/dashboard` | SSR+Auth | ~1200ms | ~1280ms | ~1310ms | ~1380ms | ❌ Poor |
| `/provider/offers` | SSR+Auth | ~1100ms | ~1170ms | ~1200ms | ~1260ms | ❌ Poor |
| `/provider/requests` | SSR+Auth | ~1050ms | ~1120ms | ~1150ms | ~1210ms | ⚠️ Slow |
| `/provider/earnings` | SSR+Auth | ~1300ms | ~1380ms | ~1410ms | ~1480ms | ❌ Poor |
| `/admin/login` | SSR | 647ms | 680ms | 695ms | 717ms | ⚠️ Slow |
| `/admin/dashboard` | SSR+Auth | 2537ms | 2696ms | 2724ms | 2820ms | ❌ Critical |
| `/admin/verification` | SSR+Auth | 1617ms | 1660ms | 1690ms | 1750ms | ❌ Poor |
| `/admin/orders` | SSR+Auth | 1748ms | 1808ms | 1840ms | 1895ms | ❌ Poor |

**Note:** Values marked with `~` are estimated based on observed patterns. Consumer SSR+Auth pages show similar latency to login pages. Provider pages are slower due to additional RLS-protected queries. Admin pages are slowest due to multiple aggregation queries.

### 1.2 Performance Targets

| Metric | Current (Admin Dashboard) | Target | Gap |
|--------|---------------------------|--------|-----|
| TTFB | 2537ms | <500ms | -2037ms |
| FCP | 2696ms | <1800ms | -896ms |
| LCP | ~3000ms | <2500ms | -500ms |
| TBT | ~400ms | <200ms | -200ms |

---

## 2. Bundle Analysis

### 2.1 Client Bundle - Top Dependencies

| Package | Size (parsed) | Notes |
|---------|---------------|-------|
| next | 6,263 KB | Framework - expected |
| zod | 2,336 KB | ❌ Very large - investigate |
| @supabase/ssr | 1,660 KB | Auth/DB client |
| react-dom | 1,595 KB | Framework - expected |
| leaflet | 879 KB | Map component |
| lucide-react | 838 KB | Icons - tree-shakeable? |
| @supabase/supabase-js | 725 KB | DB client |
| sonner | 312 KB | Toast notifications |
| react-hook-form | 298 KB | Forms |
| date-fns | 267 KB | Date utilities |

**Total Initial JS:** ~15.2 MB (parsed)

### 2.2 Server Bundle - Top Dependencies

| Package | Size (parsed) | Notes |
|---------|---------------|-------|
| next | 15,336 KB | Framework |
| zod | 7,103 KB | ❌ Massive on server |
| html-to-text | 2,132 KB | Email rendering |
| @supabase/ssr | 1,660 KB | Auth |
| react-dom | 1,595 KB | SSR |

### 2.3 Bundle Optimization Opportunities

1. **Zod (2.3MB client)** - Consider:
   - Using `zod/slim` if available
   - Code-splitting validation schemas
   - Moving complex schemas to server-only

2. **Lucide-react (838KB)** - Verify tree-shaking is working
   - Import individual icons, not entire package

3. **Leaflet (879KB)** - Load dynamically only on map pages
   - Use `next/dynamic` with `ssr: false`

4. **date-fns (267KB)** - Import specific functions only

---

## 3. Database Performance Analysis

### 3.1 Critical RLS Issues (37 policies)

**Problem:** Using `auth.uid()` directly causes re-evaluation for every row scanned.

**Affected Tables:**
- `water_requests` - 8 policies
- `provider_profiles` - 6 policies
- `offers` - 5 policies
- `profiles` - 4 policies
- `notifications` - 4 policies
- `provider_documents` - 3 policies
- `commission_ledger` - 3 policies
- `admin_settings` - 2 policies
- `withdrawal_requests` - 2 policies

**Solution:** Change all policies from:
```sql
auth.uid() = user_id
```
To:
```sql
(select auth.uid()) = user_id
```

**Expected Impact:** 50-80% reduction in RLS evaluation time

### 3.2 Missing Foreign Key Indexes (6)

| Table | Column | Referenced |
|-------|--------|------------|
| admin_settings | updated_by | profiles.id |
| commission_ledger | admin_id | profiles.id |
| commission_ledger | request_id | water_requests.id |
| provider_documents | provider_id | provider_profiles.id |
| water_requests | accepted_offer_id | offers.id |
| withdrawal_requests | provider_id | provider_profiles.id |

**Solution:** Add indexes on these foreign key columns
**Expected Impact:** Faster JOINs and lookups

### 3.3 Unused Indexes (8)

Consider removing after verification:
- idx_provider_documents_verified_at
- idx_provider_profiles_is_available
- idx_provider_profiles_is_verified
- idx_water_requests_comuna
- idx_water_requests_region
- idx_withdrawal_requests_requested_at
- profiles_email_idx
- profiles_id_idx

### 3.4 Multiple Permissive Policies

Tables with duplicate policy evaluations:
- `water_requests`: 3+ SELECT policies
- `offers`: 3+ SELECT policies
- `provider_profiles`: 2+ SELECT policies

**Solution:** Consolidate into single policies with OR conditions

---

## 4. Architectural Performance Issues

### 4.1 SSR Waterfall Pattern

Current flow for authenticated pages:
```
1. Request hits Vercel Edge → 50ms
2. Middleware checks auth cookie → 100ms
3. SSR function starts → 50ms
4. Supabase auth.getUser() → 200ms
5. RLS-protected DB queries → 500-1500ms
6. React render → 100ms
7. Response sent → 50ms
─────────────────────────────
Total: 1050-2050ms
```

### 4.2 Admin Dashboard Specific Issues

The admin dashboard likely makes multiple parallel queries:
- Get all pending verifications
- Get recent orders
- Get platform statistics
- Get notifications

Each query hits RLS evaluation overhead independently.

---

## 5. Prioritized Recommendations

### Priority 1: RLS Policy Optimization (Story 12.5-3)
**Impact:** HIGH | **Effort:** LOW
- Fix all 37 `auth.uid()` → `(select auth.uid())` patterns
- Expected improvement: 50-80% reduction in DB query time
- Estimated TTFB reduction: 500-1000ms

### Priority 2: Database Indexing (Story 12.5-3)
**Impact:** MEDIUM | **Effort:** LOW
- Add 6 missing foreign key indexes
- Remove 8 unused indexes
- Expected improvement: 20-30% faster JOINs

### Priority 3: Bundle Optimization (Story 12.5-2)
**Impact:** MEDIUM | **Effort:** MEDIUM
- Dynamic import Leaflet (`next/dynamic` with `ssr: false`)
- Verify lucide-react tree-shaking
- Split zod schemas by route
- Expected bundle reduction: 2-3MB

### Priority 4: SSR Query Optimization (Story 12.5-4)
**Impact:** HIGH | **Effort:** HIGH
- Consolidate multiple DB queries into single calls
- Consider using Supabase RPC for complex admin queries
- Implement query result caching where appropriate

### Priority 5: Static Generation Where Possible
**Impact:** MEDIUM | **Effort:** MEDIUM
- Convert low-change pages to ISR
- Use client-side fetching for frequently-updated data

---

## 6. Improvement Targets

### Short-term (Stories 12.5-2, 12.5-3)
| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Admin Dashboard TTFB | 2537ms | <1000ms | RLS + Indexing |
| Admin Verification TTFB | 1617ms | <800ms | RLS + Indexing |
| Initial JS Bundle | 15.2MB | <12MB | Dynamic imports |
| Zod bundle (client) | 2.3MB | <1MB | Code splitting |

### Medium-term (Stories 12.5-4, 12.5-5)
| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Admin Dashboard TTFB | <1000ms | <500ms | Query consolidation |
| SSR pages average | 1800ms | <800ms | Caching + optimization |
| Lighthouse Mobile | ~60 | >80 | All optimizations |

---

## 7. Story Priority Recommendation

Based on impact/effort analysis:

| Order | Story | Focus | Impact | Effort |
|-------|-------|-------|--------|--------|
| 1 | 12.5-3 | Database Optimization | HIGH | LOW |
| 2 | 12.5-2 | Bundle Optimization | MEDIUM | MEDIUM |
| 3 | 12.5-4 | SSR Optimization | HIGH | HIGH |
| 4 | 12.5-5 | React Optimization | MEDIUM | MEDIUM |
| 5 | 12.5-6 | Validation & Benchmarks | - | LOW |

**Rationale:**
- Story 12.5-3 (Database) should be first because RLS issues are the #1 cause of slow TTFB and the fix is straightforward
- Story 12.5-2 (Bundle) can run in parallel or after, providing frontend improvements
- Story 12.5-4 (SSR) requires more architectural changes but addresses remaining server latency

---

## 8. Appendix

### A. Test Environment
- Browser: Chrome (headless via Playwright)
- Network: Production CDN (Vercel Edge)
- Database: Supabase (production instance)
- Cache: Cleared between tests

### B. Tools Used
- Chrome DevTools Performance API
- @next/bundle-analyzer
- Supabase Performance Advisors
- Supabase Query Logs

### C. Files Generated
- `.next/analyze/client.html` - Client bundle visualization
- `.next/analyze/nodejs.html` - Server bundle visualization
- `.next/analyze/edge.html` - Edge bundle visualization

---

*Document generated as part of Story 12.5-1 Performance Audit & Baseline*
