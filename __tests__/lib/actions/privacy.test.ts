import { beforeEach, describe, expect, it, vi } from 'vitest'

import { exportUserData, requestAccountDeletion } from '@/lib/actions/privacy'

const createClientMock = vi.hoisted(() => vi.fn())
const revalidatePathMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

function createChain(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  }
}

describe('privacy actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a pending data export request instead of returning immediate payload', async () => {
    const userId = '11111111-1111-4111-8111-111111111111'
    const existingRequests = createChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    const insertRequest = createChain({
      single: vi.fn().mockResolvedValue({
        data: { id: '22222222-2222-4222-8222-222222222222' },
        error: null,
      }),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValueOnce(existingRequests).mockReturnValueOnce(insertRequest),
    })

    const result = await exportUserData(userId)

    expect(existingRequests.in).toHaveBeenCalledWith('status', ['pending', 'processing'])
    expect(insertRequest.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        status: 'pending',
      })
    )
    expect(result).toEqual({ success: true, requestId: '22222222-2222-4222-8222-222222222222' })
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/privacy-requests')
  })

  it('creates a pending deletion request without anonymizing immediately', async () => {
    const userId = '33333333-3333-4333-8333-333333333333'
    const existingRequests = createChain({
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    const insertRequest = createChain({
      single: vi.fn().mockResolvedValue({
        data: { id: '44444444-4444-4444-8444-444444444444' },
        error: null,
      }),
    })

    const fromMock = vi.fn().mockReturnValueOnce(existingRequests).mockReturnValueOnce(insertRequest)

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        }),
      },
      from: fromMock,
    })

    const result = await requestAccountDeletion(userId, 'cleanup')

    expect(insertRequest.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        reason: 'cleanup',
        status: 'pending',
      })
    )
    expect(fromMock).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ success: true, requestId: '44444444-4444-4444-8444-444444444444' })
    expect(revalidatePathMock).toHaveBeenCalledWith('/settings/privacy')
  })
})
