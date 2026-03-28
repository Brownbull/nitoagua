import { defineConfig, devices } from '@playwright/test';

// When BASE_URL is set, use grouped projects with seed dependencies
// to prevent data contamination between test groups.
// Run groups sequentially: npx playwright test --project=g1-consumer-ui
const isProduction = !!process.env.BASE_URL;

// ============================================================================
// Test Groups (production) — small enough for quick feedback (~5-10 min each)
// Run one group at a time, fix until green, move to next.
//
// WORKFLOW:
//   1. npm run seed:test:prod && npm run seed:offers:prod
//   2. NEXT_PUBLIC_DEV_LOGIN=true BASE_URL=https://nitoagua.vercel.app \
//      npx playwright test --project=g1-consumer-ui --reporter=list
//   3. Fix failures, re-run same group until green
//   4. Move to next group (re-seed if needed between groups)
//
// GROUP ORDER:
//   g1-consumer-ui     → Consumer home, registration, request form (no seed needed)
//   g2-consumer-wizard → Request wizard flow + submission (no seed needed)
//   g3-auth-infra      → Auth, PWA, DB health, personas (no seed needed)
//   g4-consumer-offers → Offers, countdown, selection (SEED FIRST)
//   g5-consumer-status → Status tracking, cancellation, disputes (SEED FIRST)
//   g6-provider-auth   → Provider login, registration, settings (SEED FIRST)
//   g7-provider-offers → Provider offer list, submissions, edge cases (SEED FIRST)
//   g8-provider-config → Documents, service areas, earnings (SEED FIRST)
//   g9-admin-core      → Admin orders, pricing, settings (SEED FIRST)
//   g10-admin-ops      → Admin disputes, verification, dashboard (SEED FIRST)
//   g11-mutate         → Data-changing tests: accept, cancel, deliver (RE-SEED FIRST)
// ============================================================================

// --- No seed needed ---
const G1_CONSUMER_UI = [
  'consumer-home.spec.ts',
  'consumer-home-merged.spec.ts',
  'consumer-home-trust-signals.spec.ts',
  'consumer-registration.spec.ts',
  'persona-validation.spec.ts',
  'example.spec.ts',
];

const G2_CONSUMER_WIZARD = [
  'consumer-request-form.spec.ts',
  'consumer-request-submission.spec.ts',
  'consumer-request-workflow.spec.ts',
  'consumer-request-confirmation.spec.ts',
  'consumer-payment-selection.spec.ts',
  'consumer-map-pinpoint.spec.ts',
  'urgency-pricing.spec.ts',
];

const G3_AUTH_INFRA = [
  'admin-auth.spec.ts',
  'supplier-auth.spec.ts',
  'pwa.spec.ts',
  'pwa-settings.spec.ts',
  'database-health.spec.ts',
  'session-expiry.spec.ts',
  'push-subscription.spec.ts',
];

// --- Need seed:test:prod + seed:offers:prod ---
const G4_CONSUMER_OFFERS = [
  'consumer-offers.spec.ts',
  'consumer-offer-countdown.spec.ts',
];

const G5_CONSUMER_STATUS = [
  'consumer-request-status.spec.ts',
  'consumer-request-status-offer-context.spec.ts',
  'consumer-status-tracking.spec.ts',
  'consumer-tracking.spec.ts',
  'cancel-request.spec.ts',
  'consumer-cancellation-workflow.spec.ts',
  'consumer-dispute.spec.ts',
  'negative-status-states.spec.ts',
  'request-timeout.spec.ts',
  'request-timeout-workflow.spec.ts',
  'cron-expire-offers.spec.ts',
  'epic12-integration.spec.ts',
];

const G6_PROVIDER_AUTH = [
  'supplier-dashboard.spec.ts',
  'supplier-profile.spec.ts',
  'supplier-request-details.spec.ts',
  'provider-registration.spec.ts',
  'provider-settings.spec.ts',
  'provider-availability-toggle.spec.ts',
  'provider-ux-redesign.spec.ts',
];

