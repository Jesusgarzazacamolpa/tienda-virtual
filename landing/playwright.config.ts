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
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4300',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
  webServer: [
    {
      command: 'mvn -q spring-boot:run -Dspring-boot.run.profiles=local',
      cwd: '../backend',
      url: 'http://localhost:8080/actuator/health',
      timeout: 180_000,
      reuseExistingServer: !isCi,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'npm start',
      url: 'http://localhost:4300',
      timeout: 180_000,
      reuseExistingServer: !isCi,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});
