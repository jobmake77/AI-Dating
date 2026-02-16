'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Crown, Calendar, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface MembershipCardProps {
  membershipTier: string
  membershipExpiresAt: string | null
}

export function MembershipCard({ membershipTier, membershipExpiresAt }: MembershipCardProps) {
  const isPremium = membershipTier === 'premium'
  const isExpired = membershipExpiresAt && new Date(membershipExpiresAt) < new Date()
  const isActive = isPremium && !isExpired

  return (
    <Card className={isActive ? 'border-primary bg-gradient-to-br from-primary/5 to-transparent' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <>
                <Crown className="w-5 h-5 text-primary" />
                会员状态
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-muted-foreground" />
                会员状态
              </>
            )}
          </CardTitle>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? '高级会员' : '免费会员'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive ? (
          <>
            {/* 高级会员信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">到期时间：</span>
                <span className="font-medium">
                  {membershipExpiresAt && new Date(membershipExpiresAt).toLocaleDateString('zh-CN')}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({formatDistanceToNow(new Date(membershipExpiresAt!), {
                    addSuffix: true,
                    locale: zhCN,
                  })})
                </span>
              </div>

              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">✨ 高级会员权益</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 无限制查看所有会员专享内容</li>
                  <li>• 优先获得新功能体验资格</li>
                  <li>• 专属会员标识</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 免费会员信息 */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                升级为高级会员，解锁更多优质内容和专属权益
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">🎁 升级后可享受</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 无限制查看所有会员专享内容</li>
                  <li>• 优先获得新功能体验资格</li>
                  <li>• 专属会员标识</li>
                </ul>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  查看会员权益
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* 说明文字 */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            💡 提示：会员需要联系管理员手动开通
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
