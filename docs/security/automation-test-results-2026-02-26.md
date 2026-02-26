# 自动化测试结果（普通用户）- 2026-02-26

## 环境
- 目标：`http://localhost:3000`
- 登录态：`/Users/a77/Desktop/AI-Dating/scripts/pentest/.auth.json`
- 测试工具：Playwright
- 工作区：`/Users/a77/Desktop/AI-Dating/.worktrees/pentest-automation`

## 执行摘要
- 总计 3 个用例
- 通过 2 个
- 失败 1 个

## 失败用例
### admin 页面普通用户可访问（应拒绝）
- 用例：`scripts/pentest/admin-deny.spec.ts` → `admin pages are not accessible to normal user`
- 结果：失败（HTTP 200）
- 含义：普通用户访问 `/admin` 页面未被拒绝，存在权限控制缺失的风险。
- 需要复核：
  - 页面是否只是展示空壳/无敏感数据
  - 真实管理操作是否在服务端进一步授权

## 通过用例
- 主页可访问（200）
- `/api/admin/set-admin` 对普通用户请求返回 4xx

## 证据位置
- Playwright 结果目录：`/Users/a77/Desktop/AI-Dating/.worktrees/pentest-automation/test-results/`
- 失败用例 trace：
  `test-results/admin-deny-admin-pages-are-not-accessible-to-normal-user/trace.zip`

## 建议
- 优先检查 `/admin` 相关页面与数据加载逻辑，确认是否对普通用户做了服务端鉴权。
- 如果确实应禁止普通用户访问，请在路由或服务端加载处加入强制鉴权。
