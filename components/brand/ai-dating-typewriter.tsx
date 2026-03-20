'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface AIDatingTypewriterProps {
  className?: string
  cursorClassName?: string
  text?: string
  typingSpeed?: number
  pauseMs?: number
  restartDelayMs?: number
  startDelayMs?: number
  loop?: boolean
  showCursor?: boolean
  hideCursorWhenDone?: boolean
}

export function AIDatingTypewriter({
  className,
  cursorClassName,
  text = 'AI-Dating',
  typingSpeed = 110,
  pauseMs = 2000,
  restartDelayMs = 500,
  startDelayMs = 0,
  loop = false,
  showCursor = true,
  hideCursorWhenDone = false,
}: AIDatingTypewriterProps) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (displayText === text && !loop) {
      return
    }

    const schedule = (delay: number, callback: () => void) => {
      timer = setTimeout(callback, delay)
    }

    if (displayText.length < text.length) {
      const nextDelay = displayText.length === 0 ? startDelayMs : typingSpeed
      schedule(nextDelay, () => {
        setDisplayText(text.slice(0, displayText.length + 1))
      })
    } else if (loop) {
      schedule(pauseMs + restartDelayMs, () => {
        setDisplayText('')
      })
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [
    displayText,
    hideCursorWhenDone,
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
      {showCursor && !(hideCursorWhenDone && displayText === text) ? (
        <span
          aria-hidden="true"
          className={cn(
            'terminal-cursor ml-1 inline-block h-[0.9em] w-[0.5em] rounded-[1px] bg-current align-middle',
            cursorClassName
          )}
        />
      ) : null}
    </span>
  )
}
