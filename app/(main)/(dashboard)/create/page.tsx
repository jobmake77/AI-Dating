import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePostForm } from '@/components/content/create-post-form'
import { getContentCategories } from '@/lib/queries/content-categories'

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = userData?.role === 'admin' ? 'admin' : 'user'
  const categories = await getContentCategories({ role: userRole })

  return <CreatePostForm categories={categories} />
}
