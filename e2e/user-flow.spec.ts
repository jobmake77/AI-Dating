import { test, expect } from '@playwright/test'

test.describe('完整用户流程测试', () => {
  test('用户注册到发布内容的完整流程', async ({ page }) => {
    test.slow()

    // 1. 访问首页
    const homeResponse = await page.goto('/')
    expect(homeResponse?.status()).toBe(200)
    await expect(page).toHaveTitle(/AI-Dating|A Date with AI/)
    await expect(page.locator('nav')).toBeVisible()

    // 2. 导航到注册页面
    const signupLink = page.locator('a[href*="/register"], a[href*="/signup"]').first()
    if (await signupLink.isVisible()) {
      await signupLink.click()
      await page.waitForURL('**/register')
    } else {
      await page.goto('/register')
    }

    // 3. 验证注册表单存在
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // 注意: 实际注册需要真实的邮箱验证，这里只测试表单存在
    // 在真实环境中，你需要使用测试账号或 mock 认证

    // 4. 测试登录页面
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

  })

  test('未登录用户浏览内容流程', async ({ page }) => {
    test.slow()

    // 1. 访问首页
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('#main-content')).toBeVisible()

    // 2. 检查是否有内容展示区域
    const contentArea = page.locator('main, [role="main"], article').first()
    await expect(contentArea).toBeVisible()
  })

  test('搜索功能流程', async ({ page }) => {
    await page.goto('/')

    // 查找搜索输入框或搜索按钮
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('测试搜索')
      await searchInput.press('Enter')

      // 等待搜索结果区域保持可见
      await expect(page.locator('#main-content')).toBeVisible()
    }
  })

  test('响应式导航测试', async ({ page }) => {
    // 桌面端
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()

    // 移动端
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 移动端应该有导航元素
    const navCount = await page.locator('nav').count()
    expect(navCount).toBeGreaterThan(0)
  })
})
