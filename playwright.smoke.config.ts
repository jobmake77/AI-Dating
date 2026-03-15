import { defineConfig, devices } from '@playwright/test'

const webPort = process.env.PLAYWRIGHT_WEB_PORT || '3000'
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${webPort}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:${webPort} ` +
      'NEXT_PUBLIC_SUPABASE_URL=https://example.com ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-smoke-anon-key ' +
      'SUPABASE_SERVICE_ROLE_KEY=ci-smoke-service-role-key ' +
      `npm run start -- --hostname 127.0.0.1 --port ${webPort}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
