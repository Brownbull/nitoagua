# Story 1.5: Deployment Pipeline

Status: ready-for-dev

## Story

As a **developer**,
I want **automatic deployment to Vercel on git push**,
so that **changes are deployed to production automatically**.

## Acceptance Criteria

1. **AC1.5.1**: Repository connected to Vercel (GitHub integration enabled)
2. **AC1.5.2**: Push to main branch triggers automatic build and deployment
3. **AC1.5.3**: Build includes TypeScript compilation and ESLint checks (both must pass)
4. **AC1.5.4**: Environment variables configured in Vercel dashboard (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
5. **AC1.5.5**: Preview deployments created automatically for pull requests
6. **AC1.5.6**: Production URL accessible with HTTPS (automatic via Vercel)

## Tasks / Subtasks

- [ ] **Task 1: Connect Repository to Vercel** (AC: 1, 5)
  - [ ] Log in to Vercel dashboard (create account if needed)
  - [ ] Import project from GitHub repository
  - [ ] Select the `nitoagua` repository
  - [ ] Configure framework preset as Next.js (should auto-detect)
  - [ ] Verify GitHub integration shows repository connected
  - [ ] Test: Vercel dashboard shows project linked to repository

- [ ] **Task 2: Configure Environment Variables** (AC: 4)
  - [ ] Navigate to Project Settings > Environment Variables in Vercel
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (Production + Preview + Development)
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview + Development)
  - [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (Production only - server-side)
  - [ ] Verify variables are marked as encrypted where appropriate
  - [ ] Test: Environment variables visible in dashboard (values hidden)

- [ ] **Task 3: Trigger Initial Production Deployment** (AC: 2, 3, 6)
  - [ ] Push any commit to main branch (or trigger manual deploy)
  - [ ] Monitor build logs in Vercel dashboard
  - [ ] Verify TypeScript compilation completes without errors
  - [ ] Verify ESLint checks pass
  - [ ] Wait for deployment to complete
  - [ ] Test: Build log shows successful completion

- [ ] **Task 4: Verify Production URL** (AC: 6)
  - [ ] Navigate to the production URL provided by Vercel
  - [ ] Verify HTTPS certificate is valid (lock icon in browser)
  - [ ] Verify application loads correctly
  - [ ] Test health by navigating to key routes
  - [ ] Document the production URL for team reference

- [ ] **Task 5: Test Preview Deployments** (AC: 5)
  - [ ] Create a test branch from main
  - [ ] Make a minor change (e.g., comment or whitespace)
  - [ ] Open a pull request to main
  - [ ] Verify Vercel creates a preview deployment
  - [ ] Navigate to preview URL and verify it works
  - [ ] Close the test PR (merge or close without merging)
  - [ ] Test: Preview URL is accessible with HTTPS

- [ ] **Task 6: Configure Build Settings (Optional Optimization)** (AC: 3)
  - [ ] Review Build & Development Settings in Vercel
  - [ ] Ensure build command is `npm run build`
  - [ ] Ensure output directory is `.next`
  - [ ] Ensure install command uses `npm install`
  - [ ] Test: Verify settings match expected configuration

- [ ] **Task 7: Documentation and Verification** (AC: 1-6)
  - [ ] Document production URL in project README or docs
  - [ ] Verify all acceptance criteria are met
  - [ ] Take screenshots of Vercel dashboard for reference
  - [ ] Test: Full end-to-end deployment flow works

## Dev Notes

### Technical Context

This is Story 1.5 in Epic 1: Foundation & Infrastructure. It establishes the CI/CD pipeline using Vercel's automatic deployment capabilities. This completes the foundation epic by enabling continuous deployment, making it possible for subsequent stories to be deployed immediately after completion.

**Architecture Alignment:**
- Deployment to Vercel matches Architecture spec [Source: docs/architecture.md#Deployment-Architecture]
- Environment setup for Development, Preview, Production [Source: docs/architecture.md#Environment-Setup]
- Automatic HTTPS and CDN from Vercel [Source: docs/architecture.md#Vercel-Configuration]

**Key Technical Decisions:**
- Using Vercel's GitHub integration for automatic deployments
- Environment variables stored in Vercel dashboard (not in repository)
- Preview deployments enabled for all pull requests
- No custom domain required for MVP (Vercel's default domain is sufficient)

### Environment Variables Required

Per Architecture specification [Source: docs/architecture.md#Environment-Variables]:

```bash
# Required in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Server-side only
```

**Important:** `SUPABASE_SERVICE_ROLE_KEY` should be added to Production environment only, not Preview, to prevent accidental exposure in preview deployments.

### Vercel Configuration Details

From Architecture [Source: docs/architecture.md#Vercel-Configuration]:

- **Edge Network**: CDN for static assets
- **Serverless Functions**: API routes and SSR
- **Static Assets**: Automatic optimization
- **SSL/TLS**: Automatic HTTPS on all deployments
- **DDoS Protection**: Built-in

### NFR Compliance

- **NFR14**: Target 99% uptime during business hours - Vercel provides high availability
- **NFR1**: < 3s initial load - Vercel Edge Network and CDN help achieve this

### Project Structure Notes

**No Files to Create:** This story is primarily configuration work in the Vercel dashboard.

**Files to Potentially Modify:**
- `README.md` - Add production URL documentation
- `vercel.json` - Only if custom configuration needed (not expected for MVP)

**Alignment with Architecture:**
- Matches deployment architecture from architecture.md [Source: docs/architecture.md#Deployment-Architecture]
- Uses Vercel's default Next.js configuration

### Learnings from Previous Story

**From Story 1-4-pwa-configuration (Status: review)**

- **Build Verified**: `npm run build` passes with ~656KB total static assets - production-ready
- **PWA Files**: Service worker and manifest in place - will be included in Vercel deployment
- **Test Suite**: 9 E2E tests exist - build should include test step if configured
- **Layout Updated**: `src/app/layout.tsx` includes PWA metadata that must be preserved
- **Lint Fixed**: ESLint passes after fixture file fix - build should complete cleanly
- **Note**: Firefox/Webkit test issues are environment-specific, not code issues - Vercel deployment should work

**Files Created by Previous Stories (must be deployed):**
- `src/app/manifest.ts` - PWA manifest
- `public/icons/` - PWA icons
- `public/sw.js` - Service worker
- `src/lib/supabase/` - Supabase clients
- `src/middleware.ts` - Auth middleware
- `supabase/migrations/` - Database schema

[Source: docs/sprint-artifacts/1-4-pwa-configuration.md#Dev-Agent-Record]

### Manual Steps Required

This story requires manual interaction with the Vercel dashboard:
1. Log in to Vercel (vercel.com)
2. Import project from GitHub
3. Configure environment variables
4. Verify deployments

No programmatic/CLI automation is required for MVP, but `vercel` CLI can be used if preferred.

### Testing Strategy

Per Architecture testing approach [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Test-Strategy-Summary]:

- **Build verification**: Must pass `npm run build` on Vercel
- **URL accessibility**: Production URL loads without errors
- **HTTPS verification**: Valid SSL certificate
- **Preview verification**: PR creates working preview deployment

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.5-Deployment-Pipeline]
- [Source: docs/architecture.md#Deployment-Architecture]
- [Source: docs/architecture.md#Environment-Setup]
- [Source: docs/architecture.md#Vercel-Configuration]
- [Source: docs/epics.md#Story-1.5-Deployment-Pipeline]
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-5-deployment-pipeline.context.xml](docs/sprint-artifacts/1-5-deployment-pipeline.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-02 | SM Agent | Story drafted from tech spec and epics |
| 2025-12-02 | Story Context Workflow | Context file generated, status → ready-for-dev |
