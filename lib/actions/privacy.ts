"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from 'zod'

export interface UserDataExport {
  user: any
  profile: any
  contents: any[]
  comments: any[]
  likes: any[]
  follows: any[]
  communities: any[]
  events: any[]
  messages: any[]
  notifications: any[]
}

// Validation schema
const userIdSchema = z.string().uuid('无效的用户ID')

/**
 * Export all user data in JSON format (GDPR compliance)
 */
export async function exportUserData(userId: string): Promise<{ success: boolean; data?: UserDataExport; error?: string }> {
  // Validate input
  const validation = userIdSchema.safeParse(userId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()

    // Get user basic info
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user || user.user.id !== userId) {
      return { success: false, error: "未授权访问" }
    }

    // Get profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    // Get contents
    const { data: contents } = await supabase
      .from("contents")
      .select("*")
      .eq("author_id", userId)

    // Get comments
    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("user_id", userId)

    // Get likes
    const { data: likes } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)

    // Get follows
    const { data: follows } = await supabase
      .from("follows")
      .select("*")
      .or(`follower_id.eq.${userId},following_id.eq.${userId}`)

    // Get communities
    const { data: communities } = await supabase
      .from("community_members")
      .select("*, communities(*)")
      .eq("user_id", userId)

    // Get events
    const { data: events } = await supabase
      .from("event_participants")
      .select("*, events(*)")
      .eq("user_id", userId)

    // Get messages (sent)
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", userId)

    // Get notifications
    const { data: notifications } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)

    const exportData: UserDataExport = {
      user: {
        id: user.user.id,
        email: user.user.email,
        created_at: user.user.created_at,
      },
      profile: profile || {},
      contents: contents || [],
      comments: comments || [],
      likes: likes || [],
      follows: follows || [],
      communities: communities || [],
      events: events || [],
      messages: messages || [],
      notifications: notifications || [],
    }

    // Log export request
    await supabase.from("data_export_requests").insert({
      user_id: userId,
      status: "completed",
      completed_at: new Date().toISOString(),
    })

    return { success: true, data: exportData }
  } catch (error) {
    console.error("Error exporting user data:", error)
    return { success: false, error: "导出数据失败" }
  }
}

/**
 * Request account deletion (soft delete with anonymization)
 */
export async function requestAccountDeletion(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Verify user
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user || user.user.id !== userId) {
      return { success: false, error: "未授权访问" }
    }

    // Create deletion request
    const { error: requestError } = await supabase
      .from("account_deletion_requests")
      .insert({
        user_id: userId,
        reason: reason || null,
        status: "pending",
        requested_at: new Date().toISOString(),
      })

    if (requestError) {
      return { success: false, error: "创建删除请求失败" }
    }

    // Anonymize user data (soft delete)
    const anonymousEmail = `deleted_${userId}@anonymous.local`
    const anonymousUsername = `deleted_user_${userId.substring(0, 8)}`

    // Update profile
    await supabase
      .from("users")
      .update({
        username: anonymousUsername,
        full_name: "已删除用户",
        bio: null,
        avatar: null,
        github_url: null,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", userId)

    // Soft delete contents (mark as deleted but keep for audit)
    await supabase
      .from("contents")
      .update({
        title: "[已删除]",
        content: "[此内容已被作者删除]",
        deleted_at: new Date().toISOString(),
      })
      .eq("author_id", userId)

    // Delete comments
    await supabase
      .from("comments")
      .update({
        content: "[已删除]",
        deleted_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    // Mark deletion request as completed
    await supabase
      .from("account_deletion_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("status", "pending")

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error deleting account:", error)
    return { success: false, error: "删除账户失败" }
  }
}

/**
 * Get user privacy settings
 */
export async function getUserPrivacySettings(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_privacy_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return {
      success: true,
      data: data || {
        user_id: userId,
        profile_visibility: "public",
        show_email: false,
        show_location: false,
        allow_messages: true,
        allow_notifications: true,
      },
    }
  } catch (error) {
    console.error("Error getting privacy settings:", error)
    return { success: false, error: "获取隐私设置失败" }
  }
}

/**
 * Update user privacy settings
 */
export async function updateUserPrivacySettings(
  userId: string,
  settings: {
    profile_visibility?: "public" | "private" | "followers_only"
    show_email?: boolean
    show_location?: boolean
    allow_messages?: boolean
    allow_notifications?: boolean
  }
) {
  try {
    const supabase = await createClient()

    // Verify user
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user || user.user.id !== userId) {
      return { success: false, error: "未授权访问" }
    }

    const { error } = await supabase
      .from("user_privacy_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw error
    }

    revalidatePath("/settings/privacy")

    return { success: true }
  } catch (error) {
    console.error("Error updating privacy settings:", error)
    return { success: false, error: "更新隐私设置失败" }
  }
}
