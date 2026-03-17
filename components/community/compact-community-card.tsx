"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "use-intl";

interface CompactCommunityCardProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon_url?: string | null;
    members_count: number;
    posts_count: number;
    tags?: string[] | null;
    is_joined?: boolean;
  };
  index?: number;
  onJoinToggle?: (communityId: string, isJoined: boolean) => void;
}

const gradients = [
  "gradient-primary",
  "gradient-warm",
  "gradient-ocean",
  "gradient-sunset",
  "gradient-info",
  "gradient-success",
];

export function CompactCommunityCard({
  community,
  index = 0,
  onJoinToggle
}: CompactCommunityCardProps) {
  const t = useTranslations('communitiesPage')
  const gradientClass = gradients[index % gradients.length];
  const primaryTag = community.tags?.[0] || t('title');

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJoinToggle?.(community.id, community.is_joined || false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/communities/${community.slug}`}
        className="block rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-elevated group"
      >
        <div className={`h-2 ${gradientClass}`} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            {community.icon_url ? (
              <Image
                src={community.icon_url}
                alt={community.name}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {community.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {community.description || t('noDescription')}
              </p>
              <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="font-mono font-medium text-foreground">
                    {community.members_count >= 1000
                      ? `${(community.members_count / 1000).toFixed(1)}k`
                      : community.members_count}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-info" />
                  <span className="font-mono font-medium text-foreground">
                    {community.posts_count}
                  </span>
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary font-medium">
                  {primaryTag}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleJoinClick}
              className={`h-8 text-xs shrink-0 ${
                community.is_joined
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "gradient-primary text-white hover:opacity-90 shadow-primary"
              }`}
            >
              {community.is_joined ? t('joined') : t('join')}
            </Button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
