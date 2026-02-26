# 自动化测试计划 / 脚本框架（普通用户安全验证）

## 目标
- 覆盖普通用户关键功能的“正常 + 越权 + 边界”验证。
- 重点验证：权限边界、IDOR、XSS、上传校验、敏感接口访问控制。

## 工具建议
- **Playwright**：端到端 UI 流程（登录、发布、评论、点赞等）。
- **curl + Node 脚本**：无头请求/接口验证（适合 Server Actions 触发）。
- **OWASP ZAP（可选）**：被动爬虫与低风险扫描（禁止压测）。

## 脚本结构建议
```
/scripts/pentest/
  auth.setup.ts           # 登录与会话复用
  content.spec.ts         # 内容创建/编辑/删除
  comments.spec.ts        # 评论功能
  likes-reposts.spec.ts   # 点赞/转发
  follow.spec.ts          # 关注
  communities.spec.ts     # 社区
  chat.spec.ts            # 私信
  notifications.spec.ts   # 通知
  upload.spec.ts          # 上传
  admin-deny.spec.ts      # 管理端拒绝访问
  helpers/
    api.ts                # 封装请求
    assertions.ts         # 通用断言
```

## 关键用例自动化清单

### A. 登录与权限
- 登录成功、登出成功
- 普通用户访问 /admin 路由应拒绝
- 普通用户调用 /api/admin/set-admin 应拒绝

### B. 内容发布
- 创建内容成功
- 编辑/删除自己内容成功
- 编辑/删除他人内容应失败（IDOR）

### C. 评论
- 发表评论成功
- 删除自己评论成功
- 删除他人评论失败

### D. 点赞与转发
- 点赞/取消成功
- 转发/取消成功

### E. 社区
- 创建/加入/退出成功
- 普通用户不能管理成员

### F. 私信
- 创建会话并发送消息
- 访问他人会话应失败

### G. 上传
- 合法图片/视频上传成功
- MIME 伪造上传失败
- 超大文件被拒绝

## Playwright 示例框架
```ts
// scripts/pentest/auth.setup.ts
import { test as setup, expect } from '@playwright/test'

setup('login as normal user', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await page.fill('input[name="email"]', process.env.TEST_EMAIL!)
  await page.fill('input[name="password"]', process.env.TEST_PASSWORD!)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/contents|\//)
  await page.context().storageState({ path: 'scripts/pentest/.auth.json' })
})
```

```ts
// scripts/pentest/admin-deny.spec.ts
import { test, expect } from '@playwright/test'

test.use({ storageState: 'scripts/pentest/.auth.json' })

test('deny admin page', async ({ page }) => {
  await page.goto('http://localhost:3000/admin')
  await expect(page).not.toHaveURL(/\/admin/)
})
```

## 运行方式建议
```
TEST_EMAIL=xxx TEST_PASSWORD=xxx npx playwright test scripts/pentest
```

## 输出
- 统一生成测试报告（Playwright HTML）
- 对失败用例输出具体页面截图与请求日志

## 注意事项
- 禁止压测/大量并发
- 不做破坏性测试
- 只在测试环境执行
