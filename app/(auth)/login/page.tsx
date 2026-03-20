'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Github, Mail, Sparkles, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signInWithEmail, signInWithGitHub } from '@/lib/actions/auth'
import { useTranslations } from 'use-intl'
import { AIDatingTypewriter } from '@/components/brand/ai-dating-typewriter'

export default function LoginPage() {
  const t = useTranslations('authPages.login')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const warning: string | null = null
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    // 在后台检查 session，不阻塞 UI
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        // 如果已登录，静默跳转到首页
        if (session) {
          router.push('/')
        }
      } catch (error) {
        console.error('Session check error:', error)
        // 忽略错误，让用户继续使用登录表单
      }
    }

    checkSession()

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

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = await signInWithEmail(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Success will redirect automatically
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    setError(null)

    const result = await signInWithGitHub()

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Success will redirect automatically
  }

  // 直接显示登录表单，不显示加载页面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="relative overflow-hidden">
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
              <AIDatingTypewriter
                loop
                pauseMs={2000}
                typingSpeed={120}
                deletingSpeed={70}
                restartDelayMs={450}
              />
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t('description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 relative">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {warning && (
              <Alert>
                <AlertDescription className="text-yellow-600 dark:text-yellow-500">
                  ⚠️ {warning}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full" onValueChange={() => { setError(null); setSuccess(null) }}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="signin">{t('tab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('emailLabel')}</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">{t('passwordLabel')}</Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Mail className="mr-2 h-4 w-4" />
                    {loading ? t('submitting') : t('submit')}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('divider')}</span>
                  </div>
                </div>

                <Button onClick={handleGitHubLogin} disabled={loading} variant="outline" className="w-full group">
                  <Github className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  {loading ? t('githubRedirecting') : t('github')}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  {t('oauthHint')}
                </p>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground">
              {t('signupPrompt')}{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t('signupLink')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
