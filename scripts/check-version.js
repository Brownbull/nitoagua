/**
 * Version Sync Check Script
 *
 * Ensures package.json version matches public/sw.js SW_VERSION.
 * Runs before every build to prevent version drift.
 *
 * Exit codes:
 *   0 - Versions match
 *   1 - Version mismatch (build will fail)
 *
 * @see Atlas Lessons: "SW_VERSION must match package.json version"
 */

const fs = require('fs');
const path = require('path');

// Read package.json version
const packagePath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const packageVersion = pkg.version;

// Read service worker version
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
const swMatch = swContent.match(/const SW_VERSION = "(.+?)"/);
const swVersion = swMatch ? swMatch[1] : null;

// Compare versions
if (!swVersion) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Could not find SW_VERSION in public/sw.js');
  process.exit(1);
}

if (swVersion !== packageVersion) {
  console.error('\x1b[31m%s\x1b[0m', '❌ VERSION MISMATCH DETECTED!');
  console.error('');
  console.error('   package.json version:', packageVersion);
  console.error('   public/sw.js version:', swVersion);
  console.error('');
  console.error('   Fix: Update SW_VERSION in public/sw.js to match package.json');
  console.error('');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', `✓ Versions match: ${packageVersion}`);
process.exit(0);
