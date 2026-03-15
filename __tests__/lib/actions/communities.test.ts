import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCommunity, leaveCommunity, updateMemberRole } from '@/lib/actions/communities'

const createClientMock = vi.hoisted(() => vi.fn())
const revalidatePathMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

function createChain(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  }
}

describe('community actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('syncs the creator membership to moderator after creating a community', async () => {
    const slugLookup = createChain({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    const insertCommunity = createChain({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'community-1',
          slug: 'ai-builders',
          creator_id: 'user-1',
        },
        error: null,
      }),
    })
    const syncCreatorRole = createChain({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn()
        .mockReturnValueOnce(slugLookup)
        .mockReturnValueOnce(insertCommunity)
        .mockReturnValueOnce(syncCreatorRole),
    })

    const formData = new FormData()
    formData.append('name', 'AI Builders')
    formData.append('type', 'public')

    const result = await createCommunity(formData)

    expect(syncCreatorRole.update).toHaveBeenCalledWith({ role: 'moderator' })
    expect(result.success).toBe(true)
    expect(revalidatePathMock).toHaveBeenCalledWith('/communities')
  })

  it('allows a moderator to promote a member to admin', async () => {
    const communityLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'community-1',
          slug: 'ai-builders',
          creator_id: 'creator-1',
        },
        error: null,
      }),
    })
    const currentUserLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: { role: 'moderator' },
        error: null,
      }),
    })
    const targetLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'membership-2',
          role: 'member',
          user_id: 'member-2',
        },
        error: null,
      }),
    })
    const updateRole = createChain({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'moderator-1' } },
          error: null,
        }),
      },
      from: vi.fn()
        .mockReturnValueOnce(communityLookup)
        .mockReturnValueOnce(currentUserLookup)
        .mockReturnValueOnce(targetLookup)
        .mockReturnValueOnce(updateRole),
    })

    const result = await updateMemberRole('community-1', 'membership-2', 'admin')

    expect(updateRole.update).toHaveBeenCalledWith({ role: 'admin' })
    expect(result).toEqual({ success: true })
    expect(revalidatePathMock).toHaveBeenCalledWith('/communities/ai-builders/members')
  })

  it('prevents non-creator moderators from modifying admin roles', async () => {
    const communityLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'community-1',
          slug: 'ai-builders',
          creator_id: 'creator-1',
        },
        error: null,
      }),
    })
    const currentUserLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: { role: 'moderator' },
        error: null,
      }),
    })
    const targetLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'membership-3',
          role: 'admin',
          user_id: 'admin-2',
        },
        error: null,
      }),
    })
    const updateRole = createChain({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'moderator-1' } },
          error: null,
        }),
      },
      from: vi.fn()
        .mockReturnValueOnce(communityLookup)
        .mockReturnValueOnce(currentUserLookup)
        .mockReturnValueOnce(targetLookup)
        .mockReturnValueOnce(updateRole),
    })

    const result = await updateMemberRole('community-1', 'membership-3', 'member')

    expect(result).toEqual({ success: false, error: '版主不能修改管理员角色' })
    expect(updateRole.update).not.toHaveBeenCalled()
  })

  it('prevents a community creator from leaving their own community', async () => {
    const communityLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'community-1',
          creator_id: 'creator-1',
          slug: 'ai-builders',
        },
        error: null,
      }),
    })
    const membershipLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: { role: 'moderator' },
        error: null,
      }),
    })
    const deleteMembership = createChain({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'creator-1' } },
          error: null,
        }),
      },
      from: vi.fn()
        .mockReturnValueOnce(communityLookup)
        .mockReturnValueOnce(membershipLookup)
        .mockReturnValueOnce(deleteMembership),
    })

    const result = await leaveCommunity('community-1')

    expect(result).toEqual({ success: false, error: '社区创建者不能退出社区' })
    expect(deleteMembership.delete).not.toHaveBeenCalled()
  })
})
