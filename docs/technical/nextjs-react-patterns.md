# Next.js & React Patterns

This document outlines best practices for Next.js App Router and React components, with special attention to hydration safety and performance.

## Hydration Safety (React Error #418)

React error #418 occurs when server-rendered HTML doesn't match client-rendered HTML during hydration. This causes UI flicker, broken interactivity, and console errors.

### Common Causes & Solutions

#### 1. Time-Based Values (Most Common)

**Problem:** Functions like `formatDistanceToNow()`, `new Date()`, or `Date.now()` produce different values on server vs client.

```typescript
// BAD: Server and client will have different timestamps
export function RequestCard({ request }) {
  const timeAgo = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
    locale: es,
  });

  return <span>{timeAgo}</span>; // "hace 2 minutos" vs "hace 3 minutos"
}
```

**Solution:** Move time calculations to `useEffect`:

```typescript
// GOOD: Render empty on server, calculate on client after mount
"use client";

import { useState, useEffect } from "react";

export function RequestCard({ request }) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    setTimeAgo(
      formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale: es,
      })
    );
  }, [request.created_at]);

  return <span>{timeAgo}</span>; // Empty on server, filled on client
}
```

#### 2. URL Search Params

**Problem:** `useSearchParams()` returns different values during SSR vs client hydration.

```typescript
// BAD: Server renders with no searchParams, client has them
export function Tabs({ defaultTab }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultTab;

  return <TabsList value={currentTab}>...</TabsList>;
}
```

**Solution:** Use `hasMounted` pattern to delay client-specific values:

```typescript
// GOOD: Use default during SSR, read params only after mount
"use client";

export function Tabs({ defaultTab }) {
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Use defaultTab during SSR to match server HTML
  const currentTab = hasMounted
    ? searchParams.get("tab") || defaultTab
    : defaultTab;

  return <TabsList value={currentTab}>...</TabsList>;
}
```

#### 3. Random Values

**Problem:** `Math.random()`, `crypto.randomUUID()`, etc. produce different values on each render.

```typescript
// BAD: Different ID on server vs client
const id = `element-${Math.random().toString(36).slice(2)}`;
```

**Solution:** Use `useId()` hook or generate IDs in `useEffect`:

```typescript
// GOOD: React's useId ensures consistent hydration
import { useId } from "react";

const id = useId();
```

#### 4. Browser-Only APIs

**Problem:** `window`, `localStorage`, `navigator` don't exist during SSR.

```typescript
// BAD: ReferenceError on server
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
```

**Solution:** Check for browser environment or use `useEffect`:

```typescript
// GOOD: Only access browser APIs after mount
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
  setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
}, []);
```

### Quick Checklist for Hydration Safety

Before using any of these in component render, wrap in `useEffect`:

- [ ] `new Date()`, `Date.now()`
- [ ] `formatDistanceToNow()`, `format()` with relative times
- [ ] `Math.random()`, `crypto.randomUUID()`
- [ ] `window.*`, `document.*`, `navigator.*`
- [ ] `localStorage`, `sessionStorage`
- [ ] `useSearchParams().get()` for conditional rendering
- [ ] Any external data that changes between server and client

---

## Tab Navigation Performance

### Problem: Slow/Stuck Tab Switching

Using `router.refresh()` on every tab change causes:
- Full server round-trip for each click
- UI freezing while waiting for response
- Unnecessary data re-fetching when data is already loaded

```typescript
// BAD: Triggers server refresh on every tab change
const handleTabChange = (value: string) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("tab", value);
  router.push(`?${params.toString()}`);
  router.refresh(); // This causes slowness!
};
```

### Solution: URL-Only Updates

When data is already loaded in props (from server component), only update the URL:

```typescript
// GOOD: Instant tab switching, no server round-trip
const handleTabChange = (value: string) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("tab", value);

  // Use replace() to avoid history stack buildup
  // Don't call refresh() - data is already in props
  router.replace(`?${params.toString()}`, { scroll: false });
};
```

### When to Use Each Router Method

| Method | Use Case | Effect |
|--------|----------|--------|
| `router.push()` | Navigate to new page | Adds history entry, may use cache |
| `router.replace()` | Update URL without history | No history entry, good for tabs/filters |
| `router.refresh()` | Force server data reload | Re-runs server components, clears cache |
| `router.prefetch()` | Preload route in background | Speeds up future navigation |

### Tab State Architecture

For tabs with pre-loaded data:

```typescript
// Server Component (page.tsx)
export default async function DashboardPage() {
  // Fetch ALL tab data server-side
  const [pending, accepted, completed] = await Promise.all([
    fetchPendingRequests(),
    fetchAcceptedRequests(),
    fetchCompletedRequests(),
  ]);

  return (
    <DashboardTabs
      pendingRequests={pending}
      acceptedRequests={accepted}
      completedRequests={completed}
    />
  );
}

// Client Component (dashboard-tabs.tsx)
"use client";

export function DashboardTabs({ pendingRequests, acceptedRequests, completedRequests }) {
  // Data is already loaded - just switch views client-side
  // Only update URL to allow bookmarking/sharing
}
```

---

## Optimistic Updates

For actions that modify data (accept, deliver, cancel), use optimistic updates for instant UI feedback:

```typescript
const [optimisticallyAccepted, setOptimisticallyAccepted] = useState<Set<string>>(new Set());

// Clear optimistic state when fresh server data arrives
useEffect(() => {
  setOptimisticallyAccepted(new Set());
}, [pendingRequests]); // Props change = server data refreshed

const handleAccept = async (requestId: string) => {
  // 1. Optimistic update - instant UI feedback
  setOptimisticallyAccepted(prev => new Set(prev).add(requestId));

  try {
    await fetch(`/api/requests/${requestId}`, { method: "PATCH", ... });

    // 2. Success - refresh server data
    router.refresh();
  } catch (error) {
    // 3. Rollback on failure
    setOptimisticallyAccepted(prev => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
    toast.error("Error");
  }
};

// Filter out optimistically handled items
const visibleRequests = pendingRequests.filter(
  r => !optimisticallyAccepted.has(r.id)
);
```

---

## References

- [React Hydration Error #418](https://react.dev/errors/418)
- [Next.js App Router Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [useSearchParams Documentation](https://nextjs.org/docs/app/api-reference/functions/use-search-params)

---

*Last updated: 2025-12-07 (Dashboard hydration & performance fixes)*
