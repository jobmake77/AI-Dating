export interface CommunityListItem {
  id: string
  name: string
  slug: string
  description?: string | null
  icon_url?: string | null
  members_count: number
  posts_count: number
  tags?: string[] | null
  is_joined?: boolean
}

export interface CommunityMembershipRecord {
  community: CommunityListItem | null
}
