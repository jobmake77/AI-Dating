import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { CommunityPostCreateClient } from '@/components/community/community-post-create-client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CreatePostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: community } = await getCommunityBySlug(slug)
  if (!community) {
    redirect('/communities')
  }

  // 检查用户是否是社区成员
  const { data: membership } = await getUserMembershipStatus(community.id, user.id)
  if (!membership) {
    redirect(`/communities/${slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link href={`/communities/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回社区
        </Link>

        <CommunityPostCreateClient community={community} slug={slug} />
      </div>
    </div>
  )
}
