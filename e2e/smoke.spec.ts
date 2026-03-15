import { expect, test } from '@playwright/test'

test.describe('Smoke Checks', () => {
  test.describe.configure({ mode: 'serial' })

  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/AI-Dating|A Date with AI/)
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('search page loads', async ({ page }) => {
    const response = await page.goto('/search', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveURL(/\/search/)
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('login page renders form', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /邮箱登录/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /GitHub 登录/i })).toBeVisible()
  })

  test('register page offers email and GitHub sign up', async ({ page }) => {
    const response = await page.goto('/register', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /GitHub 注册/i })).toBeVisible()
  })

  test('legacy login-client route redirects to login', async ({ page }) => {
    const response = await page.goto('/login-client', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveURL(/\/login$/)
  })
})
