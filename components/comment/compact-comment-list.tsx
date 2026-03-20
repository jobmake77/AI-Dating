"use client";

import { MessageSquare } from "lucide-react";
import { CompactCommentItem } from "./compact-comment-item";
import type { Comment } from "@/lib/queries/comments";
import { useTranslations } from "use-intl";

interface CompactCommentListProps {
  comments: Comment[];
  currentUserId?: string;
  contentId: string;
  isAuthenticated: boolean;
  commentsCount: number;
  className?: string;
}

export function CompactCommentList({
  comments,
  currentUserId,
  contentId,
  isAuthenticated,
  commentsCount,
  className,
}: CompactCommentListProps) {
  const t = useTranslations("commentUi");
  if (comments.length === 0) {
    return (
      <div className={className}>
        <h2 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-info" />
          {t("comments")}
          <span className="rounded-full bg-info/10 text-info px-2 py-0.5 text-[10px]">0</span>
        </h2>
        <div className="text-center py-4 text-muted-foreground text-sm">
          {t("empty")}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="font-mono text-xs font-bold text-foreground mb-1 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-info" />
        {t("comments")}
        <span className="rounded-full bg-info/10 text-info px-2 py-0.5 text-[10px]">
          {commentsCount}
        </span>
      </h2>
      <div className="divide-y divide-border">
        {comments.map((comment) => (
          <CompactCommentItem
            key={comment.id}
            comment={comment}
            isOwner={currentUserId === comment.user_id}
            contentId={contentId}
            currentUserId={currentUserId}
            isAuthenticated={isAuthenticated}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
