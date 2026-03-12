import { getContentsFeed } from "@/lib/queries/content";
import { ContentListCompact } from "@/components/content/content-list-compact";
import { FeedTabs } from "@/components/content/feed-tabs";
import { Pagination } from "@/components/content/pagination";
import { ProgressCard } from "@/components/onboarding/progress-card";
import { ProgressCheckpoint } from "@/components/onboarding/progress-checkpoint";
import { getOnboardingProgress } from "@/lib/actions/onboarding";
import { createClient } from "@/lib/supabase/server";
import { WelcomeBanner } from "@/components/home/welcome-banner";
import { CategoriesSidebar } from "@/components/home/categories-sidebar";
import { CommunitySidebar } from "@/components/home/community-sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Dating - A Date with AI: 连接 AI 开发者与创作者",
  description: "AI-Dating 是一个专注于 AI 开发者和创作者的技术社区平台。分享 AI 项目、技术文章、开发经验，与全球 AI 开发者交流学习。",
  keywords: ["AI", "人工智能", "开发者社区", "技术分享", "AI项目", "机器学习", "深度学习"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    title: "AI-Dating - A Date with AI",
    description: "连接 AI 开发者与创作者的技术社区平台",
    siteName: "AI-Dating",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/og?type=home`,
        width: 1200,
        height: 630,
        alt: "AI-Dating",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Dating - A Date with AI",
    description: "连接 AI 开发者与创作者的技术社区平台",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/og?type=home`],
  },
}

interface HomeProps {
  searchParams: Promise<{ page?: string; tab?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const tab = params.tab || 'hot'

  const sortBy = (['hot', 'latest', 'following'] as const).includes(tab as 'hot' | 'latest' | 'following')
    ? (tab as 'hot' | 'latest' | 'following')
    : 'hot'
  const { contents, totalPages } = await getContentsFeed({ page, sortBy })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  // 获取引导进度
  const onboardingProgress = user ? await getOnboardingProgress() : null

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Banner */}
      <WelcomeBanner />

      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-4">
          {/* Left Sidebar - Categories */}
          <CategoriesSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-3">
            <FeedTabs />

            {/* Topic list header (Trae-style) */}
            <div className="hidden sm:flex items-center px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="flex-1">话题</span>
              <div className="flex items-center gap-4">
                <span className="w-12 text-center">回复</span>
                <span className="w-12 text-center">浏览</span>
                <span className="w-12 text-center">活动</span>
              </div>
            </div>

            {/* New user onboarding progress card */}
            {onboardingProgress && (
              <div className="px-4">
                <ProgressCard progress={onboardingProgress} />
              </div>
            )}

            {/* Explore content checkpoint */}
            {user && <ProgressCheckpoint step="explored_content" />}

            <div className="space-y-1.5">
              <ContentListCompact contents={contents} isAuthenticated={isAuthenticated} />
            </div>

            <div className="border-t border-border p-4">
              <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
            </div>
          </main>

          {/* Right Sidebar - Community Info */}
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}
