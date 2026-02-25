'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  date: string
  users: number
  contents: number
}

interface GrowthChartProps {
  data: DataPoint[]
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorContents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(value) => value === 'users' ? '新增用户' : '新增内容'}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorUsers)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="contents"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorContents)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
