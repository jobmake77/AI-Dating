"use client";

import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";

const MY_COMMUNITIES = [
  { name: "AI 研究院", slug: "ai-research", members: 34, color: "hsl(221 83% 53%)" },
  { name: "Rust 中文社区", slug: "rust-cn", members: 21, color: "hsl(262 83% 58%)" },
  { name: "前端工程师", slug: "frontend", members: 56, color: "hsl(142 76% 36%)" },
  { name: "DevOps 实践", slug: "devops", members: 12, color: "hsl(24 95% 53%)" },
  { name: "开源之光", slug: "opensource", members: 28, color: "hsl(199 89% 48%)" },
];

const TRENDING_COMMUNITIES = [
  { name: "前端工程师", slug: "frontend", growth: 56 },
  { name: "求职面试", slug: "job-interview", growth: 42 },
  { name: "AI 研究院", slug: "ai-research", growth: 34 },
];

export function CategoriesSidebar() {
  return (
    <aside className="hidden lg:flex w-52 shrink-0 flex-col gap-3">
      <div className="sticky top-[60px]">
        {/* My Communities Card */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            我的社区
          </h3>
          <div className="space-y-0.5">
            {MY_COMMUNITIES.map((community) => (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-xs transition-all hover:bg-secondary group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: community.color }}
                  />
                  <span className="text-foreground group-hover:text-primary transition-colors truncate">
                    {community.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-1">
                  {community.members}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/communities"
            className="block mt-2 text-[11px] text-primary hover:underline text-center px-2"
          >
            浏览全部社区 →
          </Link>
        </div>

        {/* Trending Communities Card */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card mt-3">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-warning" />
            热门社区
          </h3>
          <div className="space-y-0.5">
            {TRENDING_COMMUNITIES.map((community, i) => (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-all hover:bg-secondary group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono w-4 text-center font-bold text-xs ${
                      i === 0
                        ? "text-warning"
                        : i === 1
                        ? "text-accent"
                        : "text-info"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {community.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-success">+{community.growth}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
