import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslation } from '@/i18n/dictionaries'
import { getRequestLocale } from '@/i18n/request'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'privacyPage.metadata.title', 'Privacy Policy'),
    description: getTranslation(
      locale,
      'privacyPage.metadata.description',
      'AI-Dating privacy policy explaining how we collect, use, and protect your personal information.'
    ),
  }
}

export default async function PrivacyPolicyPage() {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `privacyPage.${key}`, fallback)

  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h1>{t('title', 'Privacy Policy')}</h1>
        <p className="text-muted-foreground">{t('lastUpdated', 'Last updated: March 8, 2026')}</p>

        <section className="mt-8">
          <h2>{t('introduction.title', '1. Introduction')}</h2>
          <p>{t('introduction.p1', 'Welcome to AI-Dating ("we," "our," or "the platform"). We value your privacy and are committed to protecting your personal information. This privacy policy explains how we collect, use, disclose, and safeguard your information.')}</p>
          <p>{t('introduction.p2', 'By using our services, you agree to the practices described in this privacy policy. If you do not agree with this policy, please do not use our services.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('collectedInfo.title', '2. Information We Collect')}</h2>

          <h3>{t('collectedInfo.provided.title', '2.1 Information You Provide')}</h3>
          <ul>
            <li>
              <strong>{t('collectedInfo.provided.account.label', 'Account information')}</strong>: {t('collectedInfo.provided.account.text', 'username, email address, password (stored in encrypted form)')}
            </li>
            <li>
              <strong>{t('collectedInfo.provided.profile.label', 'Profile')}</strong>: {t('collectedInfo.provided.profile.text', 'display name, avatar, bio, location, website link')}
            </li>
            <li>
              <strong>{t('collectedInfo.provided.content.label', 'Content')}</strong>: {t('collectedInfo.provided.content.text', 'posts, comments, likes, follows, and other activity you publish')}
            </li>
            <li>
              <strong>{t('collectedInfo.provided.communication.label', 'Communication')}</strong>: {t('collectedInfo.provided.communication.text', 'direct messages you send and your notification preferences')}
            </li>
          </ul>

          <h3>{t('collectedInfo.automatic.title', '2.2 Information Collected Automatically')}</h3>
          <ul>
            <li>
              <strong>{t('collectedInfo.automatic.usage.label', 'Usage data')}</strong>: {t('collectedInfo.automatic.usage.text', 'IP address, browser type, device information, and operating system')}
            </li>
            <li>
              <strong>{t('collectedInfo.automatic.cookies.label', 'Cookies and similar technologies')}</strong>: {t('collectedInfo.automatic.cookies.text', 'session cookies, preferences, and analytics data')}
            </li>
            <li>
              <strong>{t('collectedInfo.automatic.logs.label', 'Log data')}</strong>: {t('collectedInfo.automatic.logs.text', 'access times, page views, and clickstream data')}
            </li>
          </ul>

          <h3>{t('collectedInfo.thirdParty.title', '2.3 Information From Third Parties')}</h3>
          <ul>
            <li>
              <strong>{t('collectedInfo.thirdParty.social.label', 'Social media')}</strong>: {t('collectedInfo.thirdParty.social.text', 'when you choose to sign in through a social provider')}
            </li>
            <li>
              <strong>{t('collectedInfo.thirdParty.analytics.label', 'Analytics services')}</strong>: {t('collectedInfo.thirdParty.analytics.text', 'aggregated data provided by services such as Google Analytics')}
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('usage.title', '3. How We Use Your Information')}</h2>
          <p>{t('usage.intro', 'We use the information we collect for the following purposes:')}</p>
          <ul>
            <li>
              <strong>{t('usage.service.label', 'Provide the service')}</strong>: {t('usage.service.text', 'create and manage your account and surface content')}
            </li>
            <li>
              <strong>{t('usage.improve.label', 'Improve the service')}</strong>: {t('usage.improve.text', 'analyze usage patterns and optimize the user experience')}
            </li>
            <li>
              <strong>{t('usage.communication.label', 'Communication')}</strong>: {t('usage.communication.text', 'send notifications, updates, and optional marketing messages')}
            </li>
            <li>
              <strong>{t('usage.security.label', 'Security')}</strong>: {t('usage.security.text', 'detect and prevent fraud, abuse, and security threats')}
            </li>
            <li>
              <strong>{t('usage.compliance.label', 'Compliance')}</strong>: {t('usage.compliance.text', 'meet legal obligations and enforce our terms')}
            </li>
            <li>
              <strong>{t('usage.personalization.label', 'Personalization')}</strong>: {t('usage.personalization.text', 'recommend relevant content and people')}
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('sharing.title', '4. Sharing and Disclosure')}</h2>
          <p>{t('sharing.intro', 'We do not sell your personal information. We may share information in the following situations:')}</p>

          <h3>{t('sharing.public.title', '4.1 Public Information')}</h3>
          <p>{t('sharing.public.text', 'Your profile, published content, and comments are public by default and may be viewed by anyone. You can adjust visibility in your privacy settings.')}</p>

          <h3>{t('sharing.providers.title', '4.2 Service Providers')}</h3>
          <p>{t('sharing.providers.intro', 'We rely on third-party providers to help operate the platform:')}</p>
          <ul>
            <li>
              <strong>Supabase</strong>: {t('sharing.providers.supabase', 'database and authentication')}
            </li>
            <li>
              <strong>Cloudflare R2</strong>: {t('sharing.providers.r2', 'image and file storage')}
            </li>
            <li>
              <strong>Google Analytics</strong>: {t('sharing.providers.analytics', 'website analytics with anonymization')}
            </li>
          </ul>

          <h3>{t('sharing.legal.title', '4.3 Legal Requirements')}</h3>
          <p>{t('sharing.legal.text', 'We may disclose your information when required by law or when necessary to protect our rights, property, or safety.')}</p>

          <h3>{t('sharing.transfer.title', '4.4 Business Transfers')}</h3>
          <p>{t('sharing.transfer.text', 'If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('security.title', '5. Data Security')}</h2>
          <p>{t('security.intro', 'We take reasonable technical and organizational measures to protect your information:')}</p>
          <ul>
            <li>{t('security.items.passwords', 'Passwords are encrypted using industry-standard practices such as bcrypt')}</li>
            <li>{t('security.items.https', 'HTTPS is used to encrypt data in transit')}</li>
            <li>{t('security.items.audits', 'Regular security reviews and vulnerability scans')}</li>
            <li>{t('security.items.access', 'Access control and permission management')}</li>
            <li>{t('security.items.backup', 'Data backup and disaster recovery planning')}</li>
          </ul>
          <p>{t('security.outro', 'However, no method of transmission over the internet or method of electronic storage is completely secure.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('rights.title', '6. Your Rights (GDPR)')}</h2>
          <p>{t('rights.intro', 'If you are located in the European Union, you may have the following rights:')}</p>
          <ul>
            <li>
              <strong>{t('rights.access.label', 'Right of access')}</strong>: {t('rights.access.text', 'request access to the personal data we hold about you')}
            </li>
            <li>
              <strong>{t('rights.rectification.label', 'Right to rectification')}</strong>: {t('rights.rectification.text', 'request correction of inaccurate personal data')}
            </li>
            <li>
              <strong>{t('rights.erasure.label', 'Right to erasure')}</strong>: {t('rights.erasure.text', 'request deletion of your personal data')}
            </li>
            <li>
              <strong>{t('rights.restriction.label', 'Right to restriction')}</strong>: {t('rights.restriction.text', 'request that we limit how your personal data is processed')}
            </li>
            <li>
              <strong>{t('rights.portability.label', 'Right to data portability')}</strong>: {t('rights.portability.text', 'receive your data in a structured, commonly used, machine-readable format')}
            </li>
            <li>
              <strong>{t('rights.object.label', 'Right to object')}</strong>: {t('rights.object.text', 'object to the processing of your personal data')}
            </li>
            <li>
              <strong>{t('rights.withdraw.label', 'Right to withdraw consent')}</strong>: {t('rights.withdraw.text', 'withdraw consent at any time')}
            </li>
          </ul>
          <p>
            {t('rights.contactPrefix', 'To exercise these rights, visit your ')}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              {t('rights.settingsLink', 'privacy settings')}
            </Link>
            {t('rights.contactSuffix', ' or contact us directly.')}
          </p>
        </section>

        <section className="mt-8">
          <h2>{t('cookies.title', '7. Cookie Policy')}</h2>
          <p>
            {t('cookies.p1Prefix', 'We use cookies and similar technologies to improve your experience. For more details, please read our ')}
            <Link href="/cookies" className="text-primary hover:underline">
              {t('cookies.linkLabel', 'Cookie Policy')}
            </Link>
            {t('cookies.p1Suffix', '.')}
          </p>
          <p>{t('cookies.p2', 'You can manage your cookie preferences in your browser settings or through our cookie consent banner.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('retention.title', '8. Data Retention')}</h2>
          <p>{t('retention.intro', 'We retain your personal information until one of the following applies:')}</p>
          <ul>
            <li>{t('retention.items.delete', 'you delete your account')}</li>
            <li>{t('retention.items.service', 'the data is no longer needed to provide the service')}</li>
            <li>{t('retention.items.legal', 'the legally required retention period expires')}</li>
          </ul>
          <p>{t('retention.outro', 'After account deletion, your data may be anonymized, though certain information may be retained for auditing and compliance purposes.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('children.title', '9. Children’s Privacy')}</h2>
          <p>{t('children.text', 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with information, please contact us.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('international.title', '10. International Data Transfers')}</h2>
          <p>{t('international.text', 'Your information may be transferred to and processed on servers outside your country or region. We take steps to ensure your data is handled securely in accordance with this privacy policy.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('changes.title', '11. Changes to This Policy')}</h2>
          <p>{t('changes.text', 'We may update this privacy policy from time to time. We will post the new policy on this page and update the "last updated" date. For material changes, we may also notify you by email or on the site.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('contact.title', '12. Contact Us')}</h2>
          <p>{t('contact.intro', 'If you have questions or concerns about this privacy policy, please contact us:')}</p>
          <ul>
            <li>
              <strong>{t('contact.emailLabel', 'Email')}</strong>: privacy@ai-dating.com
            </li>
            <li>
              <strong>{t('contact.addressLabel', 'Address')}</strong>: {t('contact.addressValue', '[Your company address]')}
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('dpo.title', '13. Data Protection Officer')}</h2>
          <p>{t('dpo.intro', 'If you are located in the European Union, you may also contact our data protection officer:')}</p>
          <ul>
            <li>
              <strong>{t('dpo.emailLabel', 'Email')}</strong>: dpo@ai-dating.com
            </li>
          </ul>
        </section>

        <div className="mt-12 rounded-lg bg-muted p-6">
          <h3 className="mb-2 text-lg font-semibold">{t('related.title', 'Related links')}</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/cookies" className="text-primary hover:underline">
                {t('related.cookies', 'Cookie Policy')}
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
