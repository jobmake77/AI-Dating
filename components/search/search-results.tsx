'use client'

import { ContentCard } from '@/components/content/content-card-twitter'
import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { User, Search, SearchX } from 'lucide-react'
import type { SearchContent, SearchUser } from '@/lib/types/search'

interface SearchResultsProps {
  contents: SearchContent[]
  users: SearchUser[]
  query: string
}

export function SearchResults({ contents, users, query }: SearchResultsProps) {
  const hasResults = contents.length > 0 || users.length > 0

  if (!query) {
    return (
      <div className="py-20">
        <EmptyState
          icon={Search}
          title="输入关键词开始搜索"
          description="搜索内容、标签或用户"
        />
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="py-20">
        <EmptyState
          icon={SearchX}
          title="没有找到相关结果"
          description="试试其他关键词或检查拼写"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 用户搜索结果 */}
      {users.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">
            用户 <span className="text-muted-foreground text-sm ml-2">({users.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <Link key={user.id} href={`/u/${user.username}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || undefined} alt={user.full_name || user.username} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {user.full_name || user.username}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
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
        </div>
      )}

      {/* 内容搜索结果 */}
      {contents.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">
            内容 <span className="text-muted-foreground text-sm ml-2">({contents.length})</span>
          </h2>
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
