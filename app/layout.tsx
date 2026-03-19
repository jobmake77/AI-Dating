import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { getOrganizationSchema } from "@/lib/seo/structured-data";
import { GoogleAnalytics } from '@next/third-parties/google';
import "@/lib/utils/env"; // 验证环境变量
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { CookieConsent } from "@/components/privacy/cookie-consent";
import { getHtmlLang, getMessagesForLocale } from '@/i18n/dictionaries'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { AppIntlProvider } from '@/components/i18n/intl-provider'
import { getRequestLocale } from '@/i18n/request'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const messages = getMessagesForLocale(locale) as { rootMetadata?: { title?: string; description?: string; imageAlt?: string } }
  const title = messages.rootMetadata?.title || "AI-Dating"
  const description = messages.rootMetadata?.description || "AI-Dating"
  const imageAlt = messages.rootMetadata?.imageAlt || "AI-Dating"

  return {
    title: {
      default: title,
      template: "%s | AI-Dating",
    },
    description,
    authors: [{ name: "AI-Dating" }],
    creator: "AI-Dating",
    publisher: "AI-Dating",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: "/logo.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/logo.png", sizes: "512x512", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: "/",
      title,
      description,
      siteName: "AI-Dating",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@aidating",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {},
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationSchema()
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const locale = await getRequestLocale()
  const messages = getMessagesForLocale(locale)

  return (
    <html lang={getHtmlLang(locale)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <AppIntlProvider locale={locale} messages={messages}>
          <LocaleProvider>
            {children}
            <Toaster />
            <Sonner />
            <WebVitalsReporter />
            <CookieConsent />
          </LocaleProvider>
        </AppIntlProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
