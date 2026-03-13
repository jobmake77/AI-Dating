"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, Users } from "lucide-react";
import type { HomepageCommunityItem } from "@/lib/queries/home";

interface CategoriesSidebarProps {
  communities: HomepageCommunityItem[];
  trendingCommunities: HomepageCommunityItem[];
  isAuthenticated?: boolean;
}

const accentPalette = [
  "hsl(221 83% 53%)",
  "hsl(262 83% 58%)",
  "hsl(142 76% 36%)",
  "hsl(24 95% 53%)",
  "hsl(199 89% 48%)",
];

function getCommunityAccent(slug: string) {
  const hash = slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accentPalette[hash % accentPalette.length];
}

export function CategoriesSidebar({
  communities,
  trendingCommunities,
  isAuthenticated = false,
}: CategoriesSidebarProps) {
  const hasCommunities = communities.length > 0;
  const sidebarTitle = hasCommunities ? "我的社区" : isAuthenticated ? "推荐社区" : "热门社区";
  const sidebarDescription = hasCommunities
    ? "从固定阵地开始，再向外探索新的讨论版块。"
    : "这里展示当前最活跃的公开社区，优先从真实活跃度排序。";

  const primaryCommunities = hasCommunities ? communities : trendingCommunities;

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-[76px] space-y-5 border-r border-border pr-4">
        <section>
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              社区目录
            </p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-foreground">
              {sidebarTitle}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {sidebarDescription}
            </p>
          </div>

          <div className="divide-y divide-border">
            {primaryCommunities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="group flex items-center justify-between py-2.5 text-xs transition-colors hover:text-primary"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getCommunityAccent(community.slug) }}
                  />
                  <span className="truncate text-foreground transition-colors group-hover:text-primary">
                    {community.name}
                  </span>
                </div>
                <div className="ml-2 flex items-center gap-1.5 shrink-0 text-[10px] text-muted-foreground">
                  <span className="font-mono">{community.members_count}</span>
                  <Users className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/communities"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-foreground transition-colors hover:text-primary"
          >
            浏览全部社区
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        <section className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-warning" />
            热门社区
          </div>

          <div className="divide-y divide-border">
            {trendingCommunities.map((community, i) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="group flex items-start justify-between gap-3 py-2.5 transition-colors hover:text-primary"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-center font-mono text-xs font-bold ${
                      i === 0
                        ? "text-warning"
                        : i === 1
                        ? "text-accent"
                        : "text-info"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {community.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {community.posts_count} 篇内容 · {community.members_count} 位成员
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
