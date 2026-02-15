import { getContentById } from '@/lib/queries/content'
import { createClient } from '@/lib/supabase/server'
import { ContentEditForm } from '@/components/content/content-edit-form'
import { notFound, redirect } from 'next/navigation'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params

  try {
    const content = await getContentById(id)

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

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">编辑内容</h1>
          <p className="text-muted-foreground mt-2">
            修改你的内容并重新发布
          </p>
        </div>

        <ContentEditForm content={content} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
