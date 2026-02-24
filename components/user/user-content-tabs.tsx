'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Heart, Repeat2 } from 'lucide-react'

interface UserContentTabsProps {
  username: string
  contents: {
    published: {
      items: any[]
      currentPage: number
      totalPages: number
    }
    liked: {
      items: any[]
      currentPage: number
      totalPages: number
    }
    reposted: {
      items: any[]
      currentPage: number
      totalPages: number
    }
  }
}

export function UserContentTabs({ username, contents }: UserContentTabsProps) {
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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="published" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>内容</span>
        </TabsTrigger>
        <TabsTrigger value="liked" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>点赞</span>
        </TabsTrigger>
        <TabsTrigger value="reposted" className="flex items-center gap-2">
          <Repeat2 className="h-4 w-4" />
          <span>转发</span>
        </TabsTrigger>
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
            <p>还没有发布任何内容</p>
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
            <p>还没有点赞任何内容</p>
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
            <p>还没有转发任何内容</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
