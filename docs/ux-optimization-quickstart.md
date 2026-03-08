# Phase 3 UX 优化功能集成指南

## 快速开始

### 1. 安装依赖

```bash
npm install next-themes react-hotkeys-hook next-intl @radix-ui/react-switch
```

### 2. 运行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中执行:
```sql
-- 执行文件: supabase/migrations/028_create_user_preferences.sql
```

### 3. 更新根布局

编辑 `app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/theme/theme-provider'
import { KeyboardShortcutsProvider } from '@/components/accessibility/keyboard-shortcuts-provider'
import { SkipLink } from '@/components/accessibility/skip-link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          <KeyboardShortcutsProvider>
            <SkipLink />
            {children}
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 4. 更新导航栏

在你的导航栏组件中添加:

```tsx
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { KeyboardShortcutsHelp } from '@/components/accessibility/keyboard-shortcuts-help'

export function Navigation() {
  return (
    <nav>
      {/* 其他导航项 */}
      <ThemeToggle />
      <LanguageSwitcher />
      <KeyboardShortcutsHelp />
    </nav>
  )
}
```

### 5. 添加外观设置页面

创建或更新 `app/(main)/(dashboard)/settings/appearance/page.tsx`:

```tsx
import { AppearanceSettings } from '@/components/settings/appearance-settings'

export default function AppearancePage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <AppearanceSettings />
    </div>
  )
}
```

### 6. 添加主内容 ID

在主内容区域添加 `id="main-content"`:

```tsx
<main id="main-content">
  {/* 页面内容 */}
</main>
```

### 7. 运行测试

```bash
npm test
```

## 功能验证清单

- [ ] 主题切换正常工作（浅色/深色/系统）
- [ ] 主题色选择器正常工作
- [ ] 字体大小调节正常工作
- [ ] 高对比度模式正常工作
- [ ] 键盘快捷键正常工作
- [ ] 语言切换正常工作
- [ ] 偏好设置持久化正常工作
- [ ] Skip Link 正常工作
- [ ] 焦点指示器清晰可见
- [ ] 移动端响应式正常

## 故障排除

### 主题不生效

检查 `app/globals.css` 是否包含主题变量定义。

### 键盘快捷键不工作

确保已安装 `react-hotkeys-hook` 并且 `KeyboardShortcutsProvider` 已添加到根布局。

### 语言切换不工作

确保已安装 `next-intl` 并配置了中间件。

### 数据库错误

确保已运行数据库迁移并且 RLS 策略已启用。

## 下一步

查看完整文档: `docs/ux-optimization-report.md`
