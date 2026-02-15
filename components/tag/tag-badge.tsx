'use client'

import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { X } from 'lucide-react'

interface TagBadgeProps {
  tag: string
  href?: string
  onRemove?: () => void
  variant?: 'default' | 'secondary' | 'outline'
}

export function TagBadge({ tag, href, onRemove, variant = 'secondary' }: TagBadgeProps) {
  const content = (
    <Badge variant={variant} className="gap-1 text-xs">
      #{tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onRemove()
          }}
          className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors cursor-pointer"
          aria-label={`移除标签 ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity cursor-pointer">
        {content}
      </Link>
    )
  }

  return content
}
