import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/categories";

async function signOut() {
  'use server'

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">
            AI-Dating
          </CardTitle>
          <CardDescription className="text-lg">
            A Date with AI: The AI Developer Community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                {user.user_metadata.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-medium">
                    欢迎回来，{user.user_metadata.user_name || user.email}！
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline">
                  退出登录
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                🚀 AI 开发者技术社区
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg">
                    立即登录
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  了解更多
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {Object.values(CATEGORIES).map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {user ? (
              <>✅ 已登录 | Day 1 完成：GitHub OAuth ✅</>
            ) : (
              <>项目正在搭建中... Day 1 进度：GitHub OAuth ✅</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
