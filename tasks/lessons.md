# AI-Dating 经验教训

**目的**: 记录开发过程中的经验教训，避免重复错误。

---

## 项目初始化

### 2026-02-14: npm 包命名限制
**问题**: 使用 `create-next-app` 时，项目名称不能包含大写字母。

**解决方案**:
- 使用小写项目名称（ai-dating）
- 或手动初始化项目

**教训**: 在初始化项目前，检查工具的命名限制。

---

### 2026-02-14: Tailwind CSS 版本兼容性
**问题**: Tailwind CSS 4.x 需要 `@tailwindcss/postcss` 插件，与 Next.js 默认配置不兼容。

**解决方案**:
- 降级到 Tailwind CSS 3.x
- 或安装 `@tailwindcss/postcss` 并更新配置

**教训**:
- 使用稳定版本的依赖（3.x）
- 新版本可能需要额外配置
- shadcn/ui 基于 3.x，保持一致

---

### 2026-02-14: package.json 模块类型
**问题**: package.json 中设置 `"type": "commonjs"` 导致 ES modules 语法报错。

**解决方案**:
- 移除 `"type": "commonjs"` 字段
- 或改为 `"type": "module"`

**教训**:
- Next.js 默认使用 ES modules
- 不要在 package.json 中强制指定模块类型
- 让 Next.js 自动处理

---

### 2026-02-14: npm 缓存权限问题
**问题**: npm 缓存文件夹包含 root 拥有的文件，导致权限错误。

**解决方案**:
```bash
sudo chown -R 501:20 "/Users/a77/.npm"
```

**教训**:
- 定期清理 npm 缓存
- 避免使用 sudo 安装全局包
- 使用 nvm 管理 Node.js 版本

---

## 开发服务器

### 2026-02-14: 端口占用问题
**问题**: 开发服务器启动失败，提示端口 3000 被占用。

**解决方案**:
```bash
lsof -ti:3000 | xargs kill -9
```

**教训**:
- 在重启服务器前，先检查端口是否被占用
- 使用 `lsof` 查找占用端口的进程
- 清理 `.next` 目录可以解决一些缓存问题

---

## 待补充

*在开发过程中持续更新*

---

**最后更新**: 2026-02-14
