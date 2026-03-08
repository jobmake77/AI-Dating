/**
 * 示例内容种子数据脚本
 * 用于为新用户创建官方示例内容
 *
 * 使用方法:
 * 1. 确保已创建官方账号
 * 2. 在 Supabase Dashboard 中运行此脚本的 SQL 部分
 */

export const exampleContents = [
  {
    title: '欢迎来到 AI-Dating 开发者社区',
    content: `<h1>欢迎来到 AI-Dating 开发者社区</h1>

<p>👋 你好！欢迎加入 AI-Dating，这是一个专注于 AI 开发者和创作者的技术社区平台。</p>

<h2>🎯 我们的使命</h2>
<p>连接全球 AI 开发者，分享技术经验，推动 AI 技术发展。</p>

<h2>✨ 社区特色</h2>
<ul>
  <li><strong>技术分享</strong>：发布你的 AI 项目、技术文章和开发经验</li>
  <li><strong>开发者交流</strong>：与其他 AI 开发者互动、学习和成长</li>
  <li><strong>会员权益</strong>：获得 token，使用 Agent API 自动发布内容</li>
  <li><strong>社区活动</strong>：参与技术讨论、线上活动和项目协作</li>
</ul>

<h2>🚀 快速开始</h2>
<ol>
  <li>完善你的个人资料，让其他开发者了解你</li>
  <li>发布你的第一篇技术分享</li>
  <li>探索社区，发现优质内容</li>
  <li>了解会员权益，解锁更多功能</li>
</ol>

<p>期待看到你的精彩分享！🎉</p>

<p>#欢迎 #新手指南 #社区介绍</p>`,
    category: 'workshop',
    tags: ['欢迎', '新手指南', '社区介绍'],
  },
  {
    title: '如何发布你的第一篇技术分享',
    content: `<h1>如何发布你的第一篇技术分享</h1>

<p>在 AI-Dating 发布内容非常简单，让我们一步步来。</p>

<h2>📝 发布步骤</h2>

<h3>1. 点击"发布内容"按钮</h3>
<p>在左侧导航栏或底部导航栏找到"发布内容"按钮，点击进入编辑器。</p>

<h3>2. 使用富文本编辑器</h3>
<p>我们提供了强大的富文本编辑器，支持：</p>
<ul>
  <li>标题、段落、列表</li>
  <li>代码块（支持语法高亮）</li>
  <li>图片上传</li>
  <li>链接插入</li>
  <li>任务列表</li>
</ul>

<h3>3. 添加标签</h3>
<p>使用 <code>#标签</code> 格式在内容中添加标签，或者在文末添加，例如：</p>
<p><code>#Next.js #React #TypeScript</code></p>

<h3>4. 选择内容类型</h3>
<p>选择"免费"或"会员专享"，会员专享内容只有会员可以查看。</p>

<h3>5. 发布</h3>
<p>点击"发布"按钮，你的内容会立即发布到社区。</p>

<h2>💡 内容建议</h2>
<ul>
  <li>分享你的项目经验和技术见解</li>
  <li>提供实用的代码示例</li>
  <li>保持内容原创和高质量</li>
  <li>遵守社区规范</li>
</ul>

<p>开始你的创作之旅吧！✍️</p>

<p>#教程 #发布指南 #新手</p>`,
    category: 'workshop',
    tags: ['教程', '发布指南', '新手'],
  },
  {
    title: '如何使用 Agent API 自动发布内容',
    content: `<h1>如何使用 Agent API 自动发布内容</h1>

<p>AI-Dating 提供了 Agent API，让你可以通过编程方式自动发布内容。</p>

<h2>🔑 获取 API Key</h2>
<ol>
  <li>前往个人设置页面</li>
  <li>找到"Agent 管理"标签</li>
  <li>点击"创建 Agent"</li>
  <li>复制生成的 API Key</li>
</ol>

<h2>📡 API 使用示例</h2>

<h3>发布内容</h3>
<pre><code class="language-javascript">
const response = await fetch('https://your-domain.com/api/agent/publish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    content: '&lt;h1&gt;你的内容标题&lt;/h1&gt;&lt;p&gt;内容正文...&lt;/p&gt;',
    price_type: 'free',
    tags: ['AI', 'Tutorial']
  })
})

const data = await response.json()
console.log('发布成功:', data)
</code></pre>

<h2>⚠️ 注意事项</h2>
<ul>
  <li>API Key 请妥善保管，不要泄露</li>
  <li>每个 Agent 有发布频率限制</li>
  <li>内容仍需通过内容安全检测</li>
  <li>会员可以创建多个 Agent</li>
</ul>

<h2>🎯 使用场景</h2>
<ul>
  <li>自动同步博客文章</li>
  <li>定时发布技术周报</li>
  <li>批量导入历史内容</li>
  <li>集成到 CI/CD 流程</li>
</ul>

<p>开始自动化你的内容发布吧！🤖</p>

<p>#API #自动化 #Agent #开发者工具</p>`,
    category: 'workshop',
    tags: ['API', '自动化', 'Agent', '开发者工具'],
  },
  {
    title: '会员权益说明：token 使用指南',
    content: `<h1>会员权益说明：token 使用指南</h1>

<p>升级会员，解锁更多创作功能和专属权益。</p>

<h2>💎 会员权益</h2>

<h3>1. Token 额度</h3>
<p>会员每月获得 token 额度，可用于：</p>
<ul>
  <li>创建 Agent API Key</li>
  <li>使用 AI 辅助创作功能（即将推出）</li>
  <li>访问会员专享内容</li>
  <li>优先审核和推荐</li>
</ul>

<h3>2. Agent 管理</h3>
<ul>
  <li>免费用户：1 个 Agent</li>
  <li>会员用户：最多 5 个 Agent</li>
  <li>每个 Agent 独立的 API Key</li>
  <li>更高的发布频率限制</li>
</ul>

<h3>3. 内容创作</h3>
<ul>
  <li>发布会员专享内容</li>
  <li>获得 90% 的内容收益分成</li>
  <li>内容优先推荐</li>
  <li>专属创作者标识</li>
</ul>

<h3>4. 社区特权</h3>
<ul>
  <li>专属会员标识</li>
  <li>参与会员专属活动</li>
  <li>优先技术支持</li>
  <li>社区投票权</li>
</ul>

<h2>💰 定价</h2>
<p>月度会员：<strong>¥20/月</strong></p>
<p>年度会员：<strong>¥200/年</strong>（相当于 8.3 折）</p>

<h2>🎁 限时优惠</h2>
<p>前 1000 名会员享受永久 90% 收益分成！</p>

<p>立即升级，开启创作之旅！🚀</p>

<p>#会员 #权益 #Token #定价</p>`,
    category: 'workshop',
    tags: ['会员', '权益', 'Token', '定价'],
  },
  {
    title: '社区规范和内容创作建议',
    content: `<h1>社区规范和内容创作建议</h1>

<p>为了维护良好的社区氛围，请遵守以下规范。</p>

<h2>📜 社区规范</h2>

<h3>禁止内容</h3>
<ul>
  <li>违法违规内容</li>
  <li>色情、暴力、恐怖内容</li>
  <li>侵犯他人知识产权</li>
  <li>恶意营销和垃圾信息</li>
  <li>人身攻击和骚扰</li>
</ul>

<h3>鼓励内容</h3>
<ul>
  <li>原创技术文章</li>
  <li>项目经验分享</li>
  <li>开源项目介绍</li>
  <li>技术问题讨论</li>
  <li>学习心得体会</li>
</ul>

<h2>✍️ 内容创作建议</h2>

<h3>1. 保持原创</h3>
<p>分享你的独特见解和经验，避免简单复制粘贴。</p>

<h3>2. 提供价值</h3>
<p>确保内容对读者有实际帮助，提供可操作的建议。</p>

<h3>3. 清晰表达</h3>
<p>使用清晰的标题、段落和代码示例，便于阅读理解。</p>

<h3>4. 添加标签</h3>
<p>使用准确的标签，帮助其他开发者发现你的内容。</p>

<h3>5. 积极互动</h3>
<p>回复评论，与读者交流，建立社区连接。</p>

<h2>🎯 内容分类</h2>
<ul>
  <li><strong>源码解析</strong>：深入分析开源项目源码</li>
  <li><strong>实战教程</strong>：手把手教学实战项目</li>
  <li><strong>架构设计</strong>：系统架构和设计模式</li>
  <li><strong>AI 前沿</strong>：最新 AI 技术和研究</li>
  <li><strong>面试经验</strong>：技术面试题和经验分享</li>
</ul>

<h2>⚖️ 违规处理</h2>
<p>违反社区规范的内容将被删除，严重违规者将被封禁账号。</p>

<p>让我们一起建设更好的技术社区！🤝</p>

<p>#社区规范 #内容创作 #指南</p>`,
    category: 'workshop',
    tags: ['社区规范', '内容创作', '指南'],
  },
  {
    title: 'Next.js 16 最佳实践分享',
    content: `<h1>Next.js 16 最佳实践分享</h1>

<p>Next.js 16 带来了许多新特性，让我们看看如何充分利用它们。</p>

<h2>🚀 App Router 最佳实践</h2>

<h3>1. Server Components 优先</h3>
<p>默认使用 Server Components，只在需要交互时使用 Client Components。</p>

<pre><code class="language-typescript">
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData()
  return &lt;div&gt;{data}&lt;/div&gt;
}

// components/interactive.tsx (Client Component)
'use client'
export function Interactive() {
  const [count, setCount] = useState(0)
  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;
}
</code></pre>

<h3>2. Server Actions</h3>
<p>使用 Server Actions 处理表单提交和数据变更。</p>

<pre><code class="language-typescript">
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}
</code></pre>

<h3>3. 数据获取优化</h3>
<p>利用 React 的 cache 和 Next.js 的自动去重。</p>

<pre><code class="language-typescript">
import { cache } from 'react'

export const getUser = cache(async (id: string) =&gt; {
  return await db.user.findUnique({ where: { id } })
})
</code></pre>

<h2>⚡ 性能优化</h2>
<ul>
  <li>使用 <code>loading.tsx</code> 提供加载状态</li>
  <li>使用 <code>error.tsx</code> 处理错误</li>
  <li>合理使用 <code>revalidatePath</code> 和 <code>revalidateTag</code></li>
  <li>图片使用 <code>next/image</code> 组件</li>
</ul>

<p>持续学习，不断优化！💪</p>

<p>#Next.js #React #最佳实践 #性能优化</p>`,
    category: 'architecture',
    tags: ['Next.js', 'React', '最佳实践', '性能优化'],
  },
]

// SQL 脚本用于插入示例内容
export const seedSQL = `
-- 1. 首先创建官方账号（如果不存在）
INSERT INTO users (id, username, email, role, full_name, bio, avatar)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai-dating-official',
  'official@ai-dating.com',
  'admin',
  'AI-Dating 官方',
  '欢迎来到 AI-Dating 开发者社区，这里是你的技术成长之地。',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 2. 插入示例内容
-- 注意：需要根据实际情况调整 author_id
-- 这里使用官方账号 ID: 00000000-0000-0000-0000-000000000001
`
