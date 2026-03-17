'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileSearchModal } from '@/components/search/mobile-search-modal'
import { createClient } from '@/lib/supabase/client'
import { Search, User, Code2, MessageSquare, Plus, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { useOptionalTranslation } from '@/components/i18n/locale-provider'
import { useLocale } from 'use-intl'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'

type UserMetadata = {
  user_name?: string | null
  avatar_url?: string | null
}

interface ServerUser {
  id: string
  email: string | undefined
  user_metadata: UserMetadata | null
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
  const locale = useLocale() as 'zh' | 'en'
  const t = useOptionalTranslation()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const user = serverUser
  const username = serverUser?.username
  const navItems = [
    { href: '/', label: t('nav.feed', '话题') },
    { href: '/trending', label: t('nav.trending', '热门') },
    { href: '/explore', label: t('nav.explore', '探索') },
    { href: '/communities', label: t('nav.communities', '社区') },
    { href: '/events', label: t('nav.events', '活动') },
  ]

  // Get unread notification count + real-time subscription
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
        (payload: RealtimePostgresInsertPayload<Tables<'notifications'>>) => {
          setUnreadCount((prev) => prev + 1)
          const notification = payload.new
          let message = t('notifications.newFallback', '你有新的通知')
          if (notification.type === 'like') message = t('notifications.like', '有人赞了你的内容')
          else if (notification.type === 'comment') message = t('notifications.comment', '有人评论了你的内容')
          else if (notification.type === 'repost') message = t('notifications.repost', '有人转发了你的内容')
          else if (notification.type === 'follow') message = t('notifications.follow', '有人关注了你')
          toast({ title: t('nav.notifications', '通知'), description: message })
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
  }, [t, toast, user])

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
        title: t('auth.logoutSuccessTitle', '已退出登录'),
        description: t('auth.logoutSuccessDescription', '您已成功退出账号'),
      })
      router.push('/')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('退出登录失败')
      toast({
        variant: 'destructive',
        title: t('auth.logoutFailedTitle', '退出失败'),
        description: error.message || t('errors.generic', '发生错误，请稍后重试'),
      })
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="hidden font-mono text-sm font-bold sm:block text-foreground group-hover:text-primary transition-colors">
            AI-Dating
          </span>
        </Link>

        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Search - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${
              searchFocused
                ? "border-primary bg-background shadow-sm w-full"
                : "border-border bg-secondary/50 w-48"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              type="search"
              placeholder={t('search.placeholderDesktop', '搜索内容、标签...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-6 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <LanguageSwitcher currentLocale={locale} />

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <NotificationDropdown
                unreadCount={unreadCount}
                onRead={() => setUnreadCount(0)}
              />

              {/* Messages - Icon only */}
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex h-8 w-8">
                <Link href="/messages">
                  <span className="sr-only">{t('nav.messages', '消息')}</span>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              {/* Create post */}
              <Button size="sm" asChild className="hidden sm:flex h-8 px-3 text-xs">
                <Link href="/create">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t('content.publish', '发布')}
                </Link>
              </Button>

              {/* User avatar */}
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex h-8 w-8">
                <Link href={profileLink}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="h-8 px-3 text-xs">
              <Link href="/login">{t('auth.login', '登录')}</Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-8 w-8"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in-up">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {user && (
              <>
                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {t('content.publish', '发布')}
                </Link>
                <Link
                  href={profileLink}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {t('nav.profile', '个人主页')}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  disabled={isSigningOut}
                  className="px-3 py-2 text-sm font-medium rounded-md text-left text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  {isSigningOut ? t('auth.loggingOut', '退出中...') : t('auth.logout', '退出登录')}
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Mobile search modal */}
      <MobileSearchModal
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
      />
    </header>
  )
}
