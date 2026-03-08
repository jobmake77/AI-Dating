/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/ssr', 'recharts'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // 启用 PPR (Partial Prerendering)
    ppr: false, // 可以在稳定后启用
  },

  // Turbopack 配置（Next.js 16 默认使用 Turbopack）
  turbopack: {},

  // 性能预算警告
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig
