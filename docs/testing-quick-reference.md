# 测试快速参考

## 快速开始

```bash
# 运行所有测试
npm run test:run

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 测试模板

### 单元测试模板

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### 组件测试模板

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('should render component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### E2E 测试模板

```typescript
import { test, expect } from '@playwright/test'

test('should complete flow', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Title/)
})
```

## 常用断言

```typescript
// 相等性
expect(value).toBe(expected)
expect(value).toEqual(expected)

// 真值
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// 数字
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)

// 字符串
expect(string).toContain('substring')
expect(string).toMatch(/regex/)

// 数组
expect(array).toContain(item)
expect(array).toHaveLength(3)

// DOM
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveAttribute('href', '/link')
expect(element).toHaveTextContent('text')
```

## Mock 示例

```typescript
// Mock 函数
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock 模块
vi.mock('@/lib/module', () => ({
  myFunction: vi.fn(),
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))
```

## 测试文件位置

```
__tests__/
├── lib/
│   ├── actions/        # Server Actions 测试
│   └── utils/          # 工具函数测试
├── components/         # 组件测试
├── accessibility/      # 可访问性测试
└── helpers/           # 测试辅助工具

e2e/                   # E2E 测试
```

## 调试技巧

```typescript
// 打印 DOM
screen.debug()

// 查找元素
screen.logTestingPlaygroundURL()

// 等待元素
await waitFor(() => {
  expect(screen.getByText('text')).toBeInTheDocument()
})

// 查看所有查询
screen.getByRole('button')
screen.getByLabelText('label')
screen.getByPlaceholderText('placeholder')
screen.getByText('text')
screen.getByTestId('test-id')
```

## 最佳实践

1. ✅ 使用描述性的测试名称
2. ✅ 遵循 AAA 模式（Arrange, Act, Assert）
3. ✅ 测试行为而非实现
4. ✅ 保持测试独立
5. ✅ 使用 beforeEach 清理状态
6. ✅ Mock 外部依赖
7. ✅ 测试边界情况
8. ✅ 保持测试简单

## 避免的做法

1. ❌ 测试实现细节
2. ❌ 测试之间相互依赖
3. ❌ 使用 sleep/timeout
4. ❌ 过度 Mock
5. ❌ 忽略错误处理
6. ❌ 跳过测试（skip）
7. ❌ 只运行部分测试（only）

## 资源

- [测试覆盖率报告](./testing-coverage-report.md)
- [新功能测试指南](./testing-new-features-guide.md)
- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [Playwright 文档](https://playwright.dev/)
