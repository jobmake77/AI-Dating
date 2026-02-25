import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventCreateForm } from '@/components/events/event-create-form'

export const metadata = {
  title: '发起活动 - AI Dating',
}

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">发起活动</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? '创建官方活动或线下活动' : '创建一个线下活动，邀请大家参与'}
        </p>
      </div>
      <EventCreateForm isAdmin={isAdmin} />
    </div>
  )
}
