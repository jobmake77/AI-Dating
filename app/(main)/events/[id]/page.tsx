import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEventById, getUserParticipation } from '@/lib/queries/events'
import { EventJoinButton } from '@/components/events/event-join-button'
import { EventShareButton } from '@/components/events/event-share-button'
import { MapPin, Clock, Users, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: event } = await getEventById(id)
  if (!event) return { title: '活动不存在' }

  return {
    title: `${event.title} - AI Dating`,
    description: event.description || `${event.location} · ${new Date(event.start_time).toLocaleDateString('zh-CN')}`,
    openGraph: {
      title: event.title,
      description: event.description || `${event.location} · ${new Date(event.start_time).toLocaleDateString('zh-CN')}`,
      images: event.cover_url ? [{ url: event.cover_url, width: 1200, height: 630 }] : [],
    },
  }
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const { data: event } = await getEventById(id)
  if (!event) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: participation } = user
    ? await getUserParticipation(event.id, user.id)
    : { data: null }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const shareUrl = `${siteUrl}/events/${event.id}`

  return (
    <div className="container max-w-3xl py-8">
      {event.cover_url && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
          <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {event.type === 'official' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">官方活动</span>
              )}
              {event.status === 'cancelled' && (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">已取消</span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-y">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{event.participants_count} 人参与</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{formatDateTime(event.start_time)}</span>
          </div>
          {event.end_time && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>结束：{formatDateTime(event.end_time)}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {event.status === 'active' && (
          <div className="flex gap-3 pt-2">
            <EventJoinButton
              eventId={event.id}
              initialJoined={!!participation}
              initialCount={event.participants_count}
              isAuthenticated={!!user}
            />
            <EventShareButton title={event.title} url={shareUrl} />
          </div>
        )}

        {event.creator && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            发起人：{(event.creator as any).full_name || (event.creator as any).username || '匿名'}
          </div>
        )}
      </div>
    </div>
  )
}
