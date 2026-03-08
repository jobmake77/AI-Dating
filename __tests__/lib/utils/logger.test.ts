import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Logger Utils', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    // Set to development mode for testing
    process.env.NODE_ENV = 'development'

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv
    vi.restoreAllMocks()
  })

  it('应该导出 logger 对象', async () => {
    const { logger } = await import('@/lib/utils/logger')
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
  })

  it('logger.info 应该调用 console.info', async () => {
    const { logger } = await import('@/lib/utils/logger')
    logger.info('test message')
    expect(console.info).toHaveBeenCalled()
  })

  it('logger.error 应该调用 console.error', async () => {
    const { logger } = await import('@/lib/utils/logger')
    logger.error('error message')
    expect(console.error).toHaveBeenCalled()
  })

  it('logger.warn 应该调用 console.warn', async () => {
    const { logger } = await import('@/lib/utils/logger')
    logger.warn('warning message')
    expect(console.warn).toHaveBeenCalled()
  })
})
