'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  FileText,
  Crown,
  TrendingUp,
  Activity,
  DollarSign,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  fileText: FileText,
  crown: Crown,
  trendingUp: TrendingUp,
  activity: Activity,
  dollarSign: DollarSign,
}

interface StatCardProps {
  title: string
  value: string | number
  icon: keyof typeof iconMap
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  const Icon = iconMap[icon]

  return (
    <Card className={cn('hover:bg-accent/30 transition-colors', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs 上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
