# 隐私功能测试指南

**项目**: AI-Dating
**日期**: 2026-03-08
**版本**: 1.0

---

## 测试步骤

### 1. Cookie 同意横幅测试

#### 1.1 首次访问测试
```bash
# 步骤
1. 清除浏览器 localStorage
2. 访问网站首页
3. 验证 Cookie 横幅显示在页面底部

# 预期结果
✓ Cookie 横幅显示
✓ 包含"接受全部"、"拒绝全部"、"自定义"按钮
✓ 包含隐私政策和 Cookie 政策链接
```

#### 1.2 接受全部测试
```bash
# 步骤
1. 点击"接受全部"按钮
2. 检查 localStorage

# 预期结果
✓ Cookie 横幅消失
✓ localStorage 包含 "cookie-consent": "true"
✓ localStorage 包含 "cookie-preferences" 且所有选项为 true
✓ Google Analytics 开始工作（如果配置了）
```

#### 1.3 拒绝全部测试
```bash
# 步骤
1. 清除 localStorage
2. 刷新页面
3. 点击"拒绝全部"按钮

# 预期结果
✓ Cookie 横幅消失
✓ 只有必要 Cookie 启用
✓ 分析和营销 Cookie 禁用
```

#### 1.4 自定义测试
```bash
# 步骤
1. 清除 localStorage
2. 刷新页面
3. 点击"自定义"按钮
4. 选择分析 Cookie，取消营销 Cookie
5. 点击"保存偏好"

# 预期结果
✓ 显示 Cookie 设置对话框
✓ 可以切换各类 Cookie
✓ 保存后横幅消失
✓ localStorage 正确保存偏好
```

---

### 2. 隐私设置页面测试

#### 2.1 访问测试
```bash
# 步骤
1. 登录账户
2. 访问 /settings/privacy

# 预期结果
✓ 页面正常加载
✓ 显示所有隐私设置选项
✓ 显示数据导出和账户删除按钮
```

#### 2.2 更新隐私设置测试
```bash
# 步骤
1. 更改个人资料可见性为"私密"
2. 取消"显示邮箱地址"
3. 点击"保存设置"

# 预期结果
✓ 显示成功提示
✓ 设置保存到数据库
✓ 刷新页面后设置保持
```

#### 2.3 数据库验证
```sql
-- 检查隐私设置
SELECT * FROM user_privacy_settings
WHERE user_id = 'your-user-id';

-- 预期结果
✓ profile_visibility = 'private'
✓ show_email = false
✓ updated_at 已更新
```

---

### 3. 数据导出测试

#### 3.1 导出功能测试
```bash
# 步骤
1. 访问 /settings/privacy
2. 点击"导出我的数据"按钮
3. 等待处理

# 预期结果
✓ 显示"导出中..."状态
✓ 自动下载 JSON 文件
✓ 显示成功提示
```

#### 3.2 导出内容验证
```bash
# 步骤
1. 打开下载的 JSON 文件
2. 验证数据完整性

# 预期结果
✓ 包含 user 对象
✓ 包含 profile 对象
✓ 包含 contents 数组
✓ 包含 comments 数组
✓ 包含 likes 数组
✓ 包含 follows 数组
✓ 包含 communities 数组
✓ 包含 events 数组
✓ 包含 messages 数组
✓ 包含 notifications 数组
✓ 所有数据格式正确
```

#### 3.3 导出记录验证
```sql
-- 检查导出记录
SELECT * FROM data_export_requests
WHERE user_id = 'your-user-id'
ORDER BY requested_at DESC
LIMIT 1;

-- 预期结果
✓ 记录存在
✓ status = 'completed'
✓ completed_at 已设置
```

---

### 4. 账户删除测试

⚠️ **警告**: 此测试会删除账户，请使用测试账户！

#### 4.1 删除流程测试
```bash
# 步骤
1. 使用测试账户登录
2. 访问 /settings/privacy
3. 点击"删除我的账户"按钮
4. 在确认对话框中点击"确认删除"

# 预期结果
✓ 显示确认对话框
✓ 对话框包含警告信息
✓ 点击确认后显示"删除中..."
✓ 删除成功后重定向到登出页面
```

#### 4.2 数据匿名化验证
```sql
-- 检查个人资料
SELECT
  username,
  display_name,
  bio,
  avatar_url,
  deleted_at
FROM profiles
WHERE id = 'deleted-user-id';

-- 预期结果
✓ username = 'deleted_user_xxx'
✓ display_name = '已删除用户'
✓ bio = NULL
✓ avatar_url = NULL
✓ deleted_at 已设置

-- 检查内容
SELECT title, content, deleted_at
FROM contents
WHERE author_id = 'deleted-user-id'
LIMIT 5;

-- 预期结果
✓ title = '[已删除]'
✓ content = '[此内容已被作者删除]'
✓ deleted_at 已设置

-- 检查评论
SELECT content, deleted_at
FROM comments
WHERE user_id = 'deleted-user-id'
LIMIT 5;

-- 预期结果
✓ content = '[已删除]'
✓ deleted_at 已设置
```

#### 4.3 删除记录验证
```sql
-- 检查删除记录
SELECT * FROM account_deletion_requests
WHERE user_id = 'deleted-user-id'
ORDER BY requested_at DESC
LIMIT 1;

-- 预期结果
✓ 记录存在
✓ status = 'completed'
✓ completed_at 已设置
```

---

### 5. 隐私政策页面测试

