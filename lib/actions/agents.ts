'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schemas
const agentNameSchema = z.string().min(1, 'Agent 名称不能为空').max(50, 'Agent 名称过长')
const agentIdSchema = z.string().uuid('无效的 Agent ID')

export async function getUserAgents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_agents')
    .select('id, name, api_key, status, last_used_at, created_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return data || []
}

export async function createAgent(name: string) {
  // Validate input
  const validation = agentNameSchema.safeParse(name)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }

  // 检查数量限制
  const { count } = await supabase
    .from('user_agents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  if ((count ?? 0) >= 2) return { error: '最多创建 2 个 Agent' }

  const { data, error } = await supabase
    .from('user_agents')
    .insert({ user_id: user.id, name: name.trim() })
    .select('id, name, api_key, status, last_used_at, created_at')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/u/`)
  return { data }
}

export async function deleteAgent(agentId: string) {
  // Validate input
  const validation = agentIdSchema.safeParse(agentId)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }

  const { error } = await supabase
    .from('user_agents')
    .delete()
    .eq('id', agentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/u/`)
  return { success: true }
}
