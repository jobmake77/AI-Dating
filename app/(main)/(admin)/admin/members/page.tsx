import { getAllUsers, checkIsAdmin } from '@/lib/actions/admin'
import { redirect } from 'next/navigation'
import { MemberManagementTable } from '@/components/admin/member-management-table'

export default async function AdminMembersPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  const users = await getAllUsers()

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">会员管理</h1>
        <p className="text-muted-foreground mt-2">
          管理用户会员状态和权限
        </p>
      </div>

      <MemberManagementTable users={users} />
    </div>
  )
}
