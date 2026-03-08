'use client'

import { useEffect } from 'react'
import { updateOnboardingProgress } from '@/lib/actions/onboarding'
import { OnboardingStepKey } from '@/types/onboarding'

interface ProgressCheckpointProps {
  step: OnboardingStepKey
  condition?: boolean
}

export function ProgressCheckpoint({ step, condition = true }: ProgressCheckpointProps) {
  useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        updateOnboardingProgress({ [step]: true }).catch((error) => {
          console.error('Failed to update onboarding progress:', error)
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [step, condition])

  return null
}
