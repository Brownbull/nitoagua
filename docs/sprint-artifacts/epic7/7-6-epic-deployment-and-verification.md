# Story 7.6: Epic Deployment & Verification

| Field | Value |
|-------|-------|
| **Story ID** | 7-6 |
| **Epic** | Epic 7: Provider Onboarding |
| **Title** | Epic Deployment & Verification |
| **Status** | backlog |
| **Priority** | P1 (High) |
| **Points** | 2 |
| **Sprint** | TBD |

---

## User Story

As a **developer**,
I want **to deploy all Epic 7 (Story 7-1) changes through the git branching workflow and verify production with test users**,
So that **the provider registration flow is live and working for new water providers**.

---

## Background

Epic 7 introduces the Provider Onboarding system. Story 7-1 (Provider Registration Flow) is complete and includes:

- Multi-step onboarding wizard (welcome, personal, areas, documents, bank, review, pending)
- Google OAuth authentication for new providers
- Document upload to Supabase Storage
- Service area selection (comunas)
- Bank information collection with Chilean validations (RUT, phone)
- Profile creation with verification_status='pending'
- Admin notification on registration submission
- Verification status display with logout/refresh buttons

### Changes to Deploy

**New Files Created:**
- `src/app/provider/layout.tsx` - Orange-themed provider layout
- `src/app/provider/onboarding/` - 7 route pages
- `src/components/provider/onboarding/` - 8 components
- `src/lib/validations/provider-registration.ts` - Zod schemas
- `src/lib/actions/provider-registration.ts` - Server action
- `src/hooks/use-onboarding-progress.ts` - localStorage persistence
- `supabase/migrations/20251215113330_provider_onboarding.sql` - Database migration
- `scripts/production/seed-provider2-test-user.ts` - Test user script
- `tests/e2e/provider-registration.spec.ts` - 69 E2E tests

**Modified Files:**
- `src/components/auth/dev-login.tsx` - Added "New Supplier" option
- `src/app/(supplier)/layout.tsx` - Fixed redirect for users without profiles
- `src/app/auth/callback/route.ts` - Enhanced onboarding redirects

---

## Acceptance Criteria

### Deployment Criteria

1. **AC7.6.1**: All Epic 7 Story 7-1 changes committed to develop branch
2. **AC7.6.2**: Develop merged to staging, preview deployment verified
3. **AC7.6.3**: Staging merged to main, production deployment triggered
4. **AC7.6.4**: Production deployment successful (Vercel build passes)
5. **AC7.6.5**: Database migration applied (comunas, provider_service_areas tables)
6. **AC7.6.6**: Supabase Storage bucket `provider-documents` created with correct policies

### Production Verification Criteria

7. **AC7.6.7**: Provider registration welcome page loads at `/provider/onboarding`
8. **AC7.6.8**: Google OAuth initiates correctly from welcome page
9. **AC7.6.9**: Multi-step wizard navigates correctly (personal → areas → documents → bank → review)
10. **AC7.6.10**: Document upload works (uploads to Supabase Storage)
11. **AC7.6.11**: Form validations work (RUT, phone format, required fields)
12. **AC7.6.12**: Registration submission creates profile with verification_status='pending'
13. **AC7.6.13**: Admin receives notification of new registration
14. **AC7.6.14**: Pending status screen shows correctly with logout/refresh buttons
15. **AC7.6.15**: After admin approval, provider redirected to dashboard
16. **AC7.6.16**: No regression in existing consumer or supplier flows

---

## Tasks / Subtasks

- [ ] **Task 1: Pre-deployment Checks**
  - [ ] Run `npm run lint` - ensure no errors
  - [ ] Run `npm run build` - ensure build succeeds
  - [ ] Run E2E tests - ensure provider-registration tests pass
  - [ ] Verify provider onboarding works locally with dev login
  - [ ] Verify all onboarding steps accessible locally

- [ ] **Task 2: Database & Storage Setup**
  - [ ] Verify `provider-documents` storage bucket exists in Supabase
  - [ ] If not, create bucket via Supabase Dashboard:
    - Name: `provider-documents`
    - Public: false
    - File size limit: 10MB
    - Allowed MIME: image/jpeg, image/png, application/pdf
  - [ ] Apply database migration (comunas, provider_service_areas)
  - [ ] Verify RLS policies for storage bucket

- [ ] **Task 3: Git Commit & Push to Develop**
  - [ ] Review all changes with `git status` and `git diff`
  - [ ] Stage all Epic 7 Story 7-1 changes
  - [ ] Create commit with descriptive message
  - [ ] Push to develop branch
  - [ ] Verify Vercel preview deployment for develop branch

