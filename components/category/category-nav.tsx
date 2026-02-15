'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

export function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1.5">
      {Object.values(CATEGORIES).map((category) => {
        const isActive = pathname === `/category/${category.slug}`
        const Icon = category.icon

        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/80'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
