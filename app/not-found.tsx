'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

/**
 * 404 页面
 * 当用户访问不存在的页面时显示
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            页面不存在
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被删除。
          </p>
          <p className="text-sm text-muted-foreground">
            可能的原因：
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>页面链接已过期</li>
            <li>页面地址输入错误</li>
            <li>内容已被删除或移动</li>
          </ul>
          <div className="flex gap-2">
            <Button asChild className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                返回首页
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上一页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
