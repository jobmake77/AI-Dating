"use client";

import { Users, TrendingUp, Github, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CommunitySidebarProps {
  communityInfo?: {
    name: string;
    icon: string;
    description: string;
    members: number;
    online: number;
  };
  trendingTags?: Array<{
    name: string;
    count: number;
  }>;
}

export function CommunitySidebar({ communityInfo, trendingTags }: CommunitySidebarProps) {
  const defaultCommunityInfo = {
    name: "AI-Dating",
    icon: "💻",
    description: "连接 AI 开发者与创作者的技术社区，分享项目、技术和灵感",
    members: 52800,
    online: 1247,
  };

  const defaultTrendingTags = [
    { name: "AI/ML", count: 1234 },
    { name: "Rust", count: 856 },
    { name: "前端", count: 742 },
    { name: "DevOps", count: 623 },
    { name: "开源", count: 512 },
  ];

  const defaultActiveCommunities = [
    { name: "前端工程师", slug: "frontend", members: 567 },
    { name: "求职面试", slug: "job-interview", members: 456 },
    { name: "AI 研究院", slug: "ai-research", members: 342 },
    { name: "开源之光", slug: "opensource", members: 289 },
    { name: "Rust 中文社区", slug: "rust-cn", members: 198 },
  ];

  const info = communityInfo || defaultCommunityInfo;
  const tags = trendingTags || defaultTrendingTags;

  return (
    <aside className="hidden xl:flex w-80 shrink-0 flex-col gap-3">
      <div className="sticky top-[60px]">
        {/* Community Info */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card">
          <div className="h-16 gradient-primary opacity-90" />
          <div className="p-3 -mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl bg-card rounded-lg p-1.5 shadow-card border border-border">
                {info.icon}
              </span>
              <h2 className="font-mono text-sm font-bold text-foreground">{info.name}</h2>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">
              {info.description}
            </p>
            <div className="flex gap-5 mb-3">
              <div>
                <span className="font-mono text-sm font-bold text-foreground block">
                  {(info.members / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" /> 成员
                </span>
              </div>
              <div>
                <span className="font-mono text-sm font-bold text-success block">
                  {info.online.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> 在线
                </span>
              </div>
            </div>
            <Button className="w-full h-8 gradient-primary text-white hover:opacity-90 text-xs shadow-primary">
              加入社区
            </Button>
          </div>
        </div>

        {/* Active Communities */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card mt-3">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            活跃社区
          </h3>
          <div className="space-y-0.5">
            {defaultActiveCommunities.map((community) => (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-all hover:bg-secondary group"
              >
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {community.name}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">({community.members})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card mt-3">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            <TrendingUp className="h-3 w-3 text-warning" />
            热门标签
          </h3>
          <div className="space-y-0.5">
            {tags.map((tag, i) => (
              <Link
                key={tag.name}
                href={`/explore?tag=${tag.name}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-all hover:bg-secondary group"
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
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {tag.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{tag.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
