import { test as base, expect, Page } from "@playwright/test";

/**
 * Error Detection Fixtures - Story Testing-1: E2E Reliability Improvements
 *
 * AC 9.1.2: Console Error Detection
 * - Capture console errors (4xx, 5xx responses)
 * - Fail tests when critical API errors occur
 * - Whitelist known acceptable errors
 *
 * AC 9.1.3: Explicit Error State Assertions
 * - Helper functions to check for error states
 * - Assert NO errors before checking for content
 */

// API errors that indicate infrastructure problems (should fail tests)
const CRITICAL_ERROR_PATTERNS = [
  /404.*Not Found/i,
  /403.*Forbidden/i,
  /401.*Unauthorized/i,
  /500.*Internal Server Error/i,
  /502.*Bad Gateway/i,
  /503.*Service Unavailable/i,
  /permission denied/i,
  /42501/, // PostgreSQL permission denied
  /PGRST/,  // PostgREST errors
] as const;

// Errors to ignore (known acceptable errors)
const WHITELISTED_ERRORS = [
  // Add patterns for errors that are acceptable
  /ResizeObserver loop/i, // Browser resize observer (benign)
  /favicon\.ico.*404/i, // Missing favicon (benign)
  /hydration/i, // Next.js hydration warnings (not errors)
  /Failed to load resource.*chrome-extension/i, // Browser extensions
] as const;

interface ApiError {
  type: "console" | "response";
  status?: number;
  url?: string;
  message: string;
  timestamp: Date;
}

interface ErrorDetectionFixtures {
  /** Array of captured API errors */
  apiErrors: ApiError[];
  /** Start capturing errors for the page */
  captureErrors: (page: Page) => void;
  /** Assert no critical errors occurred */
  assertNoApiErrors: () => void;
  /** Check if page shows an error state (toast, error message, etc.) */
  assertNoErrorState: (page: Page) => Promise<void>;
  /** Helper to check specific error patterns */
  hasErrorMatching: (pattern: RegExp) => boolean;
}

/**
 * Extended test with error detection fixtures
 *
 * Note: eslint-disable for react-hooks - Playwright's `use` function
 * is not a React hook despite having the same name.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const test = base.extend<ErrorDetectionFixtures>({
  apiErrors: async ({}, use) => {
    const errors: ApiError[] = [];
    await use(errors);
  },

  captureErrors: async ({ apiErrors }, use) => {
    const captureErrors = (page: Page) => {
      // Capture console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();

          // Skip whitelisted errors
          if (WHITELISTED_ERRORS.some((pattern) => pattern.test(text))) {
            return;
          }

          // Check if it matches critical patterns
          const isCritical = CRITICAL_ERROR_PATTERNS.some((pattern) =>
            pattern.test(text)
          );

          if (isCritical) {
            apiErrors.push({
              type: "console",
              message: text,
              timestamp: new Date(),
            });
          }
        }
      });

      // Capture HTTP response errors
      page.on("response", (response) => {
        const status = response.status();
        const url = response.url();

        // Skip non-API requests (static assets, etc.)
        if (
          url.includes("/_next/") ||
          url.includes(".js") ||
          url.includes(".css") ||
          url.includes(".png") ||
          url.includes(".svg") ||
          url.includes("favicon")
        ) {
          return;
        }

        // Capture 4xx and 5xx errors
        if (status >= 400) {
          // Check if it's a Supabase/API request
          if (
            url.includes("/rest/v1/") ||
            url.includes("/auth/") ||
            url.includes("/api/")
          ) {
            apiErrors.push({
              type: "response",
              status,
              url,
              message: `${status} ${response.statusText()}`,
              timestamp: new Date(),
            });
          }
        }
      });
    };

    await use(captureErrors);
  },

  assertNoApiErrors: async ({ apiErrors }, use) => {
    const assertNoApiErrors = () => {
      if (apiErrors.length > 0) {
        const errorSummary = apiErrors
          .map((e) => {
            if (e.type === "response") {
              return `[${e.status}] ${e.url}\n    ${e.message}`;
            }
            return `[CONSOLE] ${e.message}`;
          })
          .join("\n\n");

        throw new Error(
          `API errors detected during test!\n\n` +
            `${errorSummary}\n\n` +
            `This indicates database/infrastructure issues that tests should not pass silently.`
        );
      }
    };

    await use(assertNoApiErrors);
  },

  hasErrorMatching: async ({ apiErrors }, use) => {
    const hasErrorMatching = (pattern: RegExp): boolean => {
      return apiErrors.some(
        (e) => pattern.test(e.message) || (e.url && pattern.test(e.url))
      );
    };

    await use(hasErrorMatching);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

/**
 * Assert that the page does not show any error state
 * This should be called BEFORE checking for expected content
 */
export async function assertNoErrorState(page: Page): Promise<void> {
  // Common error indicators in the UI
  const errorIndicators = [
    // Toast/notification errors
    page.locator('[data-testid="error-toast"]'),
    page.locator('[role="alert"][data-type="error"]'),
    page.locator(".toast-error"),
    page.locator('[class*="error"]').filter({ hasText: /error|failed/i }),

    // Error messages in content
    page.getByText(/Error:|Failed to|Something went wrong/i),
    page.getByText(/No autenticado|permission denied/i),
    page.getByText(/404|Not Found/i).filter({ hasNotText: /page/ }), // Avoid matching "404 page"

    // Spanish error messages
    page.getByText(/Error al cargar|Ocurrió un error/i),
  ];

  for (const indicator of errorIndicators) {
    const isVisible = await indicator.first().isVisible().catch(() => false);
    if (isVisible) {
      const text = await indicator.first().textContent().catch(() => "");
      throw new Error(
        `Error state detected in UI: "${text}"\n\n` +
          `Tests should FAIL when error states appear, not accept them as "empty state".`
      );
    }
  }
}

/**
 * Assert that content is visible WITHOUT accepting error states
 * Use this instead of "hasContent || hasEmptyState" patterns
 */
export async function assertContentOrEmptyState(
  page: Page,
  contentLocator: ReturnType<Page["locator"]>,
  emptyStateLocator: ReturnType<Page["locator"]>,
  description: string
): Promise<"content" | "empty"> {
  // FIRST: Check for error states - fail immediately if found
  await assertNoErrorState(page);

  // THEN: Check for expected states
  const hasContent = await contentLocator.isVisible().catch(() => false);
  const hasEmptyState = await emptyStateLocator.isVisible().catch(() => false);

  if (!hasContent && !hasEmptyState) {
    throw new Error(
      `Neither content nor empty state found for: ${description}\n\n` +
        `Expected one of:\n` +
        `- Content: ${contentLocator}\n` +
        `- Empty state: ${emptyStateLocator}\n\n` +
        `If the page is loading, increase the wait timeout.`
    );
  }

  return hasContent ? "content" : "empty";
}

// Re-export expect for convenience
export { expect };
