# nitoagua Theme System & Visual Mockups

_Created: 2025-12-08_
_Author: UX Designer (Claude) with Gabe_

---

## 1. Theme Architecture

### 1.1 CSS Custom Properties Approach

We'll use CSS custom properties (variables) for theming, which allows:
- Runtime theme switching without page reload
- Easy addition of new themes
- Inheritance through component tree

```css
:root {
  /* Base semantic colors */
  --color-primary: #0077B6;
  --color-primary-hover: #006699;
  --color-background: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;

  /* Status colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Semantic UI colors */
  --color-nav-bg: var(--color-surface);
  --color-header-bg: var(--color-primary);
  --color-card-bg: var(--color-surface);
  --color-badge-bg: var(--color-primary);
}
```

### 1.2 Theme Storage

```typescript
// lib/theme.ts
type ThemeName = 'light' | 'dark' | 'ghibli-totoro' | 'ghibli-howl' | 'ghibli-kuni';

const THEME_KEY = 'nitoagua-theme';

export function getTheme(): ThemeName {
  return localStorage.getItem(THEME_KEY) as ThemeName || 'light';
}

export function setTheme(theme: ThemeName) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}
```

---

## 2. Theme Definitions

### 2.1 Light Theme (Current/Default)

```css
[data-theme="light"] {
  --color-primary: #0077B6;
  --color-primary-hover: #006699;
  --color-background: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;

  /* Water theme accents */
  --color-accent-1: #E0F2FE; /* Light blue */
  --color-accent-2: #BAE6FD; /* Sky blue */
}
```

### 2.2 Dark Theme

```css
[data-theme="dark"] {
  --color-primary: #38BDF8;
  --color-primary-hover: #7DD3FC;
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;

  /* Dark water accents */
  --color-accent-1: #0C4A6E;
  --color-accent-2: #075985;
}
```

### 2.3 Ghibli Theme: Totoro Forest

_Inspired by: My Neighbor Totoro - soft greens, earthy browns, magical forest_

```css
[data-theme="ghibli-totoro"] {
  --color-primary: #4A7C59;      /* Forest green */
  --color-primary-hover: #3D6B4A;
  --color-background: #F5F2E8;   /* Warm cream */
  --color-surface: #FFFEF7;      /* Soft white */
  --color-text-primary: #2D3B29; /* Dark forest */
  --color-text-secondary: #5C6B55;
  --color-border: #D4CDB8;

  /* Totoro accents */
  --color-accent-1: #8FB996;     /* Soft green */
  --color-accent-2: #C4B896;     /* Earthy tan */
  --color-accent-3: #7BA3A8;     /* Pond blue */

  /* Special */
  --color-magic: #A8D8EA;        /* Magical glow */
}
```

### 2.4 Ghibli Theme: Howl's Moving Castle

_Inspired by: Howl's Moving Castle - warm golds, steampunk brass, sunset hues_

```css
[data-theme="ghibli-howl"] {
  --color-primary: #C17F59;      /* Copper/brass */
  --color-primary-hover: #A66B47;
  --color-background: #FDF6E3;   /* Parchment */
  --color-surface: #FFFBF0;      /* Cream white */
  --color-text-primary: #3D2914; /* Dark brown */
  --color-text-secondary: #6B5344;
  --color-border: #E8D5B7;

  /* Howl accents */
  --color-accent-1: #F4A460;     /* Sandy gold */
  --color-accent-2: #DEB887;     /* Burlywood */
  --color-accent-3: #87CEEB;     /* Sky blue (Howl's eyes) */

  /* Special */
  --color-fire: #FF6B35;         /* Calcifer orange */
  --color-magic: #7B68EE;        /* Purple magic */
}
```

### 2.5 Ghibli Theme: Ni no Kuni

_Inspired by: Ni no Kuni - vibrant storybook colors, whimsical, hand-painted feel_

```css
[data-theme="ghibli-kuni"] {
  --color-primary: #4169E1;      /* Royal blue */
  --color-primary-hover: #3457CD;
  --color-background: #FFF8E7;   /* Warm paper */
  --color-surface: #FFFFFF;
  --color-text-primary: #1A1A2E; /* Deep navy */
  --color-text-secondary: #4A4A6A;
  --color-border: #E0D5C7;

  /* Ni no Kuni accents */
  --color-accent-1: #FF6B6B;     /* Coral red */
  --color-accent-2: #4ECDC4;     /* Teal */
  --color-accent-3: #FFE66D;     /* Golden yellow */
  --color-accent-4: #95E1D3;     /* Mint */

  /* Special */
  --color-magic: #DDA0DD;        /* Plum magic */
  --color-fairy: #98FB98;        /* Fairy green */
}
```

---

## 3. Component Visual Changes

### 3.1 Unified Navigation Design

**Proposed: Consistent Bottom Navigation for Both Roles**

