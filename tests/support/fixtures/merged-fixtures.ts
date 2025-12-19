/**
 * Merged Playwright Fixtures
 *
 * Combines @seontechnologies/playwright-utils fixtures with project-specific fixtures.
 * Import { test, expect } from this file in all E2E tests for full utility access.
 *
 * @see https://github.com/seontechnologies/playwright-utils
 * @see _bmad/bmm/testarch/knowledge/overview.md
 */

import { mergeTests } from '@playwright/test';

// Project fixtures
import { test as projectFixtures } from './index';

// Playwright Utils fixtures - import incrementally as needed
import { test as logFixture } from '@seontechnologies/playwright-utils/log/fixtures';
import { test as recurseFixture } from '@seontechnologies/playwright-utils/recurse/fixtures';
import { test as interceptFixture } from '@seontechnologies/playwright-utils/intercept-network-call/fixtures';
import { test as networkErrorFixture } from '@seontechnologies/playwright-utils/network-error-monitor/fixtures';

// Merge all fixtures into unified test object
// Order matters: later fixtures can override earlier ones
export const test = mergeTests(
  projectFixtures,      // userFactory
  logFixture,           // log - structured logging in reports
  recurseFixture,       // recurse - polling for async conditions
  interceptFixture,     // interceptNetworkCall - spy on API calls
  networkErrorFixture   // networkErrorMonitor - auto-detect HTTP errors
);

export { expect } from '@playwright/test';

// Available fixtures in tests:
//
// - userFactory: Create/cleanup test users
// - log: Structured logging - log({ level: 'step', message: 'text' })
//   Levels: info, step, success, warning, error, debug
// - recurse: Poll for async conditions (like Cypress retry)
// - interceptNetworkCall: Spy/stub network requests with auto JSON parsing
// - networkErrorMonitor: Automatically fail tests on HTTP 4xx/5xx
//
// Usage:
//   import { test, expect } from '../support/fixtures/merged-fixtures';
//
//   test('example', async ({ page, log, recurse, interceptNetworkCall }) => {
//     await log({ level: 'step', message: 'Navigate to offers page' });
//     await page.goto('/consumer/offers');
//
//     // Spy on API call
//     const offersCall = interceptNetworkCall({ urlPattern: /\/api\/offers/ });
//     await page.click('[data-testid="refresh"]');
//     const { responseJson } = await offersCall;
//
//     // Poll until condition met
//     await recurse(
//       () => page.locator('[data-testid="offer-count"]').textContent(),
//       (text) => parseInt(text || '0') > 0,
//       { timeout: 10000, delay: 500 }
//     );
//   });
