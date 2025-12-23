This is a super common issue with PWAs! The problem comes from a few sources:

**Why this happens:**

1. **Different aspect ratios** — iPhone 12 is 390×844 (19.5:9), S23 is ~360×780 depending on display settings (taller and narrower in CSS pixels)
2. **`100vh` lies on mobile** — it doesn't account for browser chrome, navigation bars, or the PWA's own status bar
3. **Fixed pixel values** — anything hardcoded won't adapt
4. **Chrome DevTools vs real devices** — the simulator doesn't perfectly replicate real viewport behavior

**Practical fixes:**

### 1. Use dynamic viewport units
```css
/* Instead of */
height: 100vh;

/* Use */
height: 100dvh; /* dynamic viewport height - adjusts for browser UI */
min-height: 100svh; /* small viewport - most conservative */
```

### 2. Make your layout flexible
```css
.screen-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden; /* prevent page scroll */
}

.header { flex-shrink: 0; }
.content { flex: 1; overflow-y: auto; } /* scrollable content area */
.footer { flex-shrink: 0; }
```

### 3. Use relative sizing for spacing
```css
/* Instead of fixed padding */
padding: 24px;

/* Use clamp or viewport-relative */
padding: clamp(12px, 3vw, 24px);
gap: min(16px, 2vh);
```

### 4. Set a CSS custom property for safe area
```css
:root {
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-nav {
  padding-bottom: calc(12px + var(--safe-bottom));
}
```

### 5. Quick debug trick
Add this temporarily to see what's overflowing:
```css
* { outline: 1px solid red; }
```

---

## Critical Lessons Learned (NitoAgua Implementation)

### What the research missed:

**1. `min-h-dvh` vs `h-dvh` - CRITICAL difference**
- `min-h-dvh` sets MINIMUM height - content can exceed and cause scrolling
- `h-dvh` sets EXACT height - constrains everything to viewport
- For screens that MUST NOT scroll (landing pages), use `h-dvh` + `overflow-hidden`
- Add `shrink-0` to header/footer sections so they don't collapse
- Use `flex-1` on main content area to fill remaining space

```jsx
// CORRECT - fits exactly in viewport
<div className="h-dvh flex flex-col overflow-hidden">
  <header className="shrink-0">...</header>
  <main className="flex-1 flex flex-col justify-center">...</main>
  <footer className="shrink-0">...</footer>
</div>
```

**1b. flex-1 spacers push content off screen**
- A `<div className="flex-1" />` spacer INSIDE main will push footer off viewport
- Use `justify-center` on the flex container instead of spacers
- Spacers work for centering within a FIXED container, not for viewport fitting

**2. Horizontal layouts save more vertical space than reducing padding**
```css
/* Instead of vertical list */
.benefits { flex-direction: column; gap: 16px; }

/* Use horizontal compact layout */
.benefits {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
```

**3. Orphaned flex children don't work**
```jsx
// BAD - flex-1 has no flex parent
function FallbackComponent() {
  return <div className="flex-1 flex items-center...">...</div>;
}

// GOOD - use min-h-dvh directly
function FallbackComponent() {
  return <div className="min-h-dvh flex items-center...">...</div>;
}
```

**4. Content reduction may be necessary**
- Remove redundant sections (e.g., trust indicators if benefits cover same info)
- Shorten text labels ("Proveedores verificados" → "Verificados")
- Reduce icon sizes (w-10 h-10 → w-9 h-9)
- Compact footer into single row instead of stacked

**5. Test on real devices, not just Chrome DevTools**
- DevTools doesn't perfectly replicate:
  - Android PWA status bar height
  - Samsung browser toolbar behavior
  - Dynamic keyboard appearing/disappearing
- Real Galaxy S23 has different behavior than "Samsung Galaxy S20 Ultra" preset

### Specific Tailwind patterns:

```css
/* Global safe area support */
.safe-area-bottom {
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}

/* Dynamic viewport height (Tailwind arbitrary value) */
min-h-[100dvh]  /* or add to tailwind.config.ts */

/* Fallback for Safari < 15.4 */
min-h-screen md:min-h-dvh  /* graceful degradation */
```

### When scrolling is acceptable:
- Request history (many items)
- Admin lists/tables
- Forms with many fields
- Detailed timelines

### When scrolling should be avoided:
- Landing/home screens
- Status screens
- Empty states
- Login/register forms

---

## Login Page Adaptability Fix (2025-12-22)

### Problem
Login page with DevLogin component (dev mode) didn't fit on Samsung S23 (360x780 CSS pixels). Required scrolling to see all content.

### Root Causes
1. **Layout used `min-h-dvh`** - allowed content to exceed viewport
2. **Large header** - `pt-8 pb-10` padding, `text-4xl` logo, `text-2xl` title
3. **Generous spacing** - `mt-8 pt-6` between sections, `space-y-4` in forms
4. **DevLogin adds ~250px** - role buttons + email/password fields + submit

### Solution: Compact Everything

**Auth Layout Changes:**
```jsx
// BEFORE
<div className="min-h-dvh flex flex-col">
  <header>...</header>
  <div className="flex-1 px-6 py-8">...</div>
</div>

// AFTER - Fixed viewport with internal scroll
<div className="h-dvh flex flex-col overflow-hidden">
  <div className="shrink-0">
    <header>...</header>
  </div>
  <div className="flex-1 px-5 py-4 overflow-y-auto">...</div>
</div>
```

**Header Compaction:**
| Element | Before | After | Savings |
|---------|--------|-------|---------|
| Padding | `pt-8 pb-10` | `pt-6 pb-6` | ~24px |
| Logo | `text-4xl mb-6` | `text-3xl mb-3` | ~20px |
| Title | `text-2xl mb-2` | `text-xl mb-1` | ~8px |
| Subtitle | `text-[15px]` | `text-sm` | ~2px |

**Form Compaction:**
| Element | Before | After | Savings |
|---------|--------|-------|---------|
| Section margins | `mt-6 pt-6` | `mt-4 pt-4` | ~16px |
| Button height | default | `h-8` / `h-9` | ~8px each |
| Form spacing | `space-y-4` | `space-y-2.5` | ~12px |
| Label spacing | `space-y-2` | `space-y-1` | ~8px |
| Input height | default | `h-9` | ~6px each |

**Total savings: ~100-120px** - now fits on S23 without scrolling

### Key Insight: Internal Scrolling
For pages with variable content (like login with optional DevLogin):
```jsx
// Parent: fixed to viewport
<div className="h-dvh flex flex-col overflow-hidden">
  // Header: never scrolls
  <div className="shrink-0">...</div>

  // Content: scrolls internally if needed
  <div className="flex-1 overflow-y-auto">
    {/* Content that might overflow on tiny screens */}
  </div>
</div>
```

This ensures:
- Header always visible
- Content scrolls only if absolutely necessary
- No page-level scroll bounce
- Works on all screen sizes

### Testing Setup
**Android Studio Emulator** (recommended for PWA testing):
- Works with Hyper-V/WSL2 via WHPX
- Select device with **Play Store icon** for WebAPK support
- Pixel 7 (1080x2400) similar to Galaxy S23 (1080x2340)

**Target viewports to test:**
| Device | CSS Pixels | Notes |
|--------|------------|-------|
| iPhone SE | 375x667 | Smallest common |
| Galaxy S23 | 360x780 | Android target |
| iPhone 12/13/14 | 390x844 | iOS standard |
| Pixel 7 | 412x915 | Android large |

---