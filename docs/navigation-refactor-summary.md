# 主页面导航重构 - 实施总结

**完成时间**: 2026-02-24
**状态**: ✅ 实施完成，待测试

---

## 实施概览

成功实现了 Discord 风格的左侧导航栏，提升了消息、社区等功能的可发现性。

### 核心改进

- ✅ 添加固定左侧导航栏（240px）
- ✅ 集成消息、社区功能入口
- ✅ 显示用户已加入的社区列表
- ✅ 移动端导航优化
- ✅ 未读消息/通知徽章
- ✅ 响应式设计

---

## 新建文件

### 1. NavLink 组件
**路径**: `components/layout/nav-link.tsx`

可复用的导航链接组件，特性：
- 支持图标、文本、徽章
- 自动高亮当前页面
- 悬停效果
- 响应式设计

### 2. CommunityNavItem 组件
**路径**: `components/layout/community-nav-item.tsx`

社区导航项组件，特性：
- 显示社区图标和名称
- 支持未读数量徽章
- 自动高亮当前社区
- 图标占位符（无图标时显示首字母）

### 3. LeftSidebar 组件
**路径**: `components/layout/left-sidebar.tsx`

主左侧导航栏组件，包含：
- **主导航区域**: 首页、消息、社区、通知
- **我的社区**: 显示已加入的社区（最多10个）
- **用户信息**: 头像、用户名、个人主页链接
- **响应式**: lg 以上屏幕显示，移动端隐藏

---

## 修改文件

### 1. 主页布局
**文件**: `app/(main)/page.tsx`

**改动**:
```typescript
// 添加左侧导航
import { LeftSidebar } from "@/components/layout/left-sidebar"

// 布局调整
<div className="flex gap-0">
  <LeftSidebar />  {/* 新增 */}
  <main className="flex-1 lg:max-w-[640px]">...</main>
  <aside className="hidden xl:block">...</aside>  {/* xl 显示 */}
</div>
```

### 2. Header
**文件**: `components/layout/site-header.tsx`

**改动**:
- 添加消息图标（MessageCircle）
- 显示未读消息数量徽章
- 实时更新未读消息数（60秒轮询）
- 导入 `getUnreadMessagesCount` action

### 3. 移动端底部导航
**文件**: `components/layout/mobile-bottom-nav.tsx`

**改动**:
- 将"搜索"替换为"消息"
- 保留 5 个图标：首页、消息、发布、社区、我的
- 添加 `unreadMessages` 参数
- 消息图标显示未读徽章

### 4. 移动端侧边菜单
**文件**: `components/layout/mobile-nav.tsx`

**改动**:
- 添加"消息"和"社区"链接
- 新增"我的社区"部分
- 显示社区图标和名称
- 支持 `userCommunities` 参数

### 5. 聊天 Actions
**文件**: `lib/actions/chat.ts`

**新增函数**:
```typescript
export async function getUnreadMessagesCount()
```
- 计算所有会话的未读消息总数
- 遍历用户参与的所有会话
- 统计未读消息数量

---

## 响应式布局

| 屏幕宽度 | 左侧导航 | 主内容 | 右侧边栏 | 底部导航 |
|---------|---------|--------|---------|---------|
| ≥1280px (xl) | ✅ 240px | 640px | ✅ 350px | ❌ |
| 1024-1279px (lg) | ✅ 240px | 自适应 | ❌ | ❌ |
| <1024px | ❌ | 全宽 | ❌ | ✅ |

---

## 功能特性

### 桌面端（≥1024px）

**左侧导航栏**:
- 固定在左侧，宽度 240px
- 主导航：首页、消息、社区、通知
- 我的社区列表（最多10个）
- 用户信息区域（底部）

**主内容区**:
- 最大宽度 640px
- 居中显示
- 可滚动

**右侧边栏**:
- 仅在 xl 屏幕（≥1280px）显示
- 宽度 350px
- 显示热门标签和内容

### 移动端（<1024px）

**底部导航**:
- 5 个图标：首页、消息、发布、社区、我的
- 消息图标显示未读徽章
- 当前页面高亮

**侧边菜单**:
- 汉堡菜单触发
- 包含所有导航链接
- 显示"我的社区"列表
- 社区图标和名称

---

## 未读徽章

### 消息徽章
- **位置**: Header 消息图标、移动端底部导航
- **数据源**: `getUnreadMessagesCount()` action
- **更新频率**: 60秒轮询
- **显示规则**: >0 显示，>99 显示 "99+"

### 通知徽章
- **位置**: Header 通知图标、左侧导航
- **数据源**: `getUnreadCount()` action（已存在）
- **更新频率**: 60秒轮询 + Realtime 订阅
- **显示规则**: >0 显示，>99 显示 "99+"

---

## 测试清单

### 桌面端测试

