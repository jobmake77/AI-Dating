'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Crown, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface MembershipSheetProps {
  membershipTier: string
  membershipExpiresAt: string | null
}

export function MembershipSheet({ membershipTier, membershipExpiresAt }: MembershipSheetProps) {
  const [open, setOpen] = useState(false)
  const isPremium = membershipTier === 'premium'
  const isExpired = membershipExpiresAt && new Date(membershipExpiresAt) < new Date()
  const isActive = isPremium && !isExpired

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Crown className="w-4 h-4 mr-2" />
          会员
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>会员中心</SheetTitle>
          <SheetDescription>
            查看你的会员状态和权益
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* 免费会员卡片 */}
          <div className={`relative border rounded-lg p-6 transition-all ${
            !isActive
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-card hover:border-primary/50'
          }`}>
            {/* 当前角标 */}
            {!isActive && (
              <div className="absolute -top-2 -right-2">
                <Badge className="shadow-md">当前</Badge>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">免费会员</h3>
                  <p className="text-sm text-muted-foreground">基础功能</p>
                </div>
              </div>
              <div className="text-2xl font-bold">¥0</div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>查看所有免费内容</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>发布和分享内容</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>参与社区讨论</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-4 h-4 flex items-center justify-center">✕</span>
                <span>查看会员专享内容</span>
              </div>
            </div>

            {!isActive && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  你当前是免费会员，升级可解锁更多权益
                </p>
              </div>
            )}
          </div>

          {/* 高级会员卡片 */}
          <div className={`relative border rounded-lg p-6 transition-all ${
            isActive
              ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md'
              : 'border-border bg-card hover:border-primary/50'
          }`}>
            {/* 当前角标 */}
            {isActive && (
              <div className="absolute -top-2 -right-2">
                <Badge className="shadow-md bg-primary">当前</Badge>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">高级会员</h3>
                  <p className="text-sm text-muted-foreground">全部权益</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">联系开通</div>
                <p className="text-xs text-muted-foreground mt-1">手动激活</p>
              </div>
            </div>

            {isActive && membershipExpiresAt && (
              <div className="mb-4 p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-medium mb-1">到期时间</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(membershipExpiresAt).toLocaleDateString('zh-CN')}
                  <span className="ml-2">
                    ({formatDistanceToNow(new Date(membershipExpiresAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })})
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">所有免费会员权益</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">无限制查看会员专享内容</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">优先获得新功能体验</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">专属会员标识</span>
              </div>
            </div>

            {!isActive && (
              <Button asChild className="w-full" size="lg">
                <Link href="/pricing">
                  查看开通方式
                </Link>
              </Button>
            )}
          </div>

          {/* 说明 */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>温馨提示：</strong>会员需要联系管理员手动开通。
              如需升级，请查看开通方式页面了解详情。
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
