import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getCommunityMembers, getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Shield, Crown, Users } from 'lucide-react'
import { updateMemberRole, removeMember } from '@/lib/actions/communities'

async function handleUpdateRole(communityId: string, memberId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
  'use server'
  await updateMemberRole(communityId, memberId, role)
}

async function handleRemoveMember(communityId: string, memberId: string): Promise<void> {
  'use server'
  await removeMember(communityId, memberId)
}

async function MembersList({ communityId, currentUserRole }: { communityId: string; currentUserRole: string | null }) {
  const { data: members } = await getCommunityMembers(communityId, { limit: 100 })

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">暂无成员</p>
      </div>
    )
  }

  const canManage = currentUserRole === 'admin'
  const canModerate = currentUserRole === 'admin' || currentUserRole === 'moderator'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member: any) => (
        <Card key={member.id} className="p-4 hover:shadow-sm transition-shadow">
          <div className="flex flex-col items-center text-center">
            <img
              src={member.user.avatar_url || '/default-avatar.png'}
              alt={member.user.display_name || member.user.username}
              className="w-16 h-16 rounded-full mb-3"
            />
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/u/${member.user.username}`}
                className="font-medium text-sm hover:underline"
              >
                {member.user.display_name || member.user.username}
              </Link>
              {member.role === 'admin' && (
                <Crown className="w-3.5 h-3.5 text-yellow-500" />
              )}
              {member.role === 'moderator' && (
                <Shield className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {member.role === 'admin' && '管理员'}
              {member.role === 'moderator' && '版主'}
              {member.role === 'member' && '成员'}
            </p>
            {member.user.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {member.user.bio}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              加入于 {new Date(member.joined_at).toLocaleDateString('zh-CN')}
            </p>

            {canManage && member.role !== 'admin' && (
              <div className="flex flex-col gap-2 mt-3 w-full">
                <form action={handleUpdateRole.bind(null, communityId, member.id, 'moderator')}>
                  <Button variant="outline" size="sm" className="w-full text-xs" type="submit">
                    设为版主
                  </Button>
                </form>
                <form action={handleRemoveMember.bind(null, communityId, member.id)}>
                  <Button variant="destructive" size="sm" className="w-full text-xs" type="submit">
                    移除
                  </Button>
                </form>
              </div>
            )}

            {canModerate && !canManage && member.role === 'member' && (
              <form action={handleRemoveMember.bind(null, communityId, member.id)} className="mt-3 w-full">
                <Button variant="destructive" size="sm" className="w-full text-xs" type="submit">
                  移除
                </Button>
              </form>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { data: community } = await getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUserRole = null
  if (user) {
    const { data: membership } = await getUserMembershipStatus(community.id, user.id)
    currentUserRole = membership?.role || null

    // 私密社区需要是成员才能查看
    if (community.type === 'private' && !membership) {
      redirect(`/communities/${slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link
          href={`/communities/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回社区
        </Link>

        {/* Community Header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm mb-6">
          <div className="h-16 bg-gradient-to-r from-primary/20 via-accent/10 to-blue-500/20" />
          <div className="px-5 pb-5 -mt-6">
            <div className="flex items-end gap-3">
              {community.icon_url ? (
                <img
                  src={community.icon_url}
                  alt={community.name}
                  className="w-14 h-14 rounded-xl bg-card shadow-sm border border-border object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
              )}
              <div className="pb-1">
                <h1 className="text-lg font-bold text-foreground">{community.name} - 成员</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  共 {community.members_count} 名成员
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
          <MembersList communityId={community.id} currentUserRole={currentUserRole} />
        </Suspense>
      </div>
    </div>
  )
}
