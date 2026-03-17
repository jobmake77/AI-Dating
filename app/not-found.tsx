'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Code2, Home, ArrowLeft, SearchX } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'use-intl'

/**
 * 404 页面
 * 当用户访问不存在的页面时显示
 */
export default function NotFound() {
  const pathname = usePathname()
  const t = useTranslations('notFound')

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', pathname)
  }, [pathname])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
              <SearchX className="h-10 w-10 text-destructive" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-warning text-warning-foreground text-xs font-bold"
            >
              !
            </motion.div>
          </div>
        </div>

        <h1
          className="font-mono text-7xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(262, 83%, 58%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>
        <p className="text-base font-medium text-foreground mb-1">{t('title')}</p>
        <p className="text-sm text-muted-foreground mb-2">
          {t('pathPrefix')} <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{pathname}</code> {t('pathSuffix')}
        </p>
        <p className="text-xs text-muted-foreground mb-8">{t('description')}</p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button
              className="h-10 gap-2 text-sm font-medium text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(262, 83%, 58%))' }}
            >
              <Home className="h-4 w-4" />
              {t('home')}
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="h-10 gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span className="font-mono text-xs">AI-Dating</span>
        </div>
      </motion.div>
    </div>
  )
}
