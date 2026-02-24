'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Lock, Check } from 'lucide-react'
import Link from 'next/link'

interface PaywallProps {
  contentType?: 'article' | 'feature'
  title?: string
  description?: string
}

export function Paywall({
  contentType = 'article',
  title,
  description
}: PaywallProps) {
  const defaultTitle = contentType === 'article'
    ? '此内容为会员专享'
    : '此功能为会员专享'

  const defaultDescription = contentType === 'article'
    ? '升级为会员即可阅读完整内容，解锁全站优质文章'
    : '升级为会员即可使用此功能，享受更多特权'

  return (
    <div className="relative">
      {/* 模糊遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />

      {/* 付费墙卡片 */}
      <Card className="relative z-20 max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            {title || defaultTitle}
          </CardTitle>
          <CardDescription>
            {description || defaultDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 会员权益 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>解锁全站会员专享内容</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>无限制阅读所有文章</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>支持优质内容创作</span>
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="space-y-2 pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                升级为会员
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              暂未开通在线支付，请联系管理员开通会员
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
