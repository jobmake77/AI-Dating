import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/user/follow-button'
import { SendMessageButton } from '@/components/user/send-message-button'
import { Calendar, FileText, Heart, Github } from 'lucide-react'
import Link from 'next/link'
import { formatISODate } from '@/lib/utils/date'
import { useTranslations } from 'use-intl'

interface UserProfileProps {
  user: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
    bio: string | null
    github_username: string | null
    followers_count?: number
    following_count?: number
    created_at?: string
  }
  isOwner: boolean
  currentUserId?: string
  isFollowing?: boolean
  isAuthenticated: boolean
  stats?: {
    contents_count: number
    total_likes: number
  }
}

export function UserProfile({ user, isOwner, currentUserId, isFollowing = false, isAuthenticated, stats }: UserProfileProps) {
  const t = useTranslations('userProfile')
  // 双重验证：确保 isOwner 为 true 且当前用户ID匹配
  const canEdit = isOwner && currentUserId === user.id
  const followersCount = Math.max(user.followers_count || 0, 0)
  const followingCount = Math.max(user.following_count || 0, 0)

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10 shadow-xl shrink-0">
            <AvatarImage src={user.avatar || undefined} alt={user.full_name || user.username} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {user.full_name || user.username}
                </h1>
              </div>

              {canEdit ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow-md transition-shadow">
                    <Link href="/settings">{t('edit')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <FollowButton
                    userId={user.id}
                    initialIsFollowing={isFollowing}
                    isCurrentUser={isOwner}
                    isAuthenticated={isAuthenticated}
                  />
                  <SendMessageButton
                    userId={user.id}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-4 text-sm">@{user.username}</p>

            {user.bio && (
              <p className="text-sm mb-5 leading-relaxed">{user.bio}</p>
            )}

            {/* 统计数据 */}
            <div className="flex items-center gap-6 mb-5 flex-wrap">
              <Link href={`/u/${user.username}/following`} className="group">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">{followingCount}</span>
                  <span className="text-muted-foreground text-sm group-hover:text-primary transition-colors">{t('followingCount')}</span>
                </div>
              </Link>
              <Link href={`/u/${user.username}/followers`} className="group">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">{followersCount}</span>
                  <span className="text-muted-foreground text-sm group-hover:text-primary transition-colors">{t('followers')}</span>
                </div>
              </Link>
              {stats && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-lg">{stats.contents_count}</span>
                    <span className="text-muted-foreground">{t('contents')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-lg">{stats.total_likes}</span>
                    <span className="text-muted-foreground">{t('likes')}</span>
                  </div>
                </>
              )}
            </div>

            {/* 社交链接和加入时间 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {user.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                >
                  <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>@{user.github_username}</span>
                </a>
              )}
              {user.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t('joined')} {formatISODate(user.created_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
