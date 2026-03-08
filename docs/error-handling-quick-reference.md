# 错误处理快速参考

## 快速导入

```typescript
// Server Actions
import { handleServerActionError } from '@/lib/utils/error-handler'
import { logServerError } from '@/lib/utils/error-logger'

// Client Components
import { ErrorBoundary } from '@/components/error-boundary'
import { logClientError } from '@/lib/utils/error-logger'

// 自动重试
import { withRetry } from '@/lib/utils/error-handler'

// 自定义错误
import { AppError, ErrorType } from '@/lib/utils/error-handler'
```

## 常用模式

### Server Action 模板

```typescript
'use server'

import { handleServerActionError } from '@/lib/utils/error-handler'

export async function myAction(formData: FormData) {
  try {
    // 业务逻辑
    return { success: true, data: result }
  } catch (error) {
    return handleServerActionError(error)
  }
}
```

### API 路由模板

```typescript
import { handleApiError } from '@/lib/utils/error-handler'

export async function GET(request: Request) {
  try {
    return Response.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### 客户端组件模板

```tsx
'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export function MyComponent() {
  return (
    <ErrorBoundary>
      <YourContent />
    </ErrorBoundary>
  )
}
```

### 自动重试模板

```typescript
import { withRetry } from '@/lib/utils/error-handler'

const data = await withRetry(
  () => fetch('/api/data').then(r => r.json()),
  { maxRetries: 3, backoff: true }
)
```

## 错误类型

```typescript
ErrorType.NETWORK      // 网络错误 (重试)
ErrorType.AUTH         // 认证错误
ErrorType.VALIDATION   // 验证错误
ErrorType.NOT_FOUND    // 404
ErrorType.PERMISSION   // 权限错误
ErrorType.SERVER       // 服务器错误 (重试)
ErrorType.UNKNOWN      // 未知错误
```

## 自定义错误

```typescript
throw new AppError(
  '用户友好的错误消息',
  ErrorType.VALIDATION,
  400 // HTTP 状态码
)
```

## 错误日志

```typescript
// 客户端
logClientError(error, {
  component: 'MyComponent',
  userId: user.id,
})

// 服务端
logServerError(error, {
  action: 'myAction',
  userId: user.id,
})
```

## 文件位置

- 错误处理工具: `/lib/utils/error-handler.ts`
- 错误日志: `/lib/utils/error-logger.ts`
- 错误边界: `/components/error-boundary.tsx`
- 离线指示器: `/components/offline-indicator.tsx`
- 全局错误: `/app/global-error.tsx`
- 根错误: `/app/error.tsx`
- 404 页面: `/app/not-found.tsx`

## 详细文档

- [实现报告](./error-handling-implementation.md)
- [使用指南](./error-handling-guide.md)
