'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { SearchResults } from '@/components/search/search-results'
import { searchAll } from '@/lib/actions/search'
import { Search, Loader2 } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ contents: any[]; users: any[] }>({
    contents: [],
    users: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ contents: [], users: [] })
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
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      debouncedSearch(query)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* 搜索框 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">搜索</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索内容、用户..."
              value={query}
              onChange={handleInputChange}
              className="pl-10 pr-4 h-12 text-base"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            )}
          </form>
        </div>

        {/* 搜索结果 */}
        <SearchResults
          contents={results.contents}
          users={results.users}
          query={query}
        />
      </div>
    </div>
  )
}
