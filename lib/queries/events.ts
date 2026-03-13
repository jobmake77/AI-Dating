import { createClient } from '@/lib/supabase/server'
import { isValidUuid } from '@/lib/utils/is-valid-uuid'

export async function getEvents(options?: {
  type?: 'official' | 'offline' | 'all'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { type = 'all', limit = 20, offset = 0 } = options || {}

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('status', 'active')

  if (type !== 'all') {
    query = query.eq('type', type)
  }

  query = query
    .order('start_time', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('获取活动列表失败:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getEventById(id: string) {
  if (!isValidUuid(id)) {
    return { data: null, error: null }
  }

  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('获取活动详情失败:', error)
    }
    return { data: null, error }
  }

  // 单独获取创建者信息
  let creator = null
  if (event.creator_id) {
    const { data: creatorData } = await supabase
      .from('users')
      .select('id, username, full_name, avatar')
      .eq('id', event.creator_id)
      .single()
    creator = creatorData
  }

  return { data: { ...event, creator }, error: null }
}

export async function getUserParticipation(eventId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_participants')
    .select('id, joined_at')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  if (error) {
    return { data: null, error: null }
  }

  return { data, error: null }
}
