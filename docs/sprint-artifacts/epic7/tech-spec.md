# Epic 7: Provider Onboarding - Technical Specification

## Overview

Epic 7 enables new water providers (aguateros) to self-register, upload verification documents, and progress through the admin verification process. This epic is essential for marketplace growth as it removes the manual onboarding bottleneck.

### Business Context

- **Target Users:** Water providers in rural Araucanía region (Villarrica, Pucón, etc.)
- **Core Value:** Self-service registration reduces admin overhead and accelerates provider onboarding
- **Verification:** Admins review documents via Epic 6's verification queue (already implemented)

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 6: Admin Operations Panel | DONE | Verification queue (6-3), Provider directory (6-4) |
| Supabase Storage | Available | `provider-documents` bucket needed |
| Google OAuth | Configured | Existing auth system |

---

## Story Inventory

| Story | Title | Priority | Points | Status |
|-------|-------|----------|--------|--------|
| 7-1 | Provider Registration Flow | P1 | 8 | done |
| 7-2 | Verification Status Screen | P1 | 3 | drafted |
| 7-3 | Service Area Configuration | P2 | 2 | drafted |
| 7-4 | Provider Availability Toggle | P2 | 2 | drafted |
| 7-5 | Provider Document Management | P2 | 3 | drafted |
| 7-6 | Epic Deployment & Verification | P1 | 2 | drafted |

**Total Points:** 20

---

## Technical Architecture

### Route Structure

```
src/app/(provider)/
├── layout.tsx                  # Provider layout with nav
├── onboarding/
│   ├── page.tsx               # Step 1: Welcome + Google OAuth
│   ├── personal/page.tsx      # Step 2: Personal info
│   ├── areas/page.tsx         # Step 3: Service areas
│   ├── documents/page.tsx     # Step 4: Document upload
│   ├── bank/page.tsx          # Step 5: Bank details
│   ├── review/page.tsx        # Step 6: Review & submit
│   └── pending/page.tsx       # Waiting for verification
├── dashboard/page.tsx         # Main provider dashboard
├── settings/page.tsx          # Service areas, availability
└── profile/
    ├── page.tsx               # Profile view/edit
    └── documents/page.tsx     # Document management
```

### Component Structure

```
src/components/provider/
├── onboarding/
│   ├── welcome-screen.tsx     # Welcome + requirements
│   ├── personal-form.tsx      # Name, phone, photo
│   ├── service-area-picker.tsx # Multi-select comunas
│   ├── document-upload.tsx    # File upload with preview
│   ├── bank-form.tsx          # Bank account details
│   ├── review-summary.tsx     # Final review
│   └── progress-indicator.tsx # Step progress bar
├── verification-status.tsx    # Status display with actions
├── availability-toggle.tsx    # Online/offline toggle
└── document-list.tsx          # Document management list
```

### Database Tables Used

#### `profiles` (Extended)

```sql
-- Provider-specific fields already in profiles:
verification_status: 'pending' | 'approved' | 'rejected' | 'more_info_needed'
is_available: boolean (default false)
bank_name: text
bank_account: text
role: 'provider' (set during registration)
```

#### `provider_documents`

```sql
CREATE TABLE provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cedula', 'licencia', 'permiso_sanitario', 'certificacion', 'vehiculo')),
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id)
);
```

#### `provider_service_areas`

```sql
CREATE TABLE provider_service_areas (
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comuna_id TEXT REFERENCES comunas(id),
  PRIMARY KEY (provider_id, comuna_id)
);
```

#### `comunas` (Pre-seeded)

```sql
-- Already seeded from architecture.md:
-- villarrica, pucon, lican-ray, curarrehue, freire
```

### Supabase Storage Configuration

```typescript
// Bucket: provider-documents (private, RLS-protected)
// Path structure: {provider_id}/{document_type}_{timestamp}.{ext}
// Example: abc123-def456/cedula_1702500000.jpg

// RLS Policy: Providers can only upload/view their own documents
// Admin Policy: Admins can view all documents (for verification)
```

---

## API Endpoints

### Provider Registration

```typescript
// POST /api/provider/register
// Creates profile with role='provider', verification_status='pending'
interface RegisterProviderRequest {
  name: string;
  phone: string;
  service_areas: string[];  // comuna_ids
  bank_name: string;
  bank_account: string;
}
```

### Document Upload

```typescript
// POST /api/provider/documents
// Uploads to Supabase Storage, creates provider_documents record
interface UploadDocumentRequest {
  type: 'cedula' | 'licencia' | 'permiso_sanitario' | 'certificacion' | 'vehiculo';
  file: File;
}
```

### Service Areas

```typescript
// GET /api/provider/service-areas
// Returns provider's current service areas

// PUT /api/provider/service-areas
// Updates service area selection
interface UpdateServiceAreasRequest {
  comuna_ids: string[];  // At least one required
}
```

### Availability Toggle

