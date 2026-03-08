# Supabase 连接后错误修复 (2026-03-01)

## 问题总结

用户连接 Supabase 后遇到 3 个错误：
1. Failed to fetch onboarding progress: {}
2. React Hydration Error (aria-controls 不匹配)
3. Runtime TypeError: Cannot read properties of null (reading 'parentNode')

## ✅ 已修复

### 1. Onboarding Progress 获取失败

**问题**:
- `getOnboardingProgress()` 查询失败返回空对象
- 新用户没有 onboarding 记录

**解决方案**:
```typescript
// lib/actions/onboarding.ts
export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // 如果记录不存在 (PGRST116)，自动创建
      if (error.code === 'PGRST116') {
        const { data: newRecord, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            completed_profile: false,
            first_post_published: false,
            explored_content: false,
            checked_membership: false,
            tour_completed: false,
            tour_skipped: false,
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Failed to create onboarding progress:', insertError)
          return null
        }

        return newRecord
      }

      logger.error('Failed to fetch onboarding progress:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error in getOnboardingProgress:', error)
    return null
  }
}
```

**改进**:
- 自动为新用户创建 onboarding 记录
- 使用 try-catch 包裹整个函数
- 使用 logger 替代 console

### 2. React Hydration Error - OnboardingTour

**问题**:
- Joyride 组件在服务端和客户端生成不同的 DOM
- `aria-controls` 属性值不一致
- 导致 hydration 警告

**解决方案**:
```typescript
// components/onboarding/onboarding-tour.tsx
export function OnboardingTour({ run, onComplete, onSkip }: OnboardingTourProps) {
  const [steps] = useState<Step[]>(onboardingSteps)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 只在客户端挂载后渲染 Joyride
  if (!mounted) {
    return null
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={onboardingStyles}
      locale={{...}}
    />
  )
}
```

**原理**:
- 服务端渲染时返回 null
- 客户端挂载后才渲染 Joyride
- 避免 SSR/CSR 不一致

### 3. React Hydration Error - MobileNav

**问题**:
- Sheet 组件（Radix UI）生成随机 ID
- 服务端和客户端 ID 不同

**解决方案**:
```typescript
// components/layout/mobile-nav.tsx
export function MobileNav({ isAuthenticated, username, onSignOut, userCommunities = [] }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 在客户端挂载前显示简单按钮
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden" disabled>
        <Menu className="h-5 w-5" />
        <span className="sr-only">打开菜单</span>
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Sheet>
  )
}
```

**原理**:
- 服务端渲染简单按钮（禁用状态）
- 客户端挂载后渲染完整 Sheet 组件
- 保持视觉一致性

### 4. 替换 console 为 logger

**修改文件**:
- `components/onboarding/onboarding-provider.tsx`
  - `console.error` → `logger.error`

## 修复文件清单

### 已修改
- ✅ `lib/actions/onboarding.ts` - 自动创建记录 + try-catch
- ✅ `components/onboarding/onboarding-tour.tsx` - 添加 mounted 检查
- ✅ `components/onboarding/onboarding-provider.tsx` - 使用 logger
- ✅ `components/layout/mobile-nav.tsx` - 添加 mounted 检查

## Hydration Error 最佳实践

### 问题根源
1. **随机 ID**: Radix UI、Joyride 等库在客户端生成随机 ID
2. **日期格式化**: `toLocaleDateString()` 在不同环境可能不同
3. **条件渲染**: `typeof window !== 'undefined'` 导致 SSR/CSR 不同
4. **外部数据**: 未快照的动态数据

### 解决方案模式

#### 1. 延迟渲染模式
```typescript
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <Fallback /> // 或 null
}

return <ProblematicComponent />
```

#### 2. suppressHydrationWarning
```typescript
<time dateTime={date.toISOString()} suppressHydrationWarning>
  {formatDate(date)}
</time>
```

#### 3. 使用 ClientDate 组件
```typescript
// 之前创建的组件
<ClientDate date={post.created_at} format="relative" />
```

## 测试建议

### 1. 测试新用户流程
- [ ] 注册新账号
- [ ] 首次登录应自动创建 onboarding 记录
- [ ] 引导流程应正常启动

### 2. 测试 Hydration
- [ ] 刷新页面不应看到 hydration 警告
- [ ] 移动端菜单按钮应正常工作
- [ ] 引导流程应正常显示

### 3. 测试错误处理
- [ ] 数据库查询失败应优雅降级
- [ ] 不应看到未捕获的错误

## 下一步

### 高优先级
1. **批量替换日期格式化** - 使用 ClientDate 组件
2. **测试所有 Radix UI 组件** - 确保没有 hydration 问题
3. **添加错误边界** - 防止组件错误导致页面崩溃

### 中优先级
4. **优化 onboarding 体验** - 添加加载状态
5. **改进错误提示** - 向用户显示友好信息

## 相关文档
- [Next.js Hydration Error](https://nextjs.org/docs/messages/react-hydration-error)
- [React 18 Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Radix UI SSR](https://www.radix-ui.com/primitives/docs/guides/server-side-rendering)
