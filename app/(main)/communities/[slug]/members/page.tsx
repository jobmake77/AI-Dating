import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getCommunityMembers, getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Shield, Crown, Users } from 'lucide-react'
import { updateMemberRole, removeMember } from '@/lib/actions/communities'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

async function handleUpdateRole(communityId: string, memberId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
  'use server'
  await updateMemberRole(communityId, memberId, role)
}

async function handleRemoveMember(communityId: string, memberId: string): Promise<void> {
  'use server'
  await removeMember(communityId, memberId)
}

async function MembersList({
  communityId,
  currentUserId,
  currentUserRole,
  creatorId,
}: {
  communityId: string
  currentUserId: string | null
  currentUserRole: string | null
  creatorId: string
}) {
  const locale = await getRequestLocale()
  const format = (key: string, fallback: string, values?: Record<string, string | number>) =>
    getTranslation(locale, `communityMembers.${key}`, fallback).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? `{${name}}`))
  const { data: members } = await getCommunityMembers(communityId, { limit: 100 })
  type CommunityMember = Awaited<ReturnType<typeof getCommunityMembers>>['data'][number]

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">{format('empty', '暂无成员')}</p>
      </div>
    )
  }

  const isCreator = currentUserId === creatorId
  const canManageRoles = isCreator || currentUserRole === 'admin' || currentUserRole === 'moderator'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member: CommunityMember) => {
        const isCreatorMember = member.user.id === creatorId
        const canEditRole =
          canManageRoles &&
          !isCreatorMember &&
          !(currentUserRole === 'moderator' && member.role === 'admin')
        const canRemoveMember =
          canManageRoles &&
          !isCreatorMember &&
          !(currentUserRole === 'moderator' && member.role === 'admin')

        return (
          <Card key={member.id} className="p-4 transition-shadow hover:shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Image
                src={member.user.avatar || '/default-avatar.png'}
                alt={member.user.full_name || member.user.username}
                width={64}
                height={64}
                unoptimized
                className="mb-3 h-16 w-16 rounded-full object-cover"
              />

              <div className="mb-1 flex items-center gap-2">
                <Link href={`/u/${member.user.username}`} className="text-sm font-medium hover:underline">
                  {member.user.full_name || member.user.username}
                </Link>
                {isCreatorMember ? (
                  <Shield className="h-3.5 w-3.5 text-primary" />
                ) : member.role === 'admin' ? (
                  <Crown className="h-3.5 w-3.5 text-yellow-500" />
                ) : member.role === 'moderator' ? (
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                ) : null}
              </div>

              <p className="mb-2 text-xs text-muted-foreground">
                {isCreatorMember && format('creatorModerator', '创建者 / 版主')}
                {!isCreatorMember && member.role === 'admin' && format('admin', '管理员')}
                {!isCreatorMember && member.role === 'moderator' && format('moderator', '版主')}
                {member.role === 'member' && format('member', '成员')}
              </p>

              {member.user.bio && (
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                  {member.user.bio}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {format('joinedAt', '加入于 {date}', {
                  date: new Date(member.joined_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN'),
                })}
              </p>

              {canEditRole && (
                <div className="mt-3 flex w-full flex-col gap-2">
                  {member.role !== 'admin' && (
                    <form action={handleUpdateRole.bind(null, communityId, member.id, 'admin')}>
                      <Button variant="outline" size="sm" className="w-full text-xs" type="submit">
                        {format('setAdmin', '设为管理员')}
                      </Button>
                    </form>
                  )}

                  {member.role !== 'moderator' && (
                    <form action={handleUpdateRole.bind(null, communityId, member.id, 'moderator')}>
                      <Button variant="outline" size="sm" className="w-full text-xs" type="submit">
                        {format('setModerator', '设为版主')}
                      </Button>
                    </form>
                  )}

                  {member.role !== 'member' && (
                    <form action={handleUpdateRole.bind(null, communityId, member.id, 'member')}>
                      <Button variant="outline" size="sm" className="w-full text-xs" type="submit">
                        {format('setMember', '设为成员')}
                      </Button>
                    </form>
                  )}

                  {canRemoveMember && (
                    <form action={handleRemoveMember.bind(null, communityId, member.id)}>
                      <Button variant="destructive" size="sm" className="w-full text-xs" type="submit">
                        {format('remove', '移除')}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getRequestLocale()
  const format = (key: string, fallback: string, values?: Record<string, string | number>) =>
    getTranslation(locale, `communityMembers.${key}`, fallback).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? `{${name}}`))
  const { data: community } = await getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentUserRole = null
  if (user) {
    const { data: membership } = await getUserMembershipStatus(community.id, user.id)
    currentUserRole = membership?.role || null

    if (community.type === 'private' && !membership) {
      redirect(`/communities/${slug}`)
    }
  }

  const isCreator = user?.id === community.creator_id
  const canManageMembers =
    isCreator || currentUserRole === 'admin' || currentUserRole === 'moderator'

  if (!canManageMembers) {
    redirect(`/communities/${slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link
          href={`/communities/${slug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {format('back', '返回社区')}
        </Link>

        <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="h-16 bg-gradient-to-r from-primary/20 via-accent/10 to-blue-500/20" />
          <div className="-mt-6 px-5 pb-5">
            <div className="flex items-end gap-3">
              {community.icon_url ? (
                <Image
                  src={community.icon_url}
                  alt={community.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="h-14 w-14 rounded-xl border border-border bg-card object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                  <Users className="h-7 w-7 text-primary" />
                </div>
              )}

              <div className="pb-1">
                <h1 className="text-lg font-bold text-foreground">{community.name} - {format('title', '成员')}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">{format('totalMembers', '共 {count} 名成员', { count: community.members_count })}</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="text-sm text-muted-foreground">{format('loading', '加载中...')}</div>}>
          <MembersList
            communityId={community.id}
            currentUserId={user?.id || null}
            currentUserRole={currentUserRole}
            creatorId={community.creator_id}
          />
        </Suspense>
      </div>
    </div>
  )
}
