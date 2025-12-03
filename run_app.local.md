# nitoagua - Local Development

**Port:** 3005

## Quick Start

```bash
npm run dev
```

Open http://localhost:3005

## Quick Links

| Service | URL |
|---------|-----|
| **App** | http://localhost:3005 |
| **Supabase Studio** | http://127.0.0.1:54330 |
| **Mailpit (Email)** | http://127.0.0.1:54331 |

## Setup (First Time)

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

## Local Supabase (Docker)

Requires Docker running.

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset database (re-apply migrations)
npx supabase db reset

# Check status
npx supabase status
```

### Local Services (ports offset +5)

| Service | URL |
|---------|-----|
| Studio | http://127.0.0.1:54330 |
| API | http://127.0.0.1:54326 |
| Database | postgresql://postgres:postgres@127.0.0.1:54327/postgres |
| Mailpit | http://127.0.0.1:54331 |

### Switch to Local Dev

Copy `.env.local.development` to `.env.local` to use local Supabase.

## Build

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Database Cleanup

Delete all water requests from the database.

```bash
# Clean LOCAL database (no confirmation needed)
npm run cleanup:local

# Clean REMOTE/Production database (requires --confirm flag)
npm run cleanup:remote -- --confirm
```

**Note:** For remote cleanup, you need a `.env.scripts` file in the project root with:

```
REMOTE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## DBeaver Connection (Local DB)

| Setting | Value |
|---------|-------|
| Host | `127.0.0.1` |
| Port | `54327` |
| Database | `postgres` |
| Username | `postgres` |
| Password | `postgres` |
