"use client";

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import type { HomepageCommunityItem } from "@/lib/queries/home";

interface CategoriesSidebarProps {
  communities: HomepageCommunityItem[];
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
  isAuthenticated = false,
}: CategoriesSidebarProps) {
  const hasCommunities = communities.length > 0;
  const sidebarTitle = "已加入社区";
  const sidebarDescription = hasCommunities
    ? "这里展示你已经加入的社区，方便快速回到熟悉的讨论区。"
    : isAuthenticated
      ? "你还没有加入社区，可以先去社区广场看看。"
      : "登录后，这里会展示你已经加入的社区。";

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-[76px] border-r border-border pr-4">
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

          {hasCommunities ? (
            <div className="divide-y divide-border">
              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.slug}`}
                  className="group flex items-center justify-between py-2.5 text-xs transition-colors hover:text-primary"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getCommunityAccent(community.slug) }}
                    />
                    <span className="truncate text-foreground transition-colors group-hover:text-primary">
                      {community.name}
                    </span>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="font-mono">{community.members_count}</span>
                    <Users className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-3 py-3">
              <p className="text-xs leading-5 text-muted-foreground">
                {isAuthenticated ? "加入社区后，这里会优先显示你的常驻版块。" : "登录并加入社区后，这里会展示你的社区列表。"}
              </p>
            </div>
          )}

          <Link
            href="/communities"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-foreground transition-colors hover:text-primary"
          >
            浏览全部社区
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
    </aside>
  );
}
