'use client'

import { ArrowUpRight, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { HomepageCommunityItem, HomepageTagItem } from '@/lib/queries/home'
import { useTranslations } from 'use-intl'

interface CommunitySidebarProps {
  communityInfo: {
    name: string
    icon: string
    description: string
    members: number
    contents: number
  }
  trendingTags: HomepageTagItem[]
  activeCommunities: HomepageCommunityItem[]
}

export function CommunitySidebar({
  communityInfo,
  trendingTags,
  activeCommunities,
}: CommunitySidebarProps) {
  const t = useTranslations('homeCommunitySidebar')
  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-[76px] space-y-5 border-l border-border pl-5">
        <section>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t('activeTitle')}
          </h3>

          <div className="rounded-2xl border border-border bg-card/60">
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-lg">
                {communityInfo.icon}
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-[-0.03em] text-foreground">{communityInfo.name}</h2>
                <p className="text-[11px] text-muted-foreground">{t('activeHint')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border px-4 py-3">
              <div>
                <span className="block font-mono text-lg font-semibold text-foreground">
                  {formatCompactCount(communityInfo.members)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users className="h-3 w-3" /> {t('membersLabel')}
                </span>
              </div>
              <div className="border-l border-border pl-4">
                <span className="block font-mono text-lg font-semibold text-foreground">
                  {formatCompactCount(communityInfo.contents)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> {t('contentsLabel')}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border px-4">
              {activeCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="group flex items-start justify-between gap-3 py-3 transition-colors hover:text-primary"
                >
                  <div>
                    <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {community.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t('communityMeta', { posts: community.posts_count, members: community.members_count })}
                    </span>
                  </div>
                  <span className="pt-0.5 font-mono text-[11px] text-muted-foreground">{community.members_count}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <Button asChild className="h-9 w-full rounded-full">
                <Link href="/communities">
                  {t('browseCommunities')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-warning" />
            {t('trendingTags')}
          </h3>
          <div className="divide-y divide-border">
            {trendingTags.map((tag, i) => (
              <Link
                key={tag.slug}
                href={`/explore?tag=${encodeURIComponent(tag.name)}`}
                className="group flex items-center justify-between py-2.5 transition-colors hover:text-primary"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono w-4 text-center font-bold text-xs ${
                      i === 0
                        ? "text-warning"
                        : i === 1
                        ? "text-accent"
                        : i === 2
                        ? "text-info"
                        : "text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground transition-colors group-hover:text-primary">
                    {tag.name}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}

function formatCompactCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return value.toString()
}
