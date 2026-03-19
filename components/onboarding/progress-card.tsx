'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react'
import { OnboardingProgress } from '@/types/onboarding'
import { restartOnboarding } from '@/lib/actions/onboarding'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'use-intl'

interface ProgressCardProps {
  progress: OnboardingProgress
}

interface Step {
  id: string
  title: string
  description: string
  completed: boolean
  href?: string
}

export function ProgressCard({ progress }: ProgressCardProps) {
  const t = useTranslations('onboardingProgress')
  const [isRestarting, setIsRestarting] = useState(false)
  const router = useRouter()

  // 如果已完成或跳过，不显示
  if (progress.tour_completed || progress.tour_skipped) {
    return null
  }

  const steps: Step[] = [
    {
      id: 'profile',
      title: t('steps.profile.title'),
      description: t('steps.profile.description'),
      completed: progress.completed_profile,
      href: '/settings',
    },
    {
      id: 'post',
      title: t('steps.post.title'),
      description: t('steps.post.description'),
      completed: progress.first_post_published,
      href: '/create',
    },
    {
      id: 'explore',
      title: t('steps.explore.title'),
      description: t('steps.explore.description'),
      completed: progress.explored_content,
      href: '/',
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const totalCount = steps.length
  const progressPercentage = (completedCount / totalCount) * 100

  const handleRestart = async () => {
    setIsRestarting(true)
    try {
      await restartOnboarding()
      router.refresh()
    } catch (error) {
      console.error('Failed to restart onboarding:', error)
    } finally {
      setIsRestarting(false)
    }
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{t('title')}</CardTitle>
            <CardDescription className="mt-1">
              {t('description')}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            disabled={isRestarting}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {t('restart')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('progress')}</span>
            <span className="font-medium">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-medium ${
                      step.completed ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {step.title}
                  </h4>
                  {!step.completed && step.href && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                      <Link href={step.href}>{t('go')}</Link>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
