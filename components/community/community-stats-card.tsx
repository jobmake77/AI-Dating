'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react'

interface CommunityStats {
  totalMembers: number
  totalPosts: number
  recentPosts: number
  recentMembers: number
  activeMembers: number
  createdAt: string
}

interface CommunityStatsCardProps {
  stats: CommunityStats
}

export function CommunityStatsCard({ stats }: CommunityStatsCardProps) {
  const statItems = [
    {
      label: '总成员数',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: '总帖子数',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-green-600'
    },
    {
      label: '最近7天新帖',
      value: stats.recentPosts,
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: '最近7天新成员',
      value: stats.recentMembers,
      icon: Users,
      color: 'text-orange-600'
    },
    {
      label: '活跃成员',
      value: stats.activeMembers,
      icon: TrendingUp,
      color: 'text-pink-600'
    },
    {
      label: '创建时间',
      value: new Date(stats.createdAt).toLocaleDateString('zh-CN'),
      icon: Calendar,
      color: 'text-gray-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.label}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
