'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Sparkles, Code, Rocket, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    // 立即检查当前会话（从本地缓存读取，更快）
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session) {
          router.push('/')
        } else {
          setCheckingAuth(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (isMounted) {
          setCheckingAuth(false)
        }
      }
    }

    checkSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (session && event === 'SIGNED_IN') {
        router.push('/')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="text-center space-y-6">
          {/* 动画图标 */}
          <div className="flex justify-center gap-3">
            <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
              <Code className="h-8 w-8 text-blue-500" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          {/* 加载文本 */}
          <div className="space-y-2">
            <p className="text-lg font-medium">正在验证身份</p>
            <div className="flex items-center justify-center gap-1">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-64 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[shimmer_1.5s_ease-in-out_infinite]"
                 style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 主卡片 */}
        <Card className="relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl" />

          <CardHeader className="text-center relative">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Zap className="h-12 w-12 text-primary animate-pulse" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              欢迎来到 AI-Dating
            </CardTitle>
            <CardDescription className="text-base mt-2">
              使用 GitHub 账号登录，加入 AI 开发者社区
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full group"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              {loading ? '正在跳转...' : '使用 GitHub 登录'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              登录即表示你同意我们的服务条款和隐私政策
            </p>
          </CardContent>
        </Card>

        {/* 特性展示 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
            <Code className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs font-medium">源码深潜</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
            <Rocket className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xs font-medium">实战工坊</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-xs font-medium">AI 前沿</p>
          </div>
        </div>
      </div>
    </div>
  )
}
