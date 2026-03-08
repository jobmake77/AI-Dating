import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "隐私政策",
  description: "AI-Dating 隐私政策 - 了解我们如何收集、使用和保护您的个人信息",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1>隐私政策</h1>
        <p className="text-muted-foreground">
          最后更新日期：2026年3月8日
        </p>

        <section className="mt-8">
          <h2>1. 引言</h2>
          <p>
            欢迎使用 AI-Dating（以下简称"我们"、"我们的"或"平台"）。
            我们重视您的隐私，并致力于保护您的个人信息。
            本隐私政策说明了我们如何收集、使用、披露和保护您的信息。
          </p>
          <p>
            使用我们的服务即表示您同意本隐私政策中描述的做法。
            如果您不同意本政策，请不要使用我们的服务。
          </p>
        </section>

        <section className="mt-8">
          <h2>2. 我们收集的信息</h2>

          <h3>2.1 您提供的信息</h3>
          <ul>
            <li><strong>账户信息</strong>：用户名、邮箱地址、密码（加密存储）</li>
            <li><strong>个人资料</strong>：显示名称、头像、简介、位置、网站链接</li>
            <li><strong>内容</strong>：您发布的文章、评论、点赞、关注等</li>
            <li><strong>通信</strong>：您发送的私信和通知偏好</li>
          </ul>

          <h3>2.2 自动收集的信息</h3>
          <ul>
            <li><strong>使用数据</strong>：IP 地址、浏览器类型、设备信息、操作系统</li>
            <li><strong>Cookie 和类似技术</strong>：会话 Cookie、偏好设置、分析数据</li>
            <li><strong>日志数据</strong>：访问时间、页面浏览、点击流数据</li>
          </ul>

          <h3>2.3 第三方来源</h3>
          <ul>
            <li><strong>社交媒体</strong>：如果您选择通过社交媒体登录</li>
            <li><strong>分析服务</strong>：Google Analytics 等服务提供的聚合数据</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>3. 我们如何使用您的信息</h2>
          <p>我们使用收集的信息用于以下目的：</p>
          <ul>
            <li><strong>提供服务</strong>：创建和管理您的账户，展示内容</li>
            <li><strong>改进服务</strong>：分析使用模式，优化用户体验</li>
            <li><strong>通信</strong>：发送通知、更新和营销信息（您可以选择退出）</li>
            <li><strong>安全</strong>：检测和防止欺诈、滥用和安全威胁</li>
            <li><strong>合规</strong>：遵守法律义务和执行我们的条款</li>
            <li><strong>个性化</strong>：推荐相关内容和用户</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>4. 信息共享和披露</h2>
          <p>我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：</p>

          <h3>4.1 公开信息</h3>
          <p>
            您的个人资料、发布的内容和评论默认是公开的，任何人都可以查看。
            您可以在隐私设置中调整可见性。
          </p>

          <h3>4.2 服务提供商</h3>
          <p>
            我们使用第三方服务提供商来帮助运营我们的平台：
          </p>
          <ul>
            <li><strong>Supabase</strong>：数据库和身份验证</li>
            <li><strong>Cloudflare R2</strong>：图片和文件存储</li>
            <li><strong>Google Analytics</strong>：网站分析（匿名化）</li>
          </ul>

          <h3>4.3 法律要求</h3>
          <p>
            如果法律要求或为了保护我们的权利、财产或安全，我们可能会披露您的信息。
          </p>

          <h3>4.4 业务转让</h3>
          <p>
            如果我们参与合并、收购或资产出售，您的信息可能会被转让。
          </p>
        </section>

        <section className="mt-8">
          <h2>5. 数据安全</h2>
          <p>
            我们采取合理的技术和组织措施来保护您的信息：
          </p>
          <ul>
            <li>密码使用行业标准加密（bcrypt）</li>
            <li>HTTPS 加密传输</li>
            <li>定期安全审计和漏洞扫描</li>
            <li>访问控制和权限管理</li>
            <li>数据备份和灾难恢复计划</li>
          </ul>
          <p>
            但请注意，没有任何互联网传输或电子存储方法是 100% 安全的。
          </p>
        </section>

        <section className="mt-8">
          <h2>6. 您的权利（GDPR）</h2>
          <p>
            如果您是欧盟居民，您享有以下权利：
          </p>
          <ul>
            <li><strong>访问权</strong>：请求访问我们持有的关于您的个人数据</li>
            <li><strong>更正权</strong>：请求更正不准确的个人数据</li>
            <li><strong>删除权</strong>：请求删除您的个人数据（"被遗忘权"）</li>
            <li><strong>限制处理权</strong>：请求限制处理您的个人数据</li>
            <li><strong>数据可携权</strong>：以结构化、常用和机器可读的格式接收您的数据</li>
            <li><strong>反对权</strong>：反对处理您的个人数据</li>
            <li><strong>撤回同意权</strong>：随时撤回您的同意</li>
          </ul>
          <p>
            要行使这些权利，请访问您的{" "}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              隐私设置
            </Link>
            {" "}或联系我们。
          </p>
        </section>

        <section className="mt-8">
          <h2>7. Cookie 政策</h2>
          <p>
            我们使用 Cookie 和类似技术来改善您的体验。详细信息请参阅我们的{" "}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookie 政策
            </Link>
            。
          </p>
          <p>
            您可以通过浏览器设置管理 Cookie 偏好，或使用我们的 Cookie 同意横幅。
          </p>
        </section>

        <section className="mt-8">
          <h2>8. 数据保留</h2>
          <p>
            我们会保留您的个人信息，直到：
          </p>
          <ul>
            <li>您删除您的账户</li>
            <li>不再需要提供服务</li>
            <li>法律要求的保留期限结束</li>
          </ul>
          <p>
            删除账户后，您的数据将被匿名化，但某些信息可能会保留用于审计和合规目的。
          </p>
        </section>

        <section className="mt-8">
          <h2>9. 儿童隐私</h2>
          <p>
            我们的服务不面向 13 岁以下的儿童。
            我们不会故意收集 13 岁以下儿童的个人信息。
            如果您认为我们可能拥有来自 13 岁以下儿童的信息，请联系我们。
          </p>
        </section>

        <section className="mt-8">
          <h2>10. 国际数据传输</h2>
          <p>
            您的信息可能会被传输到您所在国家/地区以外的服务器并在那里进行处理。
            我们会采取措施确保您的数据根据本隐私政策得到安全处理。
          </p>
        </section>

        <section className="mt-8">
          <h2>11. 隐私政策变更</h2>
          <p>
            我们可能会不时更新本隐私政策。
            我们会在此页面上发布新的隐私政策，并更新"最后更新日期"。
            重大变更时，我们会通过邮件或网站通知您。
          </p>
        </section>

        <section className="mt-8">
          <h2>12. 联系我们</h2>
          <p>
            如果您对本隐私政策有任何疑问或疑虑，请通过以下方式联系我们：
          </p>
          <ul>
            <li><strong>邮箱</strong>：privacy@ai-dating.com</li>
            <li><strong>地址</strong>：[您的公司地址]</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>13. 数据保护官</h2>
          <p>
            如果您是欧盟居民，您可以联系我们的数据保护官：
          </p>
          <ul>
            <li><strong>邮箱</strong>：dpo@ai-dating.com</li>
          </ul>
        </section>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">相关链接</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie 政策
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary hover:underline">
                服务条款
              </Link>
            </li>
            <li>
              <Link href="/settings/privacy" className="text-primary hover:underline">
                隐私设置
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  )
}
