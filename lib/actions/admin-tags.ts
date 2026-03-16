'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { createOrGetTag } from '@/lib/actions/tags'
import { logger } from '@/lib/utils/logger'

const adminTagSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, '标签名称不能为空').max(50, '标签名称过长'),
  slug: z.string().trim().min(1, '标签标识不能为空').max(80, '标签标识过长'),
  description: z.string().trim().max(200, '标签描述过长').optional(),
})

const mergeTagSchema = z.object({
  sourceTagId: z.string().uuid('无效的源标签 ID'),
  targetTagName: z.string().trim().min(1, '目标标签不能为空').max(50, '目标标签过长'),
})

const deleteTagSchema = z.object({
  tagId: z.string().uuid('无效的标签 ID'),
})

function slugifyTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function revalidateTagPaths() {
  revalidatePath('/admin/tags')
  revalidatePath('/explore')
  revalidatePath('/search')
  revalidatePath('/contents')
  revalidatePath('/')
}

async function syncLegacyContentTags(currentName: string, nextName?: string) {
  const supabase = await createClient()

  const { data: contents, error } = await supabase
    .from('contents')
    .select('id, tags')
    .contains('tags', [currentName])

  if (error) {
    logger.error('Failed to load legacy content tags for sync:', error)
    throw new Error('同步内容标签失败')
  }

  for (const content of contents || []) {
    const existingTags = Array.isArray(content.tags) ? content.tags : []
    const nextTags = nextName
      ? Array.from(new Set(existingTags.map((tag) => (tag === currentName ? nextName : tag)).filter(Boolean)))
      : existingTags.filter((tag) => tag !== currentName)

    const { error: updateError } = await supabase
      .from('contents')
      .update({
        tags: nextTags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', content.id)

    if (updateError) {
      logger.error('Failed to sync legacy content tag value:', updateError)
      throw new Error('同步内容标签失败')
    }
  }
}

export async function saveAdminTag(formData: FormData) {
  await requireAdmin()

  const validation = adminTagSchema.safeParse({
    id: formData.get('id')?.toString().trim() || undefined,
    name: formData.get('name')?.toString() || '',
    slug: slugifyTag(formData.get('slug')?.toString() || formData.get('name')?.toString() || ''),
    description: formData.get('description')?.toString() || undefined,
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '标签数据不合法')
  }

  const supabase = await createClient()
  const payload = {
    name: validation.data.name,
    slug: validation.data.slug,
    description: validation.data.description || null,
    updated_at: new Date().toISOString(),
  }

  if (validation.data.id) {
    const { data: existingTag, error: existingTagError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('id', validation.data.id)
      .single()

    if (existingTagError || !existingTag) {
      logger.error('Failed to load tag before update:', existingTagError)
      throw new Error('标签不存在')
    }

    const { error: updateError } = await supabase
      .from('tags')
      .update(payload)
      .eq('id', validation.data.id)

    if (updateError) {
      logger.error('Failed to update tag:', updateError)
      throw new Error(updateError.message)
    }

    if (existingTag.name !== payload.name) {
      await syncLegacyContentTags(existingTag.name, payload.name)
    }
  } else {
    const { error: insertError } = await supabase
      .from('tags')
      .insert(payload)

    if (insertError) {
      logger.error('Failed to create tag:', insertError)
      throw new Error(insertError.message)
    }
  }

  revalidateTagPaths()
}

export async function mergeAdminTag(formData: FormData) {
  await requireAdmin()

  const validation = mergeTagSchema.safeParse({
    sourceTagId: formData.get('source_tag_id')?.toString(),
    targetTagName: formData.get('target_tag_name')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '合并参数不合法')
  }

  const supabase = await createClient()

  const { data: sourceTag, error: sourceTagError } = await supabase
    .from('tags')
    .select('id, name')
    .eq('id', validation.data.sourceTagId)
    .single()

  if (sourceTagError || !sourceTag) {
    logger.error('Failed to load source tag before merge:', sourceTagError)
    throw new Error('源标签不存在')
  }

  const { tag: targetTag, error: targetError } = await createOrGetTag(validation.data.targetTagName)

  if (targetError || !targetTag) {
    throw new Error(targetError || '目标标签创建失败')
  }

  if (targetTag.id === sourceTag.id) {
    throw new Error('目标标签不能与源标签相同')
  }

  const { data: sourceRelations, error: sourceRelationsError } = await supabase
    .from('content_tags')
    .select('content_id')
    .eq('tag_id', sourceTag.id)

  if (sourceRelationsError) {
    logger.error('Failed to load source tag relations:', sourceRelationsError)
    throw new Error('读取标签关联失败')
  }

  if ((sourceRelations || []).length > 0) {
    const { error: upsertError } = await supabase
      .from('content_tags')
      .upsert(
        sourceRelations!.map((relation) => ({
          content_id: relation.content_id,
          tag_id: targetTag.id,
        })),
        {
          onConflict: 'content_id,tag_id',
          ignoreDuplicates: true,
        }
      )

    if (upsertError) {
      logger.error('Failed to remap content tags during merge:', upsertError)
      throw new Error('合并标签失败')
    }
  }

  const { error: deleteRelationsError } = await supabase
    .from('content_tags')
    .delete()
    .eq('tag_id', sourceTag.id)

  if (deleteRelationsError) {
    logger.error('Failed to delete old content tag relations:', deleteRelationsError)
    throw new Error('清理旧标签关联失败')
  }

  const { error: deleteSourceError } = await supabase
    .from('tags')
    .delete()
    .eq('id', sourceTag.id)

  if (deleteSourceError) {
    logger.error('Failed to delete source tag after merge:', deleteSourceError)
    throw new Error('删除源标签失败')
  }

  if (sourceTag.name !== targetTag.name) {
    await syncLegacyContentTags(sourceTag.name, targetTag.name)
  }

  revalidateTagPaths()
}

export async function deleteAdminTag(formData: FormData) {
  await requireAdmin()

  const validation = deleteTagSchema.safeParse({
    tagId: formData.get('tag_id')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '删除参数不合法')
  }

  const supabase = await createClient()
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id, name, usage_count')
    .eq('id', validation.data.tagId)
    .single()

  if (tagError || !tag) {
    logger.error('Failed to load tag before deletion:', tagError)
    throw new Error('标签不存在')
  }

  if ((tag.usage_count || 0) > 0) {
    throw new Error('标签仍在使用中，请先合并或移除关联内容')
  }

  const { error: deleteError } = await supabase
    .from('tags')
    .delete()
    .eq('id', validation.data.tagId)

  if (deleteError) {
    logger.error('Failed to delete tag:', deleteError)
    throw new Error(deleteError.message)
  }

  await syncLegacyContentTags(tag.name)
  revalidateTagPaths()
}
