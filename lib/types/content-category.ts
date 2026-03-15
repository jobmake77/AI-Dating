import type { CategoryRole } from '@/lib/utils/categories'

export interface ContentCategory {
  id: string
  name: string
  slug: string
  description?: string
  requiredRole: CategoryRole
  color: string
  sortOrder: number
  isActive: boolean
}