```typescript
// PUT /api/provider/availability
// Updates is_available flag
interface UpdateAvailabilityRequest {
  is_available: boolean;
}
```

---

## Server Actions

```typescript
// src/lib/actions/provider-registration.ts
'use server';

export async function submitProviderRegistration(data: ProviderRegistrationData);
export async function uploadProviderDocument(formData: FormData);
export async function updateServiceAreas(comunaIds: string[]);
export async function toggleAvailability(isAvailable: boolean);
export async function resubmitDocuments(formData: FormData);
```

---

## Validation Schemas

```typescript
// src/lib/validations/provider-registration.ts
import { z } from 'zod';

export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  phone: z.string().regex(/^\+?56?\d{9}$/, 'Formato: +56912345678'),
});

export const serviceAreasSchema = z.object({
  comuna_ids: z.array(z.string()).min(1, 'Selecciona al menos una comuna'),
});

export const bankInfoSchema = z.object({
  bank_name: z.string().min(1, 'Selecciona un banco'),
  account_type: z.enum(['corriente', 'vista', 'ahorro']),
  account_number: z.string().min(5, 'Número de cuenta inválido'),
  rut: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, 'Formato: 12.345.678-9'),
});

export const documentUploadSchema = z.object({
  cedula: z.instanceof(File).refine(f => f.size < 10_000_000, 'Máximo 10MB'),
  permiso_sanitario: z.instanceof(File).refine(f => f.size < 10_000_000, 'Máximo 10MB'),
  vehiculo: z.instanceof(File).refine(f => f.size < 10_000_000, 'Máximo 10MB'),
  certificacion: z.instanceof(File).optional(),
});
```

---

## UI/UX Considerations

### Mobile-First Design

- All onboarding screens optimized for mobile (phones primarily)
- Large touch targets for file upload buttons
- Progress indicator always visible at top
- Back navigation via swipe or button

### Document Upload UX

```
┌─────────────────────────────────┐
│ Cédula de Identidad *           │
│ ┌─────────────────────────────┐ │
│ │    [📷]                     │ │
│ │  Toca para subir            │ │
│ │  o arrastra una imagen      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ✅ cedula-front.jpg (2.3 MB)   │
│    [Vista previa] [Eliminar]    │
└─────────────────────────────────┘
```

### Verification Status States

| Status | Screen | Actions |
|--------|--------|---------|
| `pending` | "En revisión" + estimated time | None |
| `approved` | "¡Bienvenido!" + tutorial | "Comenzar a trabajar" |
| `rejected` | Reason + support contact | "Contactar Soporte" |
| `more_info_needed` | Missing items list | Upload fields + "Enviar" |

### Chilean Bank Options

```typescript
const CHILEAN_BANKS = [
  { value: 'banco_estado', label: 'Banco Estado' },
  { value: 'banco_chile', label: 'Banco de Chile' },
  { value: 'santander', label: 'Santander' },
  { value: 'bci', label: 'BCI' },
  { value: 'scotiabank', label: 'Scotiabank' },
  { value: 'itau', label: 'Itaú' },
  { value: 'security', label: 'Banco Security' },
  { value: 'bice', label: 'BICE' },
  { value: 'falabella', label: 'Banco Falabella' },
  { value: 'ripley', label: 'Banco Ripley' },
];
```

---

## Integration Points

### With Epic 6 (Admin)

- **Verification Queue (6-3):** New registrations appear in admin queue
- **Provider Directory (6-4):** Approved providers visible in directory
- **Notifications:** Admin notified of new applications

### With Epic 8 (Provider Offers)

- Only `verification_status = 'approved'` providers can:
  - Browse available requests
  - Submit offers
  - Access provider dashboard

### Auth Flow

```
/provider/register
       │
       ▼
Google OAuth ────▶ Check existing profile
       │                    │
       │                    ├─► If provider + approved → /provider/dashboard
       │                    │
       │                    ├─► If provider + pending → /provider/onboarding/pending
       │                    │
       │                    └─► If no provider profile → Continue registration
       ▼
Personal Info → Service Areas → Documents → Bank → Review → Submit
       │
       ▼
/provider/onboarding/pending (verification_status = 'pending')
```

---

## Testing Strategy

### E2E Test Scenarios

```typescript
// tests/e2e/provider-onboarding.spec.ts

describe('Provider Registration', () => {
  test('complete registration flow with valid documents');
  test('validation errors on invalid phone format');
  test('requires at least one service area');
  test('file upload with preview');
  test('review screen shows all submitted info');
  test('redirect to pending screen after submission');
});

describe('Verification Status', () => {
  test('pending status shows waiting message');
  test('approved status shows welcome and redirect button');
  test('rejected status shows reason and support contact');
  test('more_info_needed shows upload form for missing docs');
});

describe('Service Area Configuration', () => {
  test('load current service areas');
  test('update service areas (add/remove)');
  test('prevent removing all areas (at least one required)');
});

describe('Availability Toggle', () => {
  test('toggle ON shows green "DISPONIBLE"');
  test('toggle OFF shows gray "NO DISPONIBLE"');
  test('state persists across sessions');
});
```

