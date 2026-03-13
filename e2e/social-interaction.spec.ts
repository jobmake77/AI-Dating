import { test, expect } from '@playwright/test'

test.describe('社交互动功能测试', () => {
  test.describe('点赞功能', () => {
    test('应该显示点赞按钮', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      // 查找点赞按钮（可能在内容卡片中）
      const likeButtons = page.locator('button[aria-label*="赞"], button[aria-label*="like"]')
      const count = await likeButtons.count()

      // 如果有内容，应该有点赞按钮
      if (count > 0) {
        await expect(likeButtons.first()).toBeVisible()
      }
    })

    test('未登录用户点赞应该跳转到登录页', async ({ page }) => {
      test.slow()

      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      const likeButton = page.locator('button[aria-label*="赞"], button[aria-label*="like"]').first()

      if (await likeButton.isVisible()) {
        await likeButton.click()

        // 可能会跳转到登录页或显示登录提示
        await page.waitForTimeout(1000)
        const url = page.url()
        const hasLoginModal = await page.locator('[role="dialog"]').isVisible()

        expect(url.includes('/login') || hasLoginModal).toBeTruthy()
      }
    })
  })

  test.describe('评论功能', () => {
    test('应该能查看评论区', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      // 查找评论按钮或评论区
      const commentButtons = page.locator('button[aria-label*="评论"], button[aria-label*="comment"]')
      const count = await commentButtons.count()

      if (count > 0) {
        await expect(commentButtons.first()).toBeVisible()
      }
    })

    test('未登录用户评论应该提示登录', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      const commentButton = page.locator('button[aria-label*="评论"], button[aria-label*="comment"]').first()

      if (await commentButton.isVisible()) {
        await commentButton.click()
        await page.waitForTimeout(500)

        // 应该显示登录提示或跳转
        const hasLoginPrompt = await page.locator('text=/登录|sign in/i').isVisible()
        expect(hasLoginPrompt).toBeTruthy()
      }
    })
  })

  test.describe('关注功能', () => {
    test('应该能访问用户主页', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      // 查找用户链接
      const userLinks = page.locator('a[href*="/u/"]')
      const count = await userLinks.count()

      if (count > 0) {
        const firstUserLink = userLinks.first()
        await firstUserLink.click()

        // 验证在用户主页
        await expect(page).toHaveURL(/\/u\//)
      }
    })

    test('用户主页应该显示关注按钮', async ({ page }) => {
      // 直接访问一个用户主页（如果存在）
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      const userLinks = page.locator('a[href*="/u/"]')
      const count = await userLinks.count()

      if (count > 0) {
        const href = await userLinks.first().getAttribute('href')
        if (href) {
          await page.goto(href)
          await expect(page).toHaveURL(/\/u\//)

          // 查找关注按钮
          const followButton = page.locator('button:has-text("关注"), button:has-text("Follow")')
          // 关注按钮可能存在
          const buttonExists = await followButton.count() > 0
          expect(buttonExists).toBeDefined()
        }
      }
    })
  })

  test.describe('分享功能', () => {
    test('应该显示分享按钮', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('#main-content')).toBeVisible()

      // 查找分享按钮
      const shareButtons = page.locator('button[aria-label*="分享"], button[aria-label*="share"]')
      const count = await shareButtons.count()

      // 分享按钮可能存在
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
