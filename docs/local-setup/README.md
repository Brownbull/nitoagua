# Local Development Setup

Setup guides for the NitoAgua development environment.

## Quick Start

| Environment | Guide | Purpose |
|-------------|-------|---------|
| **WSL** | [wsl-setup.md](./wsl-setup.md) | Primary development (run app, tests, git) |
| **Windows** | [windows-setup.md](./windows-setup.md) | Chrome Extension testing only |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WINDOWS                                                     │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Chrome Browser  │◄───│ Claude Code + Chrome Extension  │ │
│  │ localhost:3005  │    │ (C:\projects\bmad\nitoagua)     │ │
│  └────────▲────────┘    └─────────────────────────────────┘ │
│           │ Port auto-forwarded from WSL                     │
└───────────┼──────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────┐
│  WSL (Primary Development)                                   │
│  ┌────────┴─────────────────────────────────────────────────┐│
│  │ ~/projects/bmad/nitoagua                                 ││
│  │ • npm run dev (port 3005)                                ││
│  │ • npm run build                                          ││
│  │ • npm run test:e2e                                       ││
│  │ • git operations                                         ││
│  │ • Claude Code (without Chrome)                           ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Local Supabase  │    │ Docker                          │ │
│  │ Port 55326      │    │                                 │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## What Goes Where

| Task | Environment | Why |
|------|-------------|-----|
| `npm install` | WSL | Node modules in Linux |
| `npm run dev` | WSL | Server runs here |
| `npm run build` | WSL | Build in Linux |
| `npm run test:e2e` | WSL | Playwright headless |
| Git operations | WSL | Main repo here |
| Claude Code (coding) | WSL | Full development |
| Chrome visual testing | Windows | Chrome Extension |
| UX verification | Windows | Browser automation |

## Why Two Environments?

**Claude Code Chrome Extension does NOT work in WSL.** The Chrome integration requires native Windows for browser automation via Claude.

- **WSL:** All development, testing, and git work
- **Windows:** Only for Chrome Extension-based visual/UX testing

## Versions Required

| Tool | Minimum Version |
|------|-----------------|
| Node.js | 20.x |
| npm | 10.x |
| Claude Code | 2.0.73+ |
| Chrome Extension | 1.0.36+ |

## Ports Used

| Service | Port |
|---------|------|
| Next.js Dev | 3005 |
| Supabase API | 55326 |
| Supabase Studio | 55327 |
