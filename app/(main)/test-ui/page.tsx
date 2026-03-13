import { getContentsFeed } from "@/lib/queries/content";
import { ContentListCompact } from "@/components/content/content-list-compact";
import { FeedTabs } from "@/components/content/feed-tabs";
import { Pagination } from "@/components/content/pagination";
import { TrendingTags } from "@/components/tag/trending-tags";
import { TrendingContents } from "@/components/content/trending-contents";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface TestPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TestPage({ searchParams }: TestPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { contents, totalPages } = await getContentsFeed({ page });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex w-full justify-center">
        <div className="relative flex w-full max-w-[1060px] bg-background">
          {/* 主内容流 */}
          <main className="relative z-10 flex-1 min-h-screen max-w-[620px] border-r border-border bg-background">
            <div className="sticky top-[56px] z-10 border-b border-border bg-card/90 backdrop-blur-xl px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-base font-semibold">社区动态</h1>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex h-2 w-2 rounded-full bg-online" />
                  实时更新
                </div>
              </div>
              <FeedTabs />
            </div>

            <ContentListCompact contents={contents} isAuthenticated={isAuthenticated} />

            <div className="border-t border-border p-4">
              <Pagination currentPage={page} totalPages={totalPages} basePath="/test-ui" />
            </div>
          </main>

          {/* 右侧边栏 */}
          <aside className="relative z-10 hidden xl:block w-[320px] flex-shrink-0">
            <div className="sticky top-[56px] p-4 space-y-4">
              <div className="space-y-4">
                <TrendingTags />
                <TrendingContents />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
