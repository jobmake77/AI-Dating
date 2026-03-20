'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface AIDatingTypewriterProps {
  className?: string
  cursorClassName?: string
  text?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseMs?: number
  restartDelayMs?: number
  startDelayMs?: number
  loop?: boolean
  showCursor?: boolean
}

export function AIDatingTypewriter({
  className,
  cursorClassName,
  text = 'AI-Dating',
  typingSpeed = 110,
  deletingSpeed = 60,
  pauseMs = 2000,
  restartDelayMs = 500,
  startDelayMs = 0,
  loop = false,
  showCursor = true,
}: AIDatingTypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (!loop && displayText === text) {
      return
    }

    const schedule = (delay: number, callback: () => void) => {
      timer = setTimeout(callback, delay)
    }

    if (!isDeleting && displayText.length < text.length) {
      const nextDelay = displayText.length === 0 ? startDelayMs : typingSpeed
      schedule(nextDelay, () => {
        setDisplayText(text.slice(0, displayText.length + 1))
      })
    } else if (!isDeleting && displayText === text) {
      if (!loop) {
        return
      }

      schedule(pauseMs, () => {
        setIsDeleting(true)
      })
    } else if (isDeleting && displayText.length > 0) {
      schedule(deletingSpeed, () => {
        setDisplayText(text.slice(0, displayText.length - 1))
      })
    } else if (isDeleting && displayText.length === 0) {
      schedule(restartDelayMs, () => {
        setIsDeleting(false)
      })
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [
    deletingSpeed,
    displayText,
    isDeleting,
    loop,
    pauseMs,
    restartDelayMs,
    startDelayMs,
    text,
    typingSpeed,
  ])

  return (
    <span
      aria-label={text}
      className={cn('inline-flex items-end', className)}
    >
      <span>{displayText}</span>
      {showCursor ? (
        <span
          aria-hidden="true"
          className={cn(
            'terminal-cursor ml-1 inline-block h-[0.95em] w-[0.58em] rounded-[2px] bg-current align-middle',
            cursorClassName
          )}
        />
      ) : null}
    </span>
  )
}
