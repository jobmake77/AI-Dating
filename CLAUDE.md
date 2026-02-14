# AI-Dating 项目工作指南

本文档定义了 AI-Dating 项目的开发工作流程、任务管理和核心原则。

---

## Workflow Orchestration

### 1. Plan Mode Default
- **进入 plan mode** 处理任何非平凡任务（3+ 步骤或架构决策）
- 如果出现问题，**立即停止并重新规划** - 不要继续推进
- 使用 plan mode 进行验证步骤，不仅仅是构建
- **提前编写详细规格**以减少歧义

### 2. Subagent Strategy
- **自由使用 subagents** 保持主上下文窗口清洁
- 将研究、探索和并行分析卸载给 subagents
- 对于复杂问题，通过 subagents 投入更多计算资源
- **每个 subagent 一个任务**以实现专注执行

### 3. Self-Improvement Loop
- 在用户的**任何纠正之后**：更新 `tasks/lessons.md` 记录模式
- 为自己编写规则以防止相同错误
- 无情地迭代这些经验教训，直到错误率下降
- 在会话开始时审查相关项目的经验教训

### 4. Verification Before Done
- **永远不要在没有证明其工作的情况下标记任务完成**
- 在相关时对比 main 和你的更改之间的行为差异
- 问自己："资深工程师会批准这个吗？"
- 运行测试、检查日志、证明正确性

### 5. Demand Elegance (Balanced)
- 对于非平凡的更改：暂停并问"有更优雅的方式吗？"
- 如果修复感觉很 hacky："知道我现在知道的一切，实现优雅的解决方案"
- **跳过简单、明显的修复** - 不要过度工程化
- 在呈现之前挑战自己的工作

### 6. Autonomous Bug Fixing
- 当收到错误报告时：**直接修复它**。不要寻求手把手指导
- 指出日志、错误、失败的测试 - 然后解决它们
- 用户无需上下文切换
- 无需被告知如何修复失败的 CI 测试

---

## Task Management

### 工作流程

1. **Plan First**: 将计划写入 `tasks/todo.md`，包含可检查的项目
2. **Verify Plan**: 在开始实施前检查
3. **Track Progress**: 在进行时标记完成的项目
4. **Explain Changes**: 每一步的高层次总结
5. **Document Results**: 在 `tasks/todo.md` 添加审查部分
6. **Capture Lessons**: 在纠正后更新 `tasks/lessons.md`

### 任务目录结构

```
tasks/
├── todo.md       # 当前任务清单和进度
└── lessons.md    # 经验教训和模式
```

---

## Core Principles

### 1. Simplicity First
- 使每个更改尽可能简单
- 影响最少的代码
- 避免不必要的复杂性

### 2. No Laziness
- 找到根本原因
- 没有临时修复
- 保持资深开发者标准

### 3. Minimal Impact
- 更改应该只触及必要的内容
- 避免引入新的 bug
- 保持代码库的稳定性

### 4. Quality Standards
- 代码必须可读、可维护
- 遵循项目的编码规范
- 编写有意义的注释（仅在必要时）
- 确保类型安全（TypeScript）

### 5. Testing & Verification
- 在标记完成前验证功能
- 测试边界情况
- 确保响应式设计在移动端工作
- 检查性能影响

---

## Project-Specific Guidelines

### 技术栈
- **前端**: Next.js 14+ (App Router) + TypeScript
- **样式**: Tailwind CSS 3.x
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **存储**: Cloudflare R2

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件
- 优先使用 Server Components
- 仅在需要交互时使用 Client Components
- 使用 Tailwind CSS 进行样式设计
- 避免内联样式

### 文件组织
```
app/
├── (auth)/          # 认证相关页面
├── (dashboard)/     # 用户仪表板
├── api/             # API 路由
├── components/      # 共享组件
├── lib/             # 工具函数
└── types/           # TypeScript 类型定义
```

### Git 工作流
- 功能分支开发
- 有意义的 commit messages
- 在 PR 前进行自我审查
- 不提交敏感信息（.env 文件）

### MVP 约束
- **5 天上线目标**
- 专注核心功能（P0）
- 延后非必要功能（P1, P2）
- 使用免费服务（0 预算）
- 简化审核流程

---

## Decision Log

### 已确认的技术决策

1. **使用 Supabase Auth 而不是 NextAuth.js**
   - 原因：统一技术栈，减少复杂度

2. **使用 Tailwind CSS 3.x 而不是 4.x**
   - 原因：更稳定，shadcn/ui 基于 3.x

3. **MVP 阶段不使用 AI 助手**
   - 原因：简化开发，降低成本

4. **使用 Cloudflare R2 存储图片**
   - 原因：10GB 免费存储，无出站流量费用

5. **90% 创作者分成（前期）**
   - 原因：吸引种子创作者
   - 风险：平台前期亏损
   - 应对：准备资金储备或后期调整

---

## Communication Guidelines

### 与用户沟通
- 简洁明了，避免冗长
- 使用中文交流
- 提供可操作的建议
- 在关键决策点征求意见
- 不要过度使用表情符号

### 报告进度
- 明确说明已完成的内容
- 列出下一步计划
- 标注遇到的问题
- 提供解决方案选项

---

## Emergency Protocols

### 当遇到阻塞时
1. 停止当前工作
2. 分析问题根源
3. 考虑替代方案
4. 向用户报告并征求意见
5. 不要盲目尝试多次

### 当发现设计缺陷时
1. 立即标记问题
2. 评估影响范围
3. 提出重构方案
4. 与用户讨论优先级
5. 记录在 lessons.md

---

**最后更新**: 2026-02-14
**版本**: 1.0

*本文档是活文档，随项目进展持续更新。*
