import { getUserByUsername } from '@/lib/actions/user'
import { getContents } from '@/lib/queries/content'
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
    const isOwner = currentUser?.id === user.id

    // Get user's published contents
    const { contents, totalPages } = await getContents({
      page,
      authorId: user.id,
      status: 'approved',
    })

    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <UserProfile user={user} isOwner={isOwner} />
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
