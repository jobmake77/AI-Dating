'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole } from '@/lib/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Shield, Calendar } from 'lucide-react'
import { formatISODate } from '@/lib/utils/date'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface UserData {
  id: string
  username: string
  email: string | null
  avatar: string | null
  full_name: string | null
  role: string
  created_at: string
}

interface UserManagementListProps {
  users: UserData[]
}

export function UserManagementList({ users }: UserManagementListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const roleLabels: Record<'user' | 'admin', string> = {
    user: '用户',
    admin: '管理员',
  }

  const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      setUpdatingUserId(userId)
      await updateUserRole(userId, role)
      toast({
        title: '更新成功',
        description: `角色已更新为 ${roleLabels[role]}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />管理员</Badge>
      default:
        return <Badge variant="outline" className="text-xs">用户</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{user.full_name || user.username}</span>
                  {getRoleBadge(user.role)}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.email && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    注册于 <time dateTime={user.created_at}>{formatISODate(user.created_at)}</time>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Select
                value={user.role}
                onValueChange={(value) => handleUpdateRole(user.id, value as 'user' | 'admin')}
                disabled={updatingUserId === user.id}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
