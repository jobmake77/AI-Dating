import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentForm } from '@/components/content/content-form'

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">发布内容</h1>
        <p className="text-muted-foreground mt-2">
          分享你的想法、见解和经验
        </p>
      </div>

      <ContentForm />
    </div>
  )
}
