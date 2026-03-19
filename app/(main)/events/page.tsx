import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEvents } from '@/lib/queries/events'
import { EventsListClient } from '@/components/events/events-list-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { Metadata } from 'next'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = getTranslation(locale, 'eventsPage.metadata.title', 'Events - AI-Dating')
  const description = getTranslation(locale, 'eventsPage.metadata.description', 'Discover and join AI community events.')

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: `${baseUrl}/events`,
      title,
      description,
      siteName: 'AI-Dating',
      images: [
        {
          url: `${baseUrl}/api/og?type=home`,
          width: 1200,
          height: 630,
          alt: getTranslation(locale, 'eventsPage.metadata.imageAlt', 'Events'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=home`],
    },
  }
}

async function EventsList() {
  const { data: events } = await getEvents({ limit: 50 })

  return <EventsListClient events={events} />
}

export default async function EventsPage() {
  const locale = await getRequestLocale()
  const t = (key: string, fallback?: string) => getTranslation(locale, `eventsPage.${key}`, fallback)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
    : { data: null }
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-sunset flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('title', '活动')}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('subtitle', '参与社区活动，提升技能、拓展人脉')}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
              asChild
            >
              <Link href="/events/create">
                <Plus className="h-3.5 w-3.5" />
                {t('create', '创建活动')}
              </Link>
            </Button>
          )}
        </div>

        <Suspense fallback={<div>{t('loading', '加载中...')}</div>}>
          <EventsList />
        </Suspense>
      </div>
    </div>
  )
}
