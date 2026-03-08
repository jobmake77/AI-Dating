# 可访问性快速参考卡

## 🎯 核心原则

1. **语义化 HTML 优先** - 使用正确的 HTML 元素
2. **键盘可访问** - 所有功能都可以通过键盘使用
3. **屏幕阅读器友好** - 提供清晰的标签和说明
4. **清晰的焦点指示器** - 用户始终知道焦点在哪里

---

## ⌨️ 键盘导航要求

- ✅ 所有交互元素可以通过 Tab 键访问
- ✅ Enter 或 Space 键可以激活按钮
- ✅ Esc 键可以关闭对话框
- ✅ 焦点顺序符合逻辑

---

## 🔘 Button 组件

```tsx
// ✅ 文本按钮
<Button>保存</Button>

// ✅ 图标按钮（需要 aria-label）
<Button aria-label="关闭">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// ✅ 切换按钮（需要 aria-pressed）
<Button aria-pressed={isActive}>
  <Bold className="h-4 w-4" aria-hidden="true" />
</Button>

// ✅ 展开/收起按钮
<Button
  aria-expanded={isOpen}
  aria-controls="menu-id"
>
  菜单 <ChevronDown aria-hidden="true" />
</Button>
```

---

## 📝 Input 组件

```tsx
// ✅ 始终使用 Label
<Label htmlFor="email">邮箱</Label>
<Input id="email" type="email" />

// ✅ 必填字段
<Label htmlFor="username">
  用户名 <span className="text-destructive">*</span>
</Label>
<Input id="username" required aria-required="true" />

// ✅ 错误状态
<Label htmlFor="password">密码</Label>
<Input
  id="password"
  error={hasError}
  aria-invalid={hasError}
  aria-describedby="password-error"
/>
{hasError && (
  <p id="password-error" className="text-sm text-destructive">
    密码至少需要 8 个字符
  </p>
)}
```

---

## 🔗 Link 组件

```tsx
// ✅ 描述性链接文本
<Link href="/profile">查看我的个人资料</Link>

// ❌ 避免模糊的链接文本
<Link href="/profile">点击这里</Link>

// ✅ 图标链接（需要 aria-label）
<Link href="/settings" aria-label="设置">
  <Settings className="h-5 w-5" aria-hidden="true" />
</Link>

// ✅ 当前页面指示
<Link
  href="/home"
  aria-current={isActive ? 'page' : undefined}
>
  首页
</Link>
```

---

## 🖼️ 图片和图标

```tsx
// ✅ 内容图片（需要 alt）
<img src="/avatar.jpg" alt="用户头像" />

// ✅ 装饰性图片（空 alt）
<img src="/decoration.png" alt="" />

// ✅ 图标（aria-hidden）
<Home className="h-5 w-5" aria-hidden="true" />

// ✅ 图标按钮（在父元素上添加 aria-label）
<button aria-label="首页">
  <Home className="h-5 w-5" aria-hidden="true" />
</button>
```

---

## 💬 对话框和模态框

```tsx
// ✅ 使用 Radix UI Dialog（自动处理焦点）
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>确认删除</DialogTitle>
    <p>你确定要删除这个项目吗？</p>
    <Button onClick={handleDelete}>删除</Button>
  </DialogContent>
</Dialog>
```

---

## 📋 表单验证

```tsx
// ✅ 错误消息关联到输入框
<Input
  id="email"
  error={!!emailError}
  aria-invalid={!!emailError}
  aria-describedby={emailError ? "email-error" : undefined}
/>
{emailError && (
  <p id="email-error" role="alert" className="text-destructive">
    {emailError}
  </p>
)}
```

---

## 🔄 动态内容

```tsx
// ✅ 加载状态（aria-live）
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "加载中..." : content}
</div>

// ✅ 错误消息（role="alert"）
{error && (
  <div role="alert" className="text-destructive">
    {error}
  </div>
)}

// ✅ 上传进度
<span aria-live="polite">{progress}%</span>
```

---

## 📱 导航和 Landmarks

```tsx
// ✅ 主内容
<main id="main-content">
  {children}
</main>

// ✅ 导航
<nav aria-label="主导航">
  {/* 导航链接 */}
</nav>

// ✅ 侧边栏
<aside aria-label="相关内容">
  {/* 侧边栏内容 */}
</aside>

// ✅ 跳转链接
<a href="#main-content" className="skip-link">
  跳到主内容
</a>
```

---

## 🎨 颜色对比度

### 最低要求（WCAG AA）
- 正文文本：**4.5:1**
- 大文本（18pt+）：**3:1**
- UI 组件：**3:1**

### 检查工具
- Chrome DevTools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🧪 测试清单

### 快速测试
- [ ] 使用 Tab 键导航整个页面
- [ ] 焦点指示器清晰可见
- [ ] 所有按钮可以用 Enter/Space 激活
- [ ] 所有图标有 aria-hidden="true"
- [ ] 所有表单字段有关联的标签

### 工具测试
- [ ] axe DevTools 扫描无严重错误
- [ ] WAVE 工具检查通过
- [ ] Lighthouse 可访问性得分 > 90

### 屏幕阅读器测试
- [ ] NVDA/JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

---

## ❌ 常见错误

### 1. 缺少 alt 文本
```tsx
// ❌ 错误
<img src="/avatar.jpg" />

// ✅ 正确
<img src="/avatar.jpg" alt="用户头像" />
```

### 2. 图标按钮没有标签
```tsx
// ❌ 错误
<button><X /></button>

// ✅ 正确
<button aria-label="关闭">
  <X aria-hidden="true" />
</button>
```

### 3. 表单字段没有标签
```tsx
// ❌ 错误
<input placeholder="用户名" />

// ✅ 正确
<Label htmlFor="username">用户名</Label>
<Input id="username" />
```

### 4. 使用 div 作为按钮
```tsx
// ❌ 错误
<div onClick={handleClick}>点击</div>

// ✅ 正确
<button onClick={handleClick}>点击</button>
```

---

## 📚 参考资源

- **完整指南**: `docs/accessibility-guide.md`
- **测试清单**: `docs/accessibility-testing-checklist.md`
- **改进报告**: `docs/accessibility-improvements.md`

### 在线资源
- [WCAG 2.1 快速参考](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM 文章](https://webaim.org/articles/)

---

## 🆘 获取帮助

1. 查看 `docs/accessibility-guide.md`
2. 使用 axe DevTools 检查你的代码
3. 在团队中询问
4. 参考 Radix UI 组件的实现

---

**记住**: 可访问性不是额外的工作，而是良好开发实践的一部分！
