'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { logClientError } from '@/lib/utils/error-logger'
import { getFriendlyErrorMessage } from '@/lib/utils/error-handler'
import { useOptionalTranslation } from '@/components/i18n/locale-provider'

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
  const t = useOptionalTranslation()
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
            {t('errorPage.title', 'Something went wrong')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {friendlyMessage}
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {t('errorPage.details', 'View error details (development only)')}
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
              {t('errorPage.retry', 'Try again')}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              {t('errorPage.home', 'Back to home')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
