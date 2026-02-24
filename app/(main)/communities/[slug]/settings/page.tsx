import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { CommunitySettingsForm } from '@/components/community/community-settings-form'
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
  if (!membership || membership.role !== 'admin') {
    redirect(`/communities/${slug}`)
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link href={`/communities/${slug}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回社区
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-6">社区设置</h1>

      <CommunitySettingsForm community={community} />
    </div>
  )
}
