# nitoagua

Water delivery coordination platform for rural Chile.

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- npm or pnpm
- Supabase account (free tier)

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Configure the following variables in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `RESEND_API_KEY` | Resend API key for email notifications | Yes |
| `CRON_SECRET` | Secret for authenticating Vercel cron jobs | Yes (production) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Future |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Architecture Patterns

### Supabase Client Usage

This project uses two Supabase client patterns:

| Client | Use Case | File |
|--------|----------|------|
| `createClient()` | Client-side operations, respects RLS | `src/lib/supabase/client.ts` |
| `createServerClient()` | Server components, respects RLS | `src/lib/supabase/server.ts` |
| `createAdminClient()` | Server-side operations that bypass RLS | `src/lib/supabase/admin.ts` |

**When to use `createAdminClient()`:**
- API routes that need to INSERT records for unauthenticated users (e.g., guest water requests)
- Server-side SELECT operations that need to bypass RLS (e.g., guest tracking by token)
- Any intentional server-side operation where RLS would block legitimate access

**Security Note:** The `SERVICE_ROLE_KEY` used by admin client is only available server-side and never exposed to the browser.
