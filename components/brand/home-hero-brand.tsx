'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { AIDatingTypewriter } from '@/components/brand/ai-dating-typewriter'

interface HomeHeroBrandProps {
  subtitle: string
}

const HOME_BRAND_PLAYED_ON_KEY = 'ai-dating-home-brand-played-on'

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function HomeHeroBrand({ subtitle }: HomeHeroBrandProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [typewriterKey, setTypewriterKey] = useState('home-brand-static')

  useEffect(() => {
    let frameId = 0

    const applyState = (nextShouldAnimate: boolean, nextKey?: string) => {
      frameId = window.requestAnimationFrame(() => {
        setShouldAnimate(nextShouldAnimate)
        if (nextKey) {
          setTypewriterKey(nextKey)
        }
      })
    }

    try {
      const todayKey = getTodayKey()
      const lastPlayedOn = window.localStorage.getItem(HOME_BRAND_PLAYED_ON_KEY)

      if (lastPlayedOn === todayKey) {
        applyState(false)
      } else {
        window.localStorage.setItem(HOME_BRAND_PLAYED_ON_KEY, todayKey)
        applyState(true, `home-brand-${todayKey}`)
      }
    } catch {
      applyState(true, `home-brand-${Date.now()}`)
    }

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary/80">
        <Sparkles className="h-3.5 w-3.5" />
        AI-Dating
      </div>
      <div className="mt-1.5 flex items-end gap-2">
        {shouldAnimate ? (
          <AIDatingTypewriter
            key={typewriterKey}
            className="text-2xl font-black tracking-tight text-foreground sm:text-[2rem]"
            cursorClassName="bg-primary"
            typingSpeed={105}
            startDelayMs={180}
          />
        ) : (
          <span className="inline-flex items-end text-2xl font-black tracking-tight text-foreground sm:text-[2rem]">
            <span>AI-Dating</span>
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        {subtitle}
      </p>
    </div>
  )
}
