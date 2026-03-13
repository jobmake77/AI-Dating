import { MapPin, Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

interface EventCardProps {
  event: {
    id: string
    title: string
    cover_url?: string | null
    location: string
    start_time: string
    end_time?: string | null
    participants_count: number
    type: 'official' | 'offline'
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {event.cover_url ? (
          <div className="relative w-full aspect-video bg-muted">
            <Image src={event.cover_url} alt={event.title} fill unoptimized sizes="480px" className="object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
        )}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 flex-1">{event.title}</h3>
            {event.type === 'official' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">官方</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{event.participants_count} 人参与</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
