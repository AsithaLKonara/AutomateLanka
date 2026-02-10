import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.FRONTEND_URL || 'http://localhost:4000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'cd ../../apps/backend && SKIP_ENV_VALIDATION=true npm run dev',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        ...process.env,
        SKIP_ENV_VALIDATION: 'true',
        NODE_ENV: 'test',
        DATABASE_URL: 'file:/Users/asithalakmal/Documents/web/automatelanka/apps/backend/prisma/dev.db',
        JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-32-chars-min-at-least',
        REFRESH_SECRET: process.env.REFRESH_SECRET || 'test-refresh-secret-key-32-chars-min-at-least',
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',
        PORT: '8000',
        FRONTEND_URL: 'http://localhost:4000',
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    },
  ],
});

