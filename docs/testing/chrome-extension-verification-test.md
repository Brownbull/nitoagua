# Chrome Extension Verification Test

**Purpose:** Verify Claude Chrome Extension can navigate and interact with NitoAgua

**Date:** 2025-12-20

---

## Prerequisites

- [ ] Claude Chrome Extension installed and active
- [ ] Logged into Claude with extension enabled
- [ ] NitoAgua running locally OR access to production

---

## Test 1: Local Application (http://localhost:3005)

### Step 1: Navigate to Home Page

1. Open Chrome browser
2. Navigate to: `http://localhost:3005`
3. **VERIFY:** Home page loads with "Pedir Agua Ahora" button visible

### Step 2: Check Consumer Flow Entry

1. Click the "Pedir Agua Ahora" button
2. **VERIFY:** Request form page loads
3. **VERIFY:** Form fields visible: Address, Comuna, Quantity

### Step 3: Navigate to Provider Login

1. Navigate to: `http://localhost:3005/login`
2. **VERIFY:** Login form displays
3. **VERIFY:** Email and password fields visible

### Step 4: Check PWA Elements

1. Navigate to: `http://localhost:3005`
2. Open Chrome DevTools (F12)
3. Go to Application tab → Manifest
4. **VERIFY:** PWA manifest loads correctly

---

## Test 2: Production Application (https://nitoagua.vercel.app)

### Step 1: Navigate to Home Page

1. Navigate to: `https://nitoagua.vercel.app`
2. **VERIFY:** Home page loads (may take a moment for cold start)
3. **VERIFY:** "Pedir Agua Ahora" button visible
4. **VERIFY:** Page is mobile-responsive (resize window to verify)

### Step 2: Check Consumer Request Flow

1. Click "Pedir Agua Ahora"
2. **VERIFY:** Request form loads
3. Fill in test address: "Test 123"
4. Select any comuna from dropdown
5. Enter quantity: "1000"
6. **VERIFY:** Form accepts input

### Step 3: Provider Portal Access

1. Navigate to: `https://nitoagua.vercel.app/login`
2. **VERIFY:** Login page loads
3. **NOTE:** Do not submit - just verify page renders

### Step 4: Admin Portal Access

1. Navigate to: `https://nitoagua.vercel.app/admin/login`
2. **VERIFY:** Admin login page loads
3. **NOTE:** Do not submit - just verify page renders

---

## Test Results

| Test | Local | Production | Notes |
|------|-------|------------|-------|
| Home page loads | ⬜ | ⬜ | |
| Main CTA visible | ⬜ | ⬜ | |
| Request form works | ⬜ | ⬜ | |
| Login page loads | ⬜ | ⬜ | |
| Admin page loads | ⬜ | ⬜ | |
| PWA manifest | ⬜ | ⬜ | |

---

## Quick Commands for Claude

If you're using Claude to execute this test, use these prompts:

### For Local Testing:
```
Navigate to http://localhost:3005 and verify the NitoAgua home page loads.
Look for a blue "Pedir Agua Ahora" button.
```

### For Production Testing:
```
Navigate to https://nitoagua.vercel.app and verify the page loads correctly.
Check that you can see the main call-to-action button for requesting water.
```

### For Form Interaction:
```
Click the "Pedir Agua Ahora" button, then fill in the form with:
- Address: "Calle Test 123"
- Select the first available comuna
- Quantity: 1000 liters
Take a screenshot of the filled form.
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not responding | Refresh page, check extension is enabled |
| Local app not loading | Ensure `npm run dev` is running on port 3005 |
| Production slow | Normal cold start, wait 5-10 seconds |
| Login fails | Use test credentials if available |

---

## Success Criteria

- [ ] Claude can navigate to URLs
- [ ] Claude can identify page elements
- [ ] Claude can click buttons
- [ ] Claude can fill forms
- [ ] Claude can report what it sees

**Test Status:** ⬜ PASS / ⬜ FAIL
