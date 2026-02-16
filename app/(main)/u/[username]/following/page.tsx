import { getUserByUsername } from '@/lib/actions/user'
import { getFollowing } from '@/lib/actions/follows'
import { checkUserFollowing } from '@/lib/actions/follows'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FollowButton } from '@/components/user/follow-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface FollowingPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params

  try {
    const user = await getUserByUsername(username)
    const following = await getFollowing(user.id)

    // Get current user
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Check following status for each user
    const followingWithStatus = await Promise.all(
      following.map(async (item: any) => {
        let isFollowing = false
        if (currentUser && currentUser.id !== item.following.id) {
          isFollowing = await checkUserFollowing(item.following.id, currentUser.id)
        }
        return { ...item, isFollowing }
      })
    )

    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>@{username} 的关注</CardTitle>
          </CardHeader>
          <CardContent>
            {followingWithStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                还没有关注任何人
              </p>
            ) : (
              <div className="space-y-4">
                {followingWithStatus.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Link href={`/u/${item.following.username}`} className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.following.avatar || undefined} />
                        <AvatarFallback>
                          {item.following.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.following.full_name || item.following.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{item.following.username}
                        </p>
                        {item.following.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {item.following.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                    <FollowButton
                      userId={item.following.id}
                      initialIsFollowing={item.isFollowing}
                      isCurrentUser={currentUser?.id === item.following.id}
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
