'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        router.push('/')
      } else {
        setCheckingAuth(false)
      }
    }

    checkUser()
  }, [router])

  const handleGitHubLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        console.error('OAuth 错误:', oauthError)
        setError(`登录失败: ${oauthError.message}`)
        setLoading(false)
        return
      }

      if (data.url) {
        // 跳转到 GitHub OAuth
        window.location.href = data.url
      } else {
        setError('未获取到 OAuth URL')
        setLoading(false)
      }
    } catch (err) {
      console.error('异常:', err)
      setError(`发生错误: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">检查登录状态...</p>
      </div>
    )
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
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            {loading ? '正在跳转...' : '使用 GitHub 登录'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            登录即表示你同意我们的服务条款和隐私政策
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