### Test Data Setup

```typescript
// scripts/seed-provider-test-data.ts
// Create test providers in various verification states:
// - pending_provider@test.com (pending)
// - approved_provider@test.com (approved)
// - rejected_provider@test.com (rejected)
// - needsinfo_provider@test.com (more_info_needed)
```

---

## Migration Plan

### New Migration: Provider Onboarding Tables

```sql
-- supabase/migrations/XXX_provider_onboarding.sql

-- Ensure comunas table is populated
INSERT INTO comunas (id, name, region) VALUES
  ('villarrica', 'Villarrica', 'Araucanía'),
  ('pucon', 'Pucón', 'Araucanía'),
  ('lican-ray', 'Licán Ray', 'Araucanía'),
  ('curarrehue', 'Curarrehue', 'Araucanía'),
  ('freire', 'Freire', 'Araucanía')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket (done via Supabase dashboard or SQL)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('provider-documents', 'provider-documents', false);

-- RLS for provider_documents
CREATE POLICY "Providers can insert own documents"
ON provider_documents FOR INSERT
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can view own documents"
ON provider_documents FOR SELECT
USING (provider_id = auth.uid());

CREATE POLICY "Providers can delete own documents"
ON provider_documents FOR DELETE
USING (provider_id = auth.uid());

-- RLS for provider_service_areas
CREATE POLICY "Providers can manage own service areas"
ON provider_service_areas FOR ALL
USING (provider_id = auth.uid());
```

### Supabase Storage Setup

```bash
# Create bucket via Supabase CLI or dashboard
# Name: provider-documents
# Public: false
# File size limit: 10MB
# Allowed MIME types: image/jpeg, image/png, application/pdf
```

---

## Performance Considerations

### Document Upload

- Max file size: 10MB per document
- Compress images client-side before upload (if > 5MB)
- Show upload progress indicator
- Retry failed uploads automatically (up to 3 times)

### Onboarding State Persistence

- Store progress in localStorage for crash recovery
- Clear localStorage on successful submission
- Resume from last completed step if session interrupted

---

## Error Handling

### Registration Errors

| Error | User Message | Action |
|-------|--------------|--------|
| Duplicate phone | "Este teléfono ya está registrado" | Show login link |
| Upload failed | "Error al subir archivo. Intenta de nuevo." | Retry button |
| Network error | "Sin conexión. Revisa tu internet." | Retry when online |
| Invalid file type | "Formato no soportado. Usa JPG, PNG o PDF." | Show allowed types |

### Verification Status Errors

| Error | User Message | Action |
|-------|--------------|--------|
| Profile not found | "Error al cargar perfil" | Redirect to login |
| Status check failed | "No pudimos verificar tu estado" | Refresh button |

---

## Security Considerations

### Document Storage

- All documents stored in private Supabase Storage bucket
- RLS ensures providers can only access their own documents
- Admins can view all documents via service role
- Signed URLs expire after 1 hour

### Input Sanitization

- Validate phone format (Chilean)
- Validate RUT checksum
- Sanitize file names before storage
- Reject executable file types

---

## Rollout Plan

1. **Story 7-1:** Provider Registration Flow (8 points)
   - Critical path, must be completed first
   - Creates all base infrastructure

2. **Story 7-2:** Verification Status Screen (3 points)
   - Required for providers to see their status
   - Depends on 7-1

3. **Story 7-3:** Service Area Configuration (2 points)
   - Can be done in parallel with 7-4

4. **Story 7-4:** Provider Availability Toggle (2 points)
   - Can be done in parallel with 7-3

5. **Story 7-5:** Provider Document Management (3 points)
   - Lower priority, for post-approval updates

---

## Acceptance Criteria Summary

### Epic-Level Done Criteria

- [ ] New providers can self-register via multi-step form
- [ ] Documents upload to Supabase Storage successfully
- [ ] Service areas selectable from pre-seeded comunas
- [ ] Providers see verification status after submission
- [ ] Approved providers redirected to dashboard
- [ ] Rejected providers see reason and support contact
- [ ] "More info needed" state allows document resubmission
- [ ] Service areas configurable after approval
- [ ] Availability toggle functional for approved providers
- [ ] All E2E tests passing
- [ ] Production deployment verified

---

## References

- [PRD v2](../prd-v2.md) - FR24-FR32 (Provider Registration & Onboarding)
- [Architecture](../architecture.md) - Provider tables, Storage, RLS
- [Epic 6 Tech Spec](../epic6/tech-spec.md) - Admin verification queue
- [UX Mockups](../ux-mockups/01-consolidated-provider-flow.html) - Onboarding screens

---

_Epic 7 Tech Spec created 2025-12-15_
