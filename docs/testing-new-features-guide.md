# 新功能测试指南

本指南帮助开发者为 AI-Dating 项目的新功能编写测试。

## 目录

- [测试原则](#测试原则)
- [测试类型](#测试类型)
- [编写单元测试](#编写单元测试)
- [编写组件测试](#编写组件测试)
- [编写 E2E 测试](#编写-e2e-测试)
- [测试最佳实践](#测试最佳实践)
- [常见问题](#常见问题)

## 测试原则

### 1. 测试金字塔

```
       /\
      /  \     E2E 测试 (少量)
     /____\
    /      \   集成测试 (适量)
   /________\
  /          \ 单元测试 (大量)
 /____________\
```

- **单元测试**: 70% - 测试独立的函数和组件
- **集成测试**: 20% - 测试模块间的交互
- **E2E 测试**: 10% - 测试完整的用户流程

### 2. 测试原则

- **快速**: 测试应该快速执行（< 30 秒）
- **独立**: 测试之间不应该相互依赖
- **可重复**: 测试结果应该一致
- **自我验证**: 测试应该自动判断通过或失败
- **及时**: 测试应该在开发时编写

## 测试类型

### 单元测试

测试独立的函数、类或组件。

**适用场景**:
- 工具函数
- Server Actions
- 数据处理逻辑
- 验证逻辑

### 组件测试

测试 React 组件的渲染和交互。

**适用场景**:
- UI 组件
- 表单组件
- 交互组件
- 布局组件

### E2E 测试

测试完整的用户流程。

**适用场景**:
- 关键用户流程
- 跨页面交互
- 认证流程
- 支付流程

## 编写单元测试

### 1. 测试 Server Actions

```typescript
// __tests__/lib/actions/my-action.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient } from '../../helpers/test-utils'

// Mock 依赖
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('My Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should perform action successfully', async () => {
    // Arrange
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })

    // Act
    const result = await myAction()

    // Assert
    expect(result.error).toBeNull()
  })

  it('should handle errors', async () => {
    // Arrange
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Error' }
      }),
    })

    // Act
    const result = await myAction()

    // Assert
    expect(result.error).toBeDefined()
  })
})
```

### 2. 测试工具函数

```typescript
// __tests__/lib/utils/my-util.test.ts
import { describe, it, expect } from 'vitest'
import { myUtil } from '@/lib/utils/my-util'

describe('myUtil', () => {
  it('should return correct result', () => {
    const result = myUtil('input')
    expect(result).toBe('expected output')
  })

  it('should handle edge cases', () => {
    expect(myUtil('')).toBe('')
    expect(myUtil(null)).toBe(null)
  })
})
```

## 编写组件测试

### 1. 基础组件测试

```typescript
// __tests__/components/my-component.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle props', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### 2. 交互测试

```typescript
import { fireEvent, waitFor } from '@testing-library/react'

it('should handle click events', async () => {
  const handleClick = vi.fn()
  render(<MyButton onClick={handleClick} />)

  const button = screen.getByRole('button')
  fireEvent.click(button)

  expect(handleClick).toHaveBeenCalledTimes(1)
})

it('should handle form submission', async () => {
  render(<MyForm />)

  const input = screen.getByLabelText('Email')
  fireEvent.change(input, { target: { value: 'test@example.com' } })

  const submitButton = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### 3. 可访问性测试

```typescript
it('should be accessible', () => {
  render(<MyComponent />)

  // 检查 ARIA 属性
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Close')

  // 检查键盘导航
  expect(button).toHaveAttribute('tabIndex', '0')

  // 检查语义化 HTML
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading).toBeInTheDocument()
})
```

## 编写 E2E 测试

### 1. 基础 E2E 测试

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should complete user flow', async ({ page }) => {
    // 1. 导航到页面
    await page.goto('/my-feature')

    // 2. 验证页面加载
    await expect(page).toHaveTitle(/My Feature/)

    // 3. 执行操作
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    // 4. 验证结果
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### 2. 认证流程测试

```typescript
test('should login successfully', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  // 验证跳转到首页
  await page.waitForURL('/')
  await expect(page.locator('text=Welcome')).toBeVisible()
})
```

### 3. 响应式测试

```typescript
test('should work on mobile', async ({ page }) => {
  // 设置移动端视口
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  // 验证移动端布局
  const mobileNav = page.locator('[data-testid="mobile-nav"]')
  await expect(mobileNav).toBeVisible()
})
```

## 测试最佳实践

### 1. 使用 AAA 模式

```typescript
it('should do something', () => {
  // Arrange - 准备测试数据
  const input = 'test'

  // Act - 执行操作
  const result = myFunction(input)

  // Assert - 验证结果
  expect(result).toBe('expected')
})
```

### 2. 使用描述性的测试名称

```typescript
// ❌ 不好
it('test 1', () => {})

// ✅ 好
it('should return error when email is invalid', () => {})
```

### 3. 测试边界情况

```typescript
describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('should reject empty email', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('should reject email without @', () => {
    expect(validateEmail('testexample.com')).toBe(false)
  })

  it('should reject email without domain', () => {
    expect(validateEmail('test@')).toBe(false)
  })
})
```

### 4. 避免测试实现细节

```typescript
// ❌ 不好 - 测试实现细节
it('should call setState', () => {
  const component = render(<MyComponent />)
  expect(component.setState).toHaveBeenCalled()
})

// ✅ 好 - 测试行为
it('should display updated value', () => {
  render(<MyComponent />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### 5. 使用 Mock 隔离依赖

```typescript
// Mock 外部 API
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))
```

### 6. 清理测试状态

```typescript
describe('My Tests', () => {
  beforeEach(() => {
    // 每个测试前清理
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 每个测试后清理
    cleanup()
  })
})
```

## 常见问题

### Q: 如何测试异步操作？

```typescript
it('should handle async operations', async () => {
  render(<MyComponent />)

  fireEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Q: 如何测试错误处理？

```typescript
it('should display error message', async () => {
  // Mock 错误响应
  mockSupabaseClient.from.mockReturnValue({
    insert: vi.fn().mockResolvedValue({
      error: { message: 'Error occurred' }
    }),
  })

  render(<MyComponent />)
  fireEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })
})
```

### Q: 如何测试受保护的路由？

```typescript
test('should redirect to login when not authenticated', async ({ page }) => {
  await page.goto('/protected')
  await page.waitForURL('/login')
  expect(page.url()).toContain('/login')
})
```

### Q: 如何测试表单验证？

```typescript
it('should show validation errors', async () => {
  render(<MyForm />)

  // 提交空表单
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))

  // 验证错误信息
  await waitFor(() => {
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })
})
```

### Q: 如何测试 Server Components？

Server Components 不能直接测试，应该测试它们调用的 Server Actions：

```typescript
// 测试 Server Action
it('should fetch data correctly', async () => {
  const result = await fetchData()
  expect(result.data).toBeDefined()
})
```

## 测试检查清单

在提交代码前，确保：

- [ ] 所有测试通过
- [ ] 新功能有对应的测试
- [ ] 测试覆盖了主要场景
- [ ] 测试覆盖了边界情况
- [ ] 测试覆盖了错误处理
- [ ] 测试名称清晰描述
- [ ] 测试独立且可重复
- [ ] 没有跳过的测试（skip）
- [ ] 没有仅运行的测试（only）

## 资源链接

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Playwright 文档](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 获取帮助

如果遇到测试问题：

1. 查看现有测试示例
2. 阅读相关文档
3. 在团队中寻求帮助
4. 查看测试工具的 GitHub Issues

---

**记住**: 好的测试是项目质量的保障，投入时间编写测试是值得的！
