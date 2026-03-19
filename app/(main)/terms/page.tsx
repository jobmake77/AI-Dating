import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslation } from '@/i18n/dictionaries'
import { getRequestLocale } from '@/i18n/request'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'termsPage.metadata.title', 'Terms of Service'),
    description: getTranslation(
      locale,
      'termsPage.metadata.description',
      'AI-Dating terms of service describing the rules and conditions for using the platform.'
    ),
  }
}

export default async function TermsOfServicePage() {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `termsPage.${key}`, fallback)

  return (
    <div className="container max-w-4xl py-12">
      <article className="prose prose-gray max-w-none dark:prose-invert">
        <h1>{t('title', 'Terms of Service')}</h1>
        <p className="text-muted-foreground">{t('lastUpdated', 'Last updated: March 8, 2026')}</p>

        <section className="mt-8">
          <h2>{t('acceptance.title', '1. Acceptance of Terms')}</h2>
          <p>{t('acceptance.text', 'Welcome to AI-Dating. By accessing or using our services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('service.title', '2. Service Description')}</h2>
          <p>{t('service.text', 'AI-Dating is a technology community platform for AI developers, builders, and creators. We provide tools for publishing content, engaging in communities, and organizing events.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('registration.title', '3. Account Registration')}</h2>
          <h3>{t('registration.eligibility.title', '3.1 Eligibility')}</h3>
          <p>{t('registration.eligibility.text', 'You must be at least 13 years old to use our services. If you are under 18, you must have permission from a parent or legal guardian.')}</p>

          <h3>{t('registration.security.title', '3.2 Account Security')}</h3>
          <p>{t('registration.security.intro', 'You are responsible for maintaining the security and confidentiality of your account. You agree to:')}</p>
          <ul>
            <li>{t('registration.security.items.accurate', 'provide accurate and complete registration information')}</li>
            <li>{t('registration.security.items.updated', 'keep your information up to date')}</li>
            <li>{t('registration.security.items.password', 'keep your password secure')}</li>
            <li>{t('registration.security.items.activity', 'be responsible for all activity under your account')}</li>
            <li>{t('registration.security.items.notify', 'notify us immediately of any unauthorized use')}</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('conduct.title', '4. User Conduct')}</h2>
          <h3>{t('conduct.acceptable.title', '4.1 Acceptable Use')}</h3>
          <p>{t('conduct.acceptable.intro', 'You agree not to:')}</p>
          <ul>
            <li>{t('conduct.acceptable.items.illegal', 'post unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable content')}</li>
            <li>{t('conduct.acceptable.items.ip', 'infringe the intellectual property or other rights of others')}</li>
            <li>{t('conduct.acceptable.items.impersonate', 'impersonate another person or misrepresent your affiliation')}</li>
            <li>{t('conduct.acceptable.items.spam', 'publish spam, advertising, or unsolicited promotional content')}</li>
            <li>{t('conduct.acceptable.items.disrupt', 'interfere with or disrupt the service or its servers')}</li>
            <li>{t('conduct.acceptable.items.automation', 'use automated tools such as bots or crawlers to access the service without authorization')}</li>
            <li>{t('conduct.acceptable.items.collect', 'collect or store other users’ personal information without permission')}</li>
            <li>{t('conduct.acceptable.items.crime', 'engage in any unlawful activity')}</li>
          </ul>

          <h3>{t('conduct.guidelines.title', '4.2 Content Guidelines')}</h3>
          <p>{t('conduct.guidelines.intro', 'Content you publish must:')}</p>
          <ul>
            <li>{t('conduct.guidelines.items.relevant', 'be related to AI, software development, or adjacent topics')}</li>
            <li>{t('conduct.guidelines.items.respectful', 'respect other people and avoid hate speech')}</li>
            <li>{t('conduct.guidelines.items.truthful', 'avoid misleading or false information')}</li>
            <li>{t('conduct.guidelines.items.copyright', 'not infringe copyright or other intellectual property rights')}</li>
            <li>{t('conduct.guidelines.items.legal', 'comply with applicable laws and regulations')}</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('ownership.title', '5. Content Ownership and License')}</h2>
          <h3>{t('ownership.yours.title', '5.1 Your Content')}</h3>
          <p>{t('ownership.yours.text', 'You retain ownership of the content you publish. By posting content, you grant AI-Dating a non-exclusive, worldwide, royalty-free, sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display that content.')}</p>

          <h3>{t('ownership.ours.title', '5.2 Our Content')}</h3>
          <p>{t('ownership.ours.text', 'The AI-Dating service and content, excluding user-generated content, are protected by copyright, trademark, and other applicable laws. You may not copy, modify, distribute, or create derivative works without explicit permission.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('moderation.title', '6. Content Moderation')}</h2>
          <p>{t('moderation.text', 'We reserve the right, but not the obligation, to review, edit, or remove any content. We may remove content that violates these Terms or that we believe is inappropriate.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('termination.title', '7. Account Termination')}</h2>
          <p>{t('termination.intro', 'We may suspend or terminate your account if you:')}</p>
          <ul>
            <li>{t('termination.items.terms', 'violate these Terms')}</li>
            <li>{t('termination.items.harmful', 'engage in unlawful or harmful activity')}</li>
            <li>{t('termination.items.inactive', 'remain inactive for an extended period')}</li>
            <li>{t('termination.items.legal', 'are subject to a legal requirement')}</li>
          </ul>
          <p>
            {t('termination.outroPrefix', 'You can delete your account at any time from ')}
            <Link href="/settings/privacy" className="text-primary hover:underline">
              {t('termination.settingsLink', 'privacy settings')}
            </Link>
            {t('termination.outroSuffix', '.')}
          </p>
        </section>

        <section className="mt-8">
          <h2>{t('disclaimer.title', '8. Disclaimer')}</h2>
          <p>{t('disclaimer.intro', 'Our services are provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied. We do not guarantee that:')}</p>
          <ul>
            <li>{t('disclaimer.items.uptime', 'the service will be uninterrupted or error-free')}</li>
            <li>{t('disclaimer.items.fixes', 'defects will be corrected')}</li>
            <li>{t('disclaimer.items.virus', 'the service or servers are free of viruses or harmful components')}</li>
            <li>{t('disclaimer.items.accuracy', 'results will be accurate or reliable')}</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('liability.title', '9. Limitation of Liability')}</h2>
          <p>{t('liability.text', 'To the fullest extent permitted by law, AI-Dating will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('indemnity.title', '10. Indemnification')}</h2>
          <p>{t('indemnity.text', 'You agree to indemnify, defend, and hold AI-Dating harmless from any claims, damages, liabilities, losses, costs, or expenses arising from your use of the service, your violation of these Terms, or your infringement of any third-party rights.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('privacy.title', '11. Privacy')}</h2>
          <p>
            {t('privacy.prefix', 'Your privacy matters to us. Please review our ')}
            <Link href="/privacy" className="text-primary hover:underline">
              {t('privacy.linkLabel', 'Privacy Policy')}
            </Link>
            {t('privacy.suffix', ' to learn how we collect, use, and protect your information.')}
          </p>
        </section>

        <section className="mt-8">
          <h2>{t('ip.title', '12. Intellectual Property')}</h2>
          <p>{t('ip.intro', 'If you believe your intellectual property rights have been infringed, please contact us at dmca@ai-dating.com and provide:')}</p>
          <ul>
            <li>{t('ip.items.contact', 'your contact information')}</li>
            <li>{t('ip.items.work', 'a description of the copyrighted work or right at issue')}</li>
            <li>{t('ip.items.location', 'the location of the allegedly infringing content')}</li>
            <li>{t('ip.items.authority', 'a statement that you are authorized to act on behalf of the rights holder')}</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>{t('changes.title', '13. Changes to the Terms')}</h2>
          <p>{t('changes.text', 'We may revise these Terms from time to time. We will post the updated Terms on this page and change the "last updated" date. Continued use of the service means you accept the revised Terms.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('law.title', '14. Governing Law')}</h2>
          <p>{t('law.text', 'These Terms are governed by the laws of the People’s Republic of China, without regard to conflict of law principles.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('disputes.title', '15. Dispute Resolution')}</h2>
          <p>{t('disputes.text', 'Any dispute arising out of these Terms or the service should first be resolved through good-faith discussion. If no resolution is reached, the dispute shall be submitted to [your competent court].')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('severability.title', '16. Severability')}</h2>
          <p>{t('severability.text', 'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('entire.title', '17. Entire Agreement')}</h2>
          <p>{t('entire.text', 'These Terms constitute the entire agreement between you and AI-Dating regarding the service and supersede all prior agreements and understandings.')}</p>
        </section>

        <section className="mt-8">
          <h2>{t('contact.title', '18. Contact Us')}</h2>
          <p>{t('contact.intro', 'If you have any questions about these Terms, please contact us:')}</p>
          <ul>
            <li>
              <strong>{t('contact.emailLabel', 'Email')}</strong>: legal@ai-dating.com
            </li>
            <li>
              <strong>{t('contact.addressLabel', 'Address')}</strong>: {t('contact.addressValue', '[Your company address]')}
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
              <Link href="/cookies" className="text-primary hover:underline">
                {t('related.cookies', 'Cookie Policy')}
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
