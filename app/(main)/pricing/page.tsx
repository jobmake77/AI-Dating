import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">会员权益</h1>
        <p className="text-xl text-muted-foreground">
          升级会员，解锁更多优质内容和专属权益
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* 免费版 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>免费版</span>
              <Badge variant="secondary">Free</Badge>
            </CardTitle>
            <CardDescription>
              基础功能，永久免费
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">¥0</div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <span>浏览所有免费内容</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <span>发布内容（需审核）</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <span>评论和点赞</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <span>关注其他用户</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <span>基础搜索功能</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 会员版 */}
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>会员版</span>
              <Badge>Premium</Badge>
            </CardTitle>
            <CardDescription>
              解锁所有高级功能和专享内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              联系管理员
              <span className="text-base font-normal text-muted-foreground ml-2">
                手动开通
              </span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span className="font-semibold">免费版所有功能</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span className="font-semibold">查看所有会员专享内容</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span>发布会员专享内容</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span>无广告浏览体验</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span>专属会员标识</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span>优先客服支持</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>如何成为会员？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <p>
              目前会员采用<strong>手动开通</strong>方式，请联系管理员申请开通会员权限。
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">联系方式：</h3>
              <ul className="space-y-1 text-sm">
                <li>• 通过平台私信联系管理员</li>
                <li>• 在社区发帖说明需求</li>
                <li>• 或通过其他指定渠道申请</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              * 会员权益可能会根据平台发展进行调整，具体以最新公告为准
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
