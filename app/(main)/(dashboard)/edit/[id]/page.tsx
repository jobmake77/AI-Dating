import { getContentById } from '@/lib/queries/content'
import { createClient } from '@/lib/supabase/server'
import { EditPostForm } from '@/components/content/edit-post-form'
import { notFound, redirect } from 'next/navigation'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const content = await getContentById(id)

  if (!content) {
    notFound()
  }

  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is the author
  if (content.author_id !== user.id) {
    redirect(`/post/${id}`)
  }

  return <EditPostForm content={content} />
}
