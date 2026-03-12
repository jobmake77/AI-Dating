"use client";

import { MessageSquare } from "lucide-react";
import { CompactCommentItem } from "./compact-comment-item";
import type { Comment } from "@/lib/queries/comments";

interface CompactCommentListProps {
  comments: Comment[];
  currentUserId?: string;
  contentId: string;
  isAuthenticated: boolean;
  commentsCount: number;
}

export function CompactCommentList({
  comments,
  currentUserId,
  contentId,
  isAuthenticated,
  commentsCount,
}: CompactCommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <h2 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-info" />
          评论
          <span className="rounded-full bg-info/10 text-info px-2 py-0.5 text-[10px]">0</span>
        </h2>
        <div className="text-center py-4 text-muted-foreground text-sm">
          还没有评论，来发表第一条吧！
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <h2 className="font-mono text-xs font-bold text-foreground mb-1 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-info" />
        评论
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
