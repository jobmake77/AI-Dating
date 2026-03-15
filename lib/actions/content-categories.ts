'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/middleware/admin'
import { logger } from '@/lib/utils/logger'

const contentCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, '分类名称不能为空').max(50, '分类名称过长'),
  slug: z.string().trim().min(1, '分类标识不能为空').max(80, '分类标识过长'),
  description: z.string().trim().max(200, '分类描述过长').optional(),
  requiredRole: z.enum(['admin', 'user']),
  color: z.string().trim().min(1, '分类颜色不能为空').max(32, '分类颜色格式异常'),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
})

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
}

function revalidateCategoryPaths() {
  revalidatePath('/admin/categories')
  revalidatePath('/create')
  revalidatePath('/contents')
  revalidatePath('/explore')
  revalidatePath('/')
}

export async function saveContentCategory(formData: FormData) {
  await requireAdmin()

  const rawId = formData.get('id')?.toString().trim()
  const rawName = formData.get('name')?.toString() || ''
  const rawSlug = formData.get('slug')?.toString() || rawName
  const rawSortOrder = Number(formData.get('sort_order') || 0)

  const validation = contentCategorySchema.safeParse({
    id: rawId || undefined,
    name: rawName,
    slug: slugifyCategory(rawSlug || rawName),
    description: formData.get('description')?.toString() || undefined,
    requiredRole: formData.get('required_role') === 'admin' ? 'admin' : 'user',
    color: formData.get('color')?.toString().trim() || '221 83% 53%',
    sortOrder: Number.isFinite(rawSortOrder) ? rawSortOrder : 0,
    isActive: formData.get('is_active') === 'on',
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '分类数据不合法')
  }

  const supabase = await createClient()
  const payload = {
    name: validation.data.name,
    slug: validation.data.slug,
    description: validation.data.description || null,
    required_role: validation.data.requiredRole,
    color: validation.data.color,
    sort_order: validation.data.sortOrder,
    is_active: validation.data.isActive,
  }

  if (validation.data.id) {
    const { data: existingCategory, error: existingError } = await supabase
      .from('content_categories')
      .select('slug')
      .eq('id', validation.data.id)
      .single()

    if (existingError) {
      logger.error('Failed to fetch existing content category:', existingError)
      throw new Error('读取原分类失败')
    }

    const { error: updateError } = await supabase
      .from('content_categories')
      .update(payload)
      .eq('id', validation.data.id)

    if (updateError) {
      logger.error('Failed to update content category:', updateError)
      throw new Error(updateError.message)
    }

    if (existingCategory.slug !== payload.slug) {
      const { error: contentUpdateError } = await supabase
        .from('contents')
        .update({ category: payload.slug })
        .eq('category', existingCategory.slug)

      if (contentUpdateError) {
        logger.error('Failed to sync content category slug changes:', contentUpdateError)
        throw new Error(contentUpdateError.message)
      }
    }
  } else {
    const { error: insertError } = await supabase
      .from('content_categories')
      .insert(payload)

    if (insertError) {
      logger.error('Failed to create content category:', insertError)
      throw new Error(insertError.message)
    }
  }

  revalidateCategoryPaths()
}

export async function deleteContentCategory(formData: FormData) {
  await requireAdmin()

  const id = formData.get('id')?.toString().trim()

  if (!id) {
    throw new Error('缺少分类 ID')
  }

  const supabase = await createClient()
  const { data: category, error: categoryError } = await supabase
    .from('content_categories')
    .select('id, slug')
    .eq('id', id)
    .single()

  if (categoryError || !category) {
    logger.error('Failed to load content category before deletion:', categoryError)
    throw new Error('分类不存在')
  }

  const { count, error: usageError } = await supabase
    .from('contents')
    .select('id', { count: 'exact', head: true })
    .eq('category', category.slug)

  if (usageError) {
    logger.error('Failed to inspect content category usage:', usageError)
    throw new Error('无法检查分类使用情况')
  }

  if ((count || 0) > 0) {
    const { error: disableError } = await supabase
      .from('content_categories')
      .update({ is_active: false })
      .eq('id', category.id)

    if (disableError) {
      logger.error('Failed to disable content category in use:', disableError)
      throw new Error(disableError.message)
    }
  } else {
    const { error: deleteError } = await supabase
      .from('content_categories')
      .delete()
      .eq('id', category.id)

    if (deleteError) {
      logger.error('Failed to delete content category:', deleteError)
      throw new Error(deleteError.message)
    }
  }

  revalidateCategoryPaths()
}
