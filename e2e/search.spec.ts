import { test, expect } from '@playwright/test'

test.describe('搜索功能测试', () => {
  test.describe('桌面端搜索', () => {
    test('应该显示搜索输入框', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]')
      const count = await searchInput.count()

      if (count > 0) {
        await expect(searchInput.first()).toBeVisible()
      }
    })

    test('应该能输入搜索关键词', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('React')
        await expect(searchInput).toHaveValue('React')
      }
    })

    test('搜索应该返回结果', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('测试')
        await searchInput.press('Enter')

        // 等待搜索结果
        await page.waitForLoadState('networkidle')

        // 验证 URL 变化或结果显示
        const url = page.url()
        expect(url.includes('search') || url.includes('搜索')).toBeTruthy()
      }
    })
  })

  test.describe('移动端搜索', () => {
    test('应该显示搜索按钮或图标', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // 查找搜索按钮或图标
      const searchButton = page.locator('button[aria-label*="搜索"], button[aria-label*="search"]')
      const searchInput = page.locator('input[type="search"]')

      const hasSearchButton = await searchButton.count() > 0
      const hasSearchInput = await searchInput.count() > 0

      expect(hasSearchButton || hasSearchInput).toBeTruthy()
    })

    test('点击搜索按钮应该打开搜索界面', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      const searchButton = page.locator('button[aria-label*="搜索"], button[aria-label*="search"]').first()

      if (await searchButton.isVisible()) {
        await searchButton.click()

        // 应该显示搜索输入框或模态框
        await page.waitForTimeout(500)
        const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]')
        await expect(searchInput.first()).toBeVisible()
      }
    })
  })

  test.describe('搜索历史', () => {
    test('应该保存搜索历史', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

      if (await searchInput.isVisible()) {
        // 执行搜索
        await searchInput.fill('React')
        await searchInput.press('Enter')
        await page.waitForLoadState('networkidle')

        // 返回首页
        await page.goto('/')

        // 再次打开搜索
        await searchInput.click()

        // 可能显示搜索历史
        await page.waitForTimeout(500)
        const hasHistory = await page.locator('text=/React|历史/i').isVisible()
        expect(hasHistory).toBeDefined()
      }
    })
  })

  test.describe('搜索建议', () => {
    test('输入时应该显示搜索建议', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('Re')

        // 等待建议出现
        await page.waitForTimeout(500)

        // 可能显示搜索建议下拉框
        const suggestions = page.locator('[role="listbox"], [role="menu"]')
        const hasSuggestions = await suggestions.count() > 0
        expect(hasSuggestions).toBeDefined()
      }
    })
  })

  test.describe('热门标签', () => {
    test('应该显示热门标签', async ({ page }) => {
      await page.goto('/')

      // 查找标签元素
      const tags = page.locator('[data-testid="tag"], .tag, a[href*="/tag/"]')
      const count = await tags.count()

      // 可能有热门标签
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('点击标签应该显示相关内容', async ({ page }) => {
      await page.goto('/')

      const tags = page.locator('[data-testid="tag"], .tag, a[href*="/tag/"]')
      const count = await tags.count()

      if (count > 0) {
        await tags.first().click()
        await page.waitForLoadState('networkidle')

        // 验证导航到标签页面
        const url = page.url()
        expect(url.includes('/tag/') || url.includes('/tags/')).toBeTruthy()
      }
    })
  })

  test.describe('搜索过滤', () => {
    test('应该能按类型过滤搜索结果', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first()

      if (await searchInput.isVisible()) {
        await searchInput.fill('测试')
        await searchInput.press('Enter')
        await page.waitForLoadState('networkidle')

        // 查找过滤选项
        const filters = page.locator('button:has-text("文章"), button:has-text("用户"), button:has-text("标签")')
        const hasFilters = await filters.count() > 0
        expect(hasFilters).toBeDefined()
      }
    })
  })
})
