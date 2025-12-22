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