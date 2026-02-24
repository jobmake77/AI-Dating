'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, PenSquare, Users, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MobileBottomNavProps {
  isAuthenticated: boolean
  username?: string | null
}

export function MobileBottomNav({ isAuthenticated, username }: MobileBottomNavProps) {
  const pathname = usePathname()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: convs } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', user.id)

        if (!convs || convs.length === 0) return

        let total = 0
        for (const conv of convs) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.conversation_id)
            .gt('created_at', conv.last_read_at || '1970-01-01')
            .neq('sender_id', user.id)
          total += count || 0
        }
        setUnreadMessages(total)
      } catch {
        // ignore
      }
    }
    load()
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    {
      href: '/messages',
      label: '消息',
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    { href: '/create', label: '发布', icon: PenSquare },
    { href: '/communities', label: '社区', icon: Users },
    {
      href: username ? `/u/${username}` : '/settings',
      label: '我的',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
