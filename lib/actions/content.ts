'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { contentSchema } from '@/lib/validations/content'

// Calculate reading time based on word count (300 words per minute)
function calculateReadingTime(content: string): number {
  const wordCount = content.length
  return Math.ceil(wordCount / 300)
}

// Generate unique slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  return `${baseSlug}-${nanoid(8)}`
}

export async function createContent(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parse and validate form data
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    excerpt: formData.get('excerpt') as string,
    price_type: formData.get('price_type') as string,
    tags: formData.get('tags') as string,
  }

  const validatedData = contentSchema.parse(rawData)

  // Generate slug and calculate reading time
  const slug = generateSlug(validatedData.title)
  const readingTime = calculateReadingTime(validatedData.content)

  // Parse tags: support both #hashtag and comma-separated
  const parseTags = (tagString: string): string[] => {
    // Extract hashtags
    const hashtags = tagString.match(/#[\w\u4e00-\u9fa5]+/g)?.map(tag => tag.slice(1)) || []
    // Extract comma-separated tags
    const commaTags = tagString.split(/[,，]/).map(t => t.replace(/#/g, '').trim()).filter(Boolean)
    // Combine and deduplicate
    return [...new Set([...hashtags, ...commaTags])]
  }

  const tags = parseTags(validatedData.tags)

  // Insert content
  const { data, error } = await supabase
    .from('contents')
    .insert({
      title: validatedData.title,
      slug,
      content: validatedData.content,
      excerpt: validatedData.excerpt || validatedData.content.substring(0, 200),
      price_type: validatedData.price_type,
      tags,
      reading_time: readingTime,
      author_id: user.id,
      status: 'pending', // Default to pending for moderation
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create content: ${error.message}`)
  }

  revalidatePath('/contents')
  redirect(`/post/${data.id}`)
}

export async function updateContent(id: string, formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parse and validate form data
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    excerpt: formData.get('excerpt') as string,
    price_type: formData.get('price_type') as string,
    tags: formData.get('tags') as string,
  }

  const validatedData = contentSchema.parse(rawData)

  // Calculate reading time
  const readingTime = calculateReadingTime(validatedData.content)

  // Parse tags
  const parseTags = (tagString: string): string[] => {
    const hashtags = tagString.match(/#[\w\u4e00-\u9fa5]+/g)?.map(tag => tag.slice(1)) || []
    const commaTags = tagString.split(/[,，]/).map(t => t.replace(/#/g, '').trim()).filter(Boolean)
    return [...new Set([...hashtags, ...commaTags])]
  }

  const tags = parseTags(validatedData.tags)

  // Update content
  const { error } = await supabase
    .from('contents')
    .update({
      title: validatedData.title,
      content: validatedData.content,
      excerpt: validatedData.excerpt || validatedData.content.substring(0, 200),
      price_type: validatedData.price_type,
      tags,
      reading_time: readingTime,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('author_id', user.id) // Ensure user owns the content

  if (error) {
    throw new Error(`Failed to update content: ${error.message}`)
  }

  revalidatePath(`/post/${id}`)
  revalidatePath('/contents')
  redirect(`/post/${id}`)
}

export async function deleteContent(id: string) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Delete content
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id) // Ensure user owns the content

  if (error) {
    throw new Error(`Failed to delete content: ${error.message}`)
  }

  revalidatePath('/contents')
  redirect('/contents')
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient()

  // Increment view count (no auth required)
  await supabase.rpc('increment_view_count', { content_id: id })
}
