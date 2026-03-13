'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Community {
  id: string
  name: string
  slug: string
  icon_url?: string | null
}

interface CommunityNavItemProps {
  community: Community
  unreadCount?: number
}

export function CommunityNavItem({ community, unreadCount = 0 }: CommunityNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === `/communities/${community.slug}`

  return (
    <Link
      href={`/communities/${community.slug}`}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg mx-2",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {community.icon_url ? (
        <Image
          src={community.icon_url}
          alt={community.name}
          width={32}
          height={32}
          unoptimized
          className="w-8 h-8 rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold">
            {community.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="flex-1 truncate">{community.name}</span>
      {unreadCount > 0 && (
        <Badge
          variant="secondary"
          className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Link>
  )
}
