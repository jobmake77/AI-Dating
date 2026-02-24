# 聊天系统文档

**创建日期**: 2026-02-16
**状态**: ✅ 已完成

---

## 概述

AI-Dating 聊天系统提供用户间的实时私信功能，基于 Supabase Realtime 实现消息的即时推送。

---

## 功能特性

### 核心功能

- ✅ **实时消息推送** - 基于 Supabase Realtime，无需刷新页面
- ✅ **未读消息计数** - 自动统计未读消息数量
- ✅ **自动标记已读** - 打开会话时自动标记为已读
- ✅ **消息历史** - 完整的消息记录和滚动
- ✅ **用户头像和信息** - 显示对方用户的头像、姓名、用户名
- ✅ **响应式设计** - 适配桌面端和移动端

### 用户体验

- 从用户主页点击"发消息"按钮发起对话
- 会话列表显示所有对话和未读消息数
- 消息输入支持 Enter 发送、Shift+Enter 换行
- 消息实时显示，自动滚动到最新消息
- 点击对方头像可跳转到其主页

---

## 数据库架构

### 表结构

#### 1. conversations（会话表）

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**说明**：存储会话的基本信息，每个会话包含两个参与者。

#### 2. conversation_participants（会话参与者表）

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
```

**说明**：记录会话的参与者和最后阅读时间，用于计算未读消息数。

#### 3. messages（消息表）

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**说明**：存储所有消息内容。

### 索引

```sql
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### RLS 策略

- 用户只能查看自己参与的会话
- 用户只能向自己参与的会话发送消息
- 用户只能更新自己的参与者记录（last_read_at）

### Realtime 配置

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
```

---

## 代码结构

### 后端

#### 查询函数 (`lib/queries/chat.ts`)

```typescript
// 获取用户的所有会话（包含未读数、最后消息、对方用户信息）
export async function getUserConversations(userId: string)

// 获取或创建与指定用户的会话
export async function getOrCreateConversation(userId: string, otherUserId: string)

// 获取会话的所有消息
export async function getConversationMessages(conversationId: string, limit = 50)

// 获取会话的对方用户信息
export async function getConversationOtherUser(conversationId: string, currentUserId: string)
```

#### Server Actions (`lib/actions/chat.ts`)

```typescript
// 发送消息
export async function sendMessage(conversationId: string, content: string)

// 标记会话为已读
export async function markConversationAsRead(conversationId: string)

