'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Shield, UserX, Ban, CheckCircle } from 'lucide-react'
import { kickMember, banMember, unbanMember } from '@/lib/actions/community-moderation'
import { updateMemberRole } from '@/lib/actions/communities'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  user: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
  }
  ban: {
    reason: string | null
    banned_until: string | null
  } | null
}

interface MemberManagementTableProps {
  members: Member[]
  communityId: string
  currentUserRole: 'admin' | 'moderator' | 'member'
  pagination: {
    page: number
    totalPages: number
    total: number
  }
}

export function MemberManagementTable({
  members,
  communityId,
  currentUserRole,
  pagination
}: MemberManagementTableProps) {
  const router = useRouter()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [actionType, setActionType] = useState<'kick' | 'ban' | 'unban' | 'role' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!selectedMember) return

    setLoading(true)
    try {
      let result

      switch (actionType) {
        case 'kick':
          result = await kickMember(communityId, selectedMember.id)
          break
        case 'ban':
          result = await banMember(communityId, selectedMember.user_id)
          break
        case 'unban':
          result = await unbanMember(communityId, selectedMember.user_id)
          break
        default:
          return
      }

      if (result.success) {
        toast.success('操作成功')
        router.refresh()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
      setSelectedMember(null)
      setActionType(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    setLoading(true)
    try {
      const result = await updateMemberRole(communityId, memberId, newRole)
      if (result.success) {
        toast.success('角色更新成功')
        router.refresh()
      } else {
        toast.error(result.error || '角色更新失败')
      }
    } catch (error) {
      toast.error('角色更新失败')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">管理员</Badge>
      case 'moderator':
        return <Badge variant="secondary">版主</Badge>
      default:
        return <Badge variant="outline">成员</Badge>
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* 表格 */}
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">成员</th>
                <th className="p-4 text-left font-medium">角色</th>
                <th className="p-4 text-left font-medium">状态</th>
                <th className="p-4 text-left font-medium">加入时间</th>
                <th className="p-4 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="p-4">
                    <Link
                      href={`/u/${member.user.username}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.avatar || undefined} />
                        <AvatarFallback>
                          {member.user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.user.full_name || member.user.username}</div>
                        <div className="text-sm text-muted-foreground">@{member.user.username}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">{getRoleBadge(member.role)}</td>
                  <td className="p-4">
                    {member.ban ? (
                      <Badge variant="destructive">已禁言</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">正常</Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(member.joined_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="p-4 text-right">
                    {currentUserRole === 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== 'admin' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'admin')}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                设为管理员
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'moderator')}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                设为版主
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'member')}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                设为普通成员
                              </DropdownMenuItem>
                            </>
                          )}
                          {member.ban ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member)
                                setActionType('unban')
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              解除禁言
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member)
                                setActionType('ban')
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              禁言
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member)
                              setActionType('kick')
                            }}
                            className="text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            踢出社区
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {pagination.total} 个成员
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => router.push(`?page=${pagination.page - 1}`)}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => router.push(`?page=${pagination.page + 1}`)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 确认对话框 */}
      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'kick' && '确认踢出成员'}
              {actionType === 'ban' && '确认禁言成员'}
              {actionType === 'unban' && '确认解除禁言'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'kick' && `确定要将 @${selectedMember?.user.username} 踢出社区吗？此操作不可撤销。`}
              {actionType === 'ban' && `确定要禁言 @${selectedMember?.user.username} 吗？被禁言的成员将无法发帖和评论。`}
              {actionType === 'unban' && `确定要解除 @${selectedMember?.user.username} 的禁言吗？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={loading}>
              {loading ? '处理中...' : '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
