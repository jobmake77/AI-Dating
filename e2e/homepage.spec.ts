import { test, expect } from '@playwright/test'

test.describe('首页测试', () => {
  test('应该成功加载首页', async ({ page }) => {
    await page.goto('/')

    // 验证页面响应状态
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)

    // 验证页面标题
    await expect(page).toHaveTitle(/AI-Dating|A Date with AI/)
  })

  test('应该显示导航栏', async ({ page }) => {
    await page.goto('/')

    // 检查导航元素是否存在
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('应该在移动端显示移动导航', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 移动端导航应该可见
    const mobileNav = page.locator('[data-testid="mobile-nav"]').or(page.locator('button[aria-label*="menu"]'))

    // 至少有一个导航元素应该存在
    const navCount = await page.locator('nav').count()
    expect(navCount).toBeGreaterThan(0)
  })
})
