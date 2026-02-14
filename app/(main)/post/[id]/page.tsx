import { getContentById } from '@/lib/queries/content'
import { createClient } from '@/lib/supabase/server'
import { incrementViewCount } from '@/lib/actions/content'
import { ContentDetail } from '@/components/content/content-detail'
import { AuthorCard } from '@/components/content/author-card'
import { notFound } from 'next/navigation'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params

  try {
    const content = await getContentById(id)

    // Check authentication and membership status
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isMember = false
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('membership_tier')
        .eq('id', user.id)
        .single()

      isMember = profile?.membership_tier === 'premium'
    }

    // Increment view count asynchronously (don't await)
    incrementViewCount(id).catch(console.error)

    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <ContentDetail
              content={content}
              isAuthenticated={!!user}
              isMember={isMember}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <AuthorCard author={content.users} />
          </aside>

          {/* Right Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
