import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { getOrganizationSchema } from "@/lib/seo/structured-data";
import { GoogleAnalytics } from '@next/third-parties/google';
import "@/lib/utils/env"; // 验证环境变量
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { OfflineIndicator } from "@/components/offline-indicator";
import { CookieConsent } from "@/components/privacy/cookie-consent";

export const metadata: Metadata = {
  title: {
    default: "AI-Dating - AI 开发者社区",
    template: "%s | AI-Dating",
  },
  description: "A Date with AI: 连接 AI 开发者与创作者的技术社区。分享源码解析、实战工坊、架构设计、AI 前沿和面试经验。",
  keywords: ["AI", "人工智能", "开发者社区", "技术博客", "源码解析", "AI 前沿", "机器学习", "深度学习"],
  authors: [{ name: "AI-Dating" }],
  creator: "AI-Dating",
  publisher: "AI-Dating",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
    locale: "zh_CN",
    url: "/",
    title: "AI-Dating - AI 开发者社区",
    description: "A Date with AI: 连接 AI 开发者与创作者的技术社区",
    siteName: "AI-Dating",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI-Dating - AI 开发者社区",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Dating - AI 开发者社区",
    description: "A Date with AI: 连接 AI 开发者与创作者的技术社区",
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
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationSchema()
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        {children}
        <Toaster />
        <Sonner />
        <WebVitalsReporter />
        <OfflineIndicator />
        <CookieConsent />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
