import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signInWithGitHub() {
  'use server'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=Could not authenticate user')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export default async function LoginPage() {
  const supabase = await createClient();

  // 检查用户是否已登录
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            欢迎来到 AI-Dating
          </CardTitle>
          <CardDescription>
            使用 GitHub 账号登录，加入 AI 开发者社区
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInWithGitHub}>
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              使用 GitHub 登录
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            登录即表示你同意我们的服务条款和隐私政策
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
