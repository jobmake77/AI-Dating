"use client"

import { Button } from "@/components/ui/button"
import { Bell, BellOff, type LucideIcon } from "lucide-react"
import { useState } from "react"

interface CategoryHeaderProps {
  category: {
    name: string
    slug: string
    description: string
    icon: LucideIcon
    color: string
  }
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const IconComponent = category.icon

  // Color mapping for gradient backgrounds
  const colorGradients: Record<string, string> = {
    blue: "from-blue-500/20 via-blue-400/10 to-background",
    green: "from-green-500/20 via-green-400/10 to-background",
    purple: "from-purple-500/20 via-purple-400/10 to-background",
    orange: "from-orange-500/20 via-orange-400/10 to-background",
    red: "from-red-500/20 via-red-400/10 to-background",
  }

  const gradient = colorGradients[category.color] || colorGradients.blue

  return (
    <div className={`relative border-b border-border bg-gradient-to-b ${gradient}`}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Category Icon */}
            <div className="rounded-xl bg-card border border-border p-3 shadow-card">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>

            {/* Category Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {category.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {category.description}
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
