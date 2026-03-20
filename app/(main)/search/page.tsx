'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useTranslations } from 'use-intl'
import { AIDatingTypewriter } from '@/components/brand/ai-dating-typewriter'

type SearchTab = 'contents' | 'users' | 'tags'

export default function SearchPage() {
  const t = useTranslations('searchPage')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<SearchTab>('contents')
  const [results, setResults] = useState<SearchResult>({
    contents: [],
    users: [],
    tags: [],
    total: 0,
  })
  const [popularTags, setPopularTags] = useState<SearchTag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const easterEggRefreshKeyRef = useRef<string | null>(null)

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query])
  const isAIDatingQuery = normalizedQuery === 'ai-dating'

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
    const normalizedInitialQuery = initialQuery.trim().toLowerCase()

    if (normalizedInitialQuery !== 'ai-dating') {
      return
    }

    if (easterEggRefreshKeyRef.current === initialQuery) {
      return
    }

    easterEggRefreshKeyRef.current = initialQuery
    router.refresh()
  }, [initialQuery, router])

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
      if (value.trim().toLowerCase() === 'ai-dating') {
        easterEggRefreshKeyRef.current = value
        router.refresh()
      }
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
  const filteredContents = activeTab === 'contents' ? results.contents : []
  const filteredUsers = activeTab === 'users' ? results.users : []
  const filteredTags = activeTab === 'tags' ? results.tags : []
  const searchTabs: Array<{ key: SearchTab; label: string }> = [
    { key: 'contents', label: t('tabContents') },
    { key: 'users', label: t('tabUsers') },
    { key: 'tags', label: t('tabTags') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {isAIDatingQuery && (
          <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent px-4 py-3 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/70">
              AI-Dating
            </div>
            <AIDatingTypewriter
              key={initialQuery}
              className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
              cursorClassName="text-primary"
              typingSpeed={105}
              startDelayMs={160}
            />
          </div>
        )}

        {/* 搜索框 */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('placeholder')}
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
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 搜索结果 */}
            {isLoading ? (
              <div className="rounded-lg border border-border bg-card p-10 text-center shadow-sm">
                <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-muted-foreground">{t('loading')}</p>
              </div>
            ) : (
              <>
                {/* 内容标签 */}
                {activeTab === 'contents' && (
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
                        <p className="text-xs text-muted-foreground">{t('emptyContents')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 用户标签 */}
                {activeTab === 'users' && (
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
                        <p className="text-xs text-muted-foreground">{t('emptyUsers')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 标签标签 */}
                {activeTab === 'tags' && (
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
                        <p className="text-xs text-muted-foreground">{t('emptyTags')}</p>
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
              <h2 className="text-sm font-bold text-foreground mb-3">{t('popularTags')}</h2>
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
