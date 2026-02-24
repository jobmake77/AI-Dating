import { getContentsFeed } from "@/lib/queries/content";
import { ContentList } from "@/components/content/content-list-twitter";
import { Pagination } from "@/components/content/pagination";
import { TrendingTags } from "@/components/tag/trending-tags";
import { TrendingContents } from "@/components/content/trending-contents";
import { createClient } from "@/lib/supabase/server";

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { contents, totalPages } = await getContentsFeed({ page })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="flex min-h-screen">
      {/* 主内容流 - 白色背景，X 风格 */}
      <main className="flex-1 min-h-screen max-w-[600px] bg-card border-r border-border">
        <div className="sticky top-[56px] z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
          <h1 className="text-lg font-bold">最新内容</h1>
        </div>

        <ContentList contents={contents} isAuthenticated={isAuthenticated} />

        <div className="border-t border-border p-5">
          <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
        </div>
      </main>

      {/* 右侧边栏 */}
      <aside className="hidden xl:block w-[320px] flex-shrink-0">
        <div className="sticky top-[56px] p-4 space-y-4">
          <TrendingTags />
          <TrendingContents />
        </div>
      </aside>
    </div>
  );
}
