import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { categories as fallbackCategories, type CategoryRole } from '@/lib/utils/categories'
import type { ContentCategory } from '@/lib/types/content-category'

type ContentCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  required_role: CategoryRole
  color: string | null
  sort_order: number | null
  is_active: boolean | null
}

const DEFAULT_CATEGORY_COLOR = '221 83% 53%'

function mapFallbackCategories(): ContentCategory[] {
  return fallbackCategories.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    requiredRole: category.requiredRole,
    color: category.color || DEFAULT_CATEGORY_COLOR,
    sortOrder: category.sortOrder ?? (index + 1) * 10,
    isActive: category.isActive !== false,
  }))
}

function mapCategoryRow(row: ContentCategoryRow): ContentCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    requiredRole: row.required_role,
    color: row.color || DEFAULT_CATEGORY_COLOR,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active !== false,
  }
}

function filterCategoriesByRole(categories: ContentCategory[], role?: CategoryRole) {
  if (!role || role === 'admin') {
    return categories
  }

  return categories.filter((category) => category.requiredRole === 'user')
}

export async function getContentCategories(options: {
  role?: CategoryRole
  includeInactive?: boolean
} = {}): Promise<ContentCategory[]> {
  const { role, includeInactive = false } = options

  try {
    const supabase = await createClient()
    let query = supabase
      .from('content_categories')
      .select('id, name, slug, description, required_role, color, sort_order, is_active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return filterCategoriesByRole((data || []).map(mapCategoryRow), role)
  } catch (error) {
    logger.error('Failed to fetch content categories, falling back to defaults:', error)
    const fallback = mapFallbackCategories().filter((category) => includeInactive || category.isActive)
    return filterCategoriesByRole(fallback, role)
  }
}

export async function getContentCategoryBySlug(slug: string, options: {
  includeInactive?: boolean
} = {}): Promise<ContentCategory | null> {
  const categories = await getContentCategories({
    includeInactive: options.includeInactive,
  })

  return categories.find((category) => category.slug === slug) || null
}

export async function canRoleAccessContentCategory(role: CategoryRole, slug: string) {
  const category = await getContentCategoryBySlug(slug, { includeInactive: true })

  if (!category || !category.isActive) {
    return false
  }

  if (role === 'admin') {
    return true
  }

  return category.requiredRole === 'user'
}
