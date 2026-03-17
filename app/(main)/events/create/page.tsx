import { requireAdmin } from '@/lib/middleware/admin'
import { EventCreateForm } from '@/components/events/event-create-form'
import { Calendar, MapPin } from 'lucide-react'

export const metadata = {
  title: '发起活动 - AI Dating',
}

export default async function CreateEventPage() {
  await requireAdmin()

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
              <h1 className="text-xl font-bold">发起活动</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                创建官方活动或线下活动
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
                  <h3 className="text-sm font-semibold mb-3">预览</h3>
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">活动封面预览</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">活动标题</h4>
                      <p className="text-xs text-muted-foreground">活动描述将显示在这里...</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-primary/5 rounded-full px-2.5 py-1.5 text-xs w-fit">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>活动时间</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-warning/5 rounded-full px-2.5 py-1.5 text-xs w-fit">
                        <MapPin className="h-3 w-3 text-warning" />
                        <span>活动地点</span>
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
