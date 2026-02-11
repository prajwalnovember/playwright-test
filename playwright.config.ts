import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { json } from 'stream/consumers';

/**
 * Load environment variables from .env file
 * This allows you to use process.env in your tests
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ["json", { outputFile: 'playwright-report/test-results.json' }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL || 'https://your-app.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on',
    headless: true,           // headless mode ensures browsers close automatically
    viewport: { width: 1366, height: 768 },
    actionTimeout: 5000, // 5 seconds for actions like click, fill etc.
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    //{name: 'setup', testMatch: /.*\.setup\.ts/},

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
        //storageState: 'playwright/.auth/user.json',
      },
      //dependencies: ['setup'],

    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
