'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Bookmark, FileText, Heart, MessageSquare } from 'lucide-react'
import { CompactContentCard } from '@/components/content/compact-content-card'
import { Pagination } from '@/components/content/pagination'
import type { PaginatedContentItems } from '@/lib/types/content'
import { useTranslations } from 'use-intl'

interface UserContentTabsCompactProps {
  username: string
  isOwner?: boolean
  contents: {
    published: PaginatedContentItems
    liked: PaginatedContentItems
    reposted: PaginatedContentItems
    bookmarked: PaginatedContentItems
  }
}

const profileTabs = ['published', 'liked', 'reposted', 'bookmarked'] as const

export function UserContentTabsCompact({
  username,
  isOwner = false,
  contents,
}: UserContentTabsCompactProps) {
  const t = useTranslations('userContentTabs')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'published'
  const effectiveCurrentTab = currentTab === 'bookmarked' && !isOwner ? 'published' : currentTab
  const visibleTabs = isOwner ? profileTabs : profileTabs.filter((tab) => tab !== 'bookmarked')

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    params.delete('page')
    router.push(`/u/${username}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Compact tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              effectiveCurrentTab === tab
                ? 'gradient-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="space-y-1.5">
        {effectiveCurrentTab === 'published' && (
          <>
            {contents.published.items.length > 0 ? (
              <>
                {contents.published.items.map((content, i) => (
                  <CompactContentCard key={content.id} content={content} index={i} />
                ))}
                {contents.published.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={contents.published.currentPage}
                      totalPages={contents.published.totalPages}
                      basePath={`/u/${username}?tab=published`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
                <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t('emptyPublished')}</p>
              </div>
            )}
          </>
        )}

        {effectiveCurrentTab === 'liked' && (
          <>
            {contents.liked.items.length > 0 ? (
              <>
                {contents.liked.items.map((content, i) => (
                  <CompactContentCard key={content.id} content={content} index={i} />
                ))}
                {contents.liked.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={contents.liked.currentPage}
                      totalPages={contents.liked.totalPages}
                      basePath={`/u/${username}?tab=liked`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
                <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t('emptyLiked')}</p>
              </div>
            )}
          </>
        )}

        {effectiveCurrentTab === 'reposted' && (
          <>
            {contents.reposted.items.length > 0 ? (
              <>
                {contents.reposted.items.map((content, i) => (
                  <CompactContentCard key={content.id} content={content} index={i} />
                ))}
                {contents.reposted.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={contents.reposted.currentPage}
                      totalPages={contents.reposted.totalPages}
                      basePath={`/u/${username}?tab=reposted`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t('emptyReposted')}</p>
              </div>
            )}
          </>
        )}

        {effectiveCurrentTab === 'bookmarked' && (
          <>
            {contents.bookmarked.items.length > 0 ? (
              <>
                {contents.bookmarked.items.map((content, i) => (
                  <CompactContentCard key={content.id} content={content} index={i} />
                ))}
                {contents.bookmarked.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={contents.bookmarked.currentPage}
                      totalPages={contents.bookmarked.totalPages}
                      basePath={`/u/${username}?tab=bookmarked`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
                <Bookmark className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{t('emptyBookmarked')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
