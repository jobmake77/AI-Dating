import { Loader2 } from 'lucide-react'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export async function PageLoader() {
  const locale = await getRequestLocale()
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex w-full justify-center">
        <div className="relative flex w-full max-w-[1060px] bg-background">
          <main className="flex-1 min-h-screen max-w-[620px] border-r border-border flex items-center justify-center">
            <LoadingSpinner size="lg" text={getTranslation(locale, 'common.loading', 'Loading...')} />
          </main>
        </div>
      </div>
    </div>
  )
}
