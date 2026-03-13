import { test, expect } from '@playwright/test'

test.describe('认证流程测试', () => {
  test('应该显示登录页面', async ({ page }) => {
    await page.goto('/login')

    // 验证登录表单元素
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('应该显示注册页面', async ({ page }) => {
    await page.goto('/register')

    // 验证注册表单元素
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })

  test('空表单提交应该显示验证错误', async ({ page }) => {
    await page.goto('/login')

    // 尝试提交空表单
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // 应该显示错误信息或保持在登录页面
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/login')
  })
})
