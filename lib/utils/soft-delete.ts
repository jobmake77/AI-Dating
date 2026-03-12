/**
 * Soft Delete Utilities
 * Helper functions for implementing soft delete in queries
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Add soft delete filter to a query
 * Excludes records where deleted_at IS NOT NULL
 */
export function excludeDeleted<T>(query: any): any {
  return query.is('deleted_at', null)
}

/**
 * Soft delete a content
 */
export async function softDeleteContent(
  supabase: SupabaseClient,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('contents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contentId)
    .is('deleted_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Soft delete a comment
 */
export async function softDeleteComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .is('deleted_at', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Restore a soft-deleted content
 */
export async function restoreContent(
  supabase: SupabaseClient,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('contents')
    .update({ deleted_at: null })
    .eq('id', contentId)
    .not('deleted_at', 'is', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Restore a soft-deleted comment
 */
export async function restoreComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: null })
    .eq('id', commentId)
    .not('deleted_at', 'is', null)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Permanently delete a content (hard delete)
 * Should only be used by admins or for data cleanup
 */
export async function hardDeleteContent(
  supabase: SupabaseClient,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', contentId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Permanently delete a comment (hard delete)
 * Should only be used by admins or for data cleanup
 */
export async function hardDeleteComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
