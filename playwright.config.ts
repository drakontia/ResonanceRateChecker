import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for Resonance Trade Center.
 *
 * Test matrix:
 *   - chromium-desktop  : 1280×720  – exercises Tooltip + desktop PriceValueCell branch
 *   - chromium-mobile   : 390×844   – exercises direct-icon mobile PriceValueCell branch
 *
 * The dev server is started automatically via webServer.  If a server is
 * already running on port 3000 (local dev workflow), it is reused.
 *
 * Artifacts (screenshot, video, trace) are captured on failure / first retry
 * so debugging CI failures is straightforward.
 */
export default defineConfig({
  // ─── Test discovery ──────────────────────────────────────────────────────
  testDir: './tests/e2e',

  // ─── Timeouts ────────────────────────────────────────────────────────────
  /** Per-test timeout (ms). */
  timeout: 30_000,
  /** expect() assertion timeout (ms). */
  expect: { timeout: 10_000 },

  // ─── Parallelism / reliability ────────────────────────────────────────────
  fullyParallel: true,
  /** Fail the suite immediately if a test uses test.only() in CI. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // ─── Reporters ───────────────────────────────────────────────────────────
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI
      ? ([['junit', { outputFile: 'playwright-results.xml' }]] as const)
      : []),
  ],

  // ─── Shared browser context options ──────────────────────────────────────
  use: {
    baseURL: 'http://localhost:3000',

    /** Capture a trace zip on the first retry of a failing test. */
    trace: 'on-first-retry',
    /** Capture a screenshot whenever a test fails. */
    screenshot: 'only-on-failure',
    /** Record a video on the first retry of a failing test. */
    video: 'on-first-retry',

    /**
     * The app redirects HTTP→HTTPS when `x-forwarded-proto: http` is present.
     * In local dev this header is never set, so plain HTTP works fine.
     */
    ignoreHTTPSErrors: true,

    /**
     * Japanese locale so any Intl-based formatting (e.g. price.toLocaleString)
     * produces predictable output regardless of the CI runner's locale.
     */
    locale: 'ja-JP',
  },

  // ─── Browser projects ────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        /**
         * ≥ 768 px  →  useIsMobile() returns false
         *            →  PriceValueCell renders icons inside <Tooltip>
         */
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
        /**
         * < 768 px  →  useIsMobile() returns true
         *            →  PriceValueCell renders icons directly (no Tooltip)
         */
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  // ─── Dev server ──────────────────────────────────────────────────────────
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    /** Reuse an already-running server during local development. */
    reuseExistingServer: !process.env.CI,
    /** Give Next.js up to 2 minutes to compile and start. */
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
