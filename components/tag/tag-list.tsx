'use client'

import { TagBadge } from './tag-badge'

interface TagListProps {
  tags: string[]
  linkable?: boolean
}

export function TagList({ tags, linkable = true }: TagListProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          href={linkable ? `/tag/${encodeURIComponent(tag)}` : undefined}
        />
      ))}
    </div>
  )
}
