export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface ContentTag {
  id: string
  content_id: string
  tag_id: string
  created_at: string
}

export interface TagWithCount extends Tag {
  content_count?: number
}
