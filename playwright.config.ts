import path from 'path';

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env file only in non-CI environment
if (!process.env.CI) {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e-tests',
  /* ensure sequential execution */
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
    }],
    ['line']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    baseURL: 'http://localhost:3000',

    launchOptions: {
      args: [
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Increase timeouts
    navigationTimeout: 6000,
    actionTimeout: 15000,

    trace: 'on-first-retry',
  },

  webServer: {
    command: process.env.CI
      ? 'npm run build && npm run start' // For CI: build then start
      : 'npm run dev', // For local: just dev
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    /*
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        contextOptions: {
          ignoreHTTPSErrors: true
        },
        launchOptions: {
          args: ['--ignore-certificate-errors']
        }
      },

    },
    */

    /*/!* Test against mobile viewports. *!/
     {
       name: 'Mobile Chrome',
       use: { ...devices['Pixel 5'] },
     },
     {
       name: 'Mobile Safari',
       use: { ...devices['iPhone 12'] },
     },

    /!* Test against branded browsers. *!/
     {
       name: 'Microsoft Edge',
       use: { ...devices['Desktop Edge'], channel: 'msedge' },
     },
     {
       name: 'Google Chrome',
       use: { ...devices['Desktop Chrome'], channel: 'chrome' },
     },*/
  ],
});
