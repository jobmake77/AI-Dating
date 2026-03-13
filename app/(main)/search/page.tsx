'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { getPopularSearchTags, searchAll } from '@/lib/actions/search'
import { Search, X, Hash, Users } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { ContentCard } from '@/components/content/content-card-twitter'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import type { SearchResult, SearchTag } from '@/lib/types/search'

const searchTabs = ['内容', '用户', '标签'] as const
type SearchTab = typeof searchTabs[number]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<SearchTab>('内容')
  const [results, setResults] = useState<SearchResult>({
    contents: [],
    users: [],
    tags: [],
    total: 0,
  })
  const [popularTags, setPopularTags] = useState<SearchTag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ contents: [], users: [], tags: [], total: 0 })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await searchAll(searchQuery)
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, 500)

  // 初始搜索
  useEffect(() => {
    if (initialQuery) {
      debouncedSearch(initialQuery)
    }
  }, [initialQuery, debouncedSearch])

  useEffect(() => {
    let mounted = true

    const loadPopularTags = async () => {
      try {
        const tags = await getPopularSearchTags()
        if (mounted) {
          setPopularTags(tags)
        }
      } catch (error) {
        console.error('Failed to load popular tags:', error)
      }
    }

    loadPopularTags()

    return () => {
      mounted = false
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`)
    }
    debouncedSearch(value)
  }

  const handleClearQuery = () => {
    setQuery('')
    setResults({ contents: [], users: [], tags: [], total: 0 })
    router.push('/search')
  }

  const handleHotSearchClick = (term: string) => {
    setQuery(term)
    router.push(`/search?q=${encodeURIComponent(term)}`)
    debouncedSearch(term)
  }

  // 根据当前标签过滤结果
  const filteredContents = activeTab === '内容' ? results.contents : []
  const filteredUsers = activeTab === '用户' ? results.users : []
  const filteredTags = activeTab === '标签' ? results.tags : []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* 搜索框 */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索内容、用户、标签..."
            value={query}
            onChange={handleInputChange}
            className="h-12 pl-12 pr-10 text-sm bg-card border-border shadow-sm focus:ring-2 focus:ring-primary/20 rounded-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 有搜索词时显示标签和结果 */}
        {query && (
          <>
            {/* 筛选标签 */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 mb-5 shadow-sm">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 搜索结果 */}
            {isLoading ? (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-sm">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground">搜索中...</p>
              </div>
            ) : (
              <>
                {/* 内容标签 */}
                {activeTab === '内容' && (
                  <div className="space-y-2">
                    {filteredContents.length > 0 ? (
                      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                        {filteredContents.map((content) => (
                          <ContentCard key={content.id} content={content} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-10 text-center shadow-sm">
                        <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">未找到相关内容</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 用户标签 */}
                {activeTab === '用户' && (
                  <div>
                    {filteredUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredUsers.map((user) => (
                          <Link key={user.id} href={`/u/${user.username}`}>
                            <Card className="hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar || undefined} alt={user.full_name || user.username} />
                                    <AvatarFallback>
                                      <Users className="w-5 h-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold truncate text-sm">
                                        {user.full_name || user.username}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    {user.bio && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {user.bio}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-10 text-center shadow-sm">
                        <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">未找到相关用户</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 标签标签 */}
                {activeTab === '标签' && (
                  <div>
                    {filteredTags.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredTags.map((tag) => (
                          <button
                            key={tag.slug}
                            onClick={() => handleHotSearchClick(tag.name)}
                            className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all flex items-center gap-2 text-left"
                          >
                            <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground">{tag.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-auto">{tag.count}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-10 text-center shadow-sm">
                        <Hash className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">未找到相关标签</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 无搜索词时显示真实热门标签 */}
        {!query && (
          <div className="space-y-5">
            {/* 热门标签 */}
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3">热门标签</h2>
              <div className="grid grid-cols-2 gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => handleHotSearchClick(tag.name)}
                    className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all flex items-center gap-2 text-left"
                  >
                    <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{tag.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
