import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateAdminExportRequest } from '@/lib/actions/admin-privacy'

const createClientMock = vi.hoisted(() => vi.fn())
const requireAdminMock = vi.hoisted(() => vi.fn())
const revalidatePathMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/middleware/admin', () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

function createChain(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    ...overrides,
  }
}

describe('admin privacy actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ id: 'admin-1' })
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  })

  it('auto-generates a download URL when completing an export request', async () => {
    const requestId = '66666666-6666-4666-8666-666666666666'
    const requestLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: requestId,
          status: 'processing',
        },
        error: null,
      }),
    })
    const updateRequest = createChain({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    createClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(requestLookup).mockReturnValueOnce(updateRequest),
    })

    const formData = new FormData()
    formData.append('request_id', requestId)
    formData.append('status', 'completed')
    formData.append('download_url', '')
    formData.append('error_message', '')

    await updateAdminExportRequest(formData)

    expect(updateRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        download_url: `http://localhost:3000/api/privacy/exports/${requestId}`,
        completed_at: expect.any(String),
        expires_at: expect.any(String),
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/privacy-requests')
  })
})
