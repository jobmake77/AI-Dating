'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * 离线状态指示器
 * 检测网络状态并显示提示
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // 初始化状态
    setIsOnline(navigator.onLine)

    // 监听网络状态变化
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)

      // 3 秒后隐藏重连提示
      setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 在线且不显示重连提示时，不渲染任何内容
  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      {!isOnline ? (
        <Alert variant="destructive" className="shadow-lg">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="ml-2">
            网络连接已断开，请检查您的网络设置
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="shadow-lg border-green-500 bg-green-50 dark:bg-green-950">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="ml-2 text-green-600 dark:text-green-400">
            网络已恢复连接
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
