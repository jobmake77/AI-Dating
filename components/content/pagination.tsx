'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useOptionalTranslation } from '@/components/i18n/locale-provider'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const t = useOptionalTranslation()
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const showPages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true
    if (page >= currentPage - 1 && page <= currentPage + 1) return true
    return false
  })

  // 智能构建分页链接，处理已包含查询参数的 basePath
  const buildPageUrl = (page: number) => {
    const separator = basePath.includes('?') ? '&' : '?'
    return `${basePath}${separator}page=${page}`
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      {currentPage > 1 && (
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href={buildPageUrl(currentPage - 1)}>{t('common.previous', 'Previous')}</Link>
        </Button>
      )}

      {showPages.map((page, index) => {
        const prevPage = showPages[index - 1]
        const showEllipsis = prevPage && page - prevPage > 1

        return (
          <div key={page} className="flex items-center gap-1.5">
            {showEllipsis && <span className="text-muted-foreground px-1">...</span>}
            <Button
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              asChild={page !== currentPage}
              className={page !== currentPage ? 'cursor-pointer' : 'cursor-default'}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={buildPageUrl(page)}>{page}</Link>
              )}
            </Button>
          </div>
        )
      })}

      {currentPage < totalPages && (
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href={buildPageUrl(currentPage + 1)}>{t('common.next', 'Next')}</Link>
        </Button>
      )}
    </div>
  )
}
