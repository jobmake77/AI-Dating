"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";

interface CompactCommentFormProps {
  contentId: string;
  isAuthenticated: boolean;
}

export function CompactCommentForm({ contentId, isAuthenticated }: CompactCommentFormProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-card text-center">
        <p className="text-sm text-muted-foreground mb-3">登录后才能发表评论</p>
        <Button size="sm" onClick={() => router.push("/login")}>
          登录
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      setError("评论内容不能为空");
      return;
    }

    if (commentText.length > 1000) {
      setError("评论内容不能超过 1000 字符");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createComment(contentId, commentText);
      setCommentText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发表评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <h3 className="text-xs font-bold text-foreground mb-2">发表评论</h3>
      <Textarea
        placeholder="写下你的想法..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="min-h-[80px] resize-none text-sm bg-secondary/60 border-none"
        disabled={isSubmitting}
      />
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <div className="flex justify-between items-center mt-3">
        <span className="text-[10px] text-muted-foreground">
          {commentText.length} / 1000
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || !commentText.trim()}
          className="h-8 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
        >
          <Send className="h-3 w-3" />
          发表评论
        </Button>
      </div>
    </div>
  );
}

