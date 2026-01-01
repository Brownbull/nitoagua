#!/usr/bin/env node
/**
 * Bundle Size Budget Check
 *
 * This script validates that the production bundle stays within defined limits.
 * Run after `npm run build` to check bundle sizes.
 *
 * Usage:
 *   npm run build && node scripts/check-bundle-size.js
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Bundle size exceeds budget
 *
 * Created: Story 12.5-6 Performance Validation & Documentation
 */

const fs = require('fs');
const path = require('path');

// Budget configuration (in bytes)
const BUDGETS = {
  // Total static chunks budget (3.5MB limit, current ~3.1MB)
  totalChunks: {
    limit: 3.5 * 1024 * 1024, // 3.5 MB
    warn: 3.2 * 1024 * 1024,  // 3.2 MB warning threshold
    name: 'Total Static Chunks'
  },
  // Largest single chunk budget (250KB limit for any individual chunk)
  largestChunk: {
    limit: 250 * 1024, // 250 KB
    warn: 200 * 1024,  // 200 KB warning threshold
    name: 'Largest Single Chunk'
  }
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getChunkSizes(chunksDir) {
  if (!fs.existsSync(chunksDir)) {
    console.error(`Error: Chunks directory not found at ${chunksDir}`);
    console.error('Run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(chunksDir)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f,
      size: fs.statSync(path.join(chunksDir, f)).size
    }))
    .sort((a, b) => b.size - a.size);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const largestFile = files[0];

  return { files, totalSize, largestFile };
}

function checkBudget(name, actual, budget) {
  const { limit, warn } = budget;
  const passed = actual <= limit;
  const warning = actual > warn && actual <= limit;

  const status = passed
    ? (warning ? '⚠️  WARNING' : '✅ PASS')
    : '❌ FAIL';

  console.log(`\n${status}: ${name}`);
  console.log(`  Actual:  ${formatBytes(actual)}`);
  console.log(`  Budget:  ${formatBytes(limit)}`);
  console.log(`  Margin:  ${formatBytes(limit - actual)} remaining`);

  if (warning) {
    console.log(`  ⚠️  Approaching limit (warn threshold: ${formatBytes(warn)})`);
  }

  return passed;
}

function main() {
  console.log('=== Bundle Size Budget Check ===\n');

  const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');
  const { files, totalSize, largestFile } = getChunkSizes(chunksDir);

  console.log(`Found ${files.length} chunk files\n`);

  // Show top 5 largest chunks
  console.log('Top 5 largest chunks:');
  files.slice(0, 5).forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.name}: ${formatBytes(f.size)}`);
  });

  // Run budget checks
  let allPassed = true;

  allPassed = checkBudget(
    BUDGETS.totalChunks.name,
    totalSize,
    BUDGETS.totalChunks
  ) && allPassed;

  allPassed = checkBudget(
    BUDGETS.largestChunk.name,
    largestFile.size,
    BUDGETS.largestChunk
  ) && allPassed;

  console.log('\n' + '='.repeat(40));

  if (allPassed) {
    console.log('✅ All bundle size checks passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Bundle size budget exceeded!\n');
    console.log('Consider:');
    console.log('  - Dynamic imports for large components');
    console.log('  - Code splitting by route');
    console.log('  - Removing unused dependencies');
    console.log('  - Checking for duplicate imports\n');
    process.exit(1);
  }
}

main();
