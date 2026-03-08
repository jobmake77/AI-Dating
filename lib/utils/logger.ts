/**
 * 统一日志工具
 * 生产环境下只记录错误，开发环境记录所有日志
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * 调试日志 - 仅开发环境
   */
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  /**
   * 信息日志 - 仅开发环境
   */
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * 警告日志 - 所有环境
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },

  /**
   * 错误日志 - 所有环境
   */
  error: (message: string, error?: any, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, error, ...args)
  },
}
