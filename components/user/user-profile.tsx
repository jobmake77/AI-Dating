import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfileProps {
  user: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
    bio: string | null
    membership_tier: string
    github_username: string | null
  }
  isOwner: boolean
  currentUserId?: string  // 添加当前用户ID用于额外验证
}

export function UserProfile({ user, isOwner, currentUserId }: UserProfileProps) {
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">
                {user.full_name || user.username}
              </h1>
              {user.membership_tier === 'premium' && (
                <Badge variant="default">会员</Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-3">@{user.username}</p>

            {user.bio && (
              <p className="text-sm mb-4">{user.bio}</p>
            )}

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

              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">编辑资料</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
