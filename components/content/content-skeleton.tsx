import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function ContentCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Author and time */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Title */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />

          {/* Excerpt */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ContentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  )
}
