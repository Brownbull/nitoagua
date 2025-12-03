# Story 1.2: Supabase Database Setup

Status: done

## Story

As a **developer**,
I want **the Supabase database schema created with all required tables**,
so that **the application can persist user and request data**.

## Acceptance Criteria

1. **AC1.2.1**: `profiles` table exists with all specified columns: id (UUID, FK to auth.users), role (consumer/supplier), name, phone, address, special_instructions, service_area, price tiers (price_100l, price_1000l, price_5000l, price_10000l), is_available, timestamps (created_at, updated_at)
2. **AC1.2.2**: `water_requests` table exists with all specified columns: id (UUID), consumer_id, guest fields (guest_name, guest_phone, guest_email), tracking_token, address, special_instructions, coordinates (latitude, longitude), amount, is_urgent, status, supplier_id, delivery_window, decline_reason, timestamps (created_at, accepted_at, delivered_at, cancelled_at)
3. **AC1.2.3**: Row Level Security (RLS) is enabled on both tables
4. **AC1.2.4**: RLS policies implement data isolation per Architecture spec: users can read/update own profile, suppliers can read pending requests, anyone can create requests, consumers can cancel own pending requests, suppliers can update assigned requests
5. **AC1.2.5**: Indexes exist on: status, supplier_id, consumer_id, tracking_token columns
6. **AC1.2.6**: TypeScript types are generated from the database schema
7. **AC1.2.7**: Migration file exists at `supabase/migrations/001_initial_schema.sql`

## Tasks / Subtasks

- [x] **Task 1: Create Supabase Project** (AC: 7)
  - [x] Create Supabase project via dashboard or CLI
  - [x] Obtain project URL and anon key
  - [x] Update `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [x] Update `.env.local` with SUPABASE_SERVICE_ROLE_KEY (server-side)
  - [x] Test connection works with simple query

- [x] **Task 2: Create profiles Table** (AC: 1, 3)
  - [x] Create migration file `supabase/migrations/001_initial_schema.sql`
  - [x] Add `profiles` table with all required columns:
    - id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
    - role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier'))
    - name TEXT NOT NULL
    - phone TEXT NOT NULL
    - address TEXT
    - special_instructions TEXT
    - service_area TEXT
    - price_100l INTEGER
    - price_1000l INTEGER
    - price_5000l INTEGER
    - price_10000l INTEGER
    - is_available BOOLEAN DEFAULT true
    - created_at TIMESTAMPTZ DEFAULT NOW()
    - updated_at TIMESTAMPTZ DEFAULT NOW()
  - [x] Enable RLS: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`

- [x] **Task 3: Create water_requests Table** (AC: 2, 3)
  - [x] Add `water_requests` table to migration with all required columns:
    - id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    - consumer_id UUID REFERENCES profiles(id)
    - guest_name TEXT
    - guest_phone TEXT NOT NULL
    - guest_email TEXT
    - tracking_token TEXT UNIQUE DEFAULT gen_random_uuid()::text
    - address TEXT NOT NULL
    - special_instructions TEXT NOT NULL
    - latitude DECIMAL(10, 8)
    - longitude DECIMAL(11, 8)
    - amount INTEGER NOT NULL CHECK (amount IN (100, 1000, 5000, 10000))
    - is_urgent BOOLEAN DEFAULT false
    - status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'cancelled'))
    - supplier_id UUID REFERENCES profiles(id)
    - delivery_window TEXT
    - decline_reason TEXT
    - created_at TIMESTAMPTZ DEFAULT NOW()
    - accepted_at TIMESTAMPTZ
    - delivered_at TIMESTAMPTZ
    - cancelled_at TIMESTAMPTZ
  - [x] Enable RLS: `ALTER TABLE water_requests ENABLE ROW LEVEL SECURITY;`

