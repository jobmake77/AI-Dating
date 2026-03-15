import { beforeEach, describe, expect, it, vi } from 'vitest'

import { signInWithEmail, signInWithGitHub, signUpWithEmail, sendPasswordReset } from '@/lib/actions/auth'
import { mockUser } from '../../helpers/mock-data'
import { mockSupabaseClient } from '../../helpers/test-utils'

const redirectMock = vi.hoisted(() => vi.fn())
const revalidatePathMock = vi.hoisted(() => vi.fn())
const trackEventMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/analytics/events', () => ({
  trackEvent: trackEventMock,
}))

function createChain(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    ...overrides,
  }
}

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`)
    })
  })

  describe('signInWithEmail', () => {
    it('returns a validation error when email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')

      await expect(signInWithEmail(formData)).resolves.toEqual(
        expect.objectContaining({
          error: expect.any(String),
        })
      )
    })

    it('creates a profile for first-time email sign in and redirects home', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            ...mockUser,
            email: 'first@example.com',
            user_metadata: {},
          },
          session: { access_token: 'token' },
        },
        error: null,
      })

      const lookupById = createChain({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
      const lookupByUsername = createChain({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
      const insertUser = createChain({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })

      mockSupabaseClient.from
        .mockReturnValueOnce(lookupById)
        .mockReturnValueOnce(lookupByUsername)
        .mockReturnValueOnce(insertUser)

      const formData = new FormData()
      formData.append('email', 'first@example.com')
      formData.append('password', 'password123')

      await expect(signInWithEmail(formData)).rejects.toThrow('NEXT_REDIRECT:/')

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'first@example.com',
        password: 'password123',
      })
      expect(insertUser.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        email: 'first@example.com',
        role: 'user',
      }))
      expect(trackEventMock).toHaveBeenCalledWith('user_logged_in', expect.objectContaining({
        user_id: mockUser.id,
      }))
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    })
  })

  describe('signUpWithEmail', () => {
    it('stores the requested username and returns success when confirmation is required', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'new user')

      const result = await signUpWithEmail(formData)

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'newuser@example.com',
        password: 'password123',
        options: expect.objectContaining({
          data: expect.objectContaining({
            username: 'new_user',
            email_confirm: false,
          }),
        }),
      }))
      expect(result).toEqual({
        success: true,
        message: '注册成功！请检查邮箱验证链接。如果没有收到邮件，请检查垃圾邮件文件夹。'
      })
    })

    it('creates the profile immediately when email confirmation is disabled', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { ...mockUser, email: 'instant@example.com' },
          session: { access_token: 'token' },
        },
        error: null,
      })

      const lookupByUsername = createChain({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
      const insertUser = createChain({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })

      mockSupabaseClient.from
        .mockReturnValueOnce(lookupByUsername)
        .mockReturnValueOnce(insertUser)

      const formData = new FormData()
      formData.append('email', 'instant@example.com')
      formData.append('password', 'password123')
      formData.append('username', 'instant_user')

      const result = await signUpWithEmail(formData)

      expect(insertUser.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        username: 'instant_user',
        email: 'instant@example.com',
        role: 'user',
      }))
      expect(trackEventMock).toHaveBeenCalledWith('user_signed_up', expect.objectContaining({
        user_id: mockUser.id,
        username: 'instant_user',
      }))
      expect(result).toEqual({
        success: true,
        message: '注册成功！正在跳转...',
        redirect: true,
      })
    })
  })

  describe('sendPasswordReset', () => {
    it('returns a friendly smtp error', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Error sending confirmation email' },
      })

      const formData = new FormData()
      formData.append('email', 'reset@example.com')

      await expect(sendPasswordReset(formData)).resolves.toEqual({
        error: 'SMTP 未配置，邮件无法发送。请在 Supabase Dashboard → Project Settings → Auth → SMTP 配置邮件服务，或联系管理员。',
        hint: 'smtp_error',
      })
    })
  })

  describe('signInWithGitHub', () => {
    it('starts the GitHub oauth flow with the configured callback', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/login/oauth/authorize?client_id=test' },
        error: null,
      })

      await expect(signInWithGitHub()).rejects.toThrow('NEXT_REDIRECT:https://github.com/login/oauth/authorize?client_id=test')

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })
    })
  })
})
