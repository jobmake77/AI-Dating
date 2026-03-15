import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { CommunitySettingsClient } from '@/components/community/community-settings-client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SettingsPage({
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
    notFound()
  }

  // 检查用户是否是管理员
  const { data: membership } = await getUserMembershipStatus(community.id, user.id)
  const isCreator = community.creator_id === user.id

  if (!membership || (!isCreator && membership.role !== 'admin')) {
    redirect(`/communities/${slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link href={`/communities/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回社区
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-5">社区设置</h1>

        <CommunitySettingsClient community={community} slug={slug} />
      </div>
    </div>
  )
}
