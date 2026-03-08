/**
 * PWA Service Worker 注册
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('[PWA] Service Worker registered:', registration.scope)

      // 检查更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用
              console.log('[PWA] New version available')
              showUpdateNotification()
            }
          })
        }
      })

      // 定期检查更新
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000) // 每小时检查一次
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  })
}

/**
 * 显示更新通知
 */
function showUpdateNotification() {
  // 可以使用 toast 或其他 UI 组件显示通知
  if (confirm('发现新版本，是否立即更新？')) {
    window.location.reload()
  }
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.unregister()
      console.log('[PWA] Service Worker unregistered')
    }
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error)
  }
}

/**
 * 检查 PWA 安装状态
 */
export function checkPWAInstallation() {
  if (typeof window === 'undefined') return false

  // 检查是否在独立模式下运行（已安装）
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isIOSStandalone = (window.navigator as any).standalone === true

  return isStandalone || (isIOS && isIOSStandalone)
}

/**
 * 显示 PWA 安装提示
 */
export function showPWAInstallPrompt() {
  if (typeof window === 'undefined') return

  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault()
    deferredPrompt = e

    // 显示自定义安装按钮
    showInstallButton()
  })

  // 安装按钮点击处理
  ;(window as any).installPWA = async () => {
    if (!deferredPrompt) return

    // 显示安装提示
    deferredPrompt.prompt()

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice
    console.log('[PWA] Install prompt outcome:', outcome)

    // 清除 deferredPrompt
    deferredPrompt = null

    // 隐藏安装按钮
    hideInstallButton()
  }

  // 监听安装完成
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed')
    hideInstallButton()
  })
}

function showInstallButton() {
  // 实现显示安装按钮的逻辑
  console.log('[PWA] Show install button')
}

function hideInstallButton() {
  // 实现隐藏安装按钮的逻辑
  console.log('[PWA] Hide install button')
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * 订阅推送通知
 */
export async function subscribeToPushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // 检查是否已订阅
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // 创建新订阅
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.warn('[PWA] VAPID public key not configured')
        return null
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      console.log('[PWA] Push subscription created')
    }

    return subscription
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error)
    return null
  }
}

/**
 * 取消推送通知订阅
 */
export async function unsubscribeFromPushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      console.log('[PWA] Push subscription cancelled')
      return true
    }

    return false
  } catch (error) {
    console.error('[PWA] Push unsubscription failed:', error)
    return false
  }
}

/**
 * 工具函数：将 base64 字符串转换为 Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
