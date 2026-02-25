'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="relative flex-shrink-0">
        <Icon className="h-5 w-5" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-background" />
        )}
      </div>
      <span className="flex-1">{children}</span>
    </Link>
  )
}
