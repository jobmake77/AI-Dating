'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/utils/logger'

// Helper to extract slug from Supabase join result (can be object or array)
function getSlug(community: any): string | null {
  if (!community) return null
  if (Array.isArray(community)) return community[0]?.slug ?? null
  return community.slug ?? null
}

// =====================================================
// Validation Schemas
// =====================================================

const createPostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000),
  images: z.array(z.string().url()).optional(),
})

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  images: z.array(z.string().url()).optional(),
})

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
})

// =====================================================
// Post CRUD Operations
// =====================================================

export async function createCommunityPost(communityId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证用户是否是社区成员
    const { data: member } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return { success: false, error: '只有社区成员可以发帖' }
    }

    // 验证表单数据
    const data = {
      title: formData.get('title') as string | undefined,
      content: formData.get('content') as string,
      images: formData.get('images') ? JSON.parse(formData.get('images') as string) : undefined,
    }

    const validatedData = createPostSchema.parse(data)

    // 创建帖子
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        author_id: user.id,
        ...validatedData,
      })
      .select(`
        *,
        author:users!community_posts_author_id_fkey(id, username, display_name, avatar_url),
        community:communities!community_posts_community_id_fkey(id, slug, name)
      `)
      .single()

    if (error) {
      logger.error('创建帖子失败:', error)
      return { success: false, error: '创建帖子失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}`)
    }
    return { success: true, data: post }
  } catch (error) {
    logger.error('创建帖子错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: '表单数据验证失败' }
    }
    return { success: false, error: '创建帖子失败' }
  }
}

export async function updateCommunityPost(postId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 获取帖子信息
    const { data: post } = await supabase
      .from('community_posts')
      .select('author_id, community_id, community:communities!community_posts_community_id_fkey(slug)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: '帖子不存在' }
    }

    // 验证用户权限（必须是作者或管理员/版主）
    const isAuthor = post.author_id === user.id
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', post.community_id)
      .eq('user_id', user.id)
      .single()

    const canEdit = isAuthor || (member && ['admin', 'moderator'].includes(member.role))

    if (!canEdit) {
      return { success: false, error: '没有权限编辑此帖子' }
    }

    // 验证表单数据
    const data: any = {}
    if (formData.get('title') !== null) data.title = formData.get('title')
    if (formData.get('content')) data.content = formData.get('content')
    if (formData.get('images')) data.images = JSON.parse(formData.get('images') as string)

    const validatedData = updatePostSchema.parse(data)

    // 更新帖子
    const { data: updatedPost, error } = await supabase
      .from('community_posts')
      .update(validatedData)
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      logger.error('更新帖子失败:', error)
      return { success: false, error: '更新帖子失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}`)
      const _slug2 = getSlug(post.community); if (_slug2) revalidatePath(`/communities/${_slug2}/posts/${postId}`)
    }
    return { success: true, data: updatedPost }
  } catch (error) {
    logger.error('更新帖子错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: '表单数据验证失败' }
    }
    return { success: false, error: '更新帖子失败' }
  }
}

export async function deleteCommunityPost(postId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 获取帖子信息
    const { data: post } = await supabase
      .from('community_posts')
      .select('author_id, community_id, community:communities!community_posts_community_id_fkey(slug)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: '帖子不存在' }
    }

    // 验证用户权限（必须是作者或管理员/版主）
    const isAuthor = post.author_id === user.id
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', post.community_id)
      .eq('user_id', user.id)
      .single()

    const canDelete = isAuthor || (member && ['admin', 'moderator'].includes(member.role))

    if (!canDelete) {
      return { success: false, error: '没有权限删除此帖子' }
    }

    // 删除帖子
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      logger.error('删除帖子失败:', error)
      return { success: false, error: '删除帖子失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}`)
    }
    return { success: true }
  } catch (error) {
    logger.error('删除帖子错误:', error)
    return { success: false, error: '删除帖子失败' }
  }
}

// =====================================================
// Post Interaction Operations
// =====================================================

export async function togglePostLike(postId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('community_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // 取消点赞
      const { error } = await supabase
        .from('community_post_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        logger.error('取消点赞失败:', error)
        return { success: false, error: '取消点赞失败' }
      }

      return { success: true, liked: false }
    } else {
      // 点赞
      const { error } = await supabase
        .from('community_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        })

      if (error) {
        logger.error('点赞失败:', error)
        return { success: false, error: '点赞失败' }
      }

      return { success: true, liked: true }
    }
  } catch (error) {
    logger.error('切换点赞错误:', error)
    return { success: false, error: '操作失败' }
  }
}

