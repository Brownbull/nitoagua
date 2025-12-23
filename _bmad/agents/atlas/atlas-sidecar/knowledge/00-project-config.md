# Project Configuration

> Section 0 of Atlas Memory
> Last Sync: 2025-12-22
> Sources: Deployment config, seed scripts, environment files, Vercel dashboard

## Deployment URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | https://nitoagua.vercel.app | Live application |
| **Local** | http://localhost:3000 | Development |
| **Supabase (Prod)** | https://spvbmmydrfquvndxpcug.supabase.co | Production database |
| **Supabase (Local)** | http://127.0.0.1:55326 | Local Supabase instance |

## Test Users (E2E Contract - REQUIRED)

> These credentials are used by atlas-e2e workflow for Chrome Extension testing.
> Source: scripts/local/seed-test-data.ts, dev login configuration

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Consumer** | consumer@nitoagua.cl | consumer.123 | Standard consumer account |
| **Provider** | supplier@nitoagua.cl | supplier.123 | Approved, verified provider |
| **Admin** | admin@nitoagua.cl | admin.123 | Full admin access |

### Dev Login Mode

When `NEXT_PUBLIC_DEV_LOGIN=true`:
- Login page shows role selector buttons
- No actual authentication required
- Used for E2E testing in local/staging

## E2E Testing Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| **Output Path** | docs/testing/e2e-checklists | Chrome Extension checklists |
| **Playwright Tests** | tests/e2e/*.spec.ts | Automated E2E |
| **Fixtures** | tests/fixtures/*.ts | Shared test data |
| **Seeds** | scripts/local/seed-*.ts | Data seeding scripts |

### Chrome Extension Testing (atlas-e2e)

| Config | Value |
|--------|-------|
| Default Mode | Chrome Extension |
| Execution Environment | Windows |
| Checklist Format | Markdown with checkboxes |
| Git Workflow | Commit results to feature branch |

## Persona Badge Mapping

| Persona | Badge | Color | Tab Position |
|---------|-------|-------|--------------|
| Consumer (Doña María) | 🔵 | Blue | Left |
| Provider (Don Pedro) | 🟢 | Green | Middle |
| Admin | 🟠 | Orange | Right |

## API Configuration

> DO NOT store actual secrets here. Reference location only.

| Config | Location | Purpose |
|--------|----------|---------|
| Supabase URL | NEXT_PUBLIC_SUPABASE_URL | Database connection |
| Supabase Anon Key | NEXT_PUBLIC_SUPABASE_ANON_KEY | Client auth |
| Supabase Service Key | SUPABASE_SERVICE_ROLE_KEY | Server-side operations |
| Resend API Key | RESEND_API_KEY (Vercel) | Email sending |

## Project Identifiers

| Identifier | Value |
|------------|-------|
| Project Name | nitoagua |
| App Version | 1.0.0 |
| Vercel Project | nitoagua |
| Supabase Project | spvbmmydrfquvndxpcug |
| GitHub Repo | Brownbull/nitoagua |

## PWA Configuration

| Setting | Value |
|---------|-------|
| Service Worker | `public/sw.js` |
| SW Version | 1.0.0 (matches app version) |
| Manifest | `public/manifest.json` |
| Dev Port | 3005 |
| Standards Doc | `docs/standards/progressive-web-app-standards.md` |

---

*Last verified: 2025-12-22 | Sources: Vercel dashboard, .env files, seed scripts, package.json*
