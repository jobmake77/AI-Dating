'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import { AgentTab } from '@/components/user/agent-tab'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Heart, Repeat2, Bot } from 'lucide-react'
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

interface UserContentTabsProps {
  username: string
  isOwner: boolean
  agents?: UserAgent[]
  contents: {
    published: PaginatedContentItems
    liked: PaginatedContentItems
    reposted: PaginatedContentItems
  }
}

export function UserContentTabs({ username, isOwner, agents = [], contents }: UserContentTabsProps) {
  const t = useTranslations('userContentTabs')
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'published'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    params.delete('page') // 切换标签时重置页码
    router.push(`/u/${username}?${params.toString()}`)
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className={`grid w-full ${isOwner ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <TabsTrigger value="published" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{t('published')}</span>
        </TabsTrigger>
        <TabsTrigger value="liked" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>{t('liked')}</span>
        </TabsTrigger>
        <TabsTrigger value="reposted" className="flex items-center gap-2">
          <Repeat2 className="h-4 w-4" />
          <span>{t('reposted')}</span>
        </TabsTrigger>
        {isOwner && (
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>{t('agents')}</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="published" className="mt-6 space-y-6">
        {contents.published.items.length > 0 ? (
          <>
            <ContentList contents={contents.published.items} />
            {contents.published.totalPages > 1 && (
              <Pagination
                currentPage={contents.published.currentPage}
                totalPages={contents.published.totalPages}
                basePath={`/u/${username}?tab=published`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('emptyPublished')}</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="liked" className="mt-6 space-y-6">
        {contents.liked.items.length > 0 ? (
          <>
            <ContentList contents={contents.liked.items} />
            {contents.liked.totalPages > 1 && (
              <Pagination
                currentPage={contents.liked.currentPage}
                totalPages={contents.liked.totalPages}
                basePath={`/u/${username}?tab=liked`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('emptyLiked')}</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reposted" className="mt-6 space-y-6">
        {contents.reposted.items.length > 0 ? (
          <>
            <ContentList contents={contents.reposted.items} />
            {contents.reposted.totalPages > 1 && (
              <Pagination
                currentPage={contents.reposted.currentPage}
                totalPages={contents.reposted.totalPages}
                basePath={`/u/${username}?tab=reposted`}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Repeat2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('emptyReposted')}</p>
          </div>
        )}
      </TabsContent>

      {isOwner && (
        <TabsContent value="agents" className="mt-6">
          <AgentTab initialAgents={agents} />
        </TabsContent>
      )}
    </Tabs>
  )
}
