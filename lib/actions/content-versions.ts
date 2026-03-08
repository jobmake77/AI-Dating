'use server'

import { createClient } from '@/lib/supabase/server'

export interface ContentVersion {
  id: string
  content_id: string
  version_number: number
  title: string
  content: string
  excerpt: string | null
  cover_image: string | null
  tags: string[] | null
  created_by: string
  created_at: string
}

/**
 * Get all versions for a content
 */
export async function getContentVersions(contentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_versions')
    .select(`
      *,
      author:users!created_by(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('content_id', contentId)
    .order('version_number', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Get a specific version
 */
export async function getContentVersion(versionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_versions')
    .select(`
      *,
      author:users!created_by(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', versionId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Restore a version (create new version from old one)
 */
export async function restoreContentVersion(contentId: string, versionId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get the version to restore
  const { data: version, error: versionError } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId)
    .single()

  if (versionError || !version) {
    return { error: 'Version not found' }
  }

  // Check if user owns the content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .select('author_id')
    .eq('id', contentId)
    .single()

  if (contentError || !content) {
    return { error: 'Content not found' }
  }

  if (content.author_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Update content with version data
  const { error: updateError } = await supabase
    .from('contents')
    .update({
      title: version.title,
      content: version.content,
      excerpt: version.excerpt,
      cover_image: version.cover_image,
      tags: version.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

/**
 * Compare two versions
 */
export async function compareVersions(versionId1: string, versionId2: string) {
  const supabase = await createClient()

  const { data: version1, error: error1 } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId1)
    .single()

  const { data: version2, error: error2 } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId2)
    .single()

  if (error1 || error2 || !version1 || !version2) {
    return { error: 'Versions not found' }
  }

  return {
    data: {
      version1,
      version2,
      changes: {
        title: version1.title !== version2.title,
        content: version1.content !== version2.content,
        excerpt: version1.excerpt !== version2.excerpt,
        cover_image: version1.cover_image !== version2.cover_image,
        tags: JSON.stringify(version1.tags) !== JSON.stringify(version2.tags),
      },
    },
  }
}

/**
 * Manually create a version (for important milestones)
 */
export async function createManualVersion(contentId: string, note?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get current content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentId)
    .single()

  if (contentError || !content) {
    return { error: 'Content not found' }
  }

  if (content.author_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Get next version number
  const { data: versions } = await supabase
    .from('content_versions')
    .select('version_number')
    .eq('content_id', contentId)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

  // Create version
  const { data, error } = await supabase
    .from('content_versions')
    .insert({
      content_id: contentId,
      version_number: nextVersion,
      title: content.title,
      content: content.content,
      excerpt: content.excerpt,
      cover_image: content.cover_image,
      tags: content.tags,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}
