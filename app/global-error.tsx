'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { logClientError } from '@/lib/utils/error-logger'
import { getTranslation } from '@/i18n/dictionaries'
import { defaultLocale, isLocale, type Locale } from '@/i18n/config'

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
  const storedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('locale') : null
  const locale: Locale = isLocale(storedLocale) ? storedLocale : defaultLocale

  useEffect(() => {
    logClientError(error, {
      component: 'GlobalError',
    })
  }, [error])

  return (
    <html lang={locale === 'en' ? 'en-US' : 'zh-CN'}>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                {getTranslation(locale, 'globalError.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {getTranslation(locale, 'globalError.description')}
              </p>
              <p className="text-sm text-muted-foreground">
                {getTranslation(locale, 'globalError.retryHint')}
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    {getTranslation(locale, 'globalError.details')}
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button onClick={reset}>
                  {getTranslation(locale, 'globalError.retry')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  {getTranslation(locale, 'globalError.home')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
