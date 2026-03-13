import { defineConfig, devices } from '@playwright/test'

const webPort = process.env.PLAYWRIGHT_WEB_PORT || '3000'
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${webPort}`
const webServerReadyURL = `${baseURL}/login`

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // 测试超时时间
  timeout: 30 * 1000,

  // 断言超时时间
  expect: {
    timeout: 5000,
  },

  // 失败时重试次数
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // 并行执行的 worker 数量
  workers: process.env.CI ? 1 : undefined,

  // 测试报告
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // 共享配置
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // 配置不同的浏览器
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 开发服务器配置（可选）
  webServer: {
    command:
      `NEXT_PUBLIC_SITE_URL=\${NEXT_PUBLIC_SITE_URL:-http://127.0.0.1:${webPort}} ` +
      'NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://example.com} ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-ci-smoke-anon-key} ' +
      'SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-ci-smoke-service-role-key} ' +
      `npm run dev -- --hostname 127.0.0.1 --port ${webPort}`,
    url: webServerReadyURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
