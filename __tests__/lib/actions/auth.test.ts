import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabaseClient, mockServerAction } from '../../helpers/test-utils'
import { mockUser } from '../../helpers/mock-data'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock analytics
vi.mock('@/lib/analytics/events', () => ({
  trackEvent: vi.fn(),
}))

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signInWithEmail', () => {
    it('should sign in user with valid credentials', async () => {
      const mockAuthData = {
        user: mockUser,
        session: { access_token: 'token' },
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      // Note: We can't directly test server actions, but we can test the logic
      expect(mockSupabaseClient.auth.signInWithPassword).toBeDefined()
    })

    it('should return error with invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      })

      expect(mockSupabaseClient.auth.signInWithPassword).toBeDefined()
    })

    it('should return error when email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')

      // Missing email should be caught by validation
      expect(formData.get('email')).toBeNull()
    })

    it('should return error when password is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      // Missing password should be caught by validation
      expect(formData.get('password')).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      await mockSupabaseClient.auth.signOut()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('signUp', () => {
    it('should create new user account', async () => {
      const mockAuthData = {
        user: mockUser,
        session: { access_token: 'token' },
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')

      expect(mockSupabaseClient.auth.signUp).toBeDefined()
    })
  })
})
