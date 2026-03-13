"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, Repeat2, Flame, Pin, Trophy, Medal, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { getCategoryColor } from "@/lib/utils/categories";
import type { TrendingContentItem } from "@/lib/types/content";

interface TrendingContentCardProps {
  content: TrendingContentItem;
  rank: number;
}

const tagColors: Record<string, string> = {
  "项目分享": "bg-[hsl(340_82%_52%/0.1)] text-[hsl(340_82%_52%)]",
  "讨论": "bg-[hsl(24_95%_53%/0.1)] text-[hsl(24_95%_53%)]",
  "开源": "bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_50%)]",
  "面试经验": "bg-[hsl(262_83%_58%/0.1)] text-[hsl(262_83%_58%)]",
  "技术": "bg-info/10 text-info",
  "问答": "bg-success/10 text-success",
  "公告": "bg-primary/10 text-primary",
  "指南": "bg-[hsl(152_69%_40%/0.1)] text-[hsl(152_69%_40%)]",
};

const rankStyles = [
  { bg: "bg-warning/10", text: "text-warning", icon: Trophy },
  { bg: "bg-accent/10", text: "text-accent", icon: Medal },
  { bg: "bg-info/10", text: "text-info", icon: Award },
];

export function TrendingContentCard({ content, rank }: TrendingContentCardProps) {
  const catColorHsl = content.category ? getCategoryColor(content.category) : "221 83% 53%";
  const primaryTag = content.tags?.[0] || "讨论";
  const tagColor = tagColors[primaryTag] || "bg-tag text-tag-foreground";
  const rankStyle = rank < 3 ? rankStyles[rank] : null;
  const RankIcon = rankStyle ? rankStyle.icon : null;

  return (
    <div className="flex items-start gap-3">
      {/* Rank Badge */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${rankStyle ? rankStyle.bg : "bg-secondary"}`}>
        {rank < 3 && rankStyle && RankIcon ? (
          <RankIcon className={`h-4 w-4 ${rankStyle.text}`} />
        ) : (
          <span className={`font-mono text-sm font-bold ${rankStyle ? rankStyle.text : "text-muted-foreground"}`}>
            {rank + 1}
          </span>
        )}
      </div>

      {/* Content Card */}
      <motion.article
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.03, duration: 0.2 }}
        className="group flex-1 min-w-0 flex items-start gap-0 rounded-lg border border-border bg-card transition-all hover:border-primary/20 hover:shadow-card"
      >
        {/* Category color bar */}
        <div
          className="w-1 self-stretch rounded-l-lg shrink-0"
          style={{ backgroundColor: `hsl(${catColorHsl})` }}
        />

        <div className="flex-1 min-w-0 flex items-start gap-3 p-3">
          {/* Like column */}
          <div className="flex flex-col items-center gap-0 shrink-0">
            <button className="rounded p-0.5 text-muted-foreground transition-all hover:text-red-500 hover:bg-red-500/10">
              <Heart className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] font-bold text-foreground leading-none my-0.5">
              {content.likes_count}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {content.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
              <Link href={`/post/${content.id}`}>
                <h3 className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {content.title}
                </h3>
              </Link>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              {content.category && (
                <span
                  className="font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `hsl(${catColorHsl} / 0.1)`,
                    color: `hsl(${catColorHsl})`,
                  }}
                >
                  {content.category}
                </span>
              )}
              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${tagColor}`}>
                {primaryTag}
              </span>
              <Link
                href={`/u/${content.users.username}`}
                className="font-medium text-link hover:underline"
              >
                {content.users.full_name || content.users.username}
              </Link>
              <span className="text-muted-foreground/50">·</span>
              <span>
                {formatDistanceToNow(new Date(content.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
              {content.is_hot && (
                <span className="flex items-center gap-0.5 text-warning">
                  <Flame className="h-3 w-3" />
                  <span className="font-mono text-[10px] font-bold">HOT</span>
                </span>
              )}
            </div>

            {/* Preview text */}
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-1">
              {content.excerpt}
            </p>
          </div>

          {/* Stats column */}
          <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground shrink-0">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span className="font-mono font-medium">{content.comments_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="font-mono font-medium">{content.view_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat2 className="h-3 w-3" />
              <span className="font-mono font-medium">{content.reposts_count}</span>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
