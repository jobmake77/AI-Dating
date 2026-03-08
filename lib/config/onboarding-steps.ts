import { Step } from 'react-joyride'

export const onboardingSteps: Step[] = [
  {
    target: '[data-tour="create-button"]',
    content: '点击这里发布你的第一篇技术分享，展示你的开发经验和见解',
    disableBeacon: true,
    placement: 'bottom',
    title: '发布内容',
  },
  {
    target: '[data-tour="profile-link"]',
    content: '完善你的个人资料，让其他开发者了解你的技术背景和专长',
    placement: 'bottom',
    title: '完善资料',
  },
  {
    target: '[data-tour="home-link"]',
    content: '探索社区，发现优质技术内容，与其他开发者交流学习',
    placement: 'bottom',
    title: '探索社区',
  },
  {
    target: '[data-tour="pricing-link"]',
    content: '开通会员，获得 token，解锁更多创作功能和 API 访问权限',
    placement: 'bottom',
    title: '了解会员',
  },
]

export const onboardingStyles = {
  options: {
    arrowColor: 'hsl(var(--background))',
    backgroundColor: 'hsl(var(--background))',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    primaryColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--foreground))',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  buttonNext: {
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  buttonBack: {
    color: 'hsl(var(--muted-foreground))',
    marginRight: '0.5rem',
  },
  buttonSkip: {
    color: 'hsl(var(--muted-foreground))',
  },
}
