/**
 * 环境变量验证工具
 * 在应用启动时验证所有必需的环境变量
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string

  // Cloudflare R2
  R2_ACCOUNT_ID?: string
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_BUCKET_NAME?: string
  R2_PUBLIC_URL?: string

  // Site
  NEXT_PUBLIC_SITE_URL?: string

  // Admin
  BOOTSTRAP_ADMIN_SECRET?: string

  // Tencent Cloud (可选)
  TENCENT_SECRET_ID?: string
  TENCENT_SECRET_KEY?: string
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
  'NEXT_PUBLIC_SITE_URL',
  'BOOTSTRAP_ADMIN_SECRET',
  'TENCENT_SECRET_ID',
  'TENCENT_SECRET_KEY',
] as const

/**
 * 验证必需的环境变量
 * @throws Error 如果缺少必需的环境变量
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = []

  // 检查必需的环境变量
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nPlease check your .env.local file.`
    )
  }

  // 返回类型安全的配置对象
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    BOOTSTRAP_ADMIN_SECRET: process.env.BOOTSTRAP_ADMIN_SECRET,
    TENCENT_SECRET_ID: process.env.TENCENT_SECRET_ID,
    TENCENT_SECRET_KEY: process.env.TENCENT_SECRET_KEY,
  }
}

/**
 * 获取环境变量，如果不存在则抛出错误
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * 获取环境变量，如果不存在则返回默认值
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

// 在开发环境下自动验证
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnv()
    console.log('✓ Environment variables validated successfully')
  } catch (error) {
    console.error('✗ Environment validation failed:')
    console.error((error as Error).message)
  }
}
