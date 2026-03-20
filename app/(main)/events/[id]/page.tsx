import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEventById, getUserParticipation } from '@/lib/queries/events'
import { EventJoinButton } from '@/components/events/event-join-button'
import { EventShareButton } from '@/components/events/event-share-button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { MapPin, Clock, Users, Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import { getEventSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'
import Image from 'next/image'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'
import { hasEventEnded } from '@/lib/utils/events'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: event } = await getEventById(id)
  if (!event) {
    notFound()
  }

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

function formatDateTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN', {
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
  const locale = await getRequestLocale()
  const format = (key: string, fallback: string, values?: Record<string, string | number>) =>
    getTranslation(locale, `eventDetail.${key}`, fallback).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? `{${name}}`))
  const { data: event } = await getEventById(id)
  if (!event) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: participation } = user
    ? await getUserParticipation(event.id, user.id)
    : { data: null }
  const isEventEnded = hasEventEnded(event.start_time, event.end_time)
  const isEventClosed = event.status !== 'active' || isEventEnded

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const shareUrl = `${siteUrl}/events/${event.id}`
  const organizerName = event.creator?.full_name || event.creator?.username || 'AI-Dating'

  // Generate structured data
  const eventSchema = getEventSchema({
    name: event.title,
    description: event.description,
    startDate: event.start_time,
    endDate: event.end_time,
    location: event.location,
    image: event.cover_url,
    organizer: organizerName,
    attendeeCount: event.participants_count,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: format('home', '首页'), url: '/' },
    { name: format('events', '活动'), url: '/events' },
    { name: event.title, url: `/events/${event.id}` },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="relative h-44 sm:h-52">
            {event.cover_url ? (
              <Image
                src={event.cover_url}
                alt={event.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 gradient-sunset opacity-90" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                {event.type === 'official' && (
                  <span className="rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-medium text-white shadow-primary">
                    {format('official', '官方')}
                  </span>
                )}
                {event.status === 'cancelled' && (
                  <span className="rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-medium text-white">
                    {format('cancelled', '已取消')}
                  </span>
                )}
                {event.status === 'active' && isEventEnded && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium text-white">
                    {format('ended', '已结束')}
                  </span>
                )}
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white sm:text-[28px]">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {format('participants', '{count} 人参与', { count: event.participants_count })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* Breadcrumb */}
        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-xs">{format('home', '首页')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/events" className="text-xs">{format('events', '活动')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">{event.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Event Details Card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card mb-4">
          <div className="h-1 gradient-primary" />
          <div className="p-5">
            <h2 className="text-sm font-semibold mb-3">{format('details', '活动详情')}</h2>

            {/* Time & Location Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-primary/5 rounded-full px-2.5 py-1.5">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span>{formatDateTime(event.start_time, locale)}</span>
                </div>
              </div>
              {event.end_time && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-info/5 rounded-full px-2.5 py-1.5">
                    <Clock className="h-3 w-3 text-info" />
                    <span>{format('endsAt', '结束：{date}', { date: formatDateTime(event.end_time, locale) })}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-warning/5 rounded-full px-2.5 py-1.5">
                  <MapPin className="h-3 w-3 text-warning" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-success/5 rounded-full px-2.5 py-1.5">
                  <Users className="h-3 w-3 text-success" />
                  <span className="font-mono">{format('participants', '{count} 人参与', { count: event.participants_count })}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Organizer */}
            {event.creator && (
              <div className="text-xs text-muted-foreground pt-3 border-t">
                {format('organizer', '发起人：{name}', { name: organizerName || format('anonymous', '匿名') })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isEventClosed ? (
            <EventJoinButton
              eventId={event.id}
              initialJoined={!!participation}
              initialCount={event.participants_count}
              isAuthenticated={!!user}
            />
          ) : (
            <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
              {format('endedNotice', '活动已结束，报名与取消报名入口已关闭')}
            </div>
          )}
          <EventShareButton title={event.title} url={shareUrl} />
        </div>
      </div>
    </div>
  )
}
