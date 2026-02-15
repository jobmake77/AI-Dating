'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Search, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, username, isLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return

    try {
      setIsSigningOut(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast({
        title: '已退出登录',
        description: '您已成功退出账号',
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('退出登录失败')
      console.error('Sign out error:', error)

      toast({
        variant: 'destructive',
        title: '退出失败',
        description: error.message || '请稍后重试',
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const showBackButton = pathname !== '/' && !pathname.startsWith('/login')

  // 显示名称优先级: GitHub 用户名 > 数据库 username > 邮箱前缀 > "用户"
  const displayName = user?.user_metadata?.user_name ||
                      username ||
                      user?.email?.split('@')[0] ||
                      '用户'

  // 头像链接: 如果有 username 去个人主页,否则去设置页
  const profileLink = username ? `/u/${username}` : '/settings'

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
              aria-label="返回上一页"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          )}

          <Link href="/" className="font-bold text-xl" aria-label="返回首页">
            AI-Dating
          </Link>

          <div className="relative w-96 hidden md:block">
            <label htmlFor="search-input" className="sr-only">
              搜索内容和标签
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="search-input"
              placeholder="搜索内容、标签..."
              className="pl-10"
              aria-label="搜索"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          ) : user ? (
            <>
              <Button asChild>
                <Link href="/create">发布内容</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={profileLink} aria-label={`查看个人主页`}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={`${displayName} 的头像`}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <User className="w-6 h-6 mr-2" aria-hidden="true" />
                  )}
                  {displayName}
                </Link>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                disabled={isSigningOut}
                aria-label="退出登录"
              >
                {isSigningOut ? '退出中...' : '退出'}
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
