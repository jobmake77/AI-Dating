export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          avatar: string | null
          role: 'user' | 'creator' | 'admin'
          is_member: boolean
          member_expire_at: string | null
          bio: string | null
          github_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          avatar?: string | null
          role?: 'user' | 'creator' | 'admin'
          is_member?: boolean
          member_expire_at?: string | null
          bio?: string | null
          github_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          avatar?: string | null
          role?: 'user' | 'creator' | 'admin'
          is_member?: boolean
          member_expire_at?: string | null
          bio?: string | null
          github_url?: string | null
          created_at?: string
        }
      }
      contents: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          category: 'source-code' | 'workshop' | 'architecture' | 'ai-frontier' | 'interview'
          content: string
          excerpt: string | null
          cover_image: string | null
          price_type: 'free' | 'member'
          status: 'pending' | 'approved' | 'rejected'
          reject_reason: string | null
          views: number
          likes_count: number
          comments_count: number
          reading_time: number | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          category: 'source-code' | 'workshop' | 'architecture' | 'ai-frontier' | 'interview'
          content: string
          excerpt?: string | null
          cover_image?: string | null
          price_type?: 'free' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          reject_reason?: string | null
          views?: number
          likes_count?: number
          comments_count?: number
          reading_time?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          category?: 'source-code' | 'workshop' | 'architecture' | 'ai-frontier' | 'interview'
          content?: string
          excerpt?: string | null
          cover_image?: string | null
          price_type?: 'free' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          reject_reason?: string | null
          views?: number
          likes_count?: number
          comments_count?: number
          reading_time?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      moderation_logs: {
        Row: {
          id: string
          content_id: string
          moderator_id: string
          action: 'approve' | 'reject'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          moderator_id: string
          action: 'approve' | 'reject'
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          moderator_id?: string
          action?: 'approve' | 'reject'
          reason?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'monthly' | 'yearly'
          status: 'active' | 'expired' | 'cancelled'
          started_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'monthly' | 'yearly'
          status?: 'active' | 'expired' | 'cancelled'
          started_at?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'monthly' | 'yearly'
          status?: 'active' | 'expired' | 'cancelled'
          started_at?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
