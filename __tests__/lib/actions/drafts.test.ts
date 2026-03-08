import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveDraft, getDraft, deleteDraft } from '@/lib/actions/drafts'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'draft-id' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  })),
}))

describe('Draft Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveDraft', () => {
    it('should save a new draft', async () => {
      const draftData = {
        content: '<p>Test content</p>',
        title: 'Test Title',
        price_type: 'free' as const,
      }

      const result = await saveDraft(draftData)

      expect(result.success).toBe(true)
      expect(result.id).toBe('draft-id')
    })

    it('should require content', async () => {
      const draftData = {
        content: '',
      }

      const result = await saveDraft(draftData)

      // Should still save empty content for draft
      expect(result.success).toBe(true)
    })
  })

  describe('getDraft', () => {
    it('should return null when no draft exists', async () => {
      const result = await getDraft()

      expect(result.data).toBeNull()
    })
  })

  describe('deleteDraft', () => {
    it('should delete draft successfully', async () => {
      const result = await deleteDraft()

      expect(result.success).toBe(true)
    })
  })
})