```
+------------------------------------------+
|  [Logo] nitoagua          [Bell] [User]  |  <- Optional top bar (minimal)
+------------------------------------------+
|                                          |
|              Page Content                |
|                                          |
+------------------------------------------+
|  [Home]    [Requests]    [Profile]       |  <- Bottom nav (both roles)
+------------------------------------------+
```

**Consumer Nav Items:**
- Home (Droplets icon)
- Historial (Clock icon) + unread badge
- Perfil (User icon)

**Supplier Nav Items:**
- Panel (LayoutDashboard icon)
- Solicitudes (Package icon) + pending badge
- Perfil (User icon)

### 3.2 BigActionButton Animation

**Current:** Static water droplet

**Proposed Animations:**

1. **Idle State:**
   - Subtle pulse animation (scale 1.0 -> 1.02 -> 1.0)
   - Water droplet icon has gentle bob
   - Optional: tiny ripple effect every 3 seconds

2. **Hover/Focus State:**
   - Scale up slightly (1.05)
   - Glow effect around button
   - Water ripples appear

3. **Tap/Active State:**
   - Ripple animation from touch point
   - Scale down briefly (0.95) then up
   - Water splash effect

4. **Loading State:**
   - Spinning water droplet
   - Or: filling water animation

```css
@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes water-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(2.5); opacity: 0; }
}
```

### 3.3 Page Transitions

**Recommended: Framer Motion**

```tsx
// components/layout/page-transition.tsx
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

### 3.4 Card Hover Effects

```css
.card-interactive {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-interactive:active {
  transform: translateY(0);
}
```

### 3.5 Status Timeline Animation

**Current:** Static checkmarks and lines

**Proposed:**
- Steps animate in sequentially on page load
- Current step has pulse animation
- Completed steps have checkmark draw animation
- Line between steps fills progressively

```css
@keyframes check-draw {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}

@keyframes step-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 119, 182, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 119, 182, 0); }
}
```

---

## 4. Background Particles (Optional Enhancement)

### 4.1 Water Particles

Subtle floating particles that look like small water droplets or bubbles.

**Implementation Options:**

1. **CSS-only (Performant):**
   - Multiple absolutely positioned divs
   - CSS animation for floating motion
   - Opacity and blur for depth

2. **Canvas-based (More Control):**
   - React component with canvas
   - Particle system with physics
   - Can respond to user interaction

3. **Library (Easiest):**
   - `tsparticles` or `particles.js`
   - Pre-built water/bubble presets

**Recommendation:** CSS-only for performance, with option to disable in settings.

```css
.water-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(0,119,182,0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-10px) translateX(-5px);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-30px) translateX(15px);
    opacity: 0.3;
  }
}
```

---

## 5. Theme Switcher Component

### 5.1 Location

Add to Profile page for both consumer and supplier.

### 5.2 Design

```
+------------------------------------------+
|  Apariencia                              |
+------------------------------------------+
|                                          |
|  Tema                                    |
|  +----+ +----+ +----+ +----+ +----+     |
|  |Light| |Dark| |Tot.| |Howl| |Kuni|    |
|  | [o] | | [] | | [] | | [] | | [] |    |
|  +----+ +----+ +----+ +----+ +----+     |
|                                          |
|  Vista previa:                           |
|  +----------------------------------+    |
|  |  [Mini preview of selected theme]|    |
|  +----------------------------------+    |
|                                          |
+------------------------------------------+
```

### 5.3 Component Structure

```tsx
// components/settings/theme-selector.tsx
const themes = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Oscuro', icon: Moon },
  { id: 'ghibli-totoro', name: 'Bosque', icon: TreePine },
  { id: 'ghibli-howl', name: 'Castillo', icon: Castle },
  { id: 'ghibli-kuni', name: 'Cuento', icon: Sparkles },
];
```

---

## 6. Implementation Priority

### Phase 1: Foundation
1. Set up CSS custom properties system
2. Implement light/dark mode toggle
3. Add theme context provider

### Phase 2: Core Themes
4. Implement Ghibli Totoro theme
5. Implement Ghibli Howl theme
6. Implement Ni no Kuni theme
7. Add theme selector to profile

### Phase 3: Animations
8. Add page transitions (Framer Motion)
9. Add BigActionButton animations
10. Add card hover effects
11. Add status timeline animations

### Phase 4: Polish
12. Add background particles (optional)
13. Add reduced motion support
14. Add theme preview component
15. Persist theme preference

---

## 7. Accessibility Considerations

- All themes must maintain WCAG 2.1 AA contrast ratios
- Add `prefers-reduced-motion` media query support
- Animations should be subtle, not distracting
- Provide option to disable particles/animations
- Theme names should be in Spanish for consistency

---

## 8. Technical Dependencies

**New packages needed:**
```json
{
  "framer-motion": "^10.x",
  "next-themes": "^0.2.x" // Optional, for SSR theme handling
}
```

**Or implement custom theme solution to avoid dependencies.**

---

_This document serves as the visual design specification for the theme system and animations. Implementation details will be refined during development._
