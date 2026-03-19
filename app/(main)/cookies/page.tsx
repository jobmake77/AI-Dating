import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslation } from '@/i18n/dictionaries'
import { getRequestLocale } from '@/i18n/request'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'cookiesPage.metadata.title', 'Cookie Policy'),
    description: getTranslation(
      locale,
      'cookiesPage.metadata.description',
      'AI-Dating cookie policy explaining how cookies and similar technologies are used on the platform.'
    ),
  }
}

export default async function CookiePolicyPage() {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `cookiesPage.${key}`, fallback)

  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h1>{t('title', 'Cookie Policy')}</h1>
        <p className="text-muted-foreground">{t('lastUpdated', 'Last updated: March 8, 2026')}</p>

        <section className="mt-8">
          <h2>{t('what.title', '1. What Are Cookies?')}</h2>
          <p>{t('what.text', 'Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work, operate more efficiently, and provide information to site owners.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('usage.title', '2. How We Use Cookies')}</h2>
          <p>{t('usage.text', 'AI-Dating uses cookies to improve your browsing experience, provide personalized content where applicable, and analyze site traffic. We currently use the following categories of cookies:')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('types.title', '3. Cookie Categories')}</h2>

          <h3>{t('types.essential.title', '3.1 Essential Cookies')}</h3>
          <p>{t('types.essential.text', 'These cookies are necessary for the core functionality of the site and cannot be disabled in our systems. They are typically set in response to actions you take, such as setting privacy preferences, signing in, or submitting forms.')}</p>
          <div className="my-4 rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">{t('types.essential.listTitle', 'Essential cookie list:')}</h4>
            <ul className="space-y-2">
              <li>
                <strong>session</strong> - {t('types.essential.items.session.purpose', 'session management and authentication')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.essential.items.session.meta', 'Duration: until session ends | Provider: AI-Dating')}</span>
              </li>
              <li>
                <strong>csrf_token</strong> - {t('types.essential.items.csrf.purpose', 'cross-site request forgery protection')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.essential.items.csrf.meta', 'Duration: until session ends | Provider: AI-Dating')}</span>
              </li>
              <li>
                <strong>cookie-consent</strong> - {t('types.essential.items.consent.purpose', 'stores your cookie preferences')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.essential.items.consent.meta', 'Duration: 1 year | Provider: AI-Dating')}</span>
              </li>
            </ul>
          </div>

          <h3>{t('types.analytics.title', '3.2 Analytics Cookies')}</h3>
          <p>{t('types.analytics.text', 'These cookies help us understand how visitors use our website. The information is aggregated and used to improve site performance and product experience.')}</p>
          <div className="my-4 rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">{t('types.analytics.listTitle', 'Analytics cookie list:')}</h4>
            <ul className="space-y-2">
              <li>
                <strong>_ga</strong> - {t('types.analytics.items.ga.purpose', 'Google Analytics cookie used to distinguish users')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.analytics.items.ga.meta', 'Duration: 2 years | Provider: Google')}</span>
              </li>
              <li>
                <strong>_gid</strong> - {t('types.analytics.items.gid.purpose', 'Google Analytics cookie used to distinguish users')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.analytics.items.gid.meta', 'Duration: 24 hours | Provider: Google')}</span>
              </li>
              <li>
                <strong>_gat</strong> - {t('types.analytics.items.gat.purpose', 'Google Analytics cookie used to throttle request rate')}
                <br />
                <span className="text-sm text-muted-foreground">{t('types.analytics.items.gat.meta', 'Duration: 1 minute | Provider: Google')}</span>
              </li>
            </ul>
          </div>

          <h3>{t('types.marketing.title', '3.3 Marketing Cookies')}</h3>
          <p>{t('types.marketing.text', 'Marketing cookies are used to track visitors and support relevant advertising or campaign measurement. They may be set through our site by advertising partners.')}</p>
          <div className="my-4 rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">{t('types.marketing.listTitle', 'Marketing cookie list:')}</h4>
            <p className="text-sm text-muted-foreground">{t('types.marketing.empty', 'We do not currently use marketing cookies. If that changes, this list will be updated.')}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2>{t('thirdParty.title', '4. Third-Party Cookies')}</h2>
          <p>{t('thirdParty.intro', 'In addition to our own cookies, we use third-party services that may place cookies on your device:')}</p>
          <ul>
            <li>
              <strong>Google Analytics</strong> - {t('thirdParty.analytics', 'used for site analytics and performance monitoring')}
              <br />
              <Link
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('thirdParty.analyticsLink', 'Google privacy policy')}
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('manage.title', '5. How to Manage Cookies')}</h2>
          <p>{t('manage.intro', 'You can manage your cookie preferences in several ways:')}</p>

          <h3>{t('manage.banner.title', '5.1 Through our cookie banner')}</h3>
          <p>{t('manage.banner.text', 'The first time you visit our site, you will see a cookie consent banner. You can accept all cookies, reject non-essential cookies, or customize your preferences.')}</p>

          <h3>{t('manage.browser.title', '5.2 Through browser settings')}</h3>
          <p>{t('manage.browser.text', 'Most browsers allow you to control cookies through their settings. Here are guides for common browsers:')}</p>
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

          <h3>{t('manage.settings.title', '5.3 Through privacy settings')}</h3>
          <p>
            {t('manage.settings.prefix', 'You can change your cookie preferences at any time in ')}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              {t('manage.settings.linkLabel', 'privacy settings')}
            </Link>
            {t('manage.settings.suffix', '.')}
          </p>
        </section>

        <section className="mt-8">
          <h2>{t('disable.title', '6. What Happens If You Disable Cookies')}</h2>
          <p>{t('disable.intro', 'If you disable cookies, some site features may stop working properly:')}</p>
          <ul>
            <li>{t('disable.items.login', 'you may not stay signed in')}</li>
            <li>{t('disable.items.preferences', 'your preferences may not be saved')}</li>
            <li>{t('disable.items.features', 'some features may become unavailable')}</li>
            <li>{t('disable.items.performance', 'site performance may be affected')}</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('updates.title', '7. Updates to This Cookie Policy')}</h2>
          <p>{t('updates.text', 'We may update this cookie policy from time to time to reflect changes in how we use cookies. We will post the revised policy on this page and update the "last updated" date.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('contact.title', '8. Contact Us')}</h2>
          <p>{t('contact.intro', 'If you have any questions about our use of cookies, please contact us:')}</p>
          <ul>
            <li>
              <strong>{t('contact.emailLabel', 'Email')}</strong>: privacy@ai-dating.com
            </li>
          </ul>
        </section>

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h3 className="mb-2 text-lg font-semibold">{t('related.title', 'Related links')}</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="text-primary hover:underline">
                {t('related.privacy', 'Privacy Policy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary hover:underline">
                {t('related.terms', 'Terms of Service')}
              </Link>
            </li>
            <li>
              <Link href="/settings/privacy" className="text-primary hover:underline">
                {t('related.settings', 'Privacy settings')}
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  )
}