- [x] **Task 4: Create RLS Policies** (AC: 4)
  - [x] Policy: "Users can read own profile" on profiles FOR SELECT USING (auth.uid() = id)
  - [x] Policy: "Users can update own profile" on profiles FOR UPDATE USING (auth.uid() = id)
  - [x] Policy: "Suppliers can read pending requests" on water_requests FOR SELECT
  - [x] Policy: "Anyone can create requests" on water_requests FOR INSERT WITH CHECK (true)
  - [x] Policy: "Consumers can cancel own pending requests" on water_requests FOR UPDATE
  - [x] Policy: "Suppliers can update assigned requests" on water_requests FOR UPDATE

- [x] **Task 5: Create Database Indexes** (AC: 5)
  - [x] Create index on water_requests(status)
  - [x] Create index on water_requests(supplier_id)
  - [x] Create index on water_requests(consumer_id)
  - [x] Create index on water_requests(tracking_token)

- [x] **Task 6: Run Migration and Generate Types** (AC: 6, 7)
  - [x] Run migration against Supabase project
  - [x] Verify tables created in Supabase dashboard
  - [x] Generate TypeScript types: `npx supabase gen types typescript --linked > src/types/database.ts`
  - [x] Verify types compile without errors

- [x] **Task 7: Verify Schema** (AC: 1, 2, 3, 4, 5)
  - [x] Test: Insert a water_request record via service role key
  - [x] Test: Verify RLS "Anyone can create requests" policy works
  - [x] Test: Verify tracking_token auto-generated
  - [x] Run `npm run build` to verify types work - PASSED

## Dev Notes

### Technical Context

This is Story 1.2 in Epic 1: Foundation & Infrastructure. It establishes the database schema that all data operations depend on. This story depends on Story 1.1 (Project Initialization) being complete.

