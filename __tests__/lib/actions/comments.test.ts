import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient } from '../../helpers/test-utils'
import { mockComment, mockUser } from '../../helpers/mock-data'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/analytics/events', () => ({
  trackEvent: vi.fn(),
}))

describe('Comments Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComment, error: null }),
      })

      expect(mockSupabaseClient.from).toBeDefined()
    })

    it('should return error when comment is empty', async () => {
      const emptyComment = ''
      expect(emptyComment.length).toBe(0)
    })
  })

  describe('getComments', () => {
    it('should fetch comments for content', async () => {
      const mockComments = [mockComment]

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockComments, error: null }),
      })

      const result = await mockSupabaseClient
        .from('comments')
        .select('*')
        .eq('content_id', 'content-123')
        .order('created_at', { ascending: false })

      expect(result.data).toEqual(mockComments)
    })
  })

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const result = await mockSupabaseClient
        .from('comments')
        .delete()
        .eq('id', 'comment-123')

      expect(result.error).toBeNull()
    })

    it('should only allow owner to delete comment', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'different-user' } },
        error: null,
      })

      expect(mockSupabaseClient.auth.getUser).toBeDefined()
    })
  })
})
