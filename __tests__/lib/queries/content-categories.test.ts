import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getContentCategories } from '@/lib/queries/content-categories'

const createClientMock = vi.hoisted(() => vi.fn())
const loggerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: loggerErrorMock,
  },
}))

function createQueryResult<T>(result: { data: T; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve: (value: { data: T; error: unknown }) => unknown) =>
      Promise.resolve(result).then(resolve),
  }

  return chain
}

describe('content category queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters admin-only categories for normal users', async () => {
    const query = createQueryResult({
      data: [
        {
          id: '1',
          name: '官方公告',
          slug: 'announce',
          description: '官方',
          required_role: 'admin',
          color: '210 100% 56%',
          sort_order: 10,
          is_active: true,
        },
        {
          id: '2',
          name: '互动交流',
          slug: 'chat',
          description: '聊天',
          required_role: 'user',
          color: '24 95% 53%',
          sort_order: 20,
          is_active: true,
        },
      ],
      error: null,
    })

    createClientMock.mockResolvedValue({
      from: vi.fn(() => query),
    })

    const categories = await getContentCategories({ role: 'user' })

    expect(categories.map((category) => category.slug)).toEqual(['chat'])
  })

  it('falls back to built-in categories when the table is unavailable', async () => {
    const query = createQueryResult({
      data: null,
      error: { message: 'relation "content_categories" does not exist' },
    })

    createClientMock.mockResolvedValue({
      from: vi.fn(() => query),
    })

    const categories = await getContentCategories({ role: 'user' })

    expect(categories.length).toBeGreaterThan(0)
    expect(categories.every((category) => category.requiredRole === 'user')).toBe(true)
    expect(loggerErrorMock).toHaveBeenCalled()
  })
})
