import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const showPages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true
    if (page >= currentPage - 1 && page <= currentPage + 1) return true
    return false
  })

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Button variant="outline" asChild>
          <Link href={`${basePath}?page=${currentPage - 1}`}>上一页</Link>
        </Button>
      )}

      {showPages.map((page, index) => {
        const prevPage = showPages[index - 1]
        const showEllipsis = prevPage && page - prevPage > 1

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="text-muted-foreground">...</span>}
            <Button
              variant={page === currentPage ? 'default' : 'outline'}
              asChild={page !== currentPage}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={`${basePath}?page=${page}`}>{page}</Link>
              )}
            </Button>
          </div>
        )
      })}

      {currentPage < totalPages && (
        <Button variant="outline" asChild>
          <Link href={`${basePath}?page=${currentPage + 1}`}>下一页</Link>
        </Button>
      )}
    </div>
  )
}
