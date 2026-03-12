"use client"

import { Button } from "@/components/ui/button"
import { Bell, BellOff, Hash } from "lucide-react"
import { useState } from "react"

interface TagHeaderProps {
  tagName: string
  postCount: number
}

export function TagHeader({ tagName, postCount }: TagHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="relative border-b border-border bg-gradient-to-b from-primary/10 via-primary/5 to-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Tag Icon */}
            <div className="rounded-xl bg-card border border-border p-3 shadow-card">
              <Hash className="h-8 w-8 text-primary" />
            </div>

            {/* Tag Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="text-primary">#</span>
                {tagName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {postCount} 篇内容使用了这个标签
              </p>
            </div>
          </div>

          {/* Follow Button */}
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsFollowing(!isFollowing)}
            className="shrink-0"
          >
            {isFollowing ? (
              <>
                <BellOff className="h-4 w-4 mr-1.5" />
                <span className="text-xs">已关注</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-1.5" />
                <span className="text-xs">关注</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}