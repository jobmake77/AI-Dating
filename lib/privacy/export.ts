import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Tables } from '@/types/database.types'

type CommunityExport = Tables<'community_members'> & {
  communities: Tables<'communities'> | null
}

type EventExport = Tables<'event_participants'> & {
  events: Tables<'events'> | null
}

export interface ExportedUserSummary {
  id: string
  email: string | null
  created_at: string | null
}

export interface UserDataExport {
  user: ExportedUserSummary
  profile: Tables<'users'> | null
  contents: Tables<'contents'>[]
  comments: Tables<'comments'>[]
  likes: Tables<'likes'>[]
  follows: Tables<'follows'>[]
  communities: CommunityExport[]
  events: EventExport[]
  messages: Tables<'messages'>[]
  notifications: Tables<'notifications'>[]
}

export async function collectUserDataExport(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserDataExport> {
  const [
    { data: profile },
    { data: contents },
    { data: comments },
    { data: likes },
    { data: follows },
    { data: communities },
    { data: events },
    { data: messages },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('contents').select('*').eq('author_id', userId),
    supabase.from('comments').select('*').eq('user_id', userId),
    supabase.from('likes').select('*').eq('user_id', userId),
    supabase.from('follows').select('*').or(`follower_id.eq.${userId},following_id.eq.${userId}`),
    supabase.from('community_members').select('*, communities(*)').eq('user_id', userId),
    supabase.from('event_participants').select('*, events(*)').eq('user_id', userId),
    supabase.from('messages').select('*').eq('sender_id', userId),
    supabase.from('notifications').select('*').eq('user_id', userId),
  ])

  return {
    user: {
      id: userId,
      email: profile?.email ?? null,
      created_at: profile?.created_at ?? null,
    },
    profile: profile || null,
    contents: contents || [],
    comments: comments || [],
    likes: likes || [],
    follows: follows || [],
    communities: (communities as CommunityExport[]) || [],
    events: (events as EventExport[]) || [],
    messages: messages || [],
    notifications: notifications || [],
  }
}
