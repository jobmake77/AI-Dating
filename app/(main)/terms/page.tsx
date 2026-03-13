import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "服务条款",
  description: "AI-Dating 服务条款 - 使用我们服务的规则和条件",
}

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1>服务条款</h1>
        <p className="text-muted-foreground">
          最后更新日期：2026年3月8日
        </p>

        <section className="mt-8">
          <h2>1. 接受条款</h2>
          <p>
            欢迎使用 AI-Dating。通过访问或使用我们的服务，您同意受这些服务条款（&ldquo;条款&rdquo;）的约束。
            如果您不同意这些条款，请不要使用我们的服务。
          </p>
        </section>

        <section className="mt-8">
          <h2>2. 服务描述</h2>
          <p>
            AI-Dating 是一个面向 AI 开发者和创作者的技术社区平台。
            我们提供内容发布、社区互动、活动组织等功能。
          </p>
        </section>

        <section className="mt-8">
          <h2>3. 账户注册</h2>
          <h3>3.1 资格</h3>
          <p>
            您必须年满 13 岁才能使用我们的服务。
            如果您未满 18 岁，您必须获得父母或监护人的许可。
          </p>

          <h3>3.2 账户安全</h3>
          <p>
            您负责维护账户的安全性和保密性。
            您同意：
          </p>
          <ul>
            <li>提供准确、完整的注册信息</li>
            <li>保持信息的更新</li>
            <li>保护您的密码安全</li>
            <li>对您账户下的所有活动负责</li>
            <li>立即通知我们任何未经授权的使用</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>4. 用户行为</h2>
          <h3>4.1 可接受的使用</h3>
          <p>
            您同意不会：
          </p>
          <ul>
            <li>发布非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他令人反感的内容</li>
            <li>侵犯他人的知识产权或其他权利</li>
            <li>冒充他人或虚假陈述您与他人的关系</li>
            <li>发布垃圾邮件、广告或未经请求的促销内容</li>
            <li>干扰或破坏服务或服务器</li>
            <li>使用自动化工具（机器人、爬虫等）未经授权访问服务</li>
            <li>收集或存储其他用户的个人信息</li>
            <li>从事任何非法活动</li>
          </ul>

          <h3>4.2 内容准则</h3>
          <p>
            您发布的内容必须：
          </p>
          <ul>
            <li>与 AI 技术、开发或相关主题相关</li>
            <li>尊重他人，不包含仇恨言论</li>
            <li>不包含误导性或虚假信息</li>
            <li>不侵犯版权或其他知识产权</li>
            <li>符合当地法律法规</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>5. 内容所有权和许可</h2>
          <h3>5.1 您的内容</h3>
          <p>
            您保留对您发布的内容的所有权。
            通过发布内容，您授予 AI-Dating 非独占、全球、免版税、可再许可的许可，
            以使用、复制、修改、改编、发布、翻译、创建衍生作品、分发和展示您的内容。
          </p>

          <h3>5.2 我们的内容</h3>
          <p>
            AI-Dating 的服务和内容（不包括用户内容）受版权、商标和其他法律保护。
            您不得复制、修改、分发或创建衍生作品，除非获得明确许可。
          </p>
        </section>

        <section className="mt-8">
          <h2>6. 内容审核</h2>
          <p>
            我们保留（但没有义务）审核、编辑或删除任何内容的权利。
            我们可能会删除违反这些条款或我们认为不适当的内容。
          </p>
        </section>

        <section className="mt-8">
          <h2>7. 账户终止</h2>
          <p>
            我们可能会在以下情况下暂停或终止您的账户：
          </p>
          <ul>
            <li>违反这些条款</li>
            <li>从事非法或有害活动</li>
            <li>长期不活跃</li>
            <li>应法律要求</li>
          </ul>
          <p>
            您可以随时通过{" "}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              隐私设置
            </Link>
            {" "}删除您的账户。
          </p>
        </section>

        <section className="mt-8">
          <h2>8. 免责声明</h2>
          <p>
            我们的服务按 &ldquo;原样&rdquo; 和 &ldquo;可用&rdquo; 基础提供，不提供任何明示或暗示的保证。
            我们不保证：
          </p>
          <ul>
            <li>服务将不间断或无错误</li>
            <li>缺陷将被纠正</li>
            <li>服务或服务器没有病毒或有害组件</li>
            <li>结果的准确性或可靠性</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>9. 责任限制</h2>
          <p>
            在法律允许的最大范围内，AI-Dating 不对任何间接、偶然、特殊、后果性或惩罚性损害负责，
            包括但不限于利润损失、数据丢失或业务中断。
          </p>
        </section>

        <section className="mt-8">
          <h2>10. 赔偿</h2>
          <p>
            您同意赔偿、辩护并使 AI-Dating 免受因您使用服务、违反这些条款或侵犯任何第三方权利
            而产生的任何索赔、损害、义务、损失、责任、成本或债务以及费用。
          </p>
        </section>

        <section className="mt-8">
          <h2>11. 隐私</h2>
          <p>
            您的隐私对我们很重要。请查看我们的{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              隐私政策
            </Link>
            {" "}了解我们如何收集、使用和保护您的信息。
          </p>
        </section>

        <section className="mt-8">
          <h2>12. 知识产权</h2>
          <p>
            如果您认为您的知识产权被侵犯，请通过 dmca@ai-dating.com 联系我们，并提供：
          </p>
          <ul>
            <li>您的联系信息</li>
            <li>被侵权作品的描述</li>
            <li>侵权内容的位置</li>
            <li>您有权代表版权所有者行事的声明</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>13. 条款变更</h2>
          <p>
            我们可能会不时修改这些条款。
            我们会在此页面上发布新的条款，并更新 &ldquo;最后更新日期&rdquo;。
            继续使用服务即表示您接受修改后的条款。
          </p>
        </section>

        <section className="mt-8">
          <h2>14. 适用法律</h2>
          <p>
            这些条款受中华人民共和国法律管辖，不考虑其法律冲突原则。
          </p>
        </section>

        <section className="mt-8">
          <h2>15. 争议解决</h2>
          <p>
            任何因这些条款或服务引起的争议应首先通过友好协商解决。
            如果协商失败，争议应提交至 [您的管辖法院]。
          </p>
        </section>

        <section className="mt-8">
          <h2>16. 可分割性</h2>
          <p>
            如果这些条款的任何条款被认定为无效或不可执行，
            其余条款将继续有效。
          </p>
        </section>

        <section className="mt-8">
          <h2>17. 完整协议</h2>
          <p>
            这些条款构成您与 AI-Dating 之间关于服务的完整协议，
            并取代所有先前的协议和理解。
          </p>
        </section>

        <section className="mt-8">
          <h2>18. 联系我们</h2>
          <p>
            如果您对这些条款有任何疑问，请通过以下方式联系我们：
          </p>
          <ul>
            <li><strong>邮箱</strong>：legal@ai-dating.com</li>
            <li><strong>地址</strong>：[您的公司地址]</li>
          </ul>
        </section>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">相关链接</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="text-primary hover:underline">
                隐私政策
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie 政策
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
