'use client'

import { useState } from 'react'
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
  const pathname = usePathname()

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <nav className="flex flex-col gap-4 mt-8">
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
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* 我的社区 */}
          {isAuthenticated && userCommunities.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
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
                >
                  {community.icon_url ? (
                    <img
                      src={community.icon_url}
                      alt={community.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
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
              <div className="border-t my-2" />
              <button
                onClick={() => {
                  onSignOut()
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">退出登录</span>
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <div className="border-t my-2" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
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
