/**
 * 触摸手势 Hook
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number // 最小滑动距离
  timeout?: number // 最大滑动时间
}

/**
 * 滑动手势 Hook
 */
export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const { threshold = 50, timeout = 300 } = options
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    const deltaTime = Date.now() - touchStart.current.time

    // 检查是否超时
    if (deltaTime > timeout) {
      touchStart.current = null
      return
    }

    // 检查是否达到阈值
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX < threshold && absY < threshold) {
      touchStart.current = null
      return
    }

    // 判断滑动方向
    if (absX > absY) {
      // 水平滑动
      if (deltaX > 0) {
        handlers.onSwipeRight?.()
      } else {
        handlers.onSwipeLeft?.()
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        handlers.onSwipeDown?.()
      } else {
        handlers.onSwipeUp?.()
      }
    }

    touchStart.current = null
  }

  return { onTouchStart, onTouchEnd }
}

/**
 * 长按手势 Hook
 */
export function useLongPress(
  onLongPress: () => void,
  options: { delay?: number } = {}
) {
  const { delay = 500 } = options
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const start = () => {
    timerRef.current = setTimeout(() => {
      onLongPress()
    }, delay)
  }

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  }
}

/**
 * 双击手势 Hook
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  options: { delay?: number } = {}
) {
  const { delay = 300 } = options
  const lastTap = useRef<number>(0)

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < delay) {
      onDoubleTap()
      lastTap.current = 0
    } else {
      lastTap.current = now
    }
  }

  return {
    onClick: handleTap,
    onTouchEnd: handleTap,
  }
}

/**
 * 拖拽手势 Hook
 */
export function useDrag() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)

    if ('touches' in e) {
      startPos.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      }
    } else {
      startPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }
  }

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    setPosition({
      x: clientX - startPos.current.x,
      y: clientY - startPos.current.y,
    })
  }, [isDragging])

  const onDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDragMove)
      window.addEventListener('mouseup', onDragEnd)
      window.addEventListener('touchmove', onDragMove)
      window.addEventListener('touchend', onDragEnd)

      return () => {
        window.removeEventListener('mousemove', onDragMove)
        window.removeEventListener('mouseup', onDragEnd)
        window.removeEventListener('touchmove', onDragMove)
        window.removeEventListener('touchend', onDragEnd)
      }
    }
  }, [isDragging, onDragEnd, onDragMove])

  return {
    isDragging,
    position,
    onDragStart,
  }
}
