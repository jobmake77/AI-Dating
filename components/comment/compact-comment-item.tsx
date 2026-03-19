"use client";

import { useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteComment, createComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import type { Comment } from "@/lib/queries/comments";
import { useLocale, useTranslations } from "use-intl";

interface CompactCommentItemProps {
  comment: Comment;
  isOwner: boolean;
  contentId: string;
  currentUserId?: string;
  isAuthenticated: boolean;
  depth: number;
}

function formatTime(dateStr: string, locale: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (diff < 24) return `${Math.max(1, Math.floor(diff))}h${locale === "en" ? " ago" : "前"}`;
  const d = new Date(dateStr);
  return locale === "en" ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function CompactCommentItem({
  comment,
  isOwner,
  contentId,
  currentUserId,
  isAuthenticated,
  depth,
}: CompactCommentItemProps) {
  const t = useTranslations("commentUi");
  const locale = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteComment(comment.id, contentId);
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await createComment(contentId, replyText, comment.id);
      setReplyText("");
      setShowReply(false);
      router.refresh();
    } catch {
      // Error handled
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-primary/20 pl-4" : ""}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-[9px] font-bold text-white">
            {comment.user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="font-mono font-medium text-primary">
            {comment.user?.username || t("anonymous")}
          </span>
          <span className="text-border">·</span>
          <span>{formatTime(comment.created_at, locale)}</span>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? t("deleting") : t("confirmDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
        {isAuthenticated && depth === 0 && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            {showReply ? t("collapse") : t("reply")}
          </button>
        )}

        {showReply && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t("replyPlaceholder", { username: comment.user?.username || "" })}
              className="min-h-[60px] text-sm bg-secondary/60 border-none"
              disabled={isReplying}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReply(false);
                  setReplyText("");
                }}
                className="h-7 text-xs"
              >
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isReplying || !replyText.trim()}
                className="h-7 text-xs gradient-primary text-white"
              >
                {isReplying ? t("replying") : t("reply")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CompactCommentItem
              key={reply.id}
              comment={reply}
              isOwner={currentUserId === reply.user_id}
              contentId={contentId}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
