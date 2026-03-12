'use server'

/**
 * User Preferences Actions
 * Server actions for managing user theme and UI preferences
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ThemePreferences } from '@/types/theme'
import { Locale } from '@/i18n/config'
import { z } from 'zod'

export interface UserPreferences extends ThemePreferences {
  locale: Locale
  reduceMotion: boolean
  keyboardShortcutsEnabled: boolean
}

// Validation schema
const userPreferencesSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']).optional(),
  color: z.string().max(50, '颜色值过长').optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  highContrast: z.boolean().optional(),
  locale: z.enum(['zh', 'en']).optional(),
  reduceMotion: z.boolean().optional(),
  keyboardShortcutsEnabled: z.boolean().optional(),
})

/**
 * Get user preferences from database
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    mode: data.theme_mode,
    color: data.theme_color,
    fontSize: data.font_size,
    highContrast: data.high_contrast,
    locale: data.locale,
    reduceMotion: data.reduce_motion,
    keyboardShortcutsEnabled: data.keyboard_shortcuts_enabled,
  }
}

/**
 * Update user preferences in database
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<{ success: boolean; error?: string }> {
  // Validate input
  const validation = userPreferencesSchema.safeParse(preferences)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const updateData: Record<string, unknown> = {}

  if (preferences.mode !== undefined) {
    updateData.theme_mode = preferences.mode
  }
  if (preferences.color !== undefined) {
    updateData.theme_color = preferences.color
  }
  if (preferences.fontSize !== undefined) {
    updateData.font_size = preferences.fontSize
  }
  if (preferences.highContrast !== undefined) {
    updateData.high_contrast = preferences.highContrast
  }
  if (preferences.locale !== undefined) {
    updateData.locale = preferences.locale
  }
  if (preferences.reduceMotion !== undefined) {
    updateData.reduce_motion = preferences.reduceMotion
  }
  if (preferences.keyboardShortcutsEnabled !== undefined) {
    updateData.keyboard_shortcuts_enabled = preferences.keyboardShortcutsEnabled
  }

  // Try to update existing preferences
  const { error: updateError } = await supabase
    .from('user_preferences')
    .update(updateData)
    .eq('user_id', user.id)

  // If no rows were updated, insert new preferences
  if (updateError) {
    const { error: insertError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        ...updateData,
      })

    if (insertError) {
      console.error('Failed to insert user preferences:', insertError)
      return { success: false, error: insertError.message }
    }
  }

  revalidatePath('/settings')
  return { success: true }
}

/**
 * Reset user preferences to defaults
 */
export async function resetUserPreferences(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to reset user preferences:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
