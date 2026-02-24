'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface NavLinkProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  badge?: number
}

export function NavLink({ href, icon: Icon, children, badge }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg mx-2",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="destructive"
          className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
        >
          {badge > 99 ? '99+' : badge}
        </Badge>
      )}
    </Link>
  )
}
