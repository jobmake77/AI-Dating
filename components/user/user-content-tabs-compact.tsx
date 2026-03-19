'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Heart, MessageSquare } from 'lucide-react'
import { CompactContentCard } from '@/components/content/compact-content-card'
import { Pagination } from '@/components/content/pagination'
import { AgentTab } from '@/components/user/agent-tab'
import type { PaginatedContentItems } from '@/lib/types/content'
import { useTranslations } from 'use-intl'

type UserAgent = {
  id: string
  name: string
  api_key: string
  status: string
  last_used_at: string | null
  created_at: string
}

interface UserContentTabsCompactProps {
  username: string
  isOwner: boolean
  agents?: UserAgent[]
  contents: {
    published: PaginatedContentItems
    liked: PaginatedContentItems
    reposted: PaginatedContentItems
  }
}

const profileTabs = ['published', 'liked', 'reposted'] as const

export function UserContentTabsCompact({
  username,
  isOwner,
  agents = [],
  contents,
}: UserContentTabsCompactProps) {
  const t = useTranslations('userContentTabs')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'published'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    params.delete('page')
    router.push(`/u/${username}?${params.toString()}`)
  }

  const allTabs = isOwner ? [...profileTabs, 'agents'] : profileTabs

  return (
    <div className="space-y-4">
      {/* Compact tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
        {allTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              currentTab === tab
                ? 'gradient-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t(tab as 'published' | 'liked' | 'reposted' | 'agents')}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="space-y-1.5">
        {currentTab === 'published' && (
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

        {currentTab === 'liked' && (
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

        {currentTab === 'reposted' && (
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

        {currentTab === 'agents' && isOwner && <AgentTab initialAgents={agents} />}
      </div>
    </div>
  )
}