export async function togglePostPin(postId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 获取帖子信息
    const { data: post } = await supabase
      .from('community_posts')
      .select('is_pinned, community_id, community:communities!community_posts_community_id_fkey(slug)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: '帖子不存在' }
    }

    // 验证用户权限（必须是管理员或版主）
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', post.community_id)
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'moderator'].includes(member.role)) {
      return { success: false, error: '没有权限置顶帖子' }
    }

    // 切换置顶状态
    const { error } = await supabase
      .from('community_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', postId)

    if (error) {
      logger.error('切换置顶状态失败:', error)
      return { success: false, error: '操作失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}`)
      const _slug2 = getSlug(post.community); if (_slug2) revalidatePath(`/communities/${_slug2}/posts/${postId}`)
    }
    return { success: true, pinned: !post.is_pinned }
  } catch (error) {
    logger.error('切换置顶状态错误:', error)
    return { success: false, error: '操作失败' }
  }
}

export async function togglePostLock(postId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 获取帖子信息
    const { data: post } = await supabase
      .from('community_posts')
      .select('is_locked, community_id, community:communities!community_posts_community_id_fkey(slug)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: '帖子不存在' }
    }

    // 验证用户权限（必须是管理员或版主）
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', post.community_id)
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'moderator'].includes(member.role)) {
      return { success: false, error: '没有权限锁定帖子' }
    }

    // 切换锁定状态
    const { error } = await supabase
      .from('community_posts')
      .update({ is_locked: !post.is_locked })
      .eq('id', postId)

    if (error) {
      logger.error('切换锁定状态失败:', error)
      return { success: false, error: '操作失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}`)
      const _slug2 = getSlug(post.community); if (_slug2) revalidatePath(`/communities/${_slug2}/posts/${postId}`)
    }
    return { success: true, locked: !post.is_locked }
  } catch (error) {
    logger.error('切换锁定状态错误:', error)
    return { success: false, error: '操作失败' }
  }
}

// =====================================================
// Comment Operations
// =====================================================

export async function createPostComment(postId: string, content: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查帖子是否被锁定
    const { data: post } = await supabase
      .from('community_posts')
      .select('is_locked, community:communities!community_posts_community_id_fkey(slug)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: '帖子不存在' }
    }

    if (post.is_locked) {
      return { success: false, error: '帖子已被锁定，无法评论' }
    }

    // 验证内容
    const validatedData = createCommentSchema.parse({ content })

    // 创建评论
    const { data: comment, error } = await supabase
      .from('community_post_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: validatedData.content,
      })
      .select(`
        *,
        author:users!community_post_comments_author_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('创建评论失败:', error)
      return { success: false, error: '创建评论失败' }
    }

    // 重新验证路径
    if (post.community) {
      const _slug = getSlug(post.community); if (_slug) revalidatePath(`/communities/${_slug}/posts/${postId}`)
    }
    return { success: true, data: comment }
  } catch (error) {
    logger.error('创建评论错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: '评论内容验证失败' }
    }
    return { success: false, error: '创建评论失败' }
  }
}

export async function deletePostComment(commentId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 获取评论信息
    const { data: comment } = await supabase
      .from('community_post_comments')
      .select(`
        author_id,
        post:community_posts!community_post_comments_post_id_fkey(
          id,
          community_id,
          community:communities!community_posts_community_id_fkey(slug)
        )
      `)
      .eq('id', commentId)
      .single()

    if (!comment || !comment.post) {
      return { success: false, error: '评论不存在' }
    }

    const postData = Array.isArray(comment.post) ? comment.post[0] : comment.post as any

    // 验证用户权限（必须是作者或管理员/版主）
    const isAuthor = comment.author_id === user.id
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', postData.community_id)
      .eq('user_id', user.id)
      .single()

    const canDelete = isAuthor || (member && ['admin', 'moderator'].includes(member.role))

    if (!canDelete) {
      return { success: false, error: '没有权限删除此评论' }
    }

    // 删除评论
    const { error } = await supabase
      .from('community_post_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      logger.error('删除评论失败:', error)
      return { success: false, error: '删除评论失败' }
    }

    // 重新验证路径
    if (postData.community) {
      const _slug = getSlug(postData.community); if (_slug) revalidatePath(`/communities/${_slug}/posts/${postData.id}`)
    }
    return { success: true }
  } catch (error) {
    logger.error('删除评论错误:', error)
    return { success: false, error: '删除评论失败' }
  }
}
