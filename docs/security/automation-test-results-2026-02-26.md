# 自动化测试结果（普通用户）- 2026-02-26

## 环境
- 目标：`http://localhost:3000`
- 登录态：`/Users/a77/Desktop/AI-Dating/scripts/pentest/.auth.json`
- 测试工具：Playwright
- 工作区：`/Users/a77/Desktop/AI-Dating/.worktrees/pentest-automation`

## 执行摘要
- 总计 19 个用例
- 通过 18 个
- 跳过 1 个（搜索结果无用户）
- 失败 0 个

## 主要覆盖范围
- 公共页面：`/`、`/contents`、`/search`、`/trending`、`/events`、`/pricing`
- 登录后页面：`/create`、`/notifications`、`/messages`、`/settings`
- 功能流：内容发布/评论/点赞/转发/删除、活动创建、社区创建与设置访问校验
- 管理端访问拒绝：`/admin` 与 `/api/admin/set-admin`
- robots/sitemap 可访问性检查

## 跳过用例说明
- `search-follow.spec.ts`：搜索结果未返回用户（无可关注目标）。

## 证据位置
- Playwright 结果目录：`/Users/a77/Desktop/AI-Dating/.worktrees/pentest-automation/test-results/`
- 最近一次执行产物可用于回放 trace。

## 备注
- 这些用例验证的是**普通用户视角**的基本流程与权限边界。
- 管理端与更深层的权限测试仍建议在管理员账号下继续执行。
