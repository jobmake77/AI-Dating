# 测试模板

本文档提供常用的测试模板，帮助快速编写测试。

---

## 单元测试模板

### 1. 工具函数测试

```typescript
import { describe, it, expect } from 'vitest'
import { yourFunction } from '@/lib/utils/your-module'

describe('yourFunction', () => {
  it('应该返回正确的结果', () => {
    const input = 'test'
    const result = yourFunction(input)
    expect(result).toBe('expected')
  })

  it('应该处理边界情况', () => {
    expect(yourFunction('')).toBe('')
    expect(yourFunction(null)).toBe(null)
  })

  it('应该抛出错误当输入无效时', () => {
    expect(() => yourFunction(undefined)).toThrow()
  })
})
```

### 2. React 组件测试

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YourComponent } from '@/components/your-component'

describe('YourComponent', () => {
  it('应该正确渲染', () => {
    render(<YourComponent />)
    expect(screen.getByText(/预期文本/i)).toBeInTheDocument()
  })

  it('应该处理用户交互', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)

    const button = screen.getByRole('button', { name: /点击/i })
    await user.click(button)

    expect(screen.getByText(/结果/i)).toBeInTheDocument()
  })

  it('应该接受 props', () => {
    render(<YourComponent title="测试标题" />)
    expect(screen.getByText('测试标题')).toBeInTheDocument()
  })
})
```

### 3. 异步函数测试

```typescript
import { describe, it, expect, vi } from 'vitest'
import { fetchData } from '@/lib/api/your-api'

describe('fetchData', () => {
  it('应该成功获取数据', async () => {
    const data = await fetchData('test-id')
    expect(data).toBeDefined()
    expect(data.id).toBe('test-id')
  })

  it('应该处理错误', async () => {
    await expect(fetchData('invalid-id')).rejects.toThrow()
  })

  it('应该使用正确的参数调用 API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    global.fetch = mockFetch

    await fetchData('test-id')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('test-id'),
      expect.any(Object)
    )
  })
})
```

### 4. Server Action 测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { yourAction } from '@/lib/actions/your-action'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: '1' }, error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: { id: '1' }, error: null })),
    })),
  })),
}))

describe('yourAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该成功执行操作', async () => {
    const result = await yourAction({ data: 'test' })
    expect(result.success).toBe(true)
  })

  it('应该返回错误当失败时', async () => {
    const result = await yourAction({ data: 'invalid' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

## E2E 测试模板

### 1. 页面加载测试

```typescript
import { test, expect } from '@playwright/test'

test.describe('页面名称', () => {
  test('应该成功加载页面', async ({ page }) => {
    await page.goto('/your-page')

    // 验证页面响应
    const response = await page.goto('/your-page')
    expect(response?.status()).toBe(200)

    // 验证页面标题
    await expect(page).toHaveTitle(/预期标题/)

    // 验证关键元素
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

### 2. 表单提交测试

```typescript
import { test, expect } from '@playwright/test'

test.describe('表单提交', () => {
  test('应该成功提交表单', async ({ page }) => {
    await page.goto('/form-page')

    // 填写表单
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // 提交表单
    await page.click('button[type="submit"]')

    // 验证结果
    await expect(page).toHaveURL(/\/success/)
    await expect(page.locator('.success-message')).toBeVisible()
  })

  test('应该显示验证错误', async ({ page }) => {
    await page.goto('/form-page')

    // 提交空表单
    await page.click('button[type="submit"]')

    // 验证错误信息
    await expect(page.locator('.error-message')).toBeVisible()
  })
})
```

### 3. 用户流程测试

```typescript
import { test, expect } from '@playwright/test'

test.describe('用户注册流程', () => {
  test('应该完成完整的注册流程', async ({ page }) => {
    // 1. 访问注册页面
    await page.goto('/signup')
    await expect(page.locator('h1')).toContainText('注册')

    // 2. 填写注册信息
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // 3. 提交注册
    await page.click('button[type="submit"]')

    // 4. 验证跳转到欢迎页面
    await expect(page).toHaveURL(/\/welcome/)
    await expect(page.locator('.welcome-message')).toBeVisible()

    // 5. 验证用户信息显示
    await expect(page.locator('.username')).toContainText('testuser')
  })
})
```

### 4. 响应式测试

```typescript
import { test, expect } from '@playwright/test'

test.describe('响应式设计', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`应该在 ${viewport.name} 正确显示`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/your-page')

      // 验证布局
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()

      // 截图
      await page.screenshot({
        path: `e2e/screenshots/${viewport.name.toLowerCase()}.png`,
      })
    })
  }
})
```

### 5. 认证测试（带登录状态）

```typescript
import { test, expect } from '@playwright/test'

// 创建认证 fixture
test.use({
  storageState: 'e2e/fixtures/auth.json',
})

test.describe('需要认证的功能', () => {
  test('应该访问受保护的页面', async ({ page }) => {
    await page.goto('/dashboard')

    // 验证已登录
    await expect(page.locator('.user-menu')).toBeVisible()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('应该执行需要认证的操作', async ({ page }) => {
    await page.goto('/create-post')

    // 填写并提交
    await page.fill('textarea[name="content"]', '测试内容')
    await page.click('button[type="submit"]')

    // 验证成功
    await expect(page.locator('.success-toast')).toBeVisible()
  })
})
```

---

## Mock 模板

### 1. Mock Supabase Client

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: mockData, error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: mockData, error: null })),
      update: vi.fn(() => ({ data: mockData, error: null })),
      delete: vi.fn(() => ({ data: null, error: null })),
    })),
    auth: {
      getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })),
    },
  })),
}))
```

### 2. Mock Next.js Router

```typescript
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}))
```

### 3. Mock Fetch API

```typescript
import { vi } from 'vitest'

global.fetch = vi.fn((url) => {
  if (url.includes('/api/success')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ data: 'success' }),
    })
  }
  return Promise.resolve({
    ok: false,
    json: async () => ({ error: 'Failed' }),
  })
})
```

---

## 测试数据工厂

```typescript
// test-utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockPost = (overrides = {}) => ({
  id: '456',
  title: '测试标题',
  content: '测试内容',
  user_id: '123',
  created_at: new Date().toISOString(),
  ...overrides,
})

// 使用
const user = createMockUser({ username: 'customuser' })
const post = createMockPost({ title: '自定义标题' })
```

---

## 自定义测试工具

```typescript
// test-utils/render.tsx
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

// 带 Provider 的渲染函数
export function renderWithProviders(ui: ReactElement) {
  return render(
    <YourProvider>
      {ui}
    </YourProvider>
  )
}

// 使用
renderWithProviders(<YourComponent />)
```

---

## 快速参考

### 常用断言

```typescript
// 基础断言
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// 数字断言
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3)

// 字符串断言
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// 数组断言
expect(array).toContain(item)
expect(array).toHaveLength(3)

// 对象断言
expect(object).toHaveProperty('key')
expect(object).toMatchObject({ key: 'value' })

// DOM 断言
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveTextContent('text')
expect(element).toHaveClass('className')
```

---

**最后更新**: 2026-03-08
