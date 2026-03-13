import { expect, test } from '@playwright/test'

test.describe('Smoke Checks', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/AI-Dating|A Date with AI/)
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('search page loads', async ({ page }) => {
    const response = await page.goto('/search')
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveURL(/\/search/)
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('login page renders form', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })
})
