/**
 * Service Worker
 * 基础 PWA 支持 - 离线缓存和资源管理
 */

const CACHE_NAME = 'ai-dating-v1'
const STATIC_CACHE = 'ai-dating-static-v1'
const DYNAMIC_CACHE = 'ai-dating-dynamic-v1'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // 立即激活新的 Service Worker
  self.skipWaiting()
})

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key)
            return caches.delete(key)
          })
      )
    })
  )

  // 立即控制所有页面
  self.clients.claim()
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // 静态资源：缓存优先
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // 页面请求：网络优先，失败时显示离线页面
  event.respondWith(networkFirst(request, true))
})

/**
 * 缓存优先策略
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    throw error
  }
}

/**
 * 网络优先策略
 */
async function networkFirst(request, showOffline = false) {
  const cache = await caches.open(DYNAMIC_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Network failed:', error)

    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    // 显示离线页面
    if (showOffline) {
      const offlinePage = await cache.match('/offline.html')
      if (offlinePage) {
        return offlinePage
      }
    }

    throw error
  }
}

/**
 * 后台同步
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // 实现数据同步逻辑
  console.log('[SW] Syncing data...')
}

/**
 * 推送通知
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const data = event.data?.json() || {}
  const title = data.title || 'AI Dating'
  const options = {
    body: data.body || '您有新的通知',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url || '/',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

/**
 * 通知点击
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')

  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
