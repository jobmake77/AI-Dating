'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { logClientError } from '@/lib/utils/error-logger'
import { getFriendlyErrorMessage } from '@/lib/utils/error-handler'

/**
 * 根级错误页面
 * 捕获页面级别的错误
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logClientError(error, {
      component: 'RootError',
    })
  }, [error])

  const friendlyMessage = getFriendlyErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            页面出错了
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {friendlyMessage}
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
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              重试
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
