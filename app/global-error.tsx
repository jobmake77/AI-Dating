'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { logClientError } from '@/lib/utils/error-logger'

/**
 * 全局错误页面
 * 捕获应用级别的错误（包括根布局错误）
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logClientError(error, {
      component: 'GlobalError',
    })
  }, [error])

  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                应用出错了
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                抱歉，应用遇到了一个严重错误。我们已经记录了这个问题，会尽快修复。
              </p>
              <p className="text-sm text-muted-foreground">
                您可以尝试刷新页面，或者返回首页重新开始。
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    查看错误详情（仅开发环境）
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button onClick={reset}>
                  重试
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
