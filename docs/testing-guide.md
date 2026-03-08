# AI-Dating 测试指南

本文档介绍如何在 AI-Dating 项目中运行和编写测试。

## 目录

- [测试框架概述](#测试框架概述)
- [快速开始](#快速开始)
- [单元测试 (Vitest)](#单元测试-vitest)
- [E2E 测试 (Playwright)](#e2e-测试-playwright)
- [编写测试](#编写测试)
- [CI/CD 集成](#cicd-集成)
- [最佳实践](#最佳实践)

---

## 测试框架概述

项目使用两种测试框架：

1. **Vitest** - 用于单元测试和组件测试
   - 快速、现代的测试运行器
   - 与 Vite 生态系统完美集成
   - 支持 TypeScript 和 JSX
   - 内置代码覆盖率报告

2. **Playwright** - 用于端到端 (E2E) 测试
   - 跨浏览器测试（Chromium、Firefox、WebKit）
   - 移动端视口测试
   - 自动等待和重试机制
   - 强大的调试工具

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
# 运行单元测试
npm test

# 运行 E2E 测试
npm run test:e2e
```

---

## 单元测试 (Vitest)

### 运行单元测试

```bash
# 监听模式（开发时推荐）
npm test

# 运行一次
npm run test:run

# 带 UI 界面
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 测试文件位置

单元测试文件位于 `__tests__/` 目录下，遵循以下结构：

```
__tests__/
├── components/          # 组件测试
│   └── ui/
│       └── button.test.tsx
├── lib/                 # 工具函数测试
│   ├── actions/
│   ├── queries/
│   └── utils/
│       ├── date.test.ts
│       └── logger.test.ts
└── app/                 # 页面逻辑测试
```

### 编写单元测试示例

#### 测试工具函数

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from '@/lib/utils/date'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = '2026-03-08T10:30:00Z'
    const result = formatDate(date)
    expect(result).toMatch(/2026/)
  })
})
```

#### 测试 React 组件

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('应该处理点击事件', async () => {
    const user = userEvent.setup()
    let clicked = false

    render(<Button onClick={() => { clicked = true }}>点击</Button>)
    await user.click(screen.getByRole('button'))

    expect(clicked).toBe(true)
  })
})
```

### Mock 数据和依赖

```typescript
import { vi } from 'vitest'

// Mock 函数
const mockFn = vi.fn()

// Mock 模块
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: vi.fn(),
  })),
}))

// Mock 环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
```

---

## E2E 测试 (Playwright)

### 运行 E2E 测试

```bash
# 运行所有 E2E 测试（无头模式）
npm run test:e2e

# 带 UI 界面运行
npm run test:e2e:ui

# 有头模式（可见浏览器）
npm run test:e2e:headed

# 调试模式
npm run test:e2e:debug
```

### 测试文件位置

E2E 测试文件位于 `e2e/` 目录下：

```
e2e/
├── auth.spec.ts         # 认证流程测试
├── homepage.spec.ts     # 首页测试
├── responsive.spec.ts   # 响应式设计测试
└── screenshots/         # 测试截图（自动生成）
```

### 编写 E2E 测试示例

#### 基础页面测试

```typescript
import { test, expect } from '@playwright/test'

test('应该成功加载首页', async ({ page }) => {
  await page.goto('/')

  // 验证页面响应
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)

  // 验证页面标题
  await expect(page).toHaveTitle(/AI-Dating/)
})
```

#### 表单交互测试

```typescript
test('应该提交登录表单', async ({ page }) => {
  await page.goto('/login')

  // 填写表单
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')

  // 提交表单
  await page.click('button[type="submit"]')

  // 验证跳转
  await expect(page).toHaveURL(/\/dashboard/)
})
```

#### 响应式测试

```typescript
test('应该在移动端正确显示', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  // 验证移动端导航
  const mobileNav = page.locator('[data-testid="mobile-nav"]')
  await expect(mobileNav).toBeVisible()
})
```

### Playwright 配置

配置文件位于 `playwright.config.ts`，包含：

- 测试超时设置
- 浏览器配置（Chromium、Firefox、WebKit）
- 移动端设备模拟
- 截图和视频录制
- 开发服务器自动启动

---

## 编写测试

### 测试命名规范

- 测试文件：`*.test.ts` 或 `*.test.tsx`（单元测试）
- E2E 测试文件：`*.spec.ts`（E2E 测试）
- 描述块：使用中文描述功能
- 测试用例：使用"应该..."格式

```typescript
describe('用户认证', () => {
  it('应该成功登录', () => {
    // 测试代码
  })

  it('应该显示错误信息当密码错误时', () => {
    // 测试代码
  })
})
```

### 测试覆盖范围

#### 必须测试的内容

1. **工具函数** - 所有 `lib/utils/` 下的函数
2. **核心组件** - UI 组件库中的基础组件
3. **关键业务逻辑** - 认证、支付、数据处理等
4. **API 路由** - 所有 API 端点
5. **关键用户流程** - 注册、登录、发布内容等

#### 可选测试的内容

1. 简单的展示组件
2. 第三方库的封装（已有测试）
3. 配置文件

### 测试数据管理

```typescript
// 使用测试数据工厂
const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  username: 'testuser',
  ...overrides,
})

// 使用 fixtures
test.use({
  storageState: 'tests/fixtures/auth.json',
})
```

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 最佳实践

### 1. 测试独立性

每个测试应该独立运行，不依赖其他测试的状态。

```typescript
// ✅ 好的做法
beforeEach(() => {
  // 每个测试前重置状态
  vi.clearAllMocks()
})

// ❌ 避免
let sharedState = {}
test('test 1', () => {
  sharedState.value = 1
})
test('test 2', () => {
  expect(sharedState.value).toBe(1) // 依赖 test 1
})
```

### 2. 使用有意义的断言

```typescript
// ✅ 好的做法
expect(user.email).toBe('test@example.com')
expect(button).toBeDisabled()

// ❌ 避免
expect(user).toBeTruthy()
expect(button.disabled).toBe(true)
```

### 3. 测试用户行为，而非实现细节

```typescript
// ✅ 好的做法
await user.click(screen.getByRole('button', { name: /提交/i }))
expect(screen.getByText(/成功/i)).toBeInTheDocument()

// ❌ 避免
expect(component.state.isSubmitting).toBe(true)
```

### 4. 使用 data-testid 谨慎

优先使用语义化选择器（role、label、text），只在必要时使用 `data-testid`。

```typescript
// ✅ 优先使用
screen.getByRole('button', { name: /提交/i })
screen.getByLabelText(/邮箱/i)
screen.getByText(/欢迎/i)

// ⚠️ 必要时使用
screen.getByTestId('complex-component')
```

### 5. 异步测试处理

```typescript
// ✅ 使用 async/await
test('应该加载数据', async () => {
  render(<DataComponent />)
  const data = await screen.findByText(/数据已加载/i)
  expect(data).toBeInTheDocument()
})

// ✅ 使用 waitFor
await waitFor(() => {
  expect(screen.getByText(/完成/i)).toBeInTheDocument()
})
```

### 6. 测试错误情况

```typescript
test('应该处理网络错误', async () => {
  // Mock 失败的请求
  vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

  render(<DataComponent />)

  // 验证错误信息显示
  const error = await screen.findByText(/网络错误/i)
  expect(error).toBeInTheDocument()
})
```

---

## 常见问题

### Q: 测试运行很慢怎么办？

A:
- 使用 `test.concurrent` 并行运行测试
- 减少不必要的 `waitFor` 超时时间
- 使用 `happy-dom` 替代 `jsdom`（更快）

### Q: 如何调试失败的测试？

A:
```bash
# Vitest UI 模式
npm run test:ui

# Playwright 调试模式
npm run test:e2e:debug
```

### Q: 如何跳过某些测试？

A:
```typescript
// 跳过单个测试
test.skip('暂时跳过', () => {})

// 只运行某个测试
test.only('只运行这个', () => {})
```

---

## 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [Playwright 官方文档](https://playwright.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [React Testing 最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**最后更新**: 2026-03-08
