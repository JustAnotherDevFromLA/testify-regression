import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalTimeout: 15 * 60 * 1000,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    [
      'monocart-reporter',
      {
        name: 'Testify Solutions Regression',
        outputFile: 'monocart-report/index.html',
      },
    ],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.SITE_BASE_URL ?? 'https://testifysolutions.net',
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile-chromium',
      grep: /@smoke/,
      use: { ...devices['Pixel 7'] },
    },
  ],
});
