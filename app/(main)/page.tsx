import { getContentsFeed } from "@/lib/queries/content";
import { ContentList } from "@/components/content/content-list-twitter";
import { Pagination } from "@/components/content/pagination";
import { TrendingTags } from "@/components/tag/trending-tags";
import { CategoryNav } from "@/components/category/category-nav";

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { contents, totalPages } = await getContentsFeed({ page })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
          {/* Left Sidebar - Trending Tags */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="sticky top-[72px] space-y-4">
              {/* Category Navigation */}
              <div className="border border-border rounded-xl p-4 bg-card/50 backdrop-blur-sm">
                <h3 className="font-bold text-base mb-3">板块导航</h3>
                <CategoryNav />
              </div>

              {/* Trending Tags */}
              <TrendingTags />
            </div>
          </aside>

          {/* Main Content Feed - Twitter Style Single Column */}
          <main className="lg:col-span-6">
            {/* Header */}
            <div className="mb-4 px-2">
              <h1 className="text-2xl font-bold mb-1">最新内容</h1>
              <p className="text-muted-foreground text-sm">
                探索社区成员分享的技术见解和实战经验
              </p>
            </div>

            {/* Content Feed */}
            <ContentList contents={contents} />

            {/* Pagination */}
            <div className="mt-6 px-2">
              <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
            </div>
          </main>

          {/* Right Sidebar - Could add "Who to Follow" or other widgets */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[72px]">
              {/* Placeholder for future widgets */}
              <div className="border border-border rounded-xl p-5 bg-card/50 backdrop-blur-sm">
                <h3 className="font-bold text-base mb-3">关于社区</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI-Dating 是一个开放的 AI 开发者学习社区，
                  在这里你可以分享技术见解、实战经验，
                  与其他开发者交流学习。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 bg-muted/20">
        <div className="container max-w-[1280px] mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
          <p>AI-Dating - 开放的 AI 开发者学习社区</p>
          <p className="mt-1.5 text-xs">Day 2 完成 · Twitter 风格布局优化 ✅</p>
        </div>
      </footer>
    </div>
  );
}
