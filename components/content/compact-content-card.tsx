"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, Flame, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { getCategoryColor } from "@/lib/utils/categories";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocale, useTranslations } from "use-intl";

interface CompactContentCardProps {
  content: {
    id: string;
    title: string;
    excerpt: string;
    tags: string[] | null;
    category?: string | null; // Category slug
    category_name?: string | null;
    category_color?: string | null;
    price_type: string;
    view_count: number;
    likes_count: number;
    reposts_count: number;
    comments_count: number;
    created_at: string;
    users: {
      username: string;
      avatar: string | null;
      full_name: string | null;
    };
    href?: string;
    source_type?: "content" | "repost" | "community_post";
    community?: {
      slug: string;
      name: string;
    } | null;
    is_pinned?: boolean;
    is_hot?: boolean;
  };
  index?: number;
  compact?: boolean;
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

export function CompactContentCard({ content, index = 0, compact = false }: CompactContentCardProps) {
  const t = useTranslations('contentUi');
  const locale = useLocale();
  const catColorHsl = content.category_color || (content.category ? getCategoryColor(content.category) : "221 83% 53%");
  const primaryTag = content.tags?.[0] || t('defaultTag');
  const tagColor = tagColors[primaryTag] || "bg-tag text-tag-foreground";
  const contentHref = content.href || `/post/${content.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group flex items-start gap-0 border-b border-border/90 bg-transparent transition-colors last:border-b-0 hover:bg-secondary/20"
    >
      {/* Category color bar */}
      <div
        className="w-1 self-stretch shrink-0"
        style={{ backgroundColor: `hsl(${catColorHsl})` }}
      />

      <div className="flex-1 min-w-0 flex items-start gap-3 px-4 py-3">
        {/* Like column (replacing vote) */}
        <div className="flex flex-col items-center gap-0 shrink-0 pt-0.5">
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
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {content.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
            <Link href={contentHref}>
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
                {content.category_name || content.category}
              </span>
            )}
            <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${tagColor}`}>
              {primaryTag}
            </span>
            {content.community && (
              <Link
                href={`/communities/${content.community.slug}`}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium text-info bg-info/10 hover:bg-info/15"
              >
                {t('communityPrefix')} · {content.community.name}
              </Link>
            )}
            <Avatar className="h-4 w-4">
              <AvatarImage src={content.users.avatar || undefined} alt={content.users.full_name || content.users.username} />
              <AvatarFallback className="text-[8px]">
                {content.users.full_name?.[0] || content.users.username[0]}
              </AvatarFallback>
            </Avatar>
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
                locale: locale === 'en' ? enUS : zhCN,
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
          {!compact && (
            <p className="mt-1 text-xs leading-6 text-muted-foreground line-clamp-1">
              {content.excerpt}
            </p>
          )}
        </div>

        {/* Stats columns (Trae-style) */}
        <div className="hidden shrink-0 items-center gap-4 text-[11px] text-muted-foreground sm:flex">
          <div className="flex flex-col items-center w-12">
            <span className="font-mono font-bold text-foreground">{content.comments_count}</span>
            <span className="text-[10px] flex items-center gap-0.5">
              <MessageCircle className="h-2.5 w-2.5" /> {t('replies')}
            </span>
          </div>
          <div className="flex flex-col items-center w-12">
            <span className="font-mono font-bold text-foreground">
              {formatCount(content.view_count)}
            </span>
            <span className="text-[10px] flex items-center gap-0.5">
              <Eye className="h-2.5 w-2.5" /> {t('views')}
            </span>
          </div>
          <div className="flex flex-col items-center w-12">
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(content.created_at), {
                addSuffix: false,
                locale: locale === 'en' ? enUS : zhCN,
              }).replace(locale === 'en' ? "about " : "大约 ", "")}
            </span>
            <span className="text-[10px]">{t('activity')}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}
