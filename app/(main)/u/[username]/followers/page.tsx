import { getUserByUsername } from '@/lib/actions/user'
import { getFollowers } from '@/lib/actions/follows'
import { checkUserFollowing } from '@/lib/actions/follows'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FollowButton } from '@/components/user/follow-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface FollowersPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params

  try {
    const user = await getUserByUsername(username)
    const followers = await getFollowers(user.id)

    // Get current user
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Check following status for each follower
    const followersWithStatus = await Promise.all(
      followers.map(async (item: any) => {
        let isFollowing = false
        if (currentUser && currentUser.id !== item.follower.id) {
          isFollowing = await checkUserFollowing(item.follower.id, currentUser.id)
        }
        return { ...item, isFollowing }
      })
    )

    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>@{username} 的粉丝</CardTitle>
          </CardHeader>
          <CardContent>
            {followersWithStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                还没有粉丝
              </p>
            ) : (
              <div className="space-y-4">
                {followersWithStatus.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Link href={`/u/${item.follower.username}`} className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.follower.avatar || undefined} />
                        <AvatarFallback>
                          {item.follower.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.follower.full_name || item.follower.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{item.follower.username}
                        </p>
                        {item.follower.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {item.follower.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                    <FollowButton
                      userId={item.follower.id}
                      initialIsFollowing={item.isFollowing}
                      isCurrentUser={currentUser?.id === item.follower.id}
                      isAuthenticated={!!currentUser}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
