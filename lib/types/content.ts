export interface ContentAuthorSummary {
  username: string
  avatar: string | null
  full_name: string | null
}

export interface ContentCommunitySummary {
  id: string
  slug: string
  name: string
}

export interface ContentListItem {
  id: string
  title: string
  excerpt: string
  tags: string[] | null
  category?: string | null
  category_name?: string | null
  category_color?: string | null
  price_type: string
  reading_time: number
  view_count: number
  likes_count: number
  reposts_count: number
  comments_count: number
  created_at: string
  users: ContentAuthorSummary
  href?: string
  source_type?: 'content' | 'repost' | 'community_post'
  community?: ContentCommunitySummary | null
  is_pinned?: boolean
  is_profile_pinned?: boolean
  is_site_pinned?: boolean
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
  category_name?: string | null
  category_color?: string | null
  view_count: number
  likes_count: number
  reposts_count: number
  comments_count: number
  created_at: string
  users: ContentAuthorSummary
  is_pinned?: boolean
  is_profile_pinned?: boolean
  is_site_pinned?: boolean
  is_hot?: boolean
  score?: number
}
