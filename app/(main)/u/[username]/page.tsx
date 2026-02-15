import { getUserByUsername } from '@/lib/actions/user'
import { getContents } from '@/lib/queries/content'
import { checkUserFollowing } from '@/lib/actions/follows'
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/components/user/user-profile'
import { UserContents } from '@/components/user/user-contents'
import { notFound } from 'next/navigation'

interface UserPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function UserPage({ params, searchParams }: UserPageProps) {
  const { username } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  try {
    const user = await getUserByUsername(username)

    // Check if current user is the profile owner
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 严格的权限检查：只有当前用户ID与页面用户ID完全匹配时才是所有者
    const isOwner = !!(currentUser && currentUser.id === user.id)

    // Check if current user is following this user
    let isFollowing = false
    if (currentUser && !isOwner) {
      isFollowing = await checkUserFollowing(user.id, currentUser.id)
    }

    // Get user's published contents
    const { contents, totalPages } = await getContents({
      page,
      authorId: user.id,
      status: 'approved',
    })

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-8">
          <UserProfile
            user={user}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
            isFollowing={isFollowing}
            isAuthenticated={!!currentUser}
          />
          <UserContents
            contents={contents}
            username={username}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
