import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/user/follow-button'
import { MembershipSheet } from '@/components/user/membership-sheet'
import Link from 'next/link'

interface UserProfileProps {
  user: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
    bio: string | null
    membership_tier: string
    membership_expires_at?: string | null
    github_username: string | null
    followers_count?: number
    following_count?: number
  }
  isOwner: boolean
  currentUserId?: string
  isFollowing?: boolean
  isAuthenticated: boolean
}

export function UserProfile({ user, isOwner, currentUserId, isFollowing = false, isAuthenticated }: UserProfileProps) {
  // 双重验证：确保 isOwner 为 true 且当前用户ID匹配
  const canEdit = isOwner && currentUserId === user.id

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar || undefined} alt={user.full_name || user.username} />
            <AvatarFallback className="text-2xl">
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {user.full_name || user.username}
                </h1>
                {user.membership_tier === 'premium' && (
                  <Badge variant="default">会员</Badge>
                )}
              </div>

              {canEdit ? (
                <div className="flex items-center gap-2">
                  <MembershipSheet
                    membershipTier={user.membership_tier}
                    membershipExpiresAt={user.membership_expires_at || null}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings">编辑资料</Link>
                  </Button>
                </div>
              ) : (
                <FollowButton
                  userId={user.id}
                  initialIsFollowing={isFollowing}
                  isCurrentUser={isOwner}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>

            <p className="text-muted-foreground mb-3">@{user.username}</p>

            {user.bio && (
              <p className="text-sm mb-4">{user.bio}</p>
            )}

            <div className="flex items-center gap-6 mb-4">
              <Link href={`/u/${user.username}/following`} className="hover:underline">
                <span className="font-semibold">{user.following_count || 0}</span>
                <span className="text-muted-foreground text-sm ml-1">关注</span>
              </Link>
              <Link href={`/u/${user.username}/followers`} className="hover:underline">
                <span className="font-semibold">{user.followers_count || 0}</span>
                <span className="text-muted-foreground text-sm ml-1">粉丝</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub: @{user.github_username}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
