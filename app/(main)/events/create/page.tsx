import { requireAdmin } from '@/lib/middleware/admin'
import { EventCreateForm } from '@/components/events/event-create-form'
import { Calendar, MapPin } from 'lucide-react'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

export async function generateMetadata() {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'eventCreate.metadata.title', 'Create Event - AI-Dating'),
    description: getTranslation(locale, 'eventCreate.metadata.description', 'Create official or offline events for the AI-Dating community.'),
  }
}

export default async function CreateEventPage() {
  await requireAdmin()
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `eventCreate.${key}`, fallback)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('pageTitle', 'Create Event')}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('pageDescription', 'Create official or offline events')}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div>
            <EventCreateForm isAdmin />
          </div>

          {/* Right: Preview Card */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card">
                <div className="h-1 gradient-primary" />
                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-3">{t('previewTitle', 'Preview')}</h3>
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{t('previewCover', 'Event cover preview')}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">{t('previewEventTitle', 'Event title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('previewDescription', 'Event description will appear here...')}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-primary/5 rounded-full px-2.5 py-1.5 text-xs w-fit">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>{t('previewTime', 'Event time')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-warning/5 rounded-full px-2.5 py-1.5 text-xs w-fit">
                        <MapPin className="h-3 w-3 text-warning" />
                        <span>{t('previewLocation', 'Event location')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
