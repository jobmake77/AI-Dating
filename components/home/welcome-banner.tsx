"use client";

import { Users, Zap, Layers } from "lucide-react";

interface WelcomeBannerProps {
  stats?: {
    developers: number;
    online: number;
    communities: number;
  };
}

export function WelcomeBanner({ stats }: WelcomeBannerProps) {
  const defaultStats = {
    developers: 52800,
    online: 1247,
    communities: 8,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="gradient-hero border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground mb-0.5">
              欢迎来到{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                AI-Dating
              </span>{" "}
              开发者社区
            </h1>
            <p className="text-xs text-muted-foreground">
              用代码连接志同道合的人，分享技术、项目和灵感
            </p>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-mono text-sm font-bold text-foreground block">
                  {(displayStats.developers / 1000).toFixed(1)}k
                </span>
                <span className="text-muted-foreground">开发者</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-success" />
              </div>
              <div>
                <span className="font-mono text-sm font-bold text-foreground block">
                  {displayStats.online.toLocaleString()}
                </span>
                <span className="text-muted-foreground">在线</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="font-mono text-sm font-bold text-foreground block">
                  {displayStats.communities}
                </span>
                <span className="text-muted-foreground">活跃社区</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
