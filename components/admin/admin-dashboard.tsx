"use client"

import { useState } from "react"
import { Users, FileText, Shield, BarChart3, AlertTriangle, Check, X, TrendingUp, Eye, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const adminTabs = [
  { id: "overview", label: "概览", icon: BarChart3, color: "text-primary" },
  { id: "users", label: "用户管理", icon: Users, color: "text-info" },
  { id: "content", label: "内容审核", icon: FileText, color: "text-warning" },
  { id: "reports", label: "举报", icon: AlertTriangle, color: "text-destructive" },
] as const

const severityColors: Record<string, string> = {
  low: "bg-info/10 text-info",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
}

interface AdminDashboardProps {
  stats: Array<{
    label: string
    value: number
    change?: string
    gradient: string
  }>
  chartData: Array<{ date: string; users: number; contents: number }>
  pendingContent: Array<{
    id: string
    title: string
    author: string
    time: string
    reason: string
    severity: string
  }>
}

export function AdminDashboard({ stats, chartData, pendingContent }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview")

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-primary">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">管理后台</h1>
          <p className="text-xs text-muted-foreground">管理社区内容和用户</p>
        </div>
      </div>

      <div className="flex gap-5">
        <nav className="w-48 shrink-0 hidden md:block">
          <div className="space-y-1">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : tab.color}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-card overflow-hidden shadow-card"
                  >
                    <div className={`h-1 ${stat.gradient}`} />
                    <div className="p-4">
                      <p className="text-[10px] text-muted-foreground font-medium mb-2">{stat.label}</p>
                      <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                      {stat.change && (
                        <p className="text-[10px] text-success font-mono font-medium mt-0.5">↑ {stat.change}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h3 className="text-xs font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  近 30 天增长
                </h3>
                <div className="h-44 flex items-end gap-1">
                  {chartData.map((day, i) => {
                    const total = day.users + day.contents
                    const maxValue = Math.max(...chartData.map(d => d.users + d.contents))
                    const height = maxValue > 0 ? (total / maxValue) * 100 : 20
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${height}%`,
                          background: `linear-gradient(180deg, hsl(221 83% 53% / 0.7), hsl(262 83% 58% / 0.3))`,
                        }}
                        title={`${day.date}: ${total} 项`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  待审核内容
                  <span className="rounded-full bg-warning/10 text-warning px-2 py-0.5 text-[10px] font-mono">{pendingContent.length}</span>
                </h3>
              </div>
              {pendingContent.length > 0 ? (
                <div className="divide-y divide-border">
                  {pendingContent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="text-primary font-medium">{item.author}</span>
                          <span>·</span>
                          <span>{item.time}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${severityColors[item.severity]}`}>
                            {item.reason}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="icon" className="h-8 w-8 rounded-full bg-success/10 text-success hover:bg-success/20 border-0">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="h-10 w-10 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs text-muted-foreground">暂无待审核内容</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === "users" || activeTab === "reports") && (
            <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
              <div className="h-10 w-10 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                {activeTab === "users" ? <Users className="h-5 w-5 text-muted-foreground/30" /> : <AlertTriangle className="h-5 w-5 text-muted-foreground/30" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeTab === "users" ? "用户管理功能开发中" : "举报管理功能开发中"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
