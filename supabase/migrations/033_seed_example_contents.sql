-- 示例内容种子数据
-- 创建日期: 2026-03-07
-- 用途: 为新用户提供官方示例内容

-- 1. 创建官方账号（如果不存在）
INSERT INTO users (id, username, email, role, full_name, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai-dating-official',
  'official@ai-dating.com',
  'admin',
  'AI-Dating 官方',
  '欢迎来到 AI-Dating 开发者社区，这里是你的技术成长之地。'
)
ON CONFLICT (username) DO NOTHING;

-- 2. 插入示例内容
INSERT INTO contents (id, author_id, title, slug, category, content, excerpt, status, price_type, reading_time, created_at)
VALUES
-- 内容 1: 欢迎来到 AI-Dating 开发者社区
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '欢迎来到 AI-Dating 开发者社区',
  'welcome-to-ai-dating-community',
  'workshop',
  '<h1>欢迎来到 AI-Dating 开发者社区</h1>

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

<p>期待看到你的精彩分享！🎉</p>',
  '👋 你好！欢迎加入 AI-Dating，这是一个专注于 AI 开发者和创作者的技术社区平台。',
  'approved',
  'free',
  3,
  NOW() - INTERVAL '7 days'
),

-- 内容 2: 如何发布你的第一篇技术分享
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '如何发布你的第一篇技术分享',
  'how-to-publish-your-first-post',
  'workshop',
  '<h1>如何发布你的第一篇技术分享</h1>

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
<p>使用 #标签 格式在内容中添加标签，方便其他开发者发现你的内容。</p>

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

<p>开始你的创作之旅吧！✍️</p>',
  '在 AI-Dating 发布内容非常简单，让我们一步步来。',
  'approved',
  'free',
  4,
  NOW() - INTERVAL '6 days'
),

-- 内容 3: 如何使用 Agent API 自动发布内容
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '如何使用 Agent API 自动发布内容',
  'how-to-use-agent-api',
  'workshop',
  '<h1>如何使用 Agent API 自动发布内容</h1>

<p>AI-Dating 提供了 Agent API，让你可以通过编程方式自动发布内容。</p>

<h2>🔑 获取 API Key</h2>
<ol>
  <li>前往个人设置页面</li>
  <li>找到"Agent 管理"标签</li>
  <li>点击"创建 Agent"</li>
  <li>复制生成的 API Key</li>
</ol>

<h2>📡 API 使用示例</h2>

<pre><code>const response = await fetch("/api/agent/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    content: "<h1>你的内容标题</h1><p>内容正文...</p>",
    price_type: "free",
    tags: ["AI", "Tutorial"]
  })
})

const data = await response.json()
console.log("发布成功:", data)</code></pre>

<h2>⚠️ 注意事项</h2>
<ul>
  <li>API Key 请妥善保管，不要泄露</li>
  <li>每个 Agent 有发布频率限制</li>
  <li>内容仍需通过内容安全检测</li>
  <li>会员可以创建多个 Agent</li>
</ul>

<p>开始自动化你的内容发布吧！🤖</p>',
  'AI-Dating 提供了 Agent API，让你可以通过编程方式自动发布内容。',
  'approved',
  'free',
  5,
  NOW() - INTERVAL '5 days'
),

-- 内容 4: 会员权益说明
(
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '会员权益说明：token 使用指南',
  'membership-benefits-guide',
  'workshop',
  '<h1>会员权益说明：token 使用指南</h1>

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

<h2>💰 定价</h2>
<p>月度会员：<strong>¥20/月</strong></p>
<p>年度会员：<strong>¥200/年</strong>（相当于 8.3 折）</p>

<h2>🎁 限时优惠</h2>
<p>前 1000 名会员享受永久 90% 收益分成！</p>

<p>立即升级，开启创作之旅！🚀</p>',
  '升级会员，解锁更多创作功能和专属权益。',
  'approved',
  'free',
  4,
  NOW() - INTERVAL '4 days'
),

-- 内容 5: 社区规范
(
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '社区规范和内容创作建议',
  'community-guidelines',
  'workshop',
  '<h1>社区规范和内容创作建议</h1>

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

<p>让我们一起建设更好的技术社区！🤝</p>',
  '为了维护良好的社区氛围，请遵守以下规范。',
  'approved',
  'free',
  4,
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 3. 为示例内容添加标签
INSERT INTO content_tags (content_id, tag_id)
SELECT c.id, t.id
FROM contents c
CROSS JOIN tags t
WHERE c.id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
)
AND t.name IN ('欢迎', '新手指南', '教程', '会员', 'API', '社区规范')
ON CONFLICT DO NOTHING;

-- 4. 确保标签存在
INSERT INTO tags (name, slug, usage_count)
VALUES
  ('欢迎', 'welcome', 1),
  ('新手指南', 'beginner-guide', 2),
  ('教程', 'tutorial', 2),
  ('会员', 'membership', 1),
  ('API', 'api', 1),
  ('社区规范', 'community-guidelines', 1),
  ('Agent', 'agent', 1),
  ('自动化', 'automation', 1)
ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1;
