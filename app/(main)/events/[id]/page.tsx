import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEventById, getUserParticipation } from '@/lib/queries/events'
import { EventJoinButton } from '@/components/events/event-join-button'
import { EventShareButton } from '@/components/events/event-share-button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { MapPin, Clock, Users, Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import { getEventSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: event } = await getEventById(id)
  if (!event) return { title: '活动不存在' }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const dateStr = new Date(event.start_time).toLocaleDateString('zh-CN')
  const ogImageUrl = `${baseUrl}/api/og?type=event&title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(dateStr)}&location=${encodeURIComponent(event.location)}&participants=${event.participants_count}`

  return {
    title: `${event.title} - AI Dating`,
    description: event.description || `${event.location} · ${dateStr}`,
    keywords: ['活动', 'AI', event.title, event.location],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: `${baseUrl}/events/${event.id}`,
      title: event.title,
      description: event.description || `${event.location} · ${dateStr}`,
      siteName: 'AI-Dating',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || `${event.location} · ${dateStr}`,
      images: [ogImageUrl],
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

  // Generate structured data
  const eventSchema = getEventSchema({
    name: event.title,
    description: event.description,
    startDate: event.start_time,
    endDate: event.end_time,
    location: event.location,
    image: event.cover_url,
    organizer: (event.creator as any)?.full_name || (event.creator as any)?.username || 'AI-Dating',
    attendeeCount: event.participants_count,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: '首页', url: '/' },
    { name: '活动', url: '/events' },
    { name: event.title, url: `/events/${event.id}` },
  ])

  return (
    <div className="container max-w-3xl py-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/events">活动</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
