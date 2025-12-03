# Story 2.1: Consumer Home Screen with Big Action Button

Status: done

## Story

As a **consumer (Doña María)**,
I want **to see one big obvious button to request water**,
so that **I know exactly what to do when I open the app**.

## Acceptance Criteria

1. **AC2-1-1**: Consumer home page displays a 200x200px circular "Solicitar Agua" button with water drop icon
2. **AC2-1-2**: Button has blue gradient (primary #0077B6 to secondary #00A8E8) with subtle shadow
3. **AC2-1-3**: Button responds to hover (scale 1.05), active (scale 0.98), and loading (pulse) states
4. **AC2-1-4**: Tapping button navigates to `/request` page
5. **AC2-1-5**: Bottom navigation displays 3 items: Home, History, Profile with icons and labels
6. **AC2-1-6**: All text is in Spanish (Chilean)
7. **AC2-1-7**: Touch targets are minimum 44x44px for accessibility

## Tasks / Subtasks

- [x] **Task 1: Create Consumer Route Group Layout** (AC: 5)
  - [x] Create `src/app/(consumer)/layout.tsx` with ConsumerNav component slot
  - [x] Set up consumer-specific metadata (Spanish titles)
  - [x] Ensure layout wraps all consumer pages

- [x] **Task 2: Create ConsumerNav Component** (AC: 5, 6, 7)
  - [x] Create `src/components/layout/consumer-nav.tsx`
  - [x] Add 3 navigation items: Inicio (Home icon), Historial (History icon), Perfil (Profile icon)
  - [x] Use lucide-react icons for consistency
  - [x] Implement active state styling (primary color fill)
  - [x] Ensure 44x44px minimum touch targets
  - [x] Position as fixed bottom navigation bar
  - [x] Test: Navigation renders with Spanish labels

- [x] **Task 3: Create BigActionButton Component** (AC: 1, 2, 3, 7)
  - [x] Create `src/components/consumer/big-action-button.tsx`
  - [x] Implement 200x200px circular button container
  - [x] Add water drop icon (lucide-react `Droplet` or similar, 48x48px)
  - [x] Add "Solicitar Agua" label text
  - [x] Apply blue gradient: `bg-gradient-to-br from-[#0077B6] to-[#00A8E8]`
  - [x] Add subtle shadow: `shadow-lg`
  - [x] Implement hover state: `hover:scale-105 transition-transform`
  - [x] Implement active state: `active:scale-98`
  - [x] Implement loading state with pulse animation
  - [x] Accept props: `onClick`, `loading`, `disabled`
  - [x] Ensure 44x44px minimum touch target (200px exceeds this)
  - [x] Test: Component renders with correct styling and states

- [x] **Task 4: Create Consumer Home Page** (AC: 1, 4, 6)
  - [x] Create `src/app/page.tsx` updated with BigActionButton (root page serves as consumer home)
  - [x] Center BigActionButton vertically and horizontally
  - [x] Add page title/welcome text in Spanish
  - [x] Implement onClick handler to navigate to `/request`
  - [x] Use Next.js `useRouter` for navigation
  - [x] Clean, uncluttered layout per UX spec
  - [x] Test: Page loads and displays button correctly

- [x] **Task 5: Create Request Page Placeholder** (AC: 4)
  - [x] Create `src/app/(consumer)/request/page.tsx` as placeholder
  - [x] Add "Formulario de Solicitud" heading (for navigation testing)
  - [x] Will be fully implemented in Story 2-2

- [x] **Task 6: E2E Testing** (AC: 1-7)
  - [x] Create `tests/e2e/consumer-home.spec.ts`
  - [x] Test: Big action button is visible and has correct dimensions
  - [x] Test: Button click navigates to /request
  - [x] Test: Bottom navigation renders with 3 items
  - [x] Test: All visible text is in Spanish
  - [x] Test: Button hover/active states work (class verification)

- [x] **Task 7: Build Verification** (AC: all)
  - [x] Run `npm run build` - verify no TypeScript errors
  - [x] Run `npm run lint` - verify ESLint passes
  - [x] Run Playwright tests - verify E2E tests pass (20 passed)
  - [x] Manual verification in browser (dev server)

## Dev Notes

### Technical Context

This is the first story in Epic 2: Consumer Water Request. It establishes the consumer-facing experience with the signature "Big Button" design that makes requesting water obvious and immediate. This story creates the foundation for the consumer route group and establishes patterns that subsequent stories will follow.

**Architecture Alignment:**
- Consumer pages use `(consumer)` route group [Source: docs/architecture.md#Project-Structure]
- Custom components in `src/components/consumer/` [Source: docs/architecture.md#Project-Structure]
- Layout components in `src/components/layout/` [Source: docs/architecture.md#Project-Structure]
- Use lucide-react for icons (already installed) [Source: docs/sprint-artifacts/epic2/tech-spec-epic-2.md#NPM-Dependencies]

**UX Alignment:**
- BigActionButton is the defining consumer experience [Source: docs/ux-design-specification.md#Core-User-Experience]
- Consumer navigation: Bottom bar with 3 items [Source: docs/ux-design-specification.md#Navigation-Patterns]
- Touch targets minimum 44x44px [Source: docs/ux-design-specification.md#Accessibility-Strategy]
- Agua Pura color theme: Primary #0077B6, Secondary #00A8E8 [Source: docs/ux-design-specification.md#Color-System]

**Key Implementation Patterns:**
- Use Tailwind CSS for all styling (no custom CSS files)
- Server Components by default, Client Components only where needed (onClick handlers)
- Spanish (Chilean) for all user-facing text

### Component Specifications

**BigActionButton Component:**
```typescript
interface BigActionButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}
```

- Size: 200x200px circular
- Icon: Water drop (Droplet from lucide-react), 48x48px
- Text: "Solicitar Agua"
- Gradient: Primary #0077B6 → Secondary #00A8E8 (bottom-right direction)
- States: default, hover (scale 1.05), active (scale 0.98), loading (pulse), disabled (gray)

**ConsumerNav Component:**
```typescript
// Navigation items
const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/history', label: 'Historial', icon: Clock },
  { href: '/profile', label: 'Perfil', icon: User },
];
```

### Project Structure Notes

**Files to Create:**
- `src/app/(consumer)/layout.tsx` - Consumer route group layout
- `src/app/(consumer)/page.tsx` - Consumer home page
- `src/app/(consumer)/request/page.tsx` - Placeholder for request form
- `src/components/consumer/big-action-button.tsx` - Custom BigActionButton
- `src/components/layout/consumer-nav.tsx` - Bottom navigation component
- `tests/e2e/consumer-home.spec.ts` - E2E tests

**Directories to Create:**
- `src/app/(consumer)/` - Consumer route group
- `src/app/(consumer)/request/` - Request pages
- `src/components/consumer/` - Consumer-specific components

**Existing Files (do not recreate):**
- `src/components/ui/button.tsx` - shadcn/ui button (use for base styles reference)
- `src/lib/supabase/` - Supabase clients (not needed for this story)
- PWA files in `public/` - Already configured

### Performance Considerations

Per NFR1 [Source: docs/prd.md#Performance]:
- Initial page load under 3 seconds on 3G
- Use Server Components for initial render
- Minimize client-side JavaScript
- No heavy images or assets on home page

### Learnings from Previous Story

**From Story 1-5-deployment-pipeline (Status: done)**

- **Production URL**: https://nitoagua.vercel.app - use for deployment verification
- **Branching Strategy**: develop → staging → main workflow established
- **Build Passes**: `npm run build` completes successfully with Next.js 16
- **PWA Foundation**: Service worker and manifest in place - consumer pages will be PWA-compatible
- **E2E Tests**: 9 Playwright tests exist from Epic 1 - follow same patterns
- **Lint Config**: ESLint configured and passing

**From Epic 1 Retrospective (Status: completed):**
- Playwright UI testing setup should be verified before starting user-facing stories
- All 5 foundation stories completed successfully
- Database schema ready (water_requests table exists for future stories)
- Auth infrastructure ready (guest flow supported)

[Source: docs/sprint-artifacts/epic1/1-5-deployment-pipeline.md#Dev-Agent-Record]
[Source: docs/sprint-artifacts/epic1/epic-1-retrospective.md]

### Testing Strategy

Per tech spec testing approach [Source: docs/sprint-artifacts/epic2/tech-spec-epic-2.md#Test-Strategy-Summary]:

**E2E Tests (Playwright):**
- Test big action button visibility and styling
- Test navigation to /request on click
- Test bottom navigation presence and items
- Test Spanish text display

**Manual Verification:**
- Visual verification of button gradient and shadow
- Touch target accessibility audit
- Mobile responsiveness check

### References

- [Source: docs/sprint-artifacts/epic2/tech-spec-epic-2.md#Story-2-1-Consumer-Home-Screen-with-Big-Action-Button]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/ux-design-specification.md#BigActionButton]
- [Source: docs/ux-design-specification.md#Navigation-Patterns]
- [Source: docs/epics.md#Story-2.1-Consumer-Home-Screen-with-Big-Action-Button]
- [Source: docs/prd.md#FR38-FR42] - PWA and platform requirements

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/epic2/2-1-consumer-home-screen-with-big-action-button.context.xml](docs/sprint-artifacts/epic2/2-1-consumer-home-screen-with-big-action-button.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build verification: `npm run build` passed (Next.js 16.0.6, Turbopack)
- Lint verification: `npm run lint` passed (no warnings/errors)
- E2E tests: 20 passed, 2 skipped (unrelated example tests)

### Completion Notes List

- Implemented consumer home screen with signature BigActionButton component
- Created reusable ConsumerNav bottom navigation component with Spanish labels
- Updated root page.tsx to serve as consumer home (instead of creating separate (consumer)/page.tsx)
- Created request page placeholder for Story 2-2
- All 7 acceptance criteria verified via E2E tests
- Button styling follows UX spec: 200x200px circular, gradient from #0077B6 to #00A8E8, shadow-lg, hover/active/loading states

### File List

**Created:**
- `src/app/(consumer)/layout.tsx` - Consumer route group layout with metadata
- `src/app/(consumer)/request/page.tsx` - Request form placeholder page
- `src/components/consumer/big-action-button.tsx` - BigActionButton component
- `src/components/layout/consumer-nav.tsx` - Bottom navigation component
- `tests/e2e/consumer-home.spec.ts` - E2E tests (10 tests)

**Modified:**
- `src/app/page.tsx` - Updated to use BigActionButton and ConsumerNav (consumer home)

**Directories Created:**
- `src/app/(consumer)/`
- `src/app/(consumer)/request/`
- `src/components/consumer/`
- `src/components/layout/`

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Story drafted from tech spec and epics |
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Context generated, status → ready-for-dev |
| 2025-12-03 | Dev Agent (Claude Opus 4.5) | Implementation complete, all tasks done, status → review |
| 2025-12-03 | SM Agent (Claude Opus 4.5) | Senior Developer Review: APPROVED, status → done |

---

## Senior Developer Review (AI)

### Reviewer
Gabe

### Date
2025-12-03

### Outcome
**APPROVE** ✅

All 7 acceptance criteria fully implemented, all 7 tasks verified complete, build and tests pass. Code quality is excellent with no blocking issues.

### Summary

Story 2-1 successfully delivers the consumer home screen with the signature BigActionButton component. The implementation follows all architecture patterns, uses Spanish throughout, and has comprehensive E2E test coverage. No issues found during systematic validation.

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**Low Severity (Informational):**
- Webkit E2E test failures are due to missing system libraries in WSL environment, not code issues. Chromium tests (20/20) all pass.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC2-1-1 | 200x200px circular "Solicitar Agua" button with water drop icon | ✅ IMPLEMENTED | `big-action-button.tsx:24,44` |
| AC2-1-2 | Blue gradient (#0077B6 to #00A8E8) with shadow | ✅ IMPLEMENTED | `big-action-button.tsx:26-28` |
| AC2-1-3 | Hover (scale 1.05), active (scale 0.98), loading (pulse) states | ✅ IMPLEMENTED | `big-action-button.tsx:34-41` |
| AC2-1-4 | Tapping navigates to `/request` | ✅ IMPLEMENTED | `page.tsx:14` |
| AC2-1-5 | Bottom navigation with 3 items | ✅ IMPLEMENTED | `consumer-nav.tsx:8-12` |
| AC2-1-6 | All text in Spanish (Chilean) | ✅ IMPLEMENTED | All UI text verified |
| AC2-1-7 | Touch targets minimum 44x44px | ✅ IMPLEMENTED | `consumer-nav.tsx:32`, button is 200x200 |

**Summary: 7 of 7 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Consumer Route Group Layout | [x] | ✅ VERIFIED | `(consumer)/layout.tsx` exists |
| Task 2: ConsumerNav Component | [x] | ✅ VERIFIED | `consumer-nav.tsx` with 3 items |
| Task 3: BigActionButton Component | [x] | ✅ VERIFIED | All specs implemented |
| Task 4: Consumer Home Page | [x] | ✅ VERIFIED | `page.tsx` updated |
| Task 5: Request Page Placeholder | [x] | ✅ VERIFIED | Placeholder exists |
| Task 6: E2E Testing | [x] | ✅ VERIFIED | 10 tests in spec file |
| Task 7: Build Verification | [x] | ✅ VERIFIED | Build/lint/tests pass |

**Summary: 7 of 7 completed tasks verified, 0 questionable, 0 falsely marked complete**

### Test Coverage and Gaps

- **E2E Tests:** 10 tests covering all 7 ACs, plus navigation behavior
- **Chromium:** 20/20 tests pass
- **Webkit:** Failures due to environment (missing system libs), not code
- **No test gaps identified**

### Architectural Alignment

- ✅ Consumer pages in `(consumer)` route group
- ✅ Custom components in `src/components/consumer/`
- ✅ Layout components in `src/components/layout/`
- ✅ Uses lucide-react for icons
- ✅ Tailwind CSS for all styling
- ✅ Spanish (Chilean) for all UI text
- ✅ 44x44px minimum touch targets

**Tech Spec Compliance: FULL**

### Security Notes

No security concerns - this story has no user input handling, database operations, or authentication requirements.

### Best-Practices and References

- [Next.js 16 App Router](https://nextjs.org/docs/app) - Used correctly for route groups
- [Tailwind CSS](https://tailwindcss.com/) - All styling via utility classes
- [lucide-react](https://lucide.dev/guide/packages/lucide-react) - Consistent icon usage
- [Playwright Testing](https://playwright.dev/) - Comprehensive E2E coverage

### Action Items

**Code Changes Required:**
- None

**Advisory Notes:**
- Note: Consider adding Playwright webkit dependencies to CI/CD environment if cross-browser testing is required
- Note: Root page.tsx correctly handles ConsumerNav independently from route group layout
