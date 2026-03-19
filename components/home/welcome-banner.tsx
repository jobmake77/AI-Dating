'use client'

import Link from 'next/link'
import { ArrowRight, Compass, Layers, Sparkles, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'use-intl'

interface WelcomeBannerProps {
  stats: {
    developers: number
    contents: number
    communities: number
  }
  activeTab?: 'hot' | 'latest' | 'following'
  featuredPost?: {
    id: string
    href?: string
    title: string
    excerpt: string
    author: string
    tag?: string | null
  } | null
}

export function WelcomeBanner({ stats, activeTab = 'hot', featuredPost }: WelcomeBannerProps) {
  const t = useTranslations('homeWelcome')
  const tabLabelKey = activeTab === 'hot' ? 'tabHot' : activeTab === 'latest' ? 'tabLatest' : 'tabFollowing'

  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(220_28%_93%))]">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.18),transparent)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,hsl(var(--warning)/0.1),transparent_68%)]" />
      <div className="pointer-events-none absolute right-0 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.07),transparent_72%)]" />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.85fr)] lg:items-start">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-warning" />
                {t('eyebrow')}
              </span>
              <span className="h-px flex-1 bg-border" />
              <span>{t(tabLabelKey)}</span>
            </div>

            <h1 className="max-w-2xl text-[1.75rem] font-semibold tracking-[-0.045em] text-foreground sm:text-[2rem] lg:text-[2.15rem] lg:leading-[1.02]">
              {t('title')}
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground sm:text-sm">
              {t('description')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild className="h-8 rounded-full px-3.5 text-xs">
                <Link href="/create" data-tour="create-button">
                  {t('create')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-8 rounded-full border-foreground/15 bg-background/75 px-3.5 text-xs">
                <Link href="/explore">
                  {t('explore')}
                  <Compass className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 lg:pl-5">
            <div className="border-l border-foreground/10 pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t('featuredTitle')}
              </p>
              {featuredPost ? (
                <div className="mt-2 space-y-1.5">
                  <Link href={featuredPost.href || `/post/${featuredPost.id}`} className="block">
                    <h2 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="line-clamp-1 text-xs leading-5 text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{t('authorPrefix', { author: featuredPost.author })}</span>
                    {featuredPost.tag && (
                      <>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="rounded-full border border-foreground/10 px-2 py-0.5 text-foreground">
                          {featuredPost.tag}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {t('featuredEmpty')}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-t border-foreground/10 pt-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Users className="h-3 w-3 text-primary" />
                  {t('developersLabel')}
                </div>
                <span className="block font-mono text-lg font-semibold text-foreground">
                  {formatCompactCount(stats.developers)}
                </span>
                <span className="text-[11px] leading-5 text-muted-foreground">{t('developersHint')}</span>
              </div>

              <div className="border-t border-foreground/10 pt-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Zap className="h-3 w-3 text-success" />
                  {t('contentsLabel')}
                </div>
                <span className="block font-mono text-lg font-semibold text-foreground">
                  {formatCompactCount(stats.contents)}
                </span>
                <span className="text-[11px] leading-5 text-muted-foreground">{t('contentsHint')}</span>
              </div>

              <div className="border-t border-foreground/10 pt-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Layers className="h-3 w-3 text-accent" />
                  {t('communitiesLabel')}
                </div>
                <span className="block font-mono text-lg font-semibold text-foreground">
                  {formatCompactCount(stats.communities)}
                </span>
                <span className="text-[11px] leading-5 text-muted-foreground">{t('communitiesHint')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatCompactCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return value.toString()
}
