import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4400',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: isCi ? undefined : (process.env['PLAYWRIGHT_CHANNEL'] ?? 'msedge')
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4400',
    timeout: 120_000,
    reuseExistingServer: !isCi,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});
