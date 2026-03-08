import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cookie 政策",
  description: "AI-Dating Cookie 政策 - 了解我们如何使用 Cookie 和类似技术",
}

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Cookie 政策</h1>
        <p className="text-muted-foreground">
          最后更新日期：2026年3月8日
        </p>

        <section className="mt-8">
          <h2>1. 什么是 Cookie？</h2>
          <p>
            Cookie 是当您访问网站时存储在您设备上的小型文本文件。
            它们被广泛用于使网站工作或更高效地工作，以及向网站所有者提供信息。
          </p>
        </section>

        <section className="mt-8">
          <h2>2. 我们如何使用 Cookie</h2>
          <p>
            AI-Dating 使用 Cookie 来改善您的浏览体验、提供个性化内容和分析网站流量。
            我们使用以下类型的 Cookie：
          </p>
        </section>

        <section className="mt-8">
          <h2>3. Cookie 类型</h2>

          <h3>3.1 必要 Cookie</h3>
          <p>
            这些 Cookie 对于网站的基本功能是必需的，无法在我们的系统中禁用。
            它们通常仅在响应您的操作时设置，例如设置隐私偏好、登录或填写表单。
          </p>
          <div className="bg-muted p-4 rounded-lg my-4">
            <h4 className="font-semibold mb-2">必要 Cookie 列表：</h4>
            <ul className="space-y-2">
              <li>
                <strong>session</strong> - 会话管理和身份验证
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：会话结束 | 提供商：AI-Dating
                </span>
              </li>
              <li>
                <strong>csrf_token</strong> - 跨站请求伪造保护
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：会话结束 | 提供商：AI-Dating
                </span>
              </li>
              <li>
                <strong>cookie-consent</strong> - 存储您的 Cookie 偏好
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：1年 | 提供商：AI-Dating
                </span>
              </li>
            </ul>
          </div>

          <h3>3.2 分析 Cookie</h3>
          <p>
            这些 Cookie 帮助我们了解访问者如何使用我们的网站。
            所有信息都是匿名的，用于改进网站功能和用户体验。
          </p>
          <div className="bg-muted p-4 rounded-lg my-4">
            <h4 className="font-semibold mb-2">分析 Cookie 列表：</h4>
            <ul className="space-y-2">
              <li>
                <strong>_ga</strong> - Google Analytics 用于区分用户
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：2年 | 提供商：Google
                </span>
              </li>
              <li>
                <strong>_gid</strong> - Google Analytics 用于区分用户
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：24小时 | 提供商：Google
                </span>
              </li>
              <li>
                <strong>_gat</strong> - Google Analytics 用于限制请求率
                <br />
                <span className="text-sm text-muted-foreground">
                  有效期：1分钟 | 提供商：Google
                </span>
              </li>
            </ul>
          </div>

          <h3>3.3 营销 Cookie</h3>
          <p>
            这些 Cookie 用于跟踪访问者并显示相关广告和营销活动。
            它们可能由我们的广告合作伙伴通过我们的网站设置。
          </p>
          <div className="bg-muted p-4 rounded-lg my-4">
            <h4 className="font-semibold mb-2">营销 Cookie 列表：</h4>
            <p className="text-sm text-muted-foreground">
              目前我们不使用营销 Cookie。如果将来使用，我们会更新此列表。
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2>4. 第三方 Cookie</h2>
          <p>
            除了我们自己的 Cookie，我们还使用第三方服务，这些服务可能会设置自己的 Cookie：
          </p>
          <ul>
            <li>
              <strong>Google Analytics</strong> - 用于网站分析和性能监控
              <br />
              <Link
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Google 隐私政策
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>5. 如何管理 Cookie</h2>
          <p>
            您可以通过以下方式管理 Cookie 偏好：
          </p>

          <h3>5.1 通过我们的 Cookie 横幅</h3>
          <p>
            首次访问我们的网站时，您会看到一个 Cookie 同意横幅。
            您可以选择接受全部、拒绝全部或自定义您的偏好。
          </p>

          <h3>5.2 通过浏览器设置</h3>
          <p>
            大多数浏览器允许您通过设置控制 Cookie。以下是常见浏览器的指南：
          </p>
          <ul>
            <li>
              <Link
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Chrome
              </Link>
            </li>
            <li>
              <Link
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mozilla Firefox
              </Link>
            </li>
            <li>
              <Link
                href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Safari
              </Link>
            </li>
            <li>
              <Link
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Edge
              </Link>
            </li>
          </ul>

          <h3>5.3 通过隐私设置</h3>
          <p>
            您可以随时在{" "}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              隐私设置
            </Link>
            {" "}中更改您的 Cookie 偏好。
          </p>
        </section>

        <section className="mt-8">
          <h2>6. 禁用 Cookie 的影响</h2>
          <p>
            如果您选择禁用 Cookie，某些网站功能可能无法正常工作：
          </p>
          <ul>
            <li>您可能无法保持登录状态</li>
            <li>您的偏好设置可能不会被保存</li>
            <li>某些功能可能无法使用</li>
            <li>网站性能可能会受到影响</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>7. Cookie 政策更新</h2>
          <p>
            我们可能会不时更新本 Cookie 政策，以反映我们使用 Cookie 的变化。
            我们会在此页面上发布新的政策，并更新"最后更新日期"。
          </p>
        </section>

        <section className="mt-8">
          <h2>8. 联系我们</h2>
          <p>
            如果您对我们的 Cookie 使用有任何疑问，请通过以下方式联系我们：
          </p>
          <ul>
            <li><strong>邮箱</strong>：privacy@ai-dating.com</li>
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
