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
import { getRequestLocale } from "@/i18n/request";
import { getTranslation } from "@/i18n/dictionaries";
import { HomeHeroBrand } from "@/components/brand/home-hero-brand";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const title = getTranslation(locale, 'homePage.metadata.title', 'AI-Dating - A Date with AI')
  const description = getTranslation(locale, 'homePage.metadata.description', 'The AI developer community for sharing projects, articles, and ideas.')
  const imageAlt = getTranslation(locale, 'homePage.metadata.imageAlt', 'AI-Dating')
  const keywords = getTranslation(locale, 'homePage.metadata.keywords', 'AI, developer community, technical sharing')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)

  return {
    title,
    description,
    keywords,
    openGraph: {
      type: "website",
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: baseUrl,
      title,
      description,
      siteName: "AI-Dating",
      images: [
        {
          url: `${baseUrl}/api/og?type=home`,
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
      images: [`${baseUrl}/api/og?type=home`],
    },
  }
}

interface HomeProps {
  searchParams: Promise<{ page?: string; tab?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const locale = await getRequestLocale()
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
  const [{ contents, totalPages }, homepageData, onboardingProgress] = await Promise.all([
    getContentsFeed({ page, sortBy }),
    getHomepageData(user?.id),
    user ? getOnboardingProgress() : Promise.resolve(null),
  ])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(220_33%_97%))]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 lg:gap-6">
          <CategoriesSidebar
            isAuthenticated={isAuthenticated}
            communities={homepageData.userCommunities}
          />

          <main className="min-w-0 flex-1 space-y-4">
            <HomeHeroBrand
              subtitle={getTranslation(
                locale,
                'homePage.brandSubtitle',
                'A place where people, ideas, and AI projects meet.'
              )}
            />

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
              description: getTranslation(locale, 'homePage.sidebarDescription', 'A technical community for AI developers and creators to share projects, techniques, and ideas.'),
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
