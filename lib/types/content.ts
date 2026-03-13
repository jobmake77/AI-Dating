export interface ContentAuthorSummary {
  username: string
  avatar: string | null
  full_name: string | null
}

export interface ContentListItem {
  id: string
  title: string
  excerpt: string
  tags: string[] | null
  category?: string | null
  price_type: string
  reading_time: number
  view_count: number
  likes_count: number
  reposts_count: number
  comments_count: number
  created_at: string
  users: ContentAuthorSummary
  is_pinned?: boolean
  is_hot?: boolean
}

export interface PaginatedContentItems {
  items: ContentListItem[]
  currentPage: number
  totalPages: number
}

export interface RelatedContentItem {
  id: string
  title: string
  excerpt: string
  cover_image?: string | null
  tags: string[] | null
  view_count: number
  likes_count: number
  created_at: string
  users: ContentAuthorSummary
  score?: number
}

export interface TrendingContentItem {
  id: string
  title: string
  excerpt: string
  tags: string[] | null
  category?: string | null
  view_count: number
  likes_count: number
  reposts_count: number
  comments_count: number
  created_at: string
  users: ContentAuthorSummary
  is_pinned?: boolean
  is_hot?: boolean
  score?: number
}
