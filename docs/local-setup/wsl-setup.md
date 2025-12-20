# WSL Development Setup

Quick setup guide for developing NitoAgua on WSL (Windows Subsystem for Linux).

## Prerequisites (Already Installed)

- WSL2 with Ubuntu
- VS Code with Remote - WSL extension
- Claude Code CLI
- Node.js and npm

## 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url> ~/projects/bmad/nitoagua
cd ~/projects/bmad/nitoagua

# Install dependencies
npm install
```

## 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
```

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://spvbmmydrfquvndxpcug.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
```

## 3. VS Code Extensions

Install these extensions in VS Code (WSL mode):

```bash
# Essential
code --install-extension anthropic.claude-code
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension prisma.prisma

# Testing
code --install-extension ms-playwright.playwright

# Optional but useful
code --install-extension yzhang.markdown-all-in-one
code --install-extension bierner.markdown-mermaid
```

## 4. Local Supabase (Optional)

```bash
# Start local Supabase
npx supabase start

# Local URLs:
# API: http://127.0.0.1:55326
# Studio: http://127.0.0.1:55327
```

## 5. Run Development Server

```bash
# Start on port 3005
npm run dev

# Access at http://localhost:3005
```

## 6. Run Tests

```bash
# E2E tests
npm run test:e2e

# Unit tests
npm run test:unit
```

## Ports Used

| Service | Port |
|---------|------|
| Next.js Dev | 3005 |
| Supabase API | 55326 |
| Supabase Studio | 55327 |

## WSL Limitations

- **Chrome Extension**: Claude Code Chrome integration does NOT work from WSL
- For Chrome automation, use Windows setup (see [windows-setup.md](./windows-setup.md))

## Useful Commands

```bash
# Check dev server status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005

# Kill process on port
fuser -k 3005/tcp

# Docker containers
docker ps
npx supabase status
```
