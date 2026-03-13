'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { onboardingSteps, onboardingStyles } from '@/lib/config/onboarding-steps'

interface OnboardingTourProps {
  run: boolean
  onComplete: () => void
  onSkip: () => void
}

const HIGHLIGHT_STYLE = '0 0 0 4px hsl(var(--primary) / 0.35), 0 0 0 9999px rgba(0, 0, 0, 0.45)'

export function OnboardingTour({ run, onComplete, onSkip }: OnboardingTourProps) {
  const [mounted, setMounted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const currentStep = useMemo(() => onboardingSteps[stepIndex], [stepIndex])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!run) {
      setStepIndex(0)
    }
  }, [run])

  useEffect(() => {
    if (!run || !currentStep) return

    const target = document.querySelector<HTMLElement>(currentStep.target)
    if (!target) return

    const previousTransition = target.style.transition
    const previousPosition = target.style.position
    const previousZIndex = target.style.zIndex
    const previousBorderRadius = target.style.borderRadius
    const previousBoxShadow = target.style.boxShadow

    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    target.style.transition = 'box-shadow 0.2s ease'
    target.style.position = previousPosition || 'relative'
    target.style.zIndex = '60'
    target.style.borderRadius = target.style.borderRadius || '0.75rem'
    target.style.boxShadow = HIGHLIGHT_STYLE

    return () => {
      target.style.transition = previousTransition
      target.style.position = previousPosition
      target.style.zIndex = previousZIndex
      target.style.borderRadius = previousBorderRadius
      target.style.boxShadow = previousBoxShadow
    }
  }, [currentStep, run])

  if (!mounted || !run || !currentStep) {
    return null
  }

  const isLastStep = stepIndex === onboardingSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      return
    }

    setStepIndex((current) => current + 1)
  }

  const handleBack = () => {
    setStepIndex((current) => Math.max(0, current - 1))
  }

  return (
    <Dialog open={run}>
      <DialogContent
        className="max-w-md"
        style={{
          backgroundColor: onboardingStyles.options.backgroundColor,
          color: onboardingStyles.options.textColor,
          zIndex: onboardingStyles.options.zIndex,
        }}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={onSkip}
      >
        <DialogHeader>
          <div className="text-xs font-medium text-muted-foreground">
            {stepIndex + 1} / {onboardingSteps.length}
          </div>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.content}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="items-center justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip}>
            跳过引导
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
              上一步
            </Button>
            <Button type="button" onClick={handleNext}>
              {isLastStep ? '完成' : '下一步'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
