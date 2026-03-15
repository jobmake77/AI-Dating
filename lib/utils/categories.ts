/**
 * Category color mapping utility
 * Maps category slugs to their corresponding HSL color values
 */

export type CategoryRole = 'admin' | 'user'

export interface Category {
  id: string
  name: string
  slug: string
  requiredRole: CategoryRole
  description?: string
  color?: string
  sortOrder?: number
  isActive?: boolean
}

export const categories: Category[] = [
  // 管理员专属
  {
    id: '1',
    name: '官方公告',
    slug: 'announce',
    requiredRole: 'admin',
    description: '平台官方发布的重要公告和通知',
    color: '210 100% 56%',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: '2',
    name: '新手入门',
    slug: 'beginner',
    requiredRole: 'admin',
    description: '帮助新用户快速上手的指南和教程',
    color: '152 69% 40%',
    sortOrder: 20,
    isActive: true,
  },
  {
    id: '3',
    name: '官方活动',
    slug: 'activity',
    requiredRole: 'admin',
    description: '平台举办的各类活动信息',
    color: '38 92% 50%',
    sortOrder: 30,
    isActive: true,
  },
  {
    id: '4',
    name: '帮助与支持',
    slug: 'help',
    requiredRole: 'admin',
    description: '常见问题解答和技术支持',
    color: '142 71% 45%',
    sortOrder: 40,
    isActive: true,
  },
  // 所有用户
  {
    id: '5',
    name: '产品建议',
    slug: 'suggest',
    requiredRole: 'user',
    description: '对平台功能和产品的改进建议',
    color: '262 83% 58%',
    sortOrder: 50,
    isActive: true,
  },
  {
    id: '6',
    name: '技巧分享',
    slug: 'tips',
    requiredRole: 'user',
    description: '分享使用技巧和经验心得',
    color: '199 89% 48%',
    sortOrder: 60,
    isActive: true,
  },
  {
    id: '7',
    name: '案例与作品',
    slug: 'showcase',
    requiredRole: 'user',
    description: '展示优秀作品和成功案例',
    color: '340 82% 52%',
    sortOrder: 70,
    isActive: true,
  },
  {
    id: '8',
    name: '互动交流',
    slug: 'chat',
    requiredRole: 'user',
    description: '用户之间的自由交流讨论',
    color: '24 95% 53%',
    sortOrder: 80,
    isActive: true,
  },
]

export function getCategoriesByRole(role: CategoryRole): Category[] {
  if (role === 'admin') {
    return categories.filter((cat) => cat.isActive !== false)
  }
  return categories.filter((cat) => cat.requiredRole === 'user' && cat.isActive !== false)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug)
}

const categoryAliases: Record<string, string[]> = {
  announce: ['官方公告', 'announce'],
  beginner: ['新手入门', 'beginner'],
  activity: ['官方活动', 'activity'],
  help: ['帮助与支持', 'help'],
  suggest: ['产品建议', 'suggest'],
  tips: ['技巧分享', 'tips'],
  showcase: ['案例与作品', 'showcase'],
  chat: ['互动交流', 'chat'],
}

function normalizeCategoryValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

export function getCategoryAliases(categoryOrSlug: string): string[] {
  const category = getCategoryBySlug(categoryOrSlug)
  const source = category ? category.slug : categoryOrSlug

  return Array.from(
    new Set([
      source,
      ...(category ? [category.name] : []),
      ...(categoryAliases[source] || []),
    ])
  )
}

export function matchesCategoryValue(categorySlug: string, value: string): boolean {
  const aliases = getCategoryAliases(categorySlug)
  const normalizedValue = normalizeCategoryValue(value)

  return aliases.some((alias) => normalizeCategoryValue(alias) === normalizedValue)
}

export function canUserAccessCategory(userRole: CategoryRole, categorySlug: string): boolean {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return false

  if (userRole === 'admin') return true
  return category.requiredRole === 'user'
}

export const categoryColors: Record<string, string> = {
  "source-code": "210 100% 56%",
  "workshop": "38 92% 50%",
  "architecture": "280 68% 55%",
  "ai-frontier": "262 83% 58%",
  "interview": "340 82% 52%",
  // Legacy categories (if any)
  announce: "210 100% 56%",
  beginner: "152 69% 40%",
  activity: "38 92% 50%",
  help: "142 71% 45%",
  suggest: "262 83% 58%",
  tips: "199 89% 48%",
  showcase: "340 82% 52%",
  chat: "24 95% 53%",
  welfare: "280 68% 55%",
  enterprise: "210 16% 46%",
  curated: "330 81% 60%",
  live: "0 72% 51%",
};

/**
 * Get the computed HSL color for a category
 * @param categorySlug - The category slug
 * @returns HSL color string (e.g., "210 100% 56%")
 */
export function getCategoryColor(categorySlug: string): string {
  const configuredColor = categories.find((category) => category.slug === categorySlug)?.color
  return configuredColor || categoryColors[categorySlug] || "221 83% 53%"; // Default to primary color
}

/**
 * Get the Tailwind CSS class for a category color
 * @param categorySlug - The category slug
 * @returns Tailwind CSS class (e.g., "cat-announce")
 */
export function getCategoryColorClass(categorySlug: string): string {
  return `cat-${categorySlug}`;
}
