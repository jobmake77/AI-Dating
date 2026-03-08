# AI-Dating 可访问性开发指南

## 目标

本指南帮助开发者在 AI-Dating 项目中编写符合 WCAG 2.1 AA 标准的可访问代码。

---

## 核心原则

### 1. 语义化 HTML 优先

使用正确的 HTML 元素，而不是过度依赖 ARIA。

**好的做法**:
```tsx
<button onClick={handleClick}>提交</button>
<nav aria-label="主导航">...</nav>
<main id="main-content">...</main>
```

**不好的做法**:
```tsx
<div onClick={handleClick} role="button">提交</div>
<div role="navigation">...</div>
<div id="main-content">...</div>
```

### 2. 键盘可访问性

所有交互元素必须可以通过键盘访问。

**检查清单**:
- [ ] 可以使用 Tab 键访问
- [ ] 可以使用 Enter 或 Space 键激活
- [ ] 焦点指示器清晰可见
- [ ] 焦点顺序符合逻辑

### 3. 屏幕阅读器友好

确保屏幕阅读器用户能够理解和使用你的组件。

**检查清单**:
- [ ] 所有图片有 alt 文本（装饰性图片使用空 alt）
- [ ] 所有表单字段有关联的标签
- [ ] 动态内容更新有适当的公告
- [ ] 按钮和链接有描述性文本

---

## 组件开发指南

### Button 组件

#### 基本用法
```tsx
import { Button } from "@/components/ui/button"

// 文本按钮（最佳）
<Button>保存</Button>

// 图标按钮（需要 aria-label）
<Button aria-label="关闭对话框">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// 切换按钮（需要 aria-pressed）
<Button
  aria-label="切换粗体"
  aria-pressed={isBold}
  onClick={() => setIsBold(!isBold)}
>
  <Bold className="h-4 w-4" aria-hidden="true" />
</Button>

// 展开/收起按钮（需要 aria-expanded）
<Button
  aria-label="展开菜单"
  aria-expanded={isOpen}
  aria-controls="menu-id"
  onClick={() => setIsOpen(!isOpen)}
>
  菜单 <ChevronDown className="h-4 w-4" aria-hidden="true" />
</Button>
```

#### 禁用状态
```tsx
// 使用 disabled 属性
<Button disabled>保存</Button>

// 如果需要解释为什么禁用，使用 title 或 tooltip
<Button disabled title="请先填写所有必填字段">
  保存
</Button>
```

### Input 组件

#### 基本用法
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// 始终使用 Label 组件
<div>
  <Label htmlFor="email">邮箱</Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
  />
</div>

// 必填字段
<div>
  <Label htmlFor="username">
    用户名 <span className="text-destructive">*</span>
  </Label>
  <Input
    id="username"
    required
    aria-required="true"
  />
</div>

// 错误状态
<div>
  <Label htmlFor="password">密码</Label>
  <Input
    id="password"
    type="password"
    error={hasError}
    aria-invalid={hasError}
    aria-describedby={hasError ? "password-error" : undefined}
  />
  {hasError && (
    <p id="password-error" className="text-sm text-destructive mt-1">
      密码至少需要 8 个字符
    </p>
  )}
</div>

// 帮助文本
<div>
  <Label htmlFor="bio">个人简介</Label>
  <Textarea
    id="bio"
    aria-describedby="bio-help"
  />
  <p id="bio-help" className="text-sm text-muted-foreground mt-1">
    简短介绍你自己（最多 500 字）
  </p>
</div>
```

### Link 和导航

#### 链接文本
```tsx
// 好的做法：描述性链接文本
<Link href="/profile">查看我的个人资料</Link>

// 不好的做法：模糊的链接文本
<Link href="/profile">点击这里</Link>

// 如果必须使用图标链接，添加 aria-label
<Link href="/settings" aria-label="设置">
  <Settings className="h-5 w-5" aria-hidden="true" />
