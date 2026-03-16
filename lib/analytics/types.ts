/**
 * Analytics Event Types
 * 定义所有可追踪的事件类型
 */

// 事件分类
export type EventCategory = 'user' | 'content' | 'api' | 'community' | 'onboarding'

// 用户相关事件
export type UserEvent =
  | 'user_signed_up'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'user_completed_profile'
  | 'user_updated_profile'
  | 'user_followed'
  | 'user_unfollowed'

// 内容相关事件
export type ContentEvent =
  | 'first_post_published'
  | 'post_published'
  | 'post_viewed'
  | 'post_liked'
  | 'post_unliked'
  | 'post_commented'
  | 'post_shared'
  | 'post_reposted'
  | 'post_deleted'
  | 'post_updated'

// API 相关事件
export type APIEvent =
  | 'api_key_created'
  | 'api_key_deleted'
  | 'api_called'
  | 'api_error'
  | 'agent_created'
  | 'agent_deleted'
  | 'agent_updated'

// 社区相关事件
export type CommunityEvent =
  | 'community_created'
  | 'community_joined'
  | 'community_left'
  | 'community_post_created'
  | 'event_created'
  | 'event_joined'
  | 'event_left'

// Onboarding 相关事件
export type OnboardingEvent =
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'

// 所有事件类型
export type AnalyticsEvent =
  | UserEvent
  | ContentEvent
  | APIEvent
  | CommunityEvent
  | OnboardingEvent

// 事件参数类型
export interface BaseEventParams {
  [key: string]: string | number | boolean | null | undefined
}

// 用户事件参数
export interface UserEventParams extends BaseEventParams {
  user_id?: string
  username?: string
  role?: string
  followed_user_id?: string
}

// 内容事件参数
export interface ContentEventParams extends BaseEventParams {
  content_id?: string
  content_title?: string
  content_type?: string
  author_id?: string
  is_first_post?: boolean
  view_duration?: number
  comment_id?: string
}

// API 事件参数
export interface APIEventParams extends BaseEventParams {
  api_key_id?: string
  agent_id?: string
  agent_name?: string
  endpoint?: string
  method?: string
  status_code?: number
  response_time?: number
  error_message?: string
}

// 社区事件参数
export interface CommunityEventParams extends BaseEventParams {
  community_id?: string
  community_name?: string
  event_id?: string
  event_title?: string
  post_id?: string
}

// Onboarding 事件参数
export interface OnboardingEventParams extends BaseEventParams {
  step_name?: string
  step_number?: number
  total_steps?: number
  skip_reason?: string
}

// 事件数据结构
export interface AnalyticsEventData {
  event_name: AnalyticsEvent
  event_category: EventCategory
  user_id?: string
  session_id?: string
  event_params?: BaseEventParams
  user_agent?: string
  ip_address?: string
  referrer?: string
  page_url?: string
}

// 事件到分类的映射
export const EVENT_CATEGORY_MAP: Record<AnalyticsEvent, EventCategory> = {
  // User events
  user_signed_up: 'user',
  user_logged_in: 'user',
  user_logged_out: 'user',
  user_completed_profile: 'user',
  user_updated_profile: 'user',
  user_followed: 'user',
  user_unfollowed: 'user',

  // Content events
  first_post_published: 'content',
  post_published: 'content',
  post_viewed: 'content',
  post_liked: 'content',
  post_unliked: 'content',
  post_commented: 'content',
  post_shared: 'content',
  post_reposted: 'content',
  post_deleted: 'content',
  post_updated: 'content',

  // API events
  api_key_created: 'api',
  api_key_deleted: 'api',
  api_called: 'api',
  api_error: 'api',
  agent_created: 'api',
  agent_deleted: 'api',
  agent_updated: 'api',

  // Community events
  community_created: 'community',
  community_joined: 'community',
  community_left: 'community',
  community_post_created: 'community',
  event_created: 'community',
  event_joined: 'community',
  event_left: 'community',

  // Onboarding events
  onboarding_started: 'onboarding',
  onboarding_step_completed: 'onboarding',
  onboarding_completed: 'onboarding',
  onboarding_skipped: 'onboarding',
}
