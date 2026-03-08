# 测试框架验证清单

完成测试框架设置后，请按照以下步骤验证配置是否正确。

## ✅ 验证步骤

### 1. 检查依赖安装

```bash
# 检查 Vitest
npm list vitest

# 检查 Playwright
npm list @playwright/test

# 检查 Testing Library
npm list @testing-library/react
```

**预期结果**: 所有依赖都已安装且版本正确。

---

### 2. 安装 Playwright 浏览器

```bash
npx playwright install
```

**预期结果**: 下载并安装 Chromium、Firefox、WebKit 浏览器。

---

### 3. 运行单元测试

```bash
npm run test:run
```

**预期结果**:
```
✓ __tests__/lib/utils/logger.test.ts (4)
✓ __tests__/lib/utils/date.test.ts (8)
✓ __tests__/components/ui/button.test.tsx (7)

Test Files  3 passed (3)
Tests  19 passed (19)
```

---

### 4. 查看测试覆盖率

```bash
npm run test:coverage
```

**预期结果**:
- 生成覆盖率报告
- 在终端显示覆盖率统计
- 在 `coverage/` 目录生成 HTML 报告

---

### 5. 运行 E2E 测试

```bash
# 确保开发服务器未运行
npm run test:e2e
```

**预期结果**:
```
Running 9 tests using 5 workers

✓ e2e/homepage.spec.ts:3:1 › 首页测试 › 应该成功加载首页
✓ e2e/auth.spec.ts:3:1 › 认证流程测试 › 应该显示登录页面
✓ e2e/responsive.spec.ts:8:3 › 响应式设计测试 › 应该在 Mobile 视口正确显示
...

9 passed (30s)
```

---

### 6. 测试 UI 界面（可选）

```bash
# Vitest UI
npm run test:ui

# Playwright UI
npm run test:e2e:ui
```

**预期结果**: 打开浏览器显示测试 UI 界面。

---

## 🐛 故障排除

### 问题 1: 找不到模块 '@/...'

**原因**: 路径别名配置问题

**解决方案**:
```bash
# 检查 vitest.config.ts 中的 alias 配置
# 确保指向项目根目录
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

---

### 问题 2: Playwright 浏览器未安装

**原因**: 首次运行需要安装浏览器

**解决方案**:
```bash
npx playwright install
```

---

### 问题 3: E2E 测试超时

**原因**: 开发服务器启动慢或端口被占用

**解决方案**:
```bash
# 检查 3000 端口是否被占用
lsof -i :3000

# 手动启动开发服务器
npm run dev

# 在另一个终端运行测试（禁用自动启动）
# 修改 playwright.config.ts 中的 webServer.reuseExistingServer 为 true
```

---

### 问题 4: 测试文件找不到

**原因**: 测试文件路径或命名不正确

**解决方案**:
- 单元测试文件必须在 `__tests__/` 目录
- 文件名必须是 `*.test.ts` 或 `*.test.tsx`
- E2E 测试文件必须在 `e2e/` 目录
- 文件名必须是 `*.spec.ts`

---

### 问题 5: React 组件测试失败

**原因**: 缺少必要的 setup 或 mock

**解决方案**:
```typescript
// 确保 vitest.setup.ts 已配置
import '@testing-library/jest-dom'

// 确保组件测试导入了必要的依赖
import { render, screen } from '@testing-library/react'
```

---

## ✅ 验证完成

如果所有步骤都通过，说明测试框架已正确配置！

现在你可以：
- ✅ 为新功能编写单元测试
- ✅ 为用户流程编写 E2E 测试
- ✅ 在 CI/CD 中运行测试
- ✅ 生成代码覆盖率报告

---

## 📚 下一步

1. 阅读 [测试指南](./testing-guide.md)
2. 查看示例测试文件
3. 为核心功能添加测试
4. 设置 CI/CD 集成

---

**最后更新**: 2026-03-08
