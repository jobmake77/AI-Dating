import { requireAdmin } from '@/lib/middleware/admin'
import Link from 'next/link'
import { FileText, Users, Shield, LayoutDashboard, BarChart3, Tags, CalendarDays, LockKeyhole, UsersRound } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '概览', icon: LayoutDashboard, exact: true },
  { href: '/admin/analytics', label: '数据看板', icon: BarChart3 },
  { href: '/admin/moderation', label: '内容审核', icon: FileText },
  { href: '/admin/contents', label: '内容管理', icon: Shield },
  { href: '/admin/categories', label: '分类管理', icon: Tags },
  { href: '/admin/tags', label: '标签管理', icon: Tags },
  { href: '/admin/communities', label: '社区管理', icon: UsersRound },
  { href: '/admin/events', label: '活动管理', icon: CalendarDays },
  { href: '/admin/privacy-requests', label: '隐私请求', icon: LockKeyhole },
  { href: '/admin/community-rules', label: '社区规则', icon: FileText },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* 左侧导航 */}
      <aside className="w-52 flex-shrink-0 border-r border-border bg-background sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">管理后台</p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
