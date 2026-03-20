"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { createComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import { useTranslations } from "use-intl";

interface CompactCommentFormProps {
  contentId: string;
  isAuthenticated: boolean;
  className?: string;
}

export function CompactCommentForm({ contentId, isAuthenticated, className }: CompactCommentFormProps) {
  const t = useTranslations("commentUi");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className={className ? `${className} text-center` : "text-center"}>
        <p className="text-sm text-muted-foreground mb-3">{t("loginRequired")}</p>
        <Button size="sm" onClick={() => router.push("/login")}>
          {t("login")}
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      setError(t("emptyError"));
      return;
    }

    if (commentText.length > 1000) {
      setError(t("tooLongError"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createComment(contentId, commentText);
      setCommentText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-xs font-bold text-foreground mb-2">{t("title")}</h3>
      <Textarea
        placeholder={t("placeholder")}
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
          {t("submit")}
        </Button>
      </div>
    </div>
  );
}