#### 5.1 页面访问测试
```bash
# 步骤
1. 访问 /privacy
2. 访问 /cookies
3. 访问 /terms

# 预期结果
✓ 所有页面正常加载
✓ 内容完整显示
✓ 链接正常工作
✓ 响应式设计正常
```

#### 5.2 内容验证
```bash
# 隐私政策 (/privacy)
✓ 包含所有必要章节
✓ GDPR 权利说明清晰
✓ 联系方式存在
✓ 相关链接正常

# Cookie 政策 (/cookies)
✓ Cookie 类型说明清晰
✓ Cookie 列表完整
✓ 管理方法说明
✓ 浏览器指南链接正常

# 服务条款 (/terms)
✓ 条款完整
✓ 用户权利和义务清晰
✓ 法律条款完整
```

---

### 6. 响应式设计测试

#### 6.1 移动端测试
```bash
# 设备
- iPhone (375px)
- iPad (768px)
- Android (360px)

# 测试页面
1. Cookie 横幅
2. 隐私设置页面
3. 隐私政策页面

# 预期结果
✓ Cookie 横幅适配移动端
✓ 按钮堆叠显示
✓ 文字可读
✓ 表单可用
✓ 对话框适配屏幕
```

---

### 7. 性能测试

#### 7.1 Cookie 横幅性能
```bash
# 测试
1. 测量页面加载时间（有/无 Cookie 横幅）
2. 测量 localStorage 读写时间

# 预期结果
✓ Cookie 横幅不影响页面加载速度
✓ localStorage 操作 < 10ms
```

#### 7.2 数据导出性能
```bash
# 测试
1. 创建大量测试数据（1000+ 内容）
2. 执行数据导出
3. 测量导出时间

# 预期结果
✓ 导出时间 < 30 秒（大数据量）
✓ 不超时
✓ 内存使用合理
```

---

### 8. 安全测试

#### 8.1 RLS 策略测试
```sql
-- 测试用户 A 不能访问用户 B 的隐私设置
-- 以用户 A 身份执行
SELECT * FROM user_privacy_settings
WHERE user_id = 'user-b-id';

-- 预期结果
✓ 返回空结果或权限错误
```

#### 8.2 数据导出权限测试
```bash
# 步骤
1. 尝试导出其他用户的数据

# 预期结果
✓ 返回"未授权访问"错误
✓ 不返回任何数据
```

#### 8.3 账户删除权限测试
```bash
# 步骤
1. 尝试删除其他用户的账户

# 预期结果
✓ 返回"未授权访问"错误
✓ 账户未被删除
```

---

### 9. 集成测试

#### 9.1 Google Analytics 集成
```bash
# 步骤
1. 接受分析 Cookie
2. 浏览几个页面
3. 检查 Google Analytics

# 预期结果
✓ GA 正确跟踪页面浏览
✓ 同意状态正确传递
```

#### 9.2 拒绝分析 Cookie
```bash
# 步骤
1. 拒绝分析 Cookie
2. 浏览几个页面
3. 检查 Google Analytics

# 预期结果
✓ GA 不跟踪页面浏览
✓ 或使用匿名模式
```

---

### 10. 边界情况测试

#### 10.1 重复操作测试
```bash
# 测试
1. 多次点击"导出数据"
2. 多次点击"删除账户"

# 预期结果
✓ 不会创建重复记录
✓ 显示适当的错误或警告
```

#### 10.2 并发测试
```bash
# 测试
1. 同时在多个标签页更新隐私设置
2. 同时导出数据

# 预期结果
✓ 数据一致性
✓ 不会出现竞态条件
```

#### 10.3 大数据量测试
```bash
# 测试
1. 创建大量数据（10000+ 内容）
2. 执行导出
3. 执行删除

# 预期结果
✓ 不超时
✓ 内存使用合理
✓ 数据完整
```

---

## 测试清单

### 功能测试
- [ ] Cookie 横幅显示和隐藏
- [ ] Cookie 偏好保存和加载
- [ ] 隐私设置更新
- [ ] 数据导出生成正确的 JSON
- [ ] 账户删除正确匿名化数据
- [ ] 所有隐私页面正常访问

### UI/UX 测试
- [ ] 响应式设计（移动端、平板、桌面）
- [ ] Cookie 横幅不遮挡内容
- [ ] 对话框清晰易懂
- [ ] 按钮状态反馈
- [ ] 错误提示友好

### 性能测试
- [ ] Cookie 横幅加载速度
- [ ] 数据导出速度
- [ ] 账户删除速度
- [ ] 大数据量处理

### 安全测试
- [ ] RLS 策略正确
- [ ] 权限验证正确
- [ ] 数据隔离正确
- [ ] SQL 注入防护

### 集成测试
- [ ] Google Analytics 集成
- [ ] Cookie 同意传递
- [ ] 第三方服务正常

---

## 测试报告模板

```markdown
# 隐私功能测试报告

**测试日期**: YYYY-MM-DD
**测试人**: [姓名]
**环境**: [开发/测试/生产]

## 测试结果

### 通过的测试
- [x] Cookie 横幅功能
- [x] 隐私设置更新
- ...

### 失败的测试
- [ ] 数据导出超时（大数据量）
  - 错误: Timeout after 30s
  - 影响: 高
  - 建议: 实施异步导出

### 待修复的问题
1. **问题**: 描述
   - **严重性**: 高/中/低
   - **重现步骤**: ...
   - **预期结果**: ...
   - **实际结果**: ...

## 总结
...
```

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
