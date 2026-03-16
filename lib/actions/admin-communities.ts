'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

const adminCommunitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, '社区名称至少 2 个字符').max(50, '社区名称过长'),
  slug: z.string().trim().min(2, '社区标识至少 2 个字符').max(80, '社区标识过长'),
  description: z.string().trim().max(500, '社区描述过长').optional(),
  type: z.enum(['public', 'private']),
  iconUrl: z.string().trim().url('图标链接格式不正确').optional().or(z.literal('')),
  coverUrl: z.string().trim().url('封面链接格式不正确').optional().or(z.literal('')),
})

const deleteCommunitySchema = z.object({
  communityId: z.string().uuid('无效的社区 ID'),
})

function slugifyCommunity(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return slug.length >= 2 ? slug : `community-${Date.now().toString().slice(-6)}`
}

function revalidateCommunityPaths(slug?: string, previousSlug?: string) {
  revalidatePath('/admin/communities')
  revalidatePath('/communities')
  revalidatePath('/communities/[slug]', 'page')

  if (slug) {
    revalidatePath(`/communities/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/communities/${previousSlug}`)
  }
}

export async function saveAdminCommunity(formData: FormData) {
  const adminUser = await requireAdmin()

  const validation = adminCommunitySchema.safeParse({
    id: formData.get('id')?.toString().trim() || undefined,
    name: formData.get('name')?.toString() || '',
    slug: slugifyCommunity(formData.get('slug')?.toString() || formData.get('name')?.toString() || ''),
    description: formData.get('description')?.toString() || undefined,
    type: formData.get('type')?.toString() === 'private' ? 'private' : 'public',
    iconUrl: formData.get('icon_url')?.toString().trim() || '',
    coverUrl: formData.get('cover_url')?.toString().trim() || '',
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '社区数据不合法')
  }

  const supabase = await createClient()
  const payload = {
    name: validation.data.name,
    slug: validation.data.slug,
    description: validation.data.description || null,
    type: validation.data.type,
    icon_url: validation.data.iconUrl || null,
    cover_url: validation.data.coverUrl || null,
    updated_at: new Date().toISOString(),
  }

  const { data: duplicateSlug, error: duplicateSlugError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', payload.slug)
    .maybeSingle()

  if (duplicateSlugError) {
    logger.error('Failed to validate community slug uniqueness:', duplicateSlugError)
    throw new Error('校验社区标识失败')
  }

  if (duplicateSlug && duplicateSlug.id !== validation.data.id) {
    throw new Error('社区标识已存在，请使用其他 slug')
  }

  if (validation.data.id) {
    const { data: existingCommunity, error: existingCommunityError } = await supabase
      .from('communities')
      .select('id, slug')
      .eq('id', validation.data.id)
      .single()

    if (existingCommunityError || !existingCommunity) {
      logger.error('Failed to load community before update:', existingCommunityError)
      throw new Error('社区不存在')
    }

    const { error: updateError } = await supabase
      .from('communities')
      .update(payload)
      .eq('id', validation.data.id)

    if (updateError) {
      logger.error('Failed to update community:', updateError)
      throw new Error(updateError.message)
    }

    revalidateCommunityPaths(payload.slug, existingCommunity.slug)
    return
  }

  const { data: createdCommunity, error: insertError } = await supabase
    .from('communities')
    .insert({
      ...payload,
      creator_id: adminUser.id,
    })
    .select('slug')
    .single()

  if (insertError || !createdCommunity) {
    logger.error('Failed to create admin community:', insertError)
    throw new Error(insertError?.message || '创建社区失败')
  }

  revalidateCommunityPaths(createdCommunity.slug)
}

export async function deleteAdminCommunity(formData: FormData) {
  await requireAdmin()

  const validation = deleteCommunitySchema.safeParse({
    communityId: formData.get('community_id')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '删除参数不合法')
  }

  const supabase = await createClient()
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id, slug')
    .eq('id', validation.data.communityId)
    .single()

  if (communityError || !community) {
    logger.error('Failed to load community before deletion:', communityError)
    throw new Error('社区不存在')
  }

  const { error: deleteError } = await supabase
    .from('communities')
    .delete()
    .eq('id', validation.data.communityId)

  if (deleteError) {
    logger.error('Failed to delete community:', deleteError)
    throw new Error(deleteError.message)
  }

  revalidateCommunityPaths(undefined, community.slug)
}
