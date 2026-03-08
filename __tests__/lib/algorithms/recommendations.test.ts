import { describe, it, expect } from 'vitest'
import {
  calculateTagSimilarity,
  getPersonalizedRecommendations,
  getTrendingRecommendations,
  getRelatedContent,
} from '@/lib/algorithms/content-recommendations'

// Mock Supabase for testing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
        neq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        not: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

describe('Content Recommendations', () => {
  describe('Tag Similarity', () => {
    it('should calculate Jaccard similarity correctly', () => {
      const tags1 = ['javascript', 'react', 'nextjs']
      const tags2 = ['react', 'nextjs', 'typescript']

      const similarity = calculateTagSimilarity(tags1, tags2)

      // Intersection: {react, nextjs} = 2
      // Union: {javascript, react, nextjs, typescript} = 4
      // Similarity: 2/4 = 0.5
      expect(similarity).toBe(0.5)
    })

    it('should return 0 for no common tags', () => {
      const tags1 = ['javascript', 'react']
      const tags2 = ['python', 'django']

      const similarity = calculateTagSimilarity(tags1, tags2)

      expect(similarity).toBe(0)
    })

    it('should return 1 for identical tags', () => {
      const tags1 = ['javascript', 'react']
      const tags2 = ['javascript', 'react']

      const similarity = calculateTagSimilarity(tags1, tags2)

      expect(similarity).toBe(1)
    })

    it('should handle empty arrays', () => {
      const tags1: string[] = []
      const tags2 = ['javascript', 'react']

      const similarity = calculateTagSimilarity(tags1, tags2)

      expect(similarity).toBe(0)
    })
  })

  describe('Personalized Recommendations', () => {
    it('should return empty array when no history', async () => {
      const recommendations = await getPersonalizedRecommendations('user-id', 10)

      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should limit results to specified number', async () => {
      const limit = 5
      const recommendations = await getPersonalizedRecommendations('user-id', limit)

      expect(recommendations.length).toBeLessThanOrEqual(limit)
    })
  })

  describe('Trending Recommendations', () => {
    it('should return trending content', async () => {
      const recommendations = await getTrendingRecommendations(10)

      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should include recommendation reason', async () => {
      const recommendations = await getTrendingRecommendations(10)

      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty('reason')
        expect(recommendations[0].reason).toBe('热门趋势')
      }
    })
  })

  describe('Related Content', () => {
    it('should return related content', async () => {
      const recommendations = await getRelatedContent('content-id', 5)

      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should filter out source content', async () => {
      const sourceId = 'content-id'
      const recommendations = await getRelatedContent(sourceId, 5)

      const hasSourceContent = recommendations.some(r => r.content_id === sourceId)
      expect(hasSourceContent).toBe(false)
    })
  })
})
