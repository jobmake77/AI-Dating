/**
 * 资源预加载工具
 * 优化关键资源的加载顺序
 */

declare global {
  interface Window {
    installPWA?: () => void
  }
}

type WindowWithNextRouter = Window & {
  __NEXT_DATA__?: {
    router?: {
      prefetch: (route: string) => void
    }
  }
}

/**
 * 预加载关键资源
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // 预加载字体
  preloadFont('/fonts/inter-var.woff2', 'font/woff2')

  // 预加载关键图片
  preloadImage('/images/logo.png')
  preloadImage('/images/hero-bg.jpg')
}

/**
 * 预加载字体
 */
export function preloadFont(href: string, type: string = 'font/woff2') {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = type
  link.href = href
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

/**
 * 预加载图片
 */
export function preloadImage(href: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}

/**
 * 预加载脚本
 */
export function preloadScript(href: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = href
  document.head.appendChild(link)
}

/**
 * 预加载样式
 */
export function preloadStyle(href: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'style'
  link.href = href
  document.head.appendChild(link)
}

/**
 * DNS 预解析
 */
export function dnsPrefetch(domain: string) {
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = domain
  document.head.appendChild(link)
}

/**
 * 预连接
 */
export function preconnect(domain: string, crossOrigin: boolean = false) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = domain
  if (crossOrigin) {
    link.crossOrigin = 'anonymous'
  }
  document.head.appendChild(link)
}

/**
 * 预取资源（低优先级）
 */
export function prefetch(href: string, as?: string) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  if (as) {
    link.as = as
  }
  document.head.appendChild(link)
}

/**
 * 初始化资源预加载
 */
export function initResourcePreloading() {
  if (typeof window === 'undefined') return

  // DNS 预解析外部域名
  dnsPrefetch('https://fonts.googleapis.com')
  dnsPrefetch('https://fonts.gstatic.com')

  // 预连接到 Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    preconnect(supabaseUrl, true)
  }

  // 预连接到 Cloudflare R2
  const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  if (r2Domain) {
    preconnect(r2Domain, true)
  }

  // 预加载关键资源
  preloadCriticalResources()
}

/**
 * 预加载路由
 * 在用户可能访问的页面上预加载资源
 */
export function preloadRoute(route: string) {
  if (typeof window === 'undefined') return

  // 使用 Next.js 的 prefetch
  const router = (window as WindowWithNextRouter).__NEXT_DATA__?.router
  if (router) {
    router.prefetch(route)
  }
}

/**
 * 智能预加载
 * 根据用户行为预测并预加载资源
 */
export function smartPreload() {
  if (typeof window === 'undefined') return

  // 监听鼠标悬停在链接上
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')

    if (link && link.href) {
      const url = new URL(link.href)
      // 只预加载同域名的链接
      if (url.origin === window.location.origin) {
        preloadRoute(url.pathname)
      }
    }
  })

  // 监听触摸开始（移动端）
  document.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')

    if (link && link.href) {
      const url = new URL(link.href)
      if (url.origin === window.location.origin) {
        preloadRoute(url.pathname)
      }
    }
  })
}