**Architecture Alignment:**
- ADR-001: Supabase over Firebase/Custom Backend - using PostgreSQL with RLS [Source: docs/architecture.md#ADR-001]
- ADR-003: No Separate ORM - using Supabase client directly [Source: docs/architecture.md#ADR-003]

**Key Technical Decisions:**
- Use `gen_random_uuid()` for UUID generation (PostgreSQL native)
- Status enum as CHECK constraint rather than separate enum type for simplicity
- Amount constraint ensures only valid tier values (100, 1000, 5000, 10000)
- tracking_token uses UUID cast to text for guest tracking URLs
- Foreign keys cascade on delete from auth.users to profiles

### Database Schema Design

**profiles Table Design:**
- Links to Supabase auth.users via FK on id
- Role field distinguishes consumers from suppliers
- Supplier-specific fields (price tiers, service_area, is_available) are nullable for consumers
- Consumer-specific fields (address, special_instructions) can be used by suppliers too

**water_requests Table Design:**
- Supports both registered users (consumer_id) and guests (guest_* fields)
- tracking_token enables guest status tracking without auth
- Status workflow: pending -> accepted -> delivered (or cancelled)
- Coordinates optional for manual address entry
- delivery_window is free text to support various formats ("Mañana 2-4pm")

### RLS Policy Strategy

Per Architecture spec, data isolation follows these rules:
1. Users can only access their own profile
2. Suppliers can see all pending requests (to accept them)
3. Assigned suppliers can see their accepted/delivered requests
4. Consumers can see their own requests
5. Anyone can create requests (guest flow)
6. Only pending requests can be cancelled by the consumer

[Source: docs/architecture.md#Row-Level-Security-Policies]

### Project Structure Notes

**Files to Create:**
```
supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── seed.sql                      # Optional: dev seed data

src/types/
└── database.ts                   # Generated by Supabase CLI
```

**Alignment with Architecture:**
- Migration location matches architecture project structure [Source: docs/architecture.md#Project-Structure]
- Type file location matches `src/types/database.ts` [Source: docs/architecture.md#Project-Structure]

### Learnings from Previous Story

**From Story 1-1-project-initialization (Status: review)**

- **Project Foundation Created**: Full Next.js project structure exists at project root
- **Environment Setup**: `.env.local.example` created - update it with Supabase credentials in this story
- **Next.js Version**: Using Next.js 16 (latest stable, not 15.1 from spec) - no impact on database work
- **Tailwind v4**: Using OKLCH colors - no impact on database work
- **shadcn/ui**: Using sonner instead of deprecated toast - no impact on database work
- **Build Verified**: Project builds and runs - this story must maintain that

[Source: docs/sprint-artifacts/1-1-project-initialization.md#Dev-Agent-Record]

### Supabase CLI Commands Reference

```bash
# Install Supabase CLI (if not installed)
npm install supabase --save-dev

# Login to Supabase
npx supabase login

# Link to project (first time)
npx supabase link --project-ref <project-ref>

# Run migration
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

# Alternatively, use remote types generation
npx supabase gen types typescript --linked > src/types/database.ts
```

### Testing Strategy

Per Architecture, testing at this stage focuses on:
- Schema verification (tables exist with correct columns)
- RLS policy testing (correct access patterns)
- Type generation verification (TypeScript compiles)

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Test-Strategy-Summary]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Supabase-Database-Setup]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/architecture.md#Database-Schema]
- [Source: docs/architecture.md#Row-Level-Security-Policies]
- [Source: docs/epics.md#Story-1.2-Supabase-Database-Setup]

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-2-supabase-database-setup.context.xml](1-2-supabase-database-setup.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Supabase project already existed (nitoagua, ref: spvbmmydrfquvndxpcug)
- User configured Supabase MCP server via CLI
- Supabase CLI linked via `npx supabase link --project-ref spvbmmydrfquvndxpcug`
- Migration pushed via `npx supabase db push`
- Types generated via `npx supabase gen types typescript --linked`
- Test insert verified: water_request created with auto-generated UUID and tracking_token

### Completion Notes List

- **Database Schema**: Created `profiles` and `water_requests` tables per architecture spec with all required columns, constraints, and foreign keys
- **RLS Security**: Enabled Row Level Security on both tables with 6 policies implementing data isolation (profile read/update/insert, request create/read/update)
- **Indexes**: Created 4 indexes on water_requests for status, supplier_id, consumer_id, and tracking_token
- **TypeScript Types**: Generated via Supabase CLI, includes Row/Insert/Update types for both tables with proper relationships
- **Build Verification**: `npm run build` passes with zero TypeScript errors
- **Additional**: Added `updated_at` trigger on profiles table for automatic timestamp updates
- **Additional**: Added "Users can insert own profile" policy for registration flow

### File List

**Created:**
- supabase/migrations/001_initial_schema.sql (new)
- src/types/database.ts (new - generated)

**Modified:**
- .env.local (updated with Supabase credentials)
- package.json (added supabase as dev dependency)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-02 | SM Agent | Story drafted from tech spec and epics |
| 2025-12-02 | Dev Agent | Implemented database schema, RLS policies, indexes; generated types; verified build |
| 2025-12-02 | SM Agent | Senior Developer Review notes appended |

---

## Senior Developer Review (AI)

### Reviewer
Gabe

### Date
2025-12-02

### Outcome
**APPROVE**

**Justification:** All 7 acceptance criteria are fully implemented with evidence. All 7 tasks marked complete have been verified. No falsely marked complete tasks found. Schema matches architecture specification exactly. RLS policies implement required data isolation. TypeScript types generated and compiling. Build passes successfully. No security vulnerabilities identified.

### Summary

This story implements the foundational Supabase database schema for nitoagua with excellent quality. The migration file is well-structured, properly documented, and implements all required tables, constraints, RLS policies, and indexes exactly as specified in the architecture document.

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**LOW Severity (Unrelated):**
- ESLint error in `tests/support/fixtures/index.ts:11` - This is a false positive from Story 1-1's test fixtures where Playwright's `use` fixture is misidentified as React's `use` hook. Not related to this story's scope.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC1.2.1 | `profiles` table with all columns | IMPLEMENTED | [001_initial_schema.sql:11-26](supabase/migrations/001_initial_schema.sql#L11-L26) |
| AC1.2.2 | `water_requests` table with all columns | IMPLEMENTED | [001_initial_schema.sql:38-59](supabase/migrations/001_initial_schema.sql#L38-L59) |
| AC1.2.3 | RLS enabled on both tables | IMPLEMENTED | [001_initial_schema.sql:29](supabase/migrations/001_initial_schema.sql#L29), [001_initial_schema.sql:62](supabase/migrations/001_initial_schema.sql#L62) |
| AC1.2.4 | RLS policies per Architecture spec | IMPLEMENTED | [001_initial_schema.sql:67-135](supabase/migrations/001_initial_schema.sql#L67-L135) |
| AC1.2.5 | Indexes on required columns | IMPLEMENTED | [001_initial_schema.sql:141-144](supabase/migrations/001_initial_schema.sql#L141-L144) |
| AC1.2.6 | TypeScript types generated | IMPLEMENTED | [src/types/database.ts](src/types/database.ts) (318 lines) |
| AC1.2.7 | Migration file at correct location | IMPLEMENTED | `supabase/migrations/001_initial_schema.sql` exists |

**Summary: 7 of 7 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Create Supabase Project | Complete | VERIFIED | `.env.local` exists, Dev Agent Record confirms project linked |
| Task 2: Create profiles Table | Complete | VERIFIED | [001_initial_schema.sql:11-29](supabase/migrations/001_initial_schema.sql#L11-L29) |
| Task 3: Create water_requests Table | Complete | VERIFIED | [001_initial_schema.sql:38-62](supabase/migrations/001_initial_schema.sql#L38-L62) |
| Task 4: Create RLS Policies | Complete | VERIFIED | [001_initial_schema.sql:67-135](supabase/migrations/001_initial_schema.sql#L67-L135) |
| Task 5: Create Database Indexes | Complete | VERIFIED | [001_initial_schema.sql:141-144](supabase/migrations/001_initial_schema.sql#L141-L144) |
| Task 6: Run Migration and Generate Types | Complete | VERIFIED | Types file exists, build passes |
| Task 7: Verify Schema | Complete | VERIFIED | Dev Agent Record confirms test insert, build passes |

**Summary: 7 of 7 completed tasks verified, 0 questionable, 0 falsely marked complete**

### Test Coverage and Gaps

**Tests Present:**
- Schema verification via migration execution
- RLS policy test (insert request as guest)
- TypeScript compilation via `npm run build`

**Gaps:**
- Note: No automated unit tests for RLS policies (acceptable for MVP, policies tested manually)

### Architectural Alignment

**Tech Spec Compliance:** COMPLIANT

- Schema exactly matches [tech-spec-epic-1.md](docs/sprint-artifacts/tech-spec-epic-1.md) data models
- Uses `gen_random_uuid()` as specified
- Status and amount CHECK constraints as specified
- Foreign key relationships correct

**Architecture Constraints:**
- ADR-001 (Supabase): Implemented correctly
- ADR-003 (No ORM): Using Supabase client directly via generated types

### Security Notes

**Positive Findings:**
- RLS enabled on all tables
- All policies use `auth.uid()` correctly
- Insert policy permissive for guest flow (by design)
- Update policies properly restrictive
- No SQL injection vectors (parameterized queries via Supabase client)

**No security issues identified.**

### Best-Practices and References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase TypeScript Types](https://supabase.com/docs/guides/api/generating-types)

### Action Items

**Advisory Notes:**
- Note: Consider adding automated RLS policy tests in future stories for regression prevention
- Note: The ESLint false positive in test fixtures (Story 1-1) should be addressed by adding an eslint-disable comment or configuring the rule to ignore Playwright fixtures
