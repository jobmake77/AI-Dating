'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchAll } from '@/lib/actions/search'
import { getPopularTags } from '@/lib/actions/tags'
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

interface MobileSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SEARCH_HISTORY_KEY = 'ai-dating-search-history'
const MAX_HISTORY_ITEMS = 10

export function MobileSearchModal({ open, onOpenChange }: MobileSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ contents: any[]; users: any[] }>({
    contents: [],
    users: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [popularTags, setPopularTags] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  // 加载搜索历史
  useEffect(() => {
    if (open) {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (history) {
        try {
          setSearchHistory(JSON.parse(history))
        } catch (e) {
          setSearchHistory([])
        }
      }
    }
  }, [open])

  // 加载热门标签
  useEffect(() => {
    if (open) {
      getPopularTags(10).then(setPopularTags)
    }
  }, [open])

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ contents: [], users: [] })
      setIsLoading(false)
      setShowResults(false)
      return
    }

    setIsLoading(true)
    setShowResults(true)
    try {
      const data = await searchAll(searchQuery)
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, 500)

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // 保存搜索历史
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery)
    ].slice(0, MAX_HISTORY_ITEMS)

    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  }, [searchHistory])

  // 执行搜索
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setQuery(searchQuery)
    debouncedSearch(searchQuery)
    saveToHistory(searchQuery)
  }

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  // 关闭模态框时重置状态
  const handleClose = () => {
    setQuery('')
    setResults({ contents: [], users: [] })
    setShowResults(false)
    onOpenChange(false)
  }

  const hasResults = results.contents.length > 0 || results.users.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 max-w-full h-full m-0 rounded-none border-0">
        <div className="flex flex-col h-full">
          {/* 搜索头部 */}
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索内容、用户..."
                value={query}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 text-base"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 搜索内容区 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {!showResults ? (
                <>
                  {/* 搜索历史 */}
                  {searchHistory.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          搜索历史
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-xs h-7"
                        >
                          清除
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(item)}
                            className="text-sm"
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 热门标签 */}
                  {popularTags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        热门标签
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <Button
                            key={tag.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(tag.name)}
                            className="text-sm"
                          >
                            #{tag.name}
                            {tag.usage_count > 0 && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                {tag.usage_count}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 搜索结果 */}
                  {!isLoading && !hasResults && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">没有找到相关结果</p>
                      <p className="text-sm text-muted-foreground mt-1">试试其他关键词</p>
                    </div>
                  )}

                  {/* 用户结果 */}
                  {results.users.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-3">
                        用户 ({results.users.length})
                      </h3>
                      <div className="space-y-2">
                        {results.users.map((user: any) => (
                          <Link
                            key={user.id}
                            href={`/u/${user.username}`}
                            onClick={handleClose}
                          >
                            <Card className="hover:border-primary transition-colors">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-sm truncate">
                                        {user.full_name || user.username}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 内容结果 */}
                  {results.contents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        内容 ({results.contents.length})
                      </h3>
                      <div className="space-y-2">
                        {results.contents.map((content: any) => (
                          <Link
                            key={content.id}
                            href={`/post/${content.id}`}
                            onClick={handleClose}
                          >
                            <Card className="hover:border-primary transition-colors">
                              <CardContent className="p-3">
                                <p className="font-semibold text-sm line-clamp-2 mb-1">
                                  {content.title}
                                </p>
                                {content.excerpt && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {content.excerpt}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={content.users?.avatar || undefined} />
                                    <AvatarFallback>{content.users?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span>{content.users?.username}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
