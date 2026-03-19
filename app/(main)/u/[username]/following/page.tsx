import { getUserByUsername } from '@/lib/actions/user'
import { getFollowing } from '@/lib/actions/follows'
import { checkUserFollowing } from '@/lib/actions/follows'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from '@/components/user/follow-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface FollowingPageProps {
  params: Promise<{ username: string }>
}

type FollowingRecord = Awaited<ReturnType<typeof getFollowing>>[number]

export default async function FollowingPage({ params }: FollowingPageProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `userRelations.${key}`, fallback)
  const { username } = await params

  const user = await getUserByUsername(username)
  if (!user) {
    notFound()
  }

  const following = await getFollowing(user.id)

  // Get current user
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Check following status for each user
  const followingWithStatus = await Promise.all(
    following.map(async (item: FollowingRecord) => {
      let isFollowing = false
      if (currentUser && currentUser.id !== item.following.id) {
        isFollowing = await checkUserFollowing(item.following.id, currentUser.id)
      }
      return { ...item, isFollowing }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backProfile', 'Back to profile')}
        </Link>

        {/* User Header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card mb-4">
          <div className="h-16 gradient-primary opacity-80" />
          <div className="px-5 pb-4 -mt-8">
            <div className="flex items-end gap-4">
              <Link href={`/u/${username}`}>
                <Avatar className="h-16 w-16 border-4 border-card shadow-lg">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="gradient-primary text-white text-xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 pt-8">
                <h1 className="font-mono text-lg font-bold text-foreground">
                  {user.full_name || username}
                </h1>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card mb-4">
          <Link
            href={`/u/${username}/followers`}
            className="flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-secondary text-center"
          >
            {t('followers', 'Followers')}
          </Link>
          <Link
            href={`/u/${username}/following`}
            className="flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all gradient-primary text-white shadow-sm text-center"
          >
            {t('following', 'Following')}
          </Link>
        </div>

        {/* Following Grid */}
        {followingWithStatus.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('emptyFollowing', 'Not following anyone yet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {followingWithStatus.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-elevated group"
              >
                <div className="p-4">
                  <Link href={`/u/${item.following.username}`} className="block">
                    <div className="flex flex-col items-center text-center mb-3">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={item.following.avatar || undefined} />
                        <AvatarFallback className="gradient-primary text-white text-lg font-bold">
                          {item.following.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.following.full_name || item.following.username}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        @{item.following.username}
                      </p>
                    </div>
                    {item.following.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                        {item.following.bio}
                      </p>
                    )}
                  </Link>
                  <FollowButton
                    userId={item.following.id}
                    initialIsFollowing={item.isFollowing}
                    isCurrentUser={currentUser?.id === item.following.id}
                    isAuthenticated={!!currentUser}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
