import { createClient } from '@/lib/supabase/server'
import { normalizeSingleRelation } from '@/lib/utils/normalize'

export interface RecommendationScore {
  content_id: string
  score: number
  reason: string
}

interface ReadingHistoryContent {
  id: string
  tags: string[] | null
  category: string | null
  author_id: string | null
}

interface ReadingHistoryItem {
  content_id: string
  read_percentage: number
  contents: ReadingHistoryContent | ReadingHistoryContent[] | null
}

/**
 * Calculate content similarity based on tags
 */
export function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) {
    return 0
  }

  const set1 = new Set(tags1)
  const set2 = new Set(tags2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))

  // Jaccard similarity
  const union = new Set([...set1, ...set2])
  return intersection.size / union.size
}

/**
 * Get personalized content recommendations based on user's reading history
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationScore[]> {
  const supabase = await createClient()

  // Get user's reading history
  const { data: history } = await supabase
    .from('reading_history')
    .select(`
      content_id,
      read_percentage,
      contents:content_id (
        id,
        tags,
        category,
        author_id
      )
    `)
    .eq('user_id', userId)
    .gte('read_percentage', 50) // Only consider content they actually read
    .order('updated_at', { ascending: false })
    .limit(20)

  if (!history || history.length === 0) {
    // No history, return trending content
    return getTrendingRecommendations(limit)
  }

  // Extract tags and categories from reading history
  const readTags = new Set<string>()
  const readCategories = new Set<string>()
  const readAuthors = new Set<string>()
  const readContentIds = new Set<string>()

  ;(history as ReadingHistoryItem[]).forEach((item) => {
    const content = normalizeSingleRelation(item.contents)
    if (content) {
      readContentIds.add(content.id)
      if (content.tags) {
        content.tags.forEach((tag) => readTags.add(tag))
      }
      if (content.category) {
        readCategories.add(content.category)
      }
      if (content.author_id) {
        readAuthors.add(content.author_id)
      }
    }
  })

  // Get candidate content (not already read)
  const { data: candidates } = await supabase
    .from('contents')
    .select('id, title, tags, category, author_id, likes_count, views, created_at')
    .eq('status', 'approved')
    .not('id', 'in', `(${Array.from(readContentIds).join(',')})`)
    .limit(100)

  if (!candidates || candidates.length === 0) {
    return []
  }

  // Calculate scores for each candidate
  const scores: RecommendationScore[] = candidates.map((content) => {
    let score = 0
    const reasons: string[] = []

    // Tag similarity (weight: 0.4)
    if (content.tags && content.tags.length > 0) {
      const tagSimilarity = calculateTagSimilarity(
        Array.from(readTags),
        content.tags
      )
      score += tagSimilarity * 0.4
      if (tagSimilarity > 0.3) {
        reasons.push('相似标签')
      }
    }

    // Category match (weight: 0.2)
    if (content.category && readCategories.has(content.category)) {
      score += 0.2
      reasons.push('相同分类')
    }

    // Same author (weight: 0.15)
    if (content.author_id && readAuthors.has(content.author_id)) {
      score += 0.15
      reasons.push('喜欢的作者')
    }

    // Popularity (weight: 0.15)
    const popularityScore = Math.min(
      (content.likes_count || 0) / 100 + (content.views || 0) / 1000,
      1
    )
    score += popularityScore * 0.15
    if (popularityScore > 0.5) {
      reasons.push('热门内容')
    }

    // Recency (weight: 0.1)
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    const recencyScore = Math.max(0, 1 - daysSinceCreation / 30)
    score += recencyScore * 0.1
    if (recencyScore > 0.7) {
      reasons.push('最新发布')
    }

    return {
      content_id: content.id,
      score,
      reason: reasons.join(', ') || '为你推荐',
    }
  })

  // Sort by score and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Get trending content recommendations
 */
export async function getTrendingRecommendations(
  limit: number = 10
): Promise<RecommendationScore[]> {
  const supabase = await createClient()

  // Get trending content (high engagement in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trending } = await supabase
    .from('contents')
    .select('id, likes_count, views, comments_count, created_at')
    .eq('status', 'approved')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('likes_count', { ascending: false })
    .limit(limit)

  if (!trending || trending.length === 0) {
    return []
  }

  return trending.map((content) => ({
    content_id: content.id,
    score: 1.0,
    reason: '热门趋势',
  }))
}

/**
 * Get related content based on a specific content
 */
export async function getRelatedContent(
  contentId: string,
  limit: number = 5
): Promise<RecommendationScore[]> {
  const supabase = await createClient()

  // Get the source content
  const { data: sourceContent } = await supabase
    .from('contents')
    .select('id, tags, category, author_id')
    .eq('id', contentId)
    .single()

  if (!sourceContent) {
    return []
  }

  // Get candidate content
  const { data: candidates } = await supabase
    .from('contents')
    .select('id, tags, category, author_id, likes_count, views')
    .eq('status', 'approved')
    .neq('id', contentId)
    .limit(50)

  if (!candidates || candidates.length === 0) {
    return []
  }

  // Calculate scores
  const scores: RecommendationScore[] = candidates.map((content) => {
    let score = 0
    const reasons: string[] = []

    // Tag similarity (weight: 0.5)
    if (sourceContent.tags && content.tags) {
      const tagSimilarity = calculateTagSimilarity(sourceContent.tags, content.tags)
      score += tagSimilarity * 0.5
      if (tagSimilarity > 0.3) {
        reasons.push('相似内容')
      }
    }

    // Category match (weight: 0.3)
    if (sourceContent.category === content.category) {
      score += 0.3
      reasons.push('相同分类')
    }

    // Same author (weight: 0.2)
    if (sourceContent.author_id === content.author_id) {
      score += 0.2
      reasons.push('同一作者')
    }

    return {
      content_id: content.id,
      score,
      reason: reasons.join(', ') || '相关推荐',
    }
  })

  // Sort by score and return top N
  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Track reading history
 */
export async function trackReadingHistory(
  userId: string,
  contentId: string,
  readDuration: number,
  readPercentage: number
) {
  const supabase = await createClient()

  // Upsert reading history
  const { error } = await supabase
    .from('reading_history')
    .upsert(
      {
        user_id: userId,
        content_id: contentId,
        read_duration: readDuration,
        read_percentage: readPercentage,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,content_id',
      }
    )

  if (error) {
    console.error('Failed to track reading history:', error)
    return { error: error.message }
  }

  return { success: true }
}
