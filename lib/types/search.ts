import type { Tables } from '@/types/database.types'
import type { ContentListItem } from '@/lib/types/content'

export type SearchContent = ContentListItem
export type SearchUser = Tables<'users'>

export interface SearchTag {
  name: string
  slug: string
  count: number
}

export interface SearchResult {
  contents: SearchContent[]
  users: SearchUser[]
  tags: SearchTag[]
  total: number
}
