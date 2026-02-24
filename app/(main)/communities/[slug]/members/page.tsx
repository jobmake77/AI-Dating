import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getCommunityMembers, getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ArrowLeft, Shield, Crown } from 'lucide-react'
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
        <p className="text-muted-foreground">暂无成员</p>
      </div>
    )
  }

  const canManage = currentUserRole === 'admin'
  const canModerate = currentUserRole === 'admin' || currentUserRole === 'moderator'

  return (
    <div className="space-y-4">
      {members.map((member: any) => (
        <Card key={member.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={member.user.avatar_url || '/default-avatar.png'}
                alt={member.user.display_name || member.user.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${member.user.username}`}
                    className="font-medium hover:underline"
                  >
                    {member.user.display_name || member.user.username}
                  </Link>
                  {member.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  {member.role === 'moderator' && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {member.role === 'admin' && '管理员'}
                  {member.role === 'moderator' && '版主'}
                  {member.role === 'member' && '成员'}
                  {' · '}
                  加入于 {new Date(member.joined_at).toLocaleDateString('zh-CN')}
                </p>
                {member.user.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {member.user.bio}
                  </p>
                )}
              </div>
            </div>

            {canManage && member.role !== 'admin' && (
              <div className="flex items-center gap-2">
                <form action={handleUpdateRole.bind(null, communityId, member.id, 'admin')}>
                  <Button variant="outline" size="sm" type="submit">
                    设为管理员
                  </Button>
                </form>
                <form action={handleUpdateRole.bind(null, communityId, member.id, 'moderator')}>
                  <Button variant="outline" size="sm" type="submit">
                    设为版主
                  </Button>
                </form>
                <form action={handleRemoveMember.bind(null, communityId, member.id)}>
                  <Button variant="destructive" size="sm" type="submit">
                    移除
                  </Button>
                </form>
              </div>
            )}

            {canModerate && !canManage && member.role === 'member' && (
              <form action={handleRemoveMember.bind(null, communityId, member.id)}>
                <Button variant="destructive" size="sm" type="submit">
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
    <div className="container max-w-4xl py-8">
      <Link href={`/communities/${slug}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回社区
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{community.name} - 成员</h1>
        <p className="text-muted-foreground mt-1">
          共 {community.members_count} 名成员
        </p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <MembersList communityId={community.id} currentUserRole={currentUserRole} />
      </Suspense>
    </div>
  )
}
