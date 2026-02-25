'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileNav } from '@/components/layout/mobile-nav'
import { createClient } from '@/lib/supabase/client'
import { Search, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

interface ServerUser {
  id: string
  email: string | undefined
  user_metadata: any
  username: string | null
  role: string | null
  avatar: string | null
}

interface SiteHeaderProps {
  serverUser?: ServerUser | null
}

export function SiteHeader({ serverUser }: SiteHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const user = serverUser
  const username = serverUser?.username
  const role = serverUser?.role

  // 获取未读通知数量 + 实时订阅
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    let mounted = true

    const loadUnreadCount = async () => {
      try {
        const supabase = createClient()
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
        if (mounted) setUnreadCount(count || 0)
      } catch {
        if (mounted) setUnreadCount(0)
      }
    }

    loadUnreadCount()

    const supabase = createClient()
    const channel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          const notification = payload.new as any
          let message = '你有新的通知'
          if (notification.type === 'like') message = '有人赞了你的内容'
          else if (notification.type === 'comment') message = '有人评论了你的内容'
          else if (notification.type === 'repost') message = '有人转发了你的内容'
          else if (notification.type === 'follow') message = '有人关注了你'
          toast({ title: '新通知', description: message })
        }
      )
      .subscribe()

    const interval = setInterval(() => {
      if (mounted) loadUnreadCount()
    }, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [user, toast])

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
      toast({ title: '已退出登录', description: '您已成功退出账号' })
      router.push('/')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('退出登录失败')
      toast({ variant: 'destructive', title: '退出失败', description: error.message || '请稍后重试' })
    } finally {
      setIsSigningOut(false)
    }
  }

  const displayName = user?.user_metadata?.user_name ||
                      username ||
                      user?.email?.split('@')[0] ||
                      '用户'

  const avatarUrl = user?.avatar || user?.user_metadata?.avatar_url
  const profileLink = username ? `/u/${username}` : '/settings'

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-sm">
      <div className="flex h-14 items-center justify-between px-4 gap-3">
        {/* 左侧：汉堡菜单（移动端）+ Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* 移动端汉堡菜单 */}
          <div className="lg:hidden">
            <MobileNav
              isAuthenticated={!!user}
              username={username}
              onSignOut={handleSignOut}
            />
          </div>

          <Link
            href="/"
            className="font-bold text-xl hover:opacity-80 transition-opacity"
            aria-label="返回首页"
          >
            AI-Dating
          </Link>
        </div>

        {/* 中间：搜索框（桌面端） */}
        <form onSubmit={handleSearch} className="relative w-full max-w-[280px] hidden md:block">
          <label htmlFor="search-input" className="sr-only">搜索内容和标签</label>
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="search-input"
            type="search"
            placeholder="搜索内容、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/60 border-transparent focus-visible:bg-background focus-visible:border-border transition-colors rounded-full"
          />
        </form>

        {/* 右侧：操作区 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {user ? (
            <>
              {/* 通知下拉 */}
              <NotificationDropdown
                unreadCount={unreadCount}
                onRead={() => setUnreadCount(0)}
              />

              {/* 管理员入口 */}
              {role === 'admin' && (
                <>
                  <Button asChild size="sm" variant="outline" className="hidden lg:flex">
                    <Link href="/admin/moderation">审核</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="hidden lg:flex">
                    <Link href="/admin/users">用户</Link>
                  </Button>
                </>
              )}

              {/* 用户头像 - 桌面端 */}
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href={profileLink} aria-label="查看个人主页">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${displayName} 的头像`}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" aria-hidden="true" />
                  )}
                </Link>
              </Button>

              {/* 退出 - 桌面端 */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                disabled={isSigningOut}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors hidden sm:flex"
              >
                {isSigningOut ? '退出中...' : '退出'}
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
