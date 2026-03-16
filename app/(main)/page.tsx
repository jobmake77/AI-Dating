import { getContentsFeed } from "@/lib/queries/content";
import { ContentListCompact } from "@/components/content/content-list-compact";
import { FeedTabs } from "@/components/content/feed-tabs";
import { Pagination } from "@/components/content/pagination";
import { ProgressCard } from "@/components/onboarding/progress-card";
import { ProgressCheckpoint } from "@/components/onboarding/progress-checkpoint";
import { getOnboardingProgress } from "@/lib/actions/onboarding";
import { createClient } from "@/lib/supabase/server";
import { CategoriesSidebar } from "@/components/home/categories-sidebar";
import { CommunitySidebar } from "@/components/home/community-sidebar";
import { getHomepageData } from "@/lib/queries/home";
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
  const requestedTab = params.tab || 'hot'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const sortBy: 'hot' | 'latest' | 'following' =
    requestedTab === 'latest'
      ? 'latest'
      : requestedTab === 'following' && isAuthenticated
        ? 'following'
        : 'hot'
  const { contents, totalPages } = await getContentsFeed({ page, sortBy })

  const homepageData = await getHomepageData(user?.id)

  // 获取引导进度
  const onboardingProgress = user ? await getOnboardingProgress() : null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(220_33%_97%))]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 lg:gap-6">
          <CategoriesSidebar
            isAuthenticated={isAuthenticated}
            communities={homepageData.userCommunities}
          />

          <main className="min-w-0 flex-1 space-y-4">
            <div className="flex justify-start">
              <FeedTabs showFollowing={isAuthenticated} />
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

          <CommunitySidebar
            communityInfo={{
              name: "AI-Dating",
              icon: "💻",
              description: "连接 AI 开发者与创作者的技术社区，分享项目、技术和灵感",
              members: homepageData.stats.totalUsers,
              contents: homepageData.stats.totalContents,
            }}
            trendingTags={homepageData.popularTags}
            activeCommunities={homepageData.trendingCommunities}
          />
        </div>
      </div>
    </div>
  );
}
