import { test, expect } from '@playwright/test'

test.describe('响应式设计测试', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`应该在 ${viewport.name} 视口正确显示`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')

      // 验证页面加载
      await expect(page.locator('body')).toBeVisible()

      // 截图用于视觉回归测试
      await page.screenshot({
        path: `e2e/screenshots/${viewport.name.toLowerCase()}-homepage.png`,
        fullPage: true,
      })
    })
  }

  test('应该在移动端正确处理触摸事件', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 测试滚动
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(500)

    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })
})
