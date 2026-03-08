'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { OnboardingTour } from './onboarding-tour'
import { completeOnboarding, skipOnboarding, getOnboardingProgress } from '@/lib/actions/onboarding'
import { OnboardingProgress } from '@/types/onboarding'
import { logger } from '@/lib/utils/logger'

interface OnboardingContextType {
  progress: OnboardingProgress | null
  startTour: () => void
  isLoading: boolean
}

const OnboardingContext = createContext<OnboardingContextType>({
  progress: null,
  startTour: () => {},
  isLoading: true,
})

export function useOnboarding() {
  return useContext(OnboardingContext)
}

interface OnboardingProviderProps {
  children: ReactNode
  userId?: string
}

export function OnboardingProvider({ children, userId }: OnboardingProviderProps) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [runTour, setRunTour] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getOnboardingProgress()
        setProgress(data)

        // 自动启动引导：新用户且未完成或跳过
        if (data && !data.tour_completed && !data.tour_skipped) {
          // 延迟 1 秒启动，让页面完全加载
          setTimeout(() => {
            setRunTour(true)
          }, 1000)
        }
      } catch (error) {
        logger.error('Failed to load onboarding progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgress()
  }, [userId])

  const handleComplete = async () => {
    setRunTour(false)
    try {
      await completeOnboarding()
      const updatedProgress = await getOnboardingProgress()
      setProgress(updatedProgress)
    } catch (error) {
      logger.error('Failed to complete onboarding:', error)
    }
  }

  const handleSkip = async () => {
    setRunTour(false)
    try {
      await skipOnboarding()
      const updatedProgress = await getOnboardingProgress()
      setProgress(updatedProgress)
    } catch (error) {
      logger.error('Failed to skip onboarding:', error)
    }
  }

  const startTour = () => {
    setRunTour(true)
  }

  return (
    <OnboardingContext.Provider value={{ progress, startTour, isLoading }}>
      {children}
      {userId && <OnboardingTour run={runTour} onComplete={handleComplete} onSkip={handleSkip} />}
    </OnboardingContext.Provider>
  )
}
