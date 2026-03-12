'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { OnboardingProgress } from '@/types/onboarding'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.debug('No user authenticated')
      return null
    }

    logger.debug('Fetching onboarding progress for user:', user.id)

    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.debug('Onboarding query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      // 如果记录不存在，创建一个新记录
      if (error.code === 'PGRST116') {
        logger.info('Creating new onboarding record for user:', user.id)

        const { data: newRecord, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            completed_profile: false,
            first_post_published: false,
            explored_content: false,
            checked_membership: false,
            tour_completed: false,
            tour_skipped: false,
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Failed to create onboarding progress:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          })
          return null
        }

        logger.info('Successfully created onboarding record')
        return newRecord
      }

      logger.error('Failed to fetch onboarding progress:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return null
    }

    logger.debug('Successfully fetched onboarding progress')
    return data
  } catch (error) {
    logger.error('Error in getOnboardingProgress:', error)
    return null
  }
}

export async function updateOnboardingProgress(updates: {
  completed_profile?: boolean
  first_post_published?: boolean
  explored_content?: boolean
  checked_membership?: boolean
}) {
  // Validate input - all fields must be boolean if provided
  const schema = z.object({
    completed_profile: z.boolean().optional(),
    first_post_published: z.boolean().optional(),
    explored_content: z.boolean().optional(),
    checked_membership: z.boolean().optional(),
  })

  const validation = schema.safeParse(updates)
  if (!validation.success) {
    logger.error('Invalid onboarding updates:', validation.error)
    return
  }

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Attempted to update onboarding progress without authentication')
      return
    }

    // 首先确保记录存在
    const { data: existing } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      // 创建新记录
      await supabase
        .from('user_onboarding')
        .insert({
          user_id: user.id,
          ...updates,
        })
    } else {
      // 更新现有记录
      await supabase
        .from('user_onboarding')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    revalidatePath('/')
    revalidatePath('/settings')
  } catch (error) {
    logger.error('Failed to update onboarding progress:', error)
  }
}

export async function completeOnboarding() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Attempted to complete onboarding without authentication')
      return
    }

    const { error } = await supabase
      .from('user_onboarding')
      .update({
        tour_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to complete onboarding:', error)
      return
    }

    revalidatePath('/')
  } catch (error) {
    logger.error('Error in completeOnboarding:', error)
  }
}

export async function skipOnboarding() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Attempted to skip onboarding without authentication')
      return
    }

    const { error } = await supabase
      .from('user_onboarding')
      .update({
        tour_skipped: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to skip onboarding:', error)
      return
    }

    revalidatePath('/')
  } catch (error) {
    logger.error('Error in skipOnboarding:', error)
  }
}

export async function restartOnboarding() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Attempted to restart onboarding without authentication')
      return
    }

    const { error } = await supabase
      .from('user_onboarding')
      .update({
        tour_completed: false,
        tour_skipped: false,
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to restart onboarding:', error)
      return
    }

    revalidatePath('/')
  } catch (error) {
    logger.error('Error in restartOnboarding:', error)
  }
}