</Link>
```

#### 当前页面指示
```tsx
// 使用 aria-current 标记当前页面
<Link
  href="/home"
  aria-current={pathname === '/home' ? 'page' : undefined}
  className={pathname === '/home' ? 'font-bold' : ''}
>
  首页
</Link>
```

### 图片和图标

#### 内容图片
```tsx
// 有意义的图片需要 alt 文本
<img
  src="/user-avatar.jpg"
  alt="张三的头像"
  className="w-10 h-10 rounded-full"
/>

// 使用 Next.js Image 组件
<Image
  src="/user-avatar.jpg"
  alt="张三的头像"
  width={40}
  height={40}
  className="rounded-full"
/>
```

#### 装饰性图片和图标
```tsx
// 装饰性图片使用空 alt
<img src="/decoration.png" alt="" />

// 图标使用 aria-hidden
<Home className="h-5 w-5" aria-hidden="true" />

// 如果图标传达信息，使用 aria-label 在父元素上
<button aria-label="首页">
  <Home className="h-5 w-5" aria-hidden="true" />
</button>
```

### 模态框和对话框

#### 基本结构
```tsx
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    {/* 始终包含标题，即使视觉上隐藏 */}
    <DialogTitle>确认删除</DialogTitle>
    <p>你确定要删除这个项目吗？</p>
    <div className="flex gap-2">
      <Button onClick={handleDelete}>删除</Button>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        取消
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

#### 焦点管理
```tsx
// Radix UI Dialog 自动处理焦点管理
// 但如果你自己实现对话框，需要：
// 1. 对话框打开时，焦点移动到对话框内
// 2. 实现焦点陷阱（Tab 键不能离开对话框）
// 3. Esc 键关闭对话框
// 4. 对话框关闭后，焦点返回到触发元素

// 推荐使用 focus-trap-react 库
import FocusTrap from 'focus-trap-react'

<FocusTrap active={isOpen}>
  <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <h2 id="dialog-title">对话框标题</h2>
    {/* 对话框内容 */}
  </div>
</FocusTrap>
```

### 表单验证

#### 实时验证
```tsx
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')

const validateEmail = (value: string) => {
  if (!value) {
    setEmailError('邮箱不能为空')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setEmailError('请输入有效的邮箱地址')
    return false
  }
  setEmailError('')
  return true
}

return (
  <div>
    <Label htmlFor="email">邮箱</Label>
    <Input
      id="email"
      type="email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value)
        validateEmail(e.target.value)
      }}
      error={!!emailError}
      aria-invalid={!!emailError}
      aria-describedby={emailError ? "email-error" : undefined}
    />
    {emailError && (
      <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
        {emailError}
      </p>
    )}
  </div>
)
```

#### 表单提交错误
```tsx
const [formError, setFormError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await submitForm()
  } catch (error) {
    setFormError('提交失败，请重试')
    // 将焦点移动到错误消息
    document.getElementById('form-error')?.focus()
  }
}

return (
  <form onSubmit={handleSubmit}>
    {formError && (
      <div
        id="form-error"
        role="alert"
        className="bg-destructive/10 text-destructive p-4 rounded-md mb-4"
        tabIndex={-1}
      >
        {formError}
      </div>
    )}
    {/* 表单字段 */}
  </form>
)
```

### 动态内容和加载状态

#### 加载指示器
```tsx
// 使用 aria-live 公告加载状态
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>加载中...</span>
    </div>
  ) : (
    <div>{content}</div>
  )}
</div>

// 或使用 role="status"
{isLoading && (
  <div role="status" className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    <span>加载中...</span>
  </div>
)}
```

#### Toast 通知
```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Toast 组件应该使用 role="status" 或 role="alert"
toast({
  title: "保存成功",
  description: "你的更改已保存",
  // 内部实现应该包含 role="status" 和 aria-live="polite"
})

// 错误通知使用 role="alert"
toast({
  variant: "destructive",
  title: "保存失败",
  description: "请重试",
  // 内部实现应该包含 role="alert" 和 aria-live="assertive"
})
```