- [ ] 左侧导航正常显示（≥1024px）
- [ ] 主导航链接可点击，当前页面高亮
- [ ] "我的社区"列表正常显示
- [ ] 社区图标和名称正确显示
- [ ] 未读消息徽章显示正确
- [ ] 未读通知徽章显示正确
- [ ] 用户信息区域显示正确
- [ ] 点击用户信息跳转到个人主页
- [ ] 主内容区宽度正确（640px）
- [ ] 右侧边栏在 xl 屏幕显示，lg 屏幕隐藏

### 移动端测试

- [ ] 左侧导航隐藏（<1024px）
- [ ] 底部导航显示 5 个图标
- [ ] 底部导航图标可点击
- [ ] 当前页面图标高亮
- [ ] 消息图标显示未读徽章
- [ ] 侧边菜单可打开
- [ ] 侧边菜单显示所有导航链接
- [ ] 侧边菜单显示"我的社区"列表
- [ ] 社区图标和名称正确显示

### 功能测试

- [ ] 点击"消息"跳转到 `/messages`
- [ ] 点击"社区"跳转到 `/communities`
- [ ] 点击社区列表项跳转到对应社区
- [ ] 未读消息数量正确显示
- [ ] 未读通知数量正确显示
- [ ] 登录/登出后导航状态正确更新
- [ ] 加入/退出社区后列表更新

### 响应式测试

测试以下屏幕尺寸：
- [ ] 1920x1080 (桌面) - 三栏布局
- [ ] 1280x800 (笔记本) - 左侧导航 + 主内容
- [ ] 768x1024 (平板) - 主内容 + 底部导航
- [ ] 375x667 (手机) - 主内容 + 底部导航

---

## 已知问题

### 1. TypeScript 错误（预先存在）

**文件**: `app/(main)/communities/[slug]/members/page.tsx:69`

**错误**:
```
Type '() => Promise<{ success: boolean; error: string; }>' is not assignable to type 'string | ((formData: FormData) => void | Promise<void>)'
```

**原因**: Server action 返回类型不符合 form action 要求

**影响**: 阻止构建，但不影响导航重构功能

**建议**: 修改 `updateMemberRole` 和 `removeMember` actions 的返回类型

### 2. 未读消息实时更新

**当前实现**: 60秒轮询

**建议优化**: 添加 Supabase Realtime 订阅

**实现方式**:
```typescript
// 订阅新消息
supabase
  .channel('messages-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  }, (payload) => {
    // 更新未读消息数
  })
  .subscribe()
```

---

## 性能考虑

### 查询优化

1. **社区列表查询**
   - 限制返回 10 个社区
   - 使用 `getUserCommunities` 复用现有查询
   - 考虑添加缓存

2. **未读消息查询**
   - 遍历所有会话计算未读数
   - 可能较慢（多个会话时）
   - 建议优化为单次查询

### 加载状态

- 左侧导航使用 Server Component，无需 loading 状态
- Header 使用 Client Component，初始显示 0，异步加载未读数
- 考虑添加 Suspense 边界

---

## 后续优化建议

### Phase 2 功能

1. **左侧导航折叠**
   - 添加折叠按钮
   - 收起为图标模式
   - 节省屏幕空间

2. **社区分组**
   - 允许用户创建分组
   - 类似 Discord 的服务器分组

3. **快捷键支持**
   - `Ctrl/Cmd + K` 快速导航
   - `Ctrl/Cmd + 1-9` 切换社区

4. **拖拽排序**
   - 调整社区顺序
   - 保存用户偏好

5. **实时更新**
   - Supabase Realtime 订阅
   - 实时更新未读徽章

6. **社区通知设置**
   - 为每个社区设置通知偏好
   - 静音某些社区

---

## 启动测试

### 1. 修复 TypeScript 错误

```bash
# 编辑 app/(main)/communities/[slug]/members/page.tsx
# 修改 updateMemberRole 和 removeMember 的使用方式
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问测试页面

- 主页: http://localhost:3000
- 消息: http://localhost:3000/messages
- 社区: http://localhost:3000/communities

### 4. 测试不同屏幕尺寸

使用浏览器开发者工具测试响应式布局

---

## 提交建议

```bash
# 查看更改
git status
git diff

# 提交更改
git add components/layout/left-sidebar.tsx
git add components/layout/nav-link.tsx
git add components/layout/community-nav-item.tsx
git add app/(main)/page.tsx
git add components/layout/site-header.tsx
git add components/layout/mobile-bottom-nav.tsx
git add components/layout/mobile-nav.tsx
git add lib/actions/chat.ts

git commit -m "feat: 实现 Discord 风格左侧导航栏

- 添加左侧固定导航栏（240px）
- 集成消息、社区功能入口
- 显示用户已加入的社区列表
- 优化移动端底部导航和侧边菜单
- 添加未读消息徽章和查询功能
- 实现响应式布局（lg/xl 断点）

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**实施完成** ✅
**下一步**: 修复 TypeScript 错误，启动测试