const G7_PROVIDER_OFFERS = [
  'provider-active-offers.spec.ts',
  'provider-offer-notification.spec.ts',
  'provider-offer-edge-cases.spec.ts',
  'provider-offer-submission.spec.ts',
  'provider-visibility.spec.ts',
  'provider-request-browser.spec.ts',
];

const G8_PROVIDER_CONFIG = [
  'provider-document-management.spec.ts',
  'provider-service-areas.spec.ts',
  'provider-map-view.spec.ts',
  'provider-earnings.spec.ts',
  'provider-earnings-seeded.spec.ts',
  'provider-earnings-workflow.spec.ts',
  'provider-commission-settlement.spec.ts',
  'commission-payment-screenshot.spec.ts',
];

const G9_ADMIN_CORE = [
  'admin-orders.spec.ts',
  'admin-orders-seeded.spec.ts',
  'admin-orders-mobile-ux.spec.ts',
  'admin-pricing.spec.ts',
  'admin-settings.spec.ts',
  'admin-panel-ux.spec.ts',
];

const G10_ADMIN_OPS = [
  'admin-disputes.spec.ts',
  'admin-settlement.spec.ts',
  'admin-providers.spec.ts',
  'admin-providers-ux.spec.ts',
  'admin-status-sync.spec.ts',
  'admin-verification.spec.ts',
  'admin-verification-workflow.spec.ts',
  'admin-dashboard-metrics.spec.ts',
  'provider-verification-status.spec.ts',
  'dashboard-data-freshness.spec.ts',
  'dashboard-tab-counts.spec.ts',
];

// --- Re-seed before running (these mutate data) ---
const G11_MUTATE = [
  'consumer-offer-selection.spec.ts',
  'offer-cancellation-flow.spec.ts',
  'provider-withdraw-offer.spec.ts',
  'supplier-accept.spec.ts',
  'supplier-deliver.spec.ts',
  'en-camino-delivery-status.spec.ts',
  'chain1-happy-path.spec.ts',
  'rating-review.spec.ts',
];

// ============================================================================
// Config
// ============================================================================
const chromeDevice = { ...devices['Desktop Chrome'] };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Sequential: 1 worker to avoid hammering Supabase IO budget
  workers: 1,

  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3005',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    // Production has heavier SSR (provider pages do 4+ DB queries)
    navigationTimeout: isProduction ? 60 * 1000 : 30 * 1000,
    headless: true,
  },

  outputDir: 'test-results/artifacts',

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  projects: isProduction
    ? [
        // No seed needed
        { name: 'g1-consumer-ui', use: chromeDevice, testMatch: G1_CONSUMER_UI },
        { name: 'g2-consumer-wizard', use: chromeDevice, testMatch: G2_CONSUMER_WIZARD },
        { name: 'g3-auth-infra', use: chromeDevice, testMatch: G3_AUTH_INFRA },
        // Seed first
        { name: 'g4-consumer-offers', use: chromeDevice, testMatch: G4_CONSUMER_OFFERS },
        { name: 'g5-consumer-status', use: chromeDevice, testMatch: G5_CONSUMER_STATUS },
        { name: 'g6-provider-auth', use: chromeDevice, testMatch: G6_PROVIDER_AUTH },
        { name: 'g7-provider-offers', use: chromeDevice, testMatch: G7_PROVIDER_OFFERS },
        { name: 'g8-provider-config', use: chromeDevice, testMatch: G8_PROVIDER_CONFIG },
        { name: 'g9-admin-core', use: chromeDevice, testMatch: G9_ADMIN_CORE },
        { name: 'g10-admin-ops', use: chromeDevice, testMatch: G10_ADMIN_OPS },
        // Re-seed first (these change data)
        { name: 'g11-mutate', use: chromeDevice, testMatch: G11_MUTATE },
      ]
    : [
        // Local development: standard browser projects
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        {
          name: 'mobile',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 360, height: 780 },
            isMobile: true,
            hasTouch: true,
          },
        },
      ],

  // Skip webServer when BASE_URL is set (testing against production)
  ...(isProduction ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3005',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  }),
});