### 列表和网格

#### 语义化列表
```tsx
// 使用适当的列表元素
<ul role="list">
  {items.map(item => (
    <li key={item.id}>
      <Link href={`/items/${item.id}`}>{item.name}</Link>
    </li>
  ))}
</ul>

// 描述列表
<dl>
  <dt>用户名</dt>
  <dd>zhangsan</dd>
  <dt>邮箱</dt>
  <dd>zhangsan@example.com</dd>
</dl>
```

#### 网格布局
```tsx
// 如果是数据网格，使用 role="grid"
<div role="grid" aria-label="用户列表">
  <div role="row">
    <div role="columnheader">姓名</div>
    <div role="columnheader">邮箱</div>
  </div>
  {users.map(user => (
    <div key={user.id} role="row">
      <div role="gridcell">{user.name}</div>
      <div role="gridcell">{user.email}</div>
    </div>
  ))}
</div>

// 如果只是视觉布局，不需要 role
<div className="grid grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>
```

### 折叠/展开组件

#### Accordion
```tsx
import { useState } from 'react'

const [isOpen, setIsOpen] = useState(false)

<div>
  <button
    onClick={() => setIsOpen(!isOpen)}
    aria-expanded={isOpen}
    aria-controls="content-id"
    className="flex items-center justify-between w-full"
  >
    <span>标题</span>
    <ChevronDown
      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      aria-hidden="true"
    />
  </button>
  {isOpen && (
    <div id="content-id" role="region" aria-labelledby="button-id">
      内容
    </div>
  )}
</div>
```

### 标签页 (Tabs)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Radix UI Tabs 已经包含了正确的 ARIA 属性
<Tabs defaultValue="tab1">
  <TabsList aria-label="内容标签">
    <TabsTrigger value="tab1">标签 1</TabsTrigger>
    <TabsTrigger value="tab2">标签 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">标签 1 的内容</TabsContent>
  <TabsContent value="tab2">标签 2 的内容</TabsContent>
</Tabs>
```

---

## ARIA 属性速查表

### 常用 ARIA 属性

| 属性 | 用途 | 示例 |
|------|------|------|
| `aria-label` | 为元素提供标签 | `<button aria-label="关闭">×</button>` |
| `aria-labelledby` | 引用另一个元素作为标签 | `<div role="dialog" aria-labelledby="title">` |
| `aria-describedby` | 引用描述性文本 | `<input aria-describedby="help-text">` |
| `aria-hidden` | 对屏幕阅读器隐藏元素 | `<Icon aria-hidden="true" />` |
| `aria-live` | 公告动态内容更新 | `<div aria-live="polite">` |
| `aria-current` | 标记当前项 | `<a aria-current="page">` |
| `aria-expanded` | 展开/收起状态 | `<button aria-expanded={isOpen}>` |
| `aria-pressed` | 切换按钮状态 | `<button aria-pressed={isActive}>` |
| `aria-invalid` | 标记无效输入 | `<input aria-invalid={hasError}>` |
| `aria-required` | 标记必填字段 | `<input aria-required="true">` |
| `aria-disabled` | 标记禁用状态 | `<button aria-disabled="true">` |
| `aria-haspopup` | 标记弹出菜单 | `<button aria-haspopup="menu">` |
| `aria-controls` | 引用控制的元素 | `<button aria-controls="menu-id">` |

### ARIA Live Regions

| 值 | 用途 | 示例 |
|------|------|------|
| `polite` | 等待用户空闲时公告 | 加载完成、保存成功 |
| `assertive` | 立即打断公告 | 错误消息、警告 |
| `off` | 不公告（默认） | 静态内容 |

### ARIA Roles

| Role | 用途 | 示例 |
|------|------|------|
| `button` | 按钮 | `<div role="button">` |
| `link` | 链接 | `<span role="link">` |
| `navigation` | 导航区域 | `<div role="navigation">` |
| `main` | 主内容 | `<div role="main">` |
| `complementary` | 补充内容 | `<div role="complementary">` |
| `banner` | 页眉 | `<div role="banner">` |
| `contentinfo` | 页脚 | `<div role="contentinfo">` |
| `search` | 搜索区域 | `<div role="search">` |
| `dialog` | 对话框 | `<div role="dialog">` |
| `alert` | 警告消息 | `<div role="alert">` |
| `status` | 状态消息 | `<div role="status">` |
| `list` | 列表 | `<div role="list">` |
| `listitem` | 列表项 | `<div role="listitem">` |

---

## 常见错误和解决方案

### 错误 1: 缺少 alt 文本
```tsx
// ❌ 错误
<img src="/avatar.jpg" />

