import { getAllUsers, checkIsAdmin } from '@/lib/actions/admin'
import { redirect } from 'next/navigation'
import { MemberManagementTable } from '@/components/admin/member-management-table'
import { AlertCircle } from 'lucide-react'

export default async function AdminMembersPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')

  let users: any[] = []
  let fetchError: string | null = null
  try {
    users = await getAllUsers()
  } catch (e: any) {
    fetchError = e?.message ?? '加载失败'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">会员管理</h1>
        <p className="text-muted-foreground mt-1">管理用户会员状态和权限</p>
      </div>
      {fetchError ? (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{fetchError}</span>
        </div>
      ) : (
        <MemberManagementTable users={users} />
      )}
    </div>
  )
}
