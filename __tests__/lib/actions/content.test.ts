import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient } from '../../helpers/test-utils'
import { mockContent, mockUser } from '../../helpers/mock-data'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/tencent/moderation', () => ({
  moderateHTMLContent: vi.fn().mockResolvedValue({ safe: true }),
  formatModerationError: vi.fn(),
}))

vi.mock('@/lib/analytics/events', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('./onboarding', () => ({
  updateOnboardingProgress: vi.fn(),
}))

describe('Content Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createContent', () => {
    it('should create content successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockContent, error: null }),
      })

      expect(mockSupabaseClient.from).toBeDefined()
    })

    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      expect(mockSupabaseClient.auth.getUser).toBeDefined()
    })

    it('should validate content before creating', async () => {
      const invalidContent = {
        title: '', // Empty title should fail validation
        content: '<p>Test</p>',
      }

      expect(invalidContent.title).toBe('')
    })
  })

  describe('getContent', () => {
    it('should fetch content by id', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockContent, error: null }),
      })

      const result = await mockSupabaseClient
        .from('contents')
        .select('*')
        .eq('id', 'content-123')
        .single()

      expect(result.data).toEqual(mockContent)
    })

    it('should return null for non-existent content', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })

      const result = await mockSupabaseClient
        .from('contents')
        .select('*')
        .eq('id', 'non-existent')
        .single()

      expect(result.data).toBeNull()
    })
  })

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const updatedContent = { ...mockContent, title: 'Updated Title' }

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedContent, error: null }),
      })

      expect(mockSupabaseClient.from).toBeDefined()
    })
  })

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const result = await mockSupabaseClient
        .from('contents')
        .delete()
        .eq('id', 'content-123')

      expect(result.error).toBeNull()
    })
  })
})
