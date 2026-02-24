'use client'

import { useState } from 'react'
import { setUserMembership, cancelUserMembership, updateUserRole } from '@/lib/actions/membership'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Crown, User, Shield, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface UserData {
  id: string
  username: string
  email: string | null
  avatar: string | null
  full_name: string | null
  role: string
  is_member: boolean
  member_expire_at: string | null
  created_at: string
}

interface UserManagementListProps {
  users: UserData[]
}

export function UserManagementList({ users }: UserManagementListProps) {
  const { toast } = useToast()
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [membershipDays, setMembershipDays] = useState('30')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSetMembership = async () => {
    if (!selectedUserId || !membershipDays) {
      toast({
        variant: 'destructive',
        title: '请输入会员天数',
      })
      return
    }

    const days = parseInt(membershipDays)
    if (isNaN(days) || days <= 0) {
      toast({
        variant: 'destructive',
        title: '请输入有效的天数',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await setUserMembership(selectedUserId, days)
      toast({
        title: '设置成功',
        description: `已设置 ${days} 天会员`,
      })
      setIsMemberDialogOpen(false)
      setMembershipDays('30')
      setSelectedUserId(null)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '设置失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelMembership = async (userId: string) => {
    if (!confirm('确定要取消该用户的会员吗？')) {
      return
    }

    try {
      await cancelUserMembership(userId)
      toast({
        title: '取消成功',
        description: '已取消会员',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '取消失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }

  const handleUpdateRole = async (userId: string, role: 'user' | 'creator' | 'admin') => {
    try {
      await updateUserRole(userId, role)
      toast({
        title: '更新成功',
        description: `角色已更新为 ${role}`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />管理员</Badge>
      case 'creator':
        return <Badge variant="secondary" className="text-xs">创作者</Badge>
      default:
        return <Badge variant="outline" className="text-xs">用户</Badge>
    }
  }

  return (
    <>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {/* 头像 */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{user.full_name || user.username}</span>
                    {getRoleBadge(user.role)}
                    {user.is_member && (
                      <Badge variant="default" className="text-xs bg-yellow-600">
                        <Crown className="w-3 h-3 mr-1" />
                        会员
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  {user.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      注册于 {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                    {user.is_member && user.member_expire_at && (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        到期于 {new Date(user.member_expire_at).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* 角色选择 */}
                <Select
                  value={user.role}
                  onValueChange={(value) => handleUpdateRole(user.id, value as any)}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">用户</SelectItem>
                    <SelectItem value="creator">创作者</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>

                {/* 会员管理 */}
                {user.is_member ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelMembership(user.id)}
                    className="text-xs"
                  >
                    取消会员
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setSelectedUserId(user.id)
                      setIsMemberDialogOpen(true)
                    }}
                    className="text-xs"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    设为会员
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 设置会员对话框 */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置会员</DialogTitle>
            <DialogDescription>
              为用户设置会员权限和有效期
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">会员天数</label>
            <Input
              type="number"
              placeholder="输入天数（如：30）"
              value={membershipDays}
              onChange={(e) => setMembershipDays(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              常用：30天（月度）、365天（年度）
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMemberDialogOpen(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              onClick={handleSetMembership}
              disabled={isSubmitting || !membershipDays}
            >
              {isSubmitting ? '设置中...' : '确认设置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
