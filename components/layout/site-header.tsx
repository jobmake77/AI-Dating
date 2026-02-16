'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Search, ArrowLeft, User, Bell, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getUnreadCount } from '@/lib/actions/notifications'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, username, role, isLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // 获取未读通知数量
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    // 初始加载
    let mounted = true
    getUnreadCount()
      .then((count) => {
        if (mounted) setUnreadCount(count)
      })
      .catch((error) => {
        console.error('Failed to fetch unread count:', error)
        if (mounted) setUnreadCount(0)
      })

    // 每60秒刷新一次（降低频率以提升性能）
    const interval = setInterval(() => {
      getUnreadCount()
        .then((count) => {
          if (mounted) setUnreadCount(count)
        })
        .catch((error) => {
          console.error('Failed to fetch unread count:', error)
        })
    }, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [user])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

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
      <div className="container max-w-[1280px] mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-muted/80 transition-colors"
              aria-label="返回上一页"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              返回
            </Button>
          )}

          <Link href="/" className="font-bold text-lg hover:opacity-80 transition-opacity" aria-label="返回首页">
            AI-Dating
          </Link>

          <form onSubmit={handleSearch} className="relative w-80 hidden md:block">
            <label htmlFor="search-input" className="sr-only">
              搜索内容和标签
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="search-input"
              type="search"
              placeholder="搜索内容、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-muted/50 border-muted focus-visible:bg-background transition-colors"
              aria-label="搜索"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-16" />
            </div>
          ) : user ? (
            <>
              <Button asChild size="sm" className="cursor-pointer">
                <Link href="/create">发布内容</Link>
              </Button>

              {/* 热门内容图标 */}
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <Link href="/trending" aria-label="查看热门内容">
                  <TrendingUp className="w-5 h-5" />
                </Link>
              </Button>

              {/* 通知图标 */}
              <Button variant="ghost" size="sm" asChild className="cursor-pointer relative">
                <Link href="/notifications" aria-label="查看通知">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {role === 'admin' && (
                <Button asChild size="sm" variant="outline" className="cursor-pointer">
                  <Link href="/admin/members">管理后台</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <Link href={profileLink} aria-label={`查看个人主页`}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={`${displayName} 的头像`}
                      className="w-6 h-6 rounded-full mr-1.5 object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 mr-1.5" aria-hidden="true" />
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
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                {isSigningOut ? '退出中...' : '退出'}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="cursor-pointer">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
