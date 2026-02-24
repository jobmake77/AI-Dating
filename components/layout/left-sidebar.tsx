'use client'

import { NavLink } from './nav-link'
import { CommunityNavItem } from './community-nav-item'
import { Home, MessageCircle, Users, Bell, PenSquare, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Community {
  id: string
  name: string
  slug: string
  icon_url?: string | null
}

interface UserData {
  username: string | null
  avatar: string | null
  full_name: string | null
}

export function LeftSidebar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [communitiesOpen, setCommunitiesOpen] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setUserData(null)
        setUserCommunities([])
        return
      }

      setUser(authUser)

      const { data: userInfo } = await supabase
        .from('users')
        .select('username, avatar, full_name')
        .eq('id', authUser.id)
        .single()
      setUserData(userInfo)

      const { data: communities } = await supabase
        .from('community_members')
        .select('*, community:communities!community_members_community_id_fkey(*)')
        .eq('user_id', authUser.id)
        .order('joined_at', { ascending: false })
        .limit(8)

      if (communities) {
        setUserCommunities(communities.map((item: any) => item.community).filter(Boolean))
      }

      try {
        const { count: notifCount } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id)
          .eq('is_read', false)
        setUnreadNotifications(notifCount || 0)

        const { data: convs } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', authUser.id)

        if (convs && convs.length > 0) {
          let total = 0
          for (const conv of convs) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.conversation_id)
              .gt('created_at', conv.last_read_at || '1970-01-01')
              .neq('sender_id', authUser.id)
            total += count || 0
          }
          setUnreadMessages(total)
        }
      } catch {
        // ignore
      }
    }

    loadData()
  }, [])

  const username = userData?.username
  const avatarUrl = userData?.avatar || user?.user_metadata?.avatar_url
  const displayName = userData?.full_name ||
                      user?.user_metadata?.user_name ||
                      username ||
                      user?.email?.split('@')[0] ||
                      '用户'
  const profileLink = username ? `/u/${username}` : '/settings'

  return (
    <aside className="hidden lg:flex w-[220px] flex-col border-r border-border bg-background h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto flex-shrink-0">
      {/* 主导航 */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        <NavLink href="/" icon={Home}>首页</NavLink>
        <NavLink href="/messages" icon={MessageCircle} badge={unreadMessages}>消息</NavLink>
        <NavLink href="/communities" icon={Users}>社区</NavLink>
        <NavLink href="/notifications" icon={Bell} badge={unreadNotifications}>通知</NavLink>

        {user && (
          <div className="pt-2 pb-1">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <PenSquare className="h-4 w-4" />
              发布内容
            </Link>
          </div>
        )}

        {/* 我的社区 */}
        {user && (
          <>
            <Separator className="my-2" />
            <button
              onClick={() => setCommunitiesOpen(!communitiesOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <span>我的社区</span>
              {communitiesOpen
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />
              }
            </button>

            {communitiesOpen && (
              <div className="space-y-0.5">
                {userCommunities.length > 0 ? (
                  <>
                    {userCommunities.map((community) => (
                      <CommunityNavItem key={community.id} community={community} />
                    ))}
                    <Link
                      href="/communities"
                      className="block px-3 py-1.5 text-xs text-primary hover:underline"
                    >
                      浏览更多 →
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/communities"
                    className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + 加入或创建社区
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </nav>

      {/* 用户信息 */}
      {user && (
        <div className="border-t border-border p-2">
          <Link
            href={profileLink}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{displayName}</p>
              {username && (
                <p className="text-xs text-muted-foreground truncate">@{username}</p>
              )}
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}
