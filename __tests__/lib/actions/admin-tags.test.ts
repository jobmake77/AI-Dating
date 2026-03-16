import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mergeAdminTag } from '@/lib/actions/admin-tags'

const createClientMock = vi.hoisted(() => vi.fn())
const requireAdminMock = vi.hoisted(() => vi.fn())
const revalidatePathMock = vi.hoisted(() => vi.fn())
const createOrGetTagMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/middleware/admin', () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('@/lib/actions/tags', () => ({
  createOrGetTag: createOrGetTagMock,
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
    upsert: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockReturnThis(),
    ...overrides,
  }
}

describe('admin tag actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminMock.mockResolvedValue({ id: 'admin-1' })
  })

  it('merges tag relations into the target tag and deletes the source tag', async () => {
    const sourceTagId = '55555555-5555-4555-8555-555555555555'
    const sourceTagLookup = createChain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: sourceTagId,
          name: 'AI',
        },
        error: null,
      }),
    })
    const sourceRelationsLookup = createChain({
      eq: vi.fn().mockResolvedValue({
        data: [{ content_id: 'content-1' }, { content_id: 'content-2' }],
        error: null,
      }),
    })
    const upsertRelations = createChain()
    const deleteSourceRelations = createChain({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const deleteSourceTag = createChain({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    createClientMock.mockResolvedValue({
      from: vi.fn()
        .mockReturnValueOnce(sourceTagLookup)
        .mockReturnValueOnce(sourceRelationsLookup)
        .mockReturnValueOnce(upsertRelations)
        .mockReturnValueOnce(deleteSourceRelations)
        .mockReturnValueOnce(deleteSourceTag),
    })

    createOrGetTagMock.mockResolvedValue({
      tag: { id: 'tag-target', name: 'AI' },
      error: null,
    })

    const formData = new FormData()
    formData.append('source_tag_id', sourceTagId)
    formData.append('target_tag_name', 'AI')

    await mergeAdminTag(formData)

    expect(upsertRelations.upsert).toHaveBeenCalledWith(
      [
        { content_id: 'content-1', tag_id: 'tag-target' },
        { content_id: 'content-2', tag_id: 'tag-target' },
      ],
      expect.objectContaining({
        onConflict: 'content_id,tag_id',
        ignoreDuplicates: true,
      })
    )
    expect(deleteSourceTag.delete).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/tags')
  })
})
