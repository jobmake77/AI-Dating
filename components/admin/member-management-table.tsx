'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateUserMembership, updateUserRole } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface User {
  id: string
  username: string
  full_name: string | null
  email: string | null
  membership_tier: string
  member_expire_at: string | null
  role: string
  created_at: string
}

interface MemberManagementTableProps {
  users: User[]
}

export function MemberManagementTable({ users }: MemberManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [membershipTier, setMembershipTier] = useState<'free' | 'premium'>('free')
  const [expireDate, setExpireDate] = useState('')
  const [role, setRole] = useState<'user' | 'creator' | 'admin'>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleUpdateMembership = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await updateUserMembership(
        selectedUser.id,
        membershipTier,
        membershipTier === 'premium' ? expireDate : undefined
      )
      toast.success('会员状态已更新')
      router.refresh()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update membership:', error)
      toast.error('更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await updateUserRole(selectedUser.id, role)
      toast.success('角色已更新')
      router.refresh()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openMembershipDialog = (user: User) => {
    setSelectedUser(user)
    setMembershipTier(user.membership_tier as 'free' | 'premium')
    if (user.member_expire_at) {
      setExpireDate(new Date(user.member_expire_at).toISOString().split('T')[0])
    } else {
      // Default to 1 year from now
      const oneYearLater = new Date()
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
      setExpireDate(oneYearLater.toISOString().split('T')[0])
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setRole(user.role as 'user' | 'creator' | 'admin')
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>会员状态</TableHead>
              <TableHead>到期时间</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || user.username}
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.membership_tier === 'premium' ? 'default' : 'secondary'}>
                    {user.membership_tier === 'premium' ? '会员' : '免费'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.member_expire_at ? (
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(user.member_expire_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.role === 'admin' ? '管理员' : user.role === 'creator' ? '创作者' : '用户'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMembershipDialog(user)}
                        >
                          会员
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>管理会员状态</DialogTitle>
                          <DialogDescription>
                            为 @{user.username} 设置会员状态
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>会员类型</Label>
                            <Select
                              value={membershipTier}
                              onValueChange={(value) => setMembershipTier(value as 'free' | 'premium')}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">免费</SelectItem>
                                <SelectItem value="premium">会员</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {membershipTier === 'premium' && (
                            <div className="space-y-2">
                              <Label>到期日期</Label>
                              <Input
                                type="date"
                                value={expireDate}
                                onChange={(e) => setExpireDate(e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleUpdateMembership}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? '保存中...' : '保存'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                        >
                          角色
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>管理用户角色</DialogTitle>
                          <DialogDescription>
                            为 @{user.username} 设置角色
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>角色</Label>
                            <Select
                              value={role}
                              onValueChange={(value) => setRole(value as 'user' | 'creator' | 'admin')}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">用户</SelectItem>
                                <SelectItem value="creator">创作者</SelectItem>
                                <SelectItem value="admin">管理员</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleUpdateRole}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? '保存中...' : '保存'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
