'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string | null
  location: string
  start_time: string
  end_time: string | null
  type: 'official' | 'offline'
  participants_count: number
}

interface ActivityCalendarProps {
  communityId?: string
}

export function ActivityCalendar({ communityId }: ActivityCalendarProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          month: selectedDate.getMonth().toString(),
          year: selectedDate.getFullYear().toString(),
        })

        if (communityId) {
          params.append('community_id', communityId)
        }

        const response = await fetch(`/api/events?${params}`)
        const data = await response.json()

        if (data.success) {
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('获取活动失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [communityId, selectedDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getEventsForDate = (date: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            活动日历
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              上月
            </Button>
            <span className="text-sm font-medium">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              下月
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : (
          <div className="space-y-4">
            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-2">
              {/* 星期标题 */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* 空白占位 */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* 日期 */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = i + 1
                const dayEvents = getEventsForDate(date)
                const hasEvents = dayEvents.length > 0
                const isToday =
                  date === new Date().getDate() &&
                  selectedDate.getMonth() === new Date().getMonth() &&
                  selectedDate.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={date}
                    className={`
                      relative p-2 text-center rounded-lg border
                      ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                      ${hasEvents ? 'cursor-pointer hover:bg-accent' : ''}
                    `}
                  >
                    <div className="text-sm font-medium">{date}</div>
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 活动列表 */}
            {events.length > 0 ? (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">本月活动</h3>
                {events.map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <Badge variant={event.type === 'official' ? 'default' : 'secondary'}>
                            {event.type === 'official' ? '官方' : '线下'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(event.start_time).toLocaleString('zh-CN', {
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.participants_count} 人参加
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                本月暂无活动
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
