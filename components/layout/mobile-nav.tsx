'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Menu, Home, Search, Bell, User, Settings, LogOut, PenSquare, MessageCircle, Users } from 'lucide-react'
import { useHydrated } from '@/lib/hooks/use-hydrated'
import { useTranslations } from 'use-intl'

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
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const mounted = useHydrated()
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/search', label: t('common.search'), icon: Search },
    ...(isAuthenticated
      ? [
          { href: '/messages', label: t('nav.messages'), icon: MessageCircle },
          { href: '/communities', label: t('nav.communities'), icon: Users },
          { href: '/notifications', label: t('nav.notifications'), icon: Bell },
          { href: '/create', label: t('nav.create'), icon: PenSquare },
          { href: username ? `/u/${username}` : '/settings', label: t('nav.me'), icon: User },
          { href: '/settings', label: t('nav.settings'), icon: Settings },
        ]
      : []),
  ]

  // 在客户端挂载前显示简单按钮
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden" disabled>
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('mobileNav.openMenu')}</span>
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('mobileNav.openNavigationMenu')}>
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{t('mobileNav.openMenu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]" aria-label={t('mobileNav.sheetLabel')}>
        <nav className="flex flex-col gap-4 mt-8" aria-label={t('mobileNav.primaryNav')}>
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
                {t('mobileNav.myCommunities')}
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
                    <Image
                      src={community.icon_url}
                      alt=""
                      width={32}
                      height={32}
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
                aria-label={t('auth.logout')}
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{t('nav.logout')}</span>
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
                aria-label={t('mobileNav.loginAccount')}
              >
                {t('auth.login')}
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
