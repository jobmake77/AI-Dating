/**
 * 响应式设计工具类和 Hook
 */

'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

// 断点定义（与 Tailwind 保持一致）
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 检测当前屏幕尺寸
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') {
        return () => {}
      }

      const media = window.matchMedia(query)
      media.addEventListener('change', callback)

      return () => media.removeEventListener('change', callback)
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  )
}

/**
 * 检测是否为移动设备
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
}

/**
 * 检测是否为平板设备
 */
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  )
}

/**
 * 检测是否为桌面设备
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
}

/**
 * 获取当前断点
 */
export function useBreakpoint(): Breakpoint | 'xs' {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | 'xs'>('xs')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl')
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl')
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg')
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md')
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm')
      } else {
        setBreakpoint('xs')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * 检测触摸设备
 */
export function useIsTouchDevice(): boolean {
  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0)
  )

  return isTouch
}

/**
 * 响应式值选择器
 */
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}): T | undefined {
  const breakpoint = useBreakpoint()

  // 从当前断点向下查找最近的值
  const breakpointOrder: (Breakpoint | 'xs')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(breakpoint)

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }

  return undefined
}
