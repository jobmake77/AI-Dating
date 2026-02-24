'use client'

import Image from 'next/image'
import { useState } from 'react'
import { User } from 'lucide-react'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  fallback?: React.ReactNode
}

/**
 * 优化的图片组件
 * - 自动使用 Next.js Image 优化
 * - 懒加载
 * - 错误处理
 * - 占位符
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  fallback,
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  // 如果没有图片或加载失败，显示 fallback
  if (!src || error) {
    return (
      fallback || (
        <div className={`flex items-center justify-center bg-muted ${className}`}>
          <User className="w-1/2 h-1/2 text-muted-foreground" />
        </div>
      )
    )
  }

  // 使用 Next.js Image 组件
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes || '100vw'}
        priority={priority}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}

/**
 * 头像组件（优化版）
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = '',
}: {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
    />
  )
}

/**
 * 封面图组件（优化版）
 */
export function OptimizedCover({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
      />
    </div>
  )
}
