'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Menu, Home, Search, Bell, User, Settings, LogOut, PenSquare, MessageCircle, Users } from 'lucide-react'

interface MobileNavProps {
  isAuthenticated: boolean
  username?: string | null
  onSignOut?: () => void
  userCommunities?: Array<{
    id: string
    name: string
    slug: string
    icon_url?: string | null
  }>
}

export function MobileNav({ isAuthenticated, username, onSignOut, userCommunities = [] }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/search', label: '搜索', icon: Search },
    ...(isAuthenticated
      ? [
          { href: '/messages', label: '消息', icon: MessageCircle },
          { href: '/communities', label: '社区', icon: Users },
          { href: '/notifications', label: '通知', icon: Bell },
          { href: '/create', label: '发布', icon: PenSquare },
          { href: username ? `/u/${username}` : '/settings', label: '我的', icon: User },
          { href: '/settings', label: '设置', icon: Settings },
        ]
      : []),
  ]

  // 在客户端挂载前显示简单按钮
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden" disabled>
        <Menu className="h-5 w-5" />
        <span className="sr-only">打开菜单</span>
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开导航菜单">
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]" aria-label="移动端导航菜单">
        <nav className="flex flex-col gap-4 mt-8" aria-label="主要功能">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* 我的社区 */}
          {isAuthenticated && userCommunities.length > 0 && (
            <>
              <Separator className="my-2" role="separator" />
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground" role="heading" aria-level={2}>
                我的社区
              </div>
              {userCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === `/communities/${community.slug}`
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-current={pathname === `/communities/${community.slug}` ? 'page' : undefined}
                >
                  {community.icon_url ? (
                    <img
                      src={community.icon_url}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center" aria-hidden="true">
                      <span className="text-xs font-semibold">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">{community.name}</span>
                </Link>
              ))}
            </>
          )}

          {isAuthenticated && onSignOut && (
            <>
              <div className="border-t my-2" role="separator" />
              <button
                onClick={() => {
                  onSignOut()
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                aria-label="退出登录"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">退出登录</span>
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <div className="border-t my-2" role="separator" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                aria-label="登录账号"
              >
                登录
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
