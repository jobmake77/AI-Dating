# 错误处理使用指南

本指南介绍如何在 AI-Dating 项目中使用错误处理系统。

---

## 快速开始

### 1. Server Actions 错误处理

在所有 Server Actions 中使用统一的错误处理：

```typescript
'use server'

import { handleServerActionError } from '@/lib/utils/error-handler'
import { logServerError } from '@/lib/utils/error-logger'

export async function myAction(formData: FormData) {
  try {
    // 1. 验证输入
    const data = validateInput(formData)

    // 2. 执行业务逻辑
    const result = await performOperation(data)

    // 3. 返回成功结果
    return { success: true, data: result }
  } catch (error) {
    // 4. 记录错误
    logServerError(error, {
      action: 'myAction',
      userId: getCurrentUserId(),
    })

    // 5. 返回友好错误消息
    return handleServerActionError(error)
  }
}
```

### 2. API 路由错误处理

在 API 路由中使用：

```typescript
import { handleApiError } from '@/lib/utils/error-handler'
import { logServerError } from '@/lib/utils/error-logger'

export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return Response.json({ data })
  } catch (error) {
    logServerError(error, {
      url: request.url,
      method: 'GET',
    })
    return handleApiError(error)
  }
}
```

### 3. 客户端组件错误处理

使用 ErrorBoundary 包裹可能出错的组件：

```tsx
'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

---

## 核心功能

### 自动重试

对于可能因网络问题失败的操作，使用自动重试：

```typescript
import { withRetry } from '@/lib/utils/error-handler'

async function fetchUserData(userId: string) {
  return await withRetry(
    async () => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Fetch failed')
      return response.json()
    },
    {
      maxRetries: 3,      // 最多重试 3 次
      delay: 1000,        // 初始延迟 1 秒
      backoff: true,      // 使用指数退避（1s, 2s, 4s）
    }
  )
}
```

**重试策略**:
- 默认只重试网络错误和服务器错误
- 不重试认证错误、验证错误等
- 使用指数退避避免服务器过载

### 自定义错误类型

创建自定义错误以提供更好的错误处理：

```typescript
import { AppError, ErrorType } from '@/lib/utils/error-handler'

// 抛出自定义错误
throw new AppError(
  '用户名已被使用',
  ErrorType.VALIDATION,
  400
)

// 在错误处理中识别
try {
  // ...
} catch (error) {
  if (error instanceof AppError && error.type === ErrorType.VALIDATION) {
    // 处理验证错误
  }
}
```

### 错误日志记录

记录错误以便调试和监控：

```typescript
import { logClientError, logServerError } from '@/lib/utils/error-logger'

// 客户端错误
try {
  await submitForm(data)
} catch (error) {
  logClientError(error, {
    component: 'SubmitForm',
    userId: user.id,
    action: 'submit',
    metadata: { formType: 'contact' },
  })
  throw error
}

// 服务端错误
try {
  await updateDatabase(data)
} catch (error) {
  logServerError(error, {
    action: 'updateDatabase',
    userId: user.id,
    metadata: { table: 'posts' },
  })
  throw error
}
```

---

## 常见场景

### 场景 1: 表单提交错误

```tsx
'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { myAction } from '@/lib/actions/my-action'

export function MyForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await myAction(formData)

      if (result.error) {
        // 显示友好错误消息
        toast({
          title: '操作失败',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      // 成功处理
      toast({
        title: '操作成功',
        description: '您的更改已保存',
      })
    } catch (error) {
      // 处理未预期的错误
      toast({
        title: '出错了',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit}>
      {/* 表单字段 */}
    </form>
  )
}
```

### 场景 2: 数据加载错误

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { withRetry } from '@/lib/utils/error-handler'

function DataDisplay() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        // 使用自动重试
        const result = await withRetry(
          () => fetch('/api/data').then(r => r.json())
        )
        setData(result)
      } catch (err) {
        setError(err)
      }
    }
    loadData()
  }, [])

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-destructive">加载失败</p>
        <button onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    )
  }

  return <div>{/* 显示数据 */}</div>
}

export function MyPage() {
  return (
    <ErrorBoundary>
      <DataDisplay />
    </ErrorBoundary>
  )
}
```

### 场景 3: 文件上传错误

```typescript
'use server'

import { handleServerActionError, AppError, ErrorType } from '@/lib/utils/error-handler'

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File

    // 验证文件
    if (!file) {
      throw new AppError('请选择文件', ErrorType.VALIDATION)
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new AppError('文件大小不能超过 10MB', ErrorType.VALIDATION)
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new AppError('只支持 JPG、PNG 和 WebP 格式', ErrorType.VALIDATION)
    }

    // 上传文件
    const url = await uploadToStorage(file)

    return { success: true, url }
  } catch (error) {
    return handleServerActionError(error)
  }
}
```

### 场景 4: 数据库操作错误

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { handleServerActionError, withRetry } from '@/lib/utils/error-handler'
import { logServerError } from '@/lib/utils/error-logger'

export async function createPost(formData: FormData) {
  try {
    const supabase = await createClient()

    // 使用重试机制处理数据库操作
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: formData.get('title'),
          content: formData.get('content'),
        })
        .select()
        .single()

      if (error) throw error
      return data
    })

    return { success: true, data: result }
  } catch (error) {
    logServerError(error, {
      action: 'createPost',
      metadata: { title: formData.get('title') },
    })
    return handleServerActionError(error)
  }
}
```

---

## 错误类型

系统支持以下错误类型：

| 错误类型 | 说明 | HTTP 状态码 | 是否重试 |
|---------|------|------------|---------|
| `NETWORK` | 网络连接错误 | 500 | ✅ 是 |
| `AUTH` | 认证失败 | 401 | ❌ 否 |
| `PERMISSION` | 权限不足 | 403 | ❌ 否 |
| `VALIDATION` | 输入验证失败 | 400 | ❌ 否 |
| `NOT_FOUND` | 资源不存在 | 404 | ❌ 否 |
| `SERVER` | 服务器内部错误 | 500 | ✅ 是 |
| `UNKNOWN` | 未知错误 | 500 | ❌ 否 |

---

## 错误消息映射

系统会自动将技术错误转换为用户友好的消息：

| 技术错误 | 用户友好消息 |
|---------|------------|
| `Failed to fetch` | 网络连接失败，请检查您的网络连接 |
| `Invalid login credentials` | 邮箱或密码错误 |
| `Email not confirmed` | 请先验证您的邮箱 |
| `User already registered` | 该邮箱已被注册，请直接登录 |
| `Internal server error` | 服务器出错了，请稍后重试 |
| `Too many requests` | 请求过于频繁，请稍后再试 |

**添加自定义映射**:

编辑 `/lib/utils/error-handler.ts` 中的 `errorMessages` 对象：

```typescript
const errorMessages: Record<string, string> = {
  // 添加新的映射
  'Custom error message': '自定义的用户友好消息',
  // ...
}
```

---

## ErrorBoundary 高级用法

### 自定义 Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div className="text-center p-8">
      <h2>自定义错误页面</h2>
      <p>出错了，但我们有自定义的 UI</p>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

### 错误回调

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // 发送到分析服务
    analytics.track('component_error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    })
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### 控制错误详情显示

```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
>
  <MyComponent />