// ✅ 正确
<img src="/avatar.jpg" alt="用户头像" />

// ✅ 装饰性图片
<img src="/decoration.png" alt="" />
```

### 错误 2: 图标按钮没有标签
```tsx
// ❌ 错误
<button>
  <X className="h-4 w-4" />
</button>

// ✅ 正确
<button aria-label="关闭">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

### 错误 3: 表单字段没有标签
```tsx
// ❌ 错误
<input type="text" placeholder="用户名" />

// ✅ 正确
<Label htmlFor="username">用户名</Label>
<Input id="username" type="text" />
```

### 错误 4: 使用 div 作为按钮
```tsx
// ❌ 错误
<div onClick={handleClick}>点击我</div>

// ✅ 正确
<button onClick={handleClick}>点击我</button>

// ✅ 如果必须使用 div，添加完整的可访问性支持
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  点击我
</div>
```

### 错误 5: 颜色对比度不足
```tsx
// ❌ 错误：浅灰色文本在白色背景上
<p className="text-gray-300">这段文字很难阅读</p>

// ✅ 正确：使用足够的对比度
<p className="text-gray-700">这段文字容易阅读</p>

// 使用工具检查对比度：
// - Chrome DevTools
// - WebAIM Contrast Checker
// 目标：至少 4.5:1 (正文文本)
```

### 错误 6: 模态框没有焦点管理
```tsx
// ❌ 错误：焦点可以离开模态框
<div className="modal">
  <h2>标题</h2>
  <button>确定</button>
</div>

// ✅ 正确：使用 Radix UI Dialog 或实现焦点陷阱
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>标题</DialogTitle>
    <Button>确定</Button>
  </DialogContent>
</Dialog>
```

---

## 测试工具

### 浏览器扩展
- **axe DevTools**: 自动化可访问性测试
- **WAVE**: 可视化可访问性问题
- **Lighthouse**: Chrome DevTools 内置

### 屏幕阅读器
- **NVDA** (Windows, 免费)
- **JAWS** (Windows, 付费)
- **VoiceOver** (macOS/iOS, 内置)
- **TalkBack** (Android, 内置)

### 在线工具
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)

---

## 代码审查清单

在提交 PR 前，检查以下项目：

- [ ] 所有交互元素可以通过键盘访问
- [ ] 焦点指示器清晰可见
- [ ] 所有图片有适当的 alt 文本
- [ ] 所有表单字段有关联的标签
- [ ] 按钮和链接有描述性文本
- [ ] 使用语义化 HTML 元素
- [ ] ARIA 属性使用正确
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 使用 axe DevTools 扫描无严重错误
- [ ] 使用屏幕阅读器测试核心功能

---

## 参考资源

- [WCAG 2.1 快速参考](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI 文档](https://www.radix-ui.com/) - 我们的 UI 组件基于此
- [WebAIM 文章](https://webaim.org/articles/)
- [MDN 可访问性](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## 获取帮助

如果你对可访问性有疑问：

1. 查看本指南和参考资源
2. 使用 axe DevTools 检查你的代码
3. 在团队中询问
4. 参考 Radix UI 组件的实现

记住：可访问性不是额外的工作，而是良好开发实践的一部分。
