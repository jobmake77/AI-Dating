'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { contentSchema } from '@/lib/validations/content'
import { moderateHTMLContent, formatModerationError } from '@/lib/tencent/moderation'
import { updateOnboardingProgress } from './onboarding'
import { trackEvent } from '@/lib/analytics/events'

// Calculate reading time based on word count (300 words per minute)
function calculateReadingTime(content: string): number {
  // Strip HTML tags for word count
  const text = content.replace(/<[^>]*>/g, '')
  const wordCount = text.length
  return Math.ceil(wordCount / 300)
}

// Generate unique slug from title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  return `${baseSlug}-${nanoid(8)}`
}

// Extract title from HTML content (first heading or first 50 chars)
function extractTitle(htmlContent: string): string {
  // Try to find first heading
  const headingMatch = htmlContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)
  if (headingMatch) {
    return headingMatch[1].replace(/<[^>]*>/g, '').substring(0, 200)
  }

  // Try to find first paragraph
  const paragraphMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i)
  if (paragraphMatch) {
    const text = paragraphMatch[1].replace(/<[^>]*>/g, '')
    return text.substring(0, 50) + (text.length > 50 ? '...' : '')
  }

  // Fallback: strip all HTML and take first 50 chars
  const text = htmlContent.replace(/<[^>]*>/g, '').trim()
  return text.substring(0, 50) + (text.length > 50 ? '...' : '')
}

// Extract excerpt from HTML content
function extractExcerpt(htmlContent: string): string {
  const text = htmlContent.replace(/<[^>]*>/g, '').trim()
  return text.substring(0, 200) + (text.length > 200 ? '...' : '')
}

// Extract hashtags from HTML content
function extractTags(htmlContent: string): string[] {
  const text = htmlContent.replace(/<[^>]*>/g, '')
  const hashtags = text.match(/#[\w\u4e00-\u9fa5]+/g) || []
  return [...new Set(hashtags.map(tag => tag.slice(1)))]
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
    content: formData.get('content') as string,
    price_type: formData.get('price_type') as string || 'free',
  }

  const validatedData = contentSchema.parse(rawData)

  // 腾讯云天御内容安全检测
  const moderationResult = await moderateHTMLContent(validatedData.content)
  if (!moderationResult.isSafe) {
    const errorMessage = formatModerationError(moderationResult)
    throw new Error(errorMessage)
  }

  // Parse tags from form data
  const tagsJson = formData.get('tags') as string
  const userTags: string[] = tagsJson ? JSON.parse(tagsJson) : []

  // Get cover image if provided
  const coverImage = formData.get('cover_image') as string | null

  // Auto-generate title and excerpt from HTML content
  const title = extractTitle(validatedData.content)
  const excerpt = extractExcerpt(validatedData.content)
  const slug = generateSlug(title)
  const readingTime = calculateReadingTime(validatedData.content)

  // Insert content
  const { data, error } = await supabase
    .from('contents')
    .insert({
      title,
      slug,
      content: validatedData.content,
      excerpt,
      price_type: validatedData.price_type,
      reading_time: readingTime,
      author_id: user.id,
      status: 'approved', // 通过敏感词检测后直接发布
      cover_image: coverImage,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create content: ${error.message}`)
  }

  // Add tags to content
  if (userTags.length > 0) {
    const { addTagsToContent } = await import('./tags')
    await addTagsToContent(data.id, userTags)
  }

  // 检查是否为首次发布
  const { count: contentCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  // 追踪事件
  if (contentCount === 1) {
    await trackEvent('first_post_published', {
      content_id: data.id,
      content_title: title,
      author_id: user.id,
    })
  }

  await trackEvent('post_published', {
    content_id: data.id,
    content_title: title,
    author_id: user.id,
    price_type: validatedData.price_type,
  })

  // 标记用户已发布第一篇内容
  try {
    await updateOnboardingProgress({ first_post_published: true })
  } catch (error) {
    // 忽略错误，不影响内容发布
    console.error('Failed to update onboarding progress:', error)
  }

  revalidatePath('/contents')
  revalidatePath('/')
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
    content: formData.get('content') as string,
    price_type: formData.get('price_type') as string || 'free',
  }

  const validatedData = contentSchema.parse(rawData)

  // Parse tags from form data
  const tagsJson = formData.get('tags') as string
  const userTags: string[] = tagsJson ? JSON.parse(tagsJson) : []

  // Get cover image if provided
  const coverImage = formData.get('cover_image') as string | null

  // Auto-generate title and excerpt from HTML content
  const title = extractTitle(validatedData.content)
  const excerpt = extractExcerpt(validatedData.content)
  const readingTime = calculateReadingTime(validatedData.content)

  // Update content
  const { error } = await supabase
    .from('contents')
    .update({
      title,
      content: validatedData.content,
      excerpt,
      price_type: validatedData.price_type,
      reading_time: readingTime,
      updated_at: new Date().toISOString(),
      cover_image: coverImage,
    })
    .eq('id', id)
    .eq('author_id', user.id) // Ensure user owns the content

  if (error) {
    throw new Error(`Failed to update content: ${error.message}`)
  }

  // Update tags
  if (userTags.length > 0) {
    // Remove old tags
    await supabase
      .from('content_tags')
      .delete()
      .eq('content_id', id)

    // Add new tags
    const { addTagsToContent } = await import('./tags')
    await addTagsToContent(id, userTags)
  }

  revalidatePath(`/post/${id}`)
  revalidatePath('/contents')
  revalidatePath('/')
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
