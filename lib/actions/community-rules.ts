'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

const communityRuleSchema = z.object({
  id: z.string().uuid().optional(),
  communityId: z.string().uuid('无效的社区 ID'),
  ruleText: z.string().trim().min(2, '规则内容至少 2 个字符').max(200, '规则内容过长'),
  sortOrder: z.number().int().min(0, '排序不能小于 0').max(9999, '排序值过大'),
  isActive: z.boolean(),
})

const deleteCommunityRuleSchema = z.object({
  ruleId: z.string().uuid('无效的规则 ID'),
})

async function revalidateCommunityRulePaths(communityId: string) {
  const supabase = await createClient()
  const { data: community } = await supabase
    .from('communities')
    .select('slug')
    .eq('id', communityId)
    .single()

  revalidatePath('/admin/community-rules')
  revalidatePath('/communities/[slug]', 'page')

  if (community?.slug) {
    revalidatePath(`/communities/${community.slug}`)
  }
}

export async function saveCommunityRule(formData: FormData) {
  await requireAdmin()

  const rawSortOrder = Number(formData.get('sort_order') || 0)
  const validation = communityRuleSchema.safeParse({
    id: formData.get('id')?.toString().trim() || undefined,
    communityId: formData.get('community_id')?.toString(),
    ruleText: formData.get('rule_text')?.toString() || '',
    sortOrder: Number.isFinite(rawSortOrder) ? rawSortOrder : 0,
    isActive: formData.get('is_active') === 'on',
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '社区规则数据不合法')
  }

  const supabase = await createClient()
  const payload = {
    community_id: validation.data.communityId,
    rule_text: validation.data.ruleText,
    sort_order: validation.data.sortOrder,
    is_active: validation.data.isActive,
    updated_at: new Date().toISOString(),
  }

  if (validation.data.id) {
    const { error: updateError } = await supabase
      .from('community_rules')
      .update(payload)
      .eq('id', validation.data.id)

    if (updateError) {
      logger.error('Failed to update community rule:', updateError)
      throw new Error(updateError.message)
    }
  } else {
    const { error: insertError } = await supabase
      .from('community_rules')
      .insert(payload)

    if (insertError) {
      logger.error('Failed to create community rule:', insertError)
      throw new Error(insertError.message)
    }
  }

  await revalidateCommunityRulePaths(validation.data.communityId)
}

export async function deleteCommunityRule(formData: FormData) {
  await requireAdmin()

  const validation = deleteCommunityRuleSchema.safeParse({
    ruleId: formData.get('rule_id')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '删除参数不合法')
  }

  const supabase = await createClient()
  const { data: rule, error: ruleError } = await supabase
    .from('community_rules')
    .select('id, community_id')
    .eq('id', validation.data.ruleId)
    .single()

  if (ruleError || !rule) {
    logger.error('Failed to load community rule before deletion:', ruleError)
    throw new Error('社区规则不存在')
  }

  const { error: deleteError } = await supabase
    .from('community_rules')
    .delete()
    .eq('id', validation.data.ruleId)

  if (deleteError) {
    logger.error('Failed to delete community rule:', deleteError)
    throw new Error(deleteError.message)
  }

  await revalidateCommunityRulePaths(rule.community_id)
}
