'use client'

import { NavLink } from './nav-link'
import { CommunityNavItem } from './community-nav-item'
import { Home, MessageCircle, Users, Bell, PenSquare, ChevronDown, ChevronRight, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { useOptionalTranslation } from '@/components/i18n/locale-provider'

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
  role: string | null
}

interface CommunityMembership {
  community: Community | null
}

export function LeftSidebar() {
  const t = useOptionalTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [communitiesOpen, setCommunitiesOpen] = useState(true)
  const pathname = usePathname()
  const visibleUnreadNotifications = pathname === '/notifications' ? 0 : unreadNotifications

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
        .select('username, avatar, full_name, role')
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
        setUserCommunities(
          (communities as CommunityMembership[])
            .map((item) => item.community)
            .filter((community): community is Community => Boolean(community))
        )
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
                      t('leftSidebar.defaultUser', 'User')
  const profileLink = username ? `/u/${username}` : '/settings'

  return (
    <aside
      className="hidden lg:flex w-[240px] flex-col border-r border-border bg-background h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto flex-shrink-0"
      aria-label={t('leftSidebar.primaryNavAria', 'Primary navigation')}
    >
      <div className="px-3 pt-4 pb-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t('leftSidebar.navigationTitle', 'Navigation')}</p>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 px-3 space-y-2" aria-label={t('leftSidebar.mainFunctionsAria', 'Main features')}>
        <div className="space-y-1.5" data-tour="home-link">
          <NavLink href="/" icon={Home}>{t('nav.home', 'Home')}</NavLink>
          <NavLink href="/messages" icon={MessageCircle} badge={unreadMessages}>{t('nav.messages', 'Messages')}</NavLink>
          <NavLink href="/communities" icon={Users}>{t('nav.communities', 'Communities')}</NavLink>
          <NavLink href="/notifications" icon={Bell} badge={visibleUnreadNotifications}>{t('nav.notifications', 'Notifications')}</NavLink>
          <NavLink href="/events" icon={Calendar}>{t('nav.events', 'Events')}</NavLink>

          {userData?.role === 'admin' && (
            <NavLink href="/admin" icon={ShieldCheck}>{t('nav.admin', 'Admin')}</NavLink>
          )}
        </div>

        {user && (
          <div className="pt-0.5" data-tour="create-button">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              aria-label={t('leftSidebar.createAria', 'Create new content')}
            >
              <PenSquare className="h-4 w-4" aria-hidden="true" />
              {t('content.publish', 'Publish')}
            </Link>
          </div>
        )}

        {/* 我的社区 */}
        {user && (
          <div className="pt-0.5">
            <button
              onClick={() => setCommunitiesOpen(!communitiesOpen)}
              className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md hover:bg-accent"
              aria-expanded={communitiesOpen}
              aria-controls="my-communities-list"
              aria-label={communitiesOpen ? t('leftSidebar.collapseCommunities', 'Collapse my communities') : t('leftSidebar.expandCommunities', 'Expand my communities')}
            >
              <span>{t('mobileNav.myCommunities', 'My communities')}</span>
              {communitiesOpen
                ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                : <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              }
            </button>

            {communitiesOpen && (
              <div id="my-communities-list" className="mt-2 space-y-1.5" role="list">
                {userCommunities.length > 0 ? (
                  <>
                    {userCommunities.map((community) => (
                      <CommunityNavItem key={community.id} community={community} />
                    ))}
                    <Link
                      href="/communities"
                      className="block px-3 py-1.5 text-xs text-primary hover:underline"
                      aria-label={t('leftSidebar.browseMoreAria', 'Browse more communities')}
                    >
                      {t('leftSidebar.browseMore', 'Browse more')} →
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/communities"
                    className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t('leftSidebar.joinOrCreateAria', 'Join or create a community')}
                  >
                    + {t('leftSidebar.joinOrCreate', 'Join or create a community')}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* 用户信息 */}
      {user && (
        <div className="border-t border-border px-3 py-4" data-tour="profile-link">
          <Link
            href={profileLink}
            className="flex items-center gap-3 bg-background p-3 hover:bg-accent/40 transition-colors"
            aria-label={t('leftSidebar.viewProfile', 'View {name} profile', { name: displayName })}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                aria-hidden="true"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0" aria-hidden="true">
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
