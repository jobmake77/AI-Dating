'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Tag } from '@/lib/types/tag'

/**
 * 创建或获取标签
 * 如果标签已存在，返回现有标签；否则创建新标签
 */
export async function createOrGetTag(name: string): Promise<{ tag: Tag | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // 生成 slug（小写，空格替换为连字符）
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-')

    // 先尝试查找现有标签
    const { data: existingTag, error: findError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()

    if (existingTag) {
      return { tag: existingTag, error: null }
    }

    // 如果不存在，创建新标签
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert({
        name: name.trim(),
        slug,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating tag:', createError)
      return { tag: null, error: '创建标签失败' }
    }

    return { tag: newTag, error: null }
  } catch (error) {
    console.error('Error in createOrGetTag:', error)
    return { tag: null, error: '操作失败' }
  }
}

/**
 * 为内容添加标签
 */
export async function addTagsToContent(contentId: string, tagNames: string[]): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // 验证用户权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 验证内容所有权
    const { data: content } = await supabase
      .from('contents')
      .select('author_id')
      .eq('id', contentId)
      .single()

    if (!content || content.author_id !== user.id) {
      return { error: '无权限' }
    }

    // 创建或获取所有标签
    const tags = await Promise.all(
      tagNames.map(name => createOrGetTag(name))
    )

    // 过滤出成功的标签
    const validTags = tags
      .filter(result => result.tag !== null)
      .map(result => result.tag!)

    if (validTags.length === 0) {
      return { error: '没有有效的标签' }
    }

    // 创建内容标签关联
    const contentTags = validTags.map(tag => ({
      content_id: contentId,
      tag_id: tag.id,
    }))

    const { error: insertError } = await supabase
      .from('content_tags')
      .insert(contentTags)

    if (insertError) {
      console.error('Error adding tags to content:', insertError)
      return { error: '添加标签失败' }
    }

    revalidatePath(`/post/${contentId}`)
    return { error: null }
  } catch (error) {
    console.error('Error in addTagsToContent:', error)
    return { error: '操作失败' }
  }
}

/**
 * 移除内容的标签
 */
export async function removeTagFromContent(contentId: string, tagId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // 验证用户权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 验证内容所有权
    const { data: content } = await supabase
      .from('contents')
      .select('author_id')
      .eq('id', contentId)
      .single()

    if (!content || content.author_id !== user.id) {
      return { error: '无权限' }
    }

    const { error: deleteError } = await supabase
      .from('content_tags')
      .delete()
      .eq('content_id', contentId)
      .eq('tag_id', tagId)

    if (deleteError) {
      console.error('Error removing tag from content:', deleteError)
      return { error: '移除标签失败' }
    }

    revalidatePath(`/post/${contentId}`)
    return { error: null }
  } catch (error) {
    console.error('Error in removeTagFromContent:', error)
    return { error: '操作失败' }
  }
}

/**
 * 获取热门标签
 */
export async function getPopularTags(limit: number = 20): Promise<Tag[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular tags:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPopularTags:', error)
    return []
  }
}

/**
 * 搜索标签
 */
export async function searchTags(query: string, limit: number = 10): Promise<Tag[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching tags:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchTags:', error)
    return []
  }
}

/**
 * 获取内容的标签
 */
export async function getContentTags(contentId: string): Promise<Tag[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('content_tags')
      .select('tags(*)')
      .eq('content_id', contentId)

    if (error) {
      console.error('Error fetching content tags:', error)
      return []
    }

    return data?.map(item => item.tags).filter(Boolean).flat() || []
  } catch (error) {
    console.error('Error in getContentTags:', error)
    return []
  }
}
