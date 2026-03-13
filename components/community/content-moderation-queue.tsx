'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Flag, Check, X, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Post {
  id: string
  title: string | null
  content: string
  created_at: string
  author: {
    id: string
    username: string
    avatar: string | null
  }
  reports_count?: number
}

interface ContentModerationQueueProps {
  communityId: string
  posts: Post[]
}

export function ContentModerationQueue({ communityId, posts }: ContentModerationQueueProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (postId: string) => {
    setLoading(postId)
    try {
      // TODO: 实现审核通过逻辑
      toast.success('帖子已通过审核')
    } catch {
      toast.error('操作失败')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (postId: string) => {
    setLoading(postId)
    try {
      // TODO: 实现审核拒绝逻辑
      toast.success('帖子已被拒绝')
    } catch {
      toast.error('操作失败')
    } finally {
      setLoading(null)
    }
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            内容审核队列
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无需要审核的内容
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          内容审核队列
          <Badge variant="destructive">{posts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>
                  {post.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/u/${post.author.username}`}
                    className="font-medium hover:underline"
                  >
                    @{post.author.username}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleString('zh-CN')}
                  </span>
                  {post.reports_count && post.reports_count > 0 && (
                    <Badge variant="destructive">
                      {post.reports_count} 个举报
                    </Badge>
                  )}
                </div>

                {post.title && (
                  <h4 className="font-medium mb-1">{post.title}</h4>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/communities/${communityId}/posts/${post.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(post.id)}
                  disabled={loading === post.id}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(post.id)}
                  disabled={loading === post.id}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
