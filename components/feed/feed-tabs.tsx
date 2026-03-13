"use client"

import { Flame, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const tabs = [
  { id: "new", label: "最新", icon: Clock, color: "text-info" },
  { id: "hot", label: "热门", icon: Flame, color: "text-warning" },
  { id: "top", label: "精华", icon: TrendingUp, color: "text-success" },
]

interface FeedTabsProps {
  activeTab?: string
  basePath: string
}

export function FeedTabs({ activeTab = "new", basePath }: FeedTabsProps) {
  const searchParams = useSearchParams()

  const createTabUrl = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    params.delete("page") // Reset to page 1 when changing tabs
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <Link
            key={tab.id}
            href={createTabUrl(tab.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "gradient-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <tab.icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : tab.color}`} />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
