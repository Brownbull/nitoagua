# Windows Setup for Chrome Extension Testing

Setup Claude Code on Windows to use the Chrome Extension for visual/UX testing.

**Important:** This setup is ONLY for Chrome Extension testing. The application runs in WSL.

## How It Works

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
│  WSL      │                                                  │
│  ┌────────┴─────────────────────────────────────────────────┐│
│  │ npm run dev (port 3005) ← Run app here                   ││
│  │ npm run build, npm run test:e2e ← All dev work here      ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Windows 10/11
- Google Chrome
- Node.js for Windows (v20+)
- Git for Windows

---

## Step 1: Clone Project to Windows

Open PowerShell (not CMD) and run:

```powershell
# Enable long paths (required for Windows - some file paths are too long)
git config --global core.longpaths true

# Create folder structure
mkdir C:\projects\bmad -Force
cd C:\projects\bmad

# Clone ONLY the develop branch (faster, avoids checkout issues)
git clone --branch develop --single-branch https://github.com/Brownbull/nitoagua.git
cd nitoagua
```

**Note:** You do NOT need to run `npm install` - we're not running the app here.

### Syncing with WSL

When you want to test changes made in WSL:

```powershell
cd C:\projects\bmad\nitoagua
git pull origin develop
```

Or if testing a feature branch:
```powershell
git fetch origin feature/my-branch
git checkout feature/my-branch
```

---

## Step 2: Install Claude Code

```powershell
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify version (requires 2.0.73+)
claude --version

# If version is lower, upgrade:
claude update
```

---

## Step 3: Install Chrome Extension

1. Go to [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome)
2. Click "Add to Chrome"
3. Sign in with your Claude account
4. Verify extension version is 1.0.36+

---

## Step 4: Copy Settings from WSL (Optional)

To get your existing Claude Code settings:

```powershell
# Create Claude directory
mkdir $env:USERPROFILE\.claude -Force

# Copy settings from WSL
copy \\wsl.localhost\Ubuntu-24.04\home\khujta\.claude\settings.json $env:USERPROFILE\.claude\

# Copy plugins (optional)
mkdir $env:USERPROFILE\.claude\plugins -Force
copy \\wsl.localhost\Ubuntu-24.04\home\khujta\.claude\plugins\installed_plugins.json $env:USERPROFILE\.claude\plugins\
copy \\wsl.localhost\Ubuntu-24.04\home\khujta\.claude\plugins\known_marketplaces.json $env:USERPROFILE\.claude\plugins\
```

---

## Step 5: Start Claude Code with Chrome

```powershell
# Navigate to project
cd C:\projects\bmad\nitoagua

# Start Claude Code with Chrome integration
claude --chrome
```

To enable Chrome by default:
```
/chrome
# Select "Enabled by default"
```

---

## Step 6: Verify Setup

In Claude Code, run:
```
/chrome
```
Should show: "Chrome extension connected"

Then test with:
```
Navigate to http://localhost:3005 and describe what you see
```

(Make sure `npm run dev` is running in WSL first!)

---

## Usage

| Task | Where |
|------|-------|
| Run app (`npm run dev`) | WSL |
| Build (`npm run build`) | WSL |
| E2E tests (`npm run test:e2e`) | WSL |
| Git commits | WSL |
| Chrome visual testing | Windows |
| UX verification | Windows |

---

## Troubleshooting

### Chrome not detected
- Close all Chrome windows completely
- Re-run `claude --chrome`

### localhost:3005 not accessible
- Verify app is running in WSL: open WSL terminal, run `npm run dev`
- WSL2 auto-forwards ports to Windows

### "Unknown option --chrome"
- Your Claude Code version is too old
- Run: `npm install -g @anthropic-ai/claude-code@latest`

### Settings not loading
```powershell
# Verify files exist
dir $env:USERPROFILE\.claude
```

---

## Quick Reference

**Start testing session:**
```powershell
cd C:\projects\bmad\nitoagua
claude --chrome
```

**Test local app:**
```
Navigate to http://localhost:3005 and verify the home page loads
```

**Test production:**
```
Navigate to https://nitoagua.vercel.app and describe the page
```
