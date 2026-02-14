import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getContents } from "@/lib/queries/content";
import { ContentList } from "@/components/content/content-list";
import { Pagination } from "@/components/content/pagination";
import { TrendingTags } from "@/components/tag/trending-tags";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

async function signOut() {
  'use server'

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 获取用户的 username
  let username = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username
  }

  const params = await searchParams
  const page = Number(params.page) || 1

  const { contents, totalPages } = await getContents({ page })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              AI-Dating
            </Link>
            <div className="relative w-96 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索内容、标签..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && username ? (
              <>
                <Button asChild>
                  <Link href="/create">发布内容</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/u/${username}`}>
                    {user.user_metadata.avatar_url && (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    {user.user_metadata.user_name || username}
                  </Link>
                </Button>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm">
                    退出
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href="/login">登录</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Trending Tags */}
          <aside className="lg:col-span-1 space-y-6">
            <TrendingTags />
          </aside>

          {/* Main Content Feed */}
          <main className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">最新内容</h2>
              <p className="text-muted-foreground mt-1">
                探索社区成员分享的技术见解和实战经验
              </p>
            </div>

            <ContentList contents={contents} />
            <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container max-w-7xl mx-auto py-8 px-4 text-center text-sm text-muted-foreground">
          <p>AI-Dating - 开放的 AI 开发者学习社区</p>
          <p className="mt-2">Day 2 重构完成：标签驱动的开放社区 ✅</p>
        </div>
      </footer>
    </div>
  );
}