- [ ] **Task 4: Merge to Staging**
  - [ ] Checkout staging branch
  - [ ] Merge develop into staging
  - [ ] Push staging branch
  - [ ] Verify Vercel preview deployment for staging
  - [ ] Test staging deployment manually:
    - [ ] Provider welcome page loads
    - [ ] OAuth flow works
    - [ ] All form steps render correctly

- [ ] **Task 5: Merge to Main (Production)**
  - [ ] Checkout main branch
  - [ ] Merge staging into main
  - [ ] Push main branch
  - [ ] Monitor Vercel production deployment
  - [ ] Verify build completes successfully

- [ ] **Task 6: Production Verification with Test User**
  - [ ] **Create Test User:**
    - Run: `SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx ts-node scripts/production/seed-provider2-test-user.ts`
    - Creates `provider2@nitoagua.cl` / `provider2.123` (no profile)
  - [ ] **Test Registration Flow:**
    - Navigate to https://nitoagua.vercel.app/provider/onboarding
    - Verify welcome page displays requirements and benefits
    - Use dev login (if enabled) with provider2 test account
    - Complete personal info step (name, phone in +56 format)
    - Complete service areas step (select at least one comuna)
    - Complete document upload step (upload test images)
    - Complete bank info step (RUT validation works)
    - Review step shows all entered information
    - Submit registration
    - Verify redirect to pending status page
    - Verify logout and refresh buttons work
  - [ ] **Test Admin Verification:**
    - Login as admin at /admin/login
    - Navigate to /admin/verification
    - Verify new registration appears in queue
    - View provider documents
    - Approve the provider
  - [ ] **Test Post-Approval:**
    - Login as provider2 at /login
    - Verify redirect to /dashboard (approved provider)
    - Verify supplier dashboard loads correctly

- [ ] **Task 7: Regression Testing**
  - [ ] Test consumer guest flow (create water request)
  - [ ] Test consumer registered flow (login, history)
  - [ ] Test existing supplier flow (dashboard, accept request)
  - [ ] Test admin flows (login, dashboard, settings)
  - [ ] Verify no console errors on any page

- [ ] **Task 8: E2E Test Suite Verification**
  - [ ] Run full E2E test suite against production
  - [ ] Ensure provider-registration.spec.ts tests pass (69 tests)
  - [ ] Ensure no regression in other test suites

- [ ] **Task 9: Document Deployment**
  - [ ] Update story with deployment notes
  - [ ] Note any issues encountered and resolutions
  - [ ] Record production URLs verified
  - [ ] Update sprint-status.yaml

---

## Technical Notes

### Environment Variables Required in Production

| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Should exist |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Should exist |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Should exist |
| `NEXT_PUBLIC_DEV_LOGIN` | Dev login for testing | Optional (true for testing) |

### Test Users

| Email | Password | Purpose | Profile |
|-------|----------|---------|---------|
| provider2@nitoagua.cl | provider2.123 | Test onboarding | NO (goes through flow) |
| supplier@nitoagua.cl | supplier.123 | Existing supplier | YES (approved) |
| admin@nitoagua.cl | admin.123 | Admin verification | YES (in allowlist) |

### Branching Strategy

```
develop → staging → main
   ↓         ↓        ↓
preview   preview  production
```

### Production URLs to Test

| URL | Expected Behavior |
|-----|-------------------|
| `/provider/onboarding` | Welcome page with requirements |
| `/provider/onboarding/personal` | Personal info form (requires auth) |
| `/provider/onboarding/areas` | Service area selection |
| `/provider/onboarding/documents` | Document upload |
| `/provider/onboarding/bank` | Bank info form |
| `/provider/onboarding/review` | Review summary |
| `/provider/onboarding/pending` | Verification status |

### Supabase Storage Bucket Setup

If `provider-documents` bucket doesn't exist:

1. Go to Supabase Dashboard → Storage
2. Create new bucket:
   - Name: `provider-documents`
   - Public: OFF
   - File size limit: 10485760 (10MB)
3. Add RLS policies (from migration or manually):
   ```sql
   -- Providers can upload their own documents
   CREATE POLICY "Providers can upload own documents"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Providers can view their own documents
   CREATE POLICY "Providers can view own documents"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Admins can view all documents
   CREATE POLICY "Admins can view all documents"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'provider-documents');
   ```

---

## Dependencies

- **Requires:** Story 7-1 (Provider Registration Flow) - **DONE**
- **Requires:** Epic 6 deployed (Admin verification queue) - **DONE**
- **Enables:** Stories 7-2 through 7-5 can proceed after verification

---

## File List

| Action | File |
|--------|------|
| N/A | Deployment story - no new code changes (only verification) |

---

## Dev Agent Record

### Debug Log

*To be filled during implementation*

### Completion Notes

*To be filled after deployment*

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-15 | Story created for Epic 7 deployment | Claude |
