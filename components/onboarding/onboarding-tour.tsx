'use client'

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { onboardingSteps, onboardingStyles } from '@/lib/config/onboarding-steps'

interface OnboardingTourProps {
  run: boolean
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ run, onComplete, onSkip }: OnboardingTourProps) {
  const [steps] = useState<Step[]>(onboardingSteps)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data

    if (status === STATUS.FINISHED) {
      onComplete()
    } else if (status === STATUS.SKIPPED) {
      onSkip()
    }
  }

  // 只在客户端挂载后渲染 Joyride
  if (!mounted) {
    return null
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={onboardingStyles}
      locale={{
        back: '上一步',
        close: '关闭',
        last: '完成',
        next: '下一步',
        open: '打开对话框',
        skip: '跳过引导',
      }}
    />
  )
}
