export interface EventListItem {
  id: string
  title: string
  description?: string | null
  location: string
  start_time: string
  end_time?: string | null
  participants_count: number
  max_participants?: number | null
  type: 'official' | 'offline'
  tags?: string[] | null
}