// 创建与指定用户的会话
export async function createConversationWithUser(otherUserId: string)
```

### 前端

#### 页面

- **`/messages`** - 会话列表页面
- **`/messages/[id]`** - 聊天对话页面

#### 组件

##### 1. ConversationList (`components/chat/conversation-list.tsx`)

显示用户的所有会话列表。

**功能**：
- 显示对方用户头像、姓名
- 显示最后一条消息内容和时间
- 显示未读消息数（Badge）
- 空状态提示

##### 2. ChatMessages (`components/chat/chat-messages.tsx`)

显示会话中的所有消息。

**功能**：
- 实时订阅新消息（Supabase Realtime）
- 自动滚动到最新消息
- 区分自己和对方的消息（不同样式）
- 显示消息时间
- 自动标记已读

**实时订阅代码**：

```typescript
useEffect(() => {
  const supabase = createClient()

  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // 获取发送者信息并添加到消息列表
        const newMessage = { ...payload.new, sender }
        setMessages((prev) => [...prev, newMessage])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [conversationId])
```

##### 3. ChatInput (`components/chat/chat-input.tsx`)

消息输入框。

**功能**：
- 多行文本输入
- Enter 发送、Shift+Enter 换行
- 发送中状态（禁用输入）
- 错误提示（Toast）

##### 4. SendMessageButton (`components/user/send-message-button.tsx`)

用户主页的"发消息"按钮。

**功能**：
- 创建或获取与该用户的会话
- 跳转到聊天页面
- 未登录时跳转到登录页

---

## 使用流程

### 1. 发起对话

```
用户主页 → 点击"发消息"按钮 → 创建会话 → 跳转到聊天页面
```

**实现**：
- `SendMessageButton` 调用 `createConversationWithUser` action
- 如果会话已存在，返回现有会话 ID
- 如果会话不存在，创建新会话并添加两个参与者
- 跳转到 `/messages/[conversationId]`

### 2. 查看消息列表

```
导航栏"消息"图标 → 会话列表页面 → 显示所有对话
```

**实现**：
- `/messages` 页面调用 `getUserConversations` 查询
- 显示每个会话的最后消息、未读数、对方用户信息
- 点击会话跳转到聊天页面

### 3. 发送和接收消息

```
聊天页面 → 输入消息 → Enter 发送 → 实时显示
```

**实现**：
- `ChatInput` 调用 `sendMessage` action
- 消息插入到 `messages` 表
- Supabase Realtime 推送新消息事件
- `ChatMessages` 监听事件并更新消息列表
- 自动滚动到最新消息

### 4. 未读消息计数

```
会话列表 → 显示未读数 → 打开会话 → 自动标记已读
```

**实现**：
- `getUserConversations` 计算未读数：
  ```sql
  SELECT COUNT(*) FROM messages
  WHERE conversation_id = ?
  AND created_at > last_read_at
  AND sender_id != current_user_id
  ```
- `ChatMessages` 组件挂载时调用 `markConversationAsRead`
- 更新 `conversation_participants.last_read_at` 为当前时间

---

## 安全性

### RLS 策略

所有表都启用了 Row Level Security (RLS)：

1. **conversations** - 用户只能查看自己参与的会话
2. **conversation_participants** - 用户只能查看和更新自己的参与记录
3. **messages** - 用户只能查看和发送自己参与的会话中的消息

### 权限验证

- 发送消息前验证用户是否是会话参与者
- 创建会话时验证对方用户是否存在
- 不能与自己创建会话

---

## 性能优化

### 数据库优化

- 为常用查询字段添加索引
- 使用 `created_at DESC` 索引加速消息排序
- 限制消息查询数量（默认 50 条）

### 前端优化

- 使用 Supabase Realtime 减少轮询
- 消息列表虚拟化（未来优化）
- 图片懒加载（未来优化）

---

## 测试建议

### 功能测试

1. **发起对话**
   - 从用户主页点击"发消息"
   - 验证会话创建成功
   - 验证跳转到聊天页面

2. **发送消息**
   - 输入消息并发送
   - 验证消息显示在列表中
   - 验证消息时间正确

3. **实时推送**
   - 用两个账号测试
   - A 发送消息，B 实时收到
   - 验证无需刷新页面

4. **未读消息**
   - A 发送消息给 B
   - B 查看会话列表，验证未读数显示
   - B 打开会话，验证未读数清零

5. **响应式设计**
   - 在移动端测试所有功能
   - 验证布局正常
   - 验证输入框和按钮可用

### 边界测试

- 发送空消息（应被拒绝）
- 发送超长消息（验证显示）
- 快速连续发送多条消息
- 网络断开时发送消息（错误提示）

---

## 未来优化

### 短期优化（1-2 周）

- [ ] 消息撤回功能
- [ ] 消息编辑功能
- [ ] 图片消息支持
- [ ] 表情回应（Reaction）

### 中期优化（1-2 个月）

- [ ] 消息搜索
- [ ] 消息置顶
- [ ] 消息转发
- [ ] 群聊功能

### 长期优化（3+ 个月）

- [ ] 语音消息
- [ ] 视频消息
- [ ] 文件传输
- [ ] 消息加密

---

## 故障排查

### 消息不实时更新

**可能原因**：
1. Supabase Realtime 未启用
2. RLS 策略阻止了订阅
3. 网络连接问题

**解决方案**：
1. 检查 Supabase 项目设置中 Realtime 是否启用
2. 验证 RLS 策略是否正确
3. 检查浏览器控制台是否有错误

### 未读消息数不准确

**可能原因**：
1. `last_read_at` 未更新
2. 时区问题

**解决方案**：
1. 检查 `markConversationAsRead` 是否被调用
2. 确保使用 UTC 时间

### 消息发送失败

**可能原因**：
1. 用户未登录
2. 不是会话参与者
3. 网络错误

**解决方案**：
1. 检查用户认证状态
2. 验证会话参与者记录
3. 查看错误日志

---

## 相关文档

- [Supabase Realtime 文档](https://supabase.com/docs/guides/realtime)
- [数据库 Schema](../supabase/migrations/013_chat_system.sql)
- [项目 README](../README.md)

---

**最后更新**: 2026-02-16
