// 用户引导相关类型定义

export interface OnboardingProgress {
  user_id: string
  completed_profile: boolean
  first_post_published: boolean
  explored_content: boolean
  checked_membership: boolean
  tour_completed: boolean
  tour_skipped: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: string
  href?: string
}

export type OnboardingStepKey =
  | 'completed_profile'
  | 'first_post_published'
  | 'explored_content'
  | 'checked_membership'