</ErrorBoundary>
```

---

## 离线状态处理

离线指示器会自动显示，无需额外配置。

**手动检测离线状态**:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function MyComponent() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return <div>您当前处于离线状态</div>
  }

  return <div>{/* 正常内容 */}</div>
}
```

---

## 最佳实践

### 1. 始终处理错误

❌ **不好**:
```typescript
export async function myAction() {
  const result = await dangerousOperation()
  return { data: result }
}
```

✅ **好**:
```typescript
export async function myAction() {
  try {
    const result = await dangerousOperation()
    return { success: true, data: result }
  } catch (error) {
    return handleServerActionError(error)
  }
}
```

### 2. 提供有意义的错误消息

❌ **不好**:
```typescript
throw new Error('Error')
```

✅ **好**:
```typescript
throw new AppError(
  '用户名必须在 3-20 个字符之间',
  ErrorType.VALIDATION
)
```

### 3. 记录错误上下文

❌ **不好**:
```typescript
catch (error) {
  console.error(error)
}
```

✅ **好**:
```typescript
catch (error) {
  logServerError(error, {
    action: 'createPost',
    userId: user.id,
    metadata: { postId: post.id },
  })
}
```

### 4. 使用 ErrorBoundary 保护组件

❌ **不好**:
```tsx
export function MyPage() {
  return <ComplexComponent />
}
```

✅ **好**:
```tsx
export function MyPage() {
  return (
    <ErrorBoundary>
      <ComplexComponent />
    </ErrorBoundary>
  )
}
```

### 5. 合理使用重试

❌ **不好** (重试所有错误):
```typescript
await withRetry(() => validateEmail(email))
```

✅ **好** (只重试网络错误):
```typescript
await withRetry(
  () => fetch('/api/data'),
  {
    shouldRetry: (error) => {
      // 只重试网络错误
      return error.message.includes('fetch')
    }
  }
)
```

---

## 调试技巧

### 1. 开发环境查看详细错误

错误页面在开发环境会显示完整的错误堆栈，帮助调试。

### 2. 使用浏览器开发工具

- **Network 标签**: 查看网络请求失败
- **Console 标签**: 查看错误日志
- **Application 标签**: 模拟离线状态

### 3. 测试错误场景

```tsx
// 创建测试组件
function ErrorTest() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Test error')
  }

  return (
    <button onClick={() => setShouldError(true)}>
      触发错误
    </button>
  )
}

// 使用
<ErrorBoundary>
  <ErrorTest />
</ErrorBoundary>
```

---

## 常见问题

### Q: 为什么我的错误没有被捕获？

A: 确保：
1. Server Actions 使用了 try-catch
2. 客户端组件被 ErrorBoundary 包裹
3. 异步错误使用了 await

### Q: 如何自定义错误消息？

A: 编辑 `/lib/utils/error-handler.ts` 中的 `errorMessages` 对象。

### Q: 重试次数可以修改吗？

A: 可以，在调用 `withRetry` 时传入 `maxRetries` 参数。

### Q: 如何集成 Sentry？

A: 在 `/lib/utils/error-logger.ts` 中取消注释 Sentry 相关代码，并配置 DSN。

### Q: 离线指示器可以自定义样式吗？

A: 可以，编辑 `/components/offline-indicator.tsx` 修改样式。

---

## 相关文档

- [实现报告](./error-handling-implementation.md)
- [Next.js 错误处理文档](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
