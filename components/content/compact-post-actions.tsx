"use client";

import { useState } from "react";
import { Heart, Repeat2, Share2, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

interface CompactPostActionsProps {
  contentId: string;
  initialLikesCount: number;
  initialRepostsCount: number;
  initialIsLiked: boolean;
  initialIsReposted: boolean;
  initialIsBookmarked: boolean;
  isAuthenticated: boolean;
}

export function CompactPostActions({
  contentId,
  initialLikesCount,
  initialRepostsCount,
  initialIsLiked,
  initialIsReposted,
  initialIsBookmarked,
  isAuthenticated,
}: CompactPostActionsProps) {
  const t = useTranslations('contentUi');
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isRepostLoading, setIsRepostLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const router = useRouter();

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsLikeLoading(true);
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (newIsLiked) {
        await supabase.from("likes").insert({ content_id: contentId, user_id: user.id });
      } else {
        await supabase.from("likes").delete().eq("content_id", contentId).eq("user_id", user.id);
      }
      router.refresh();
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(initialLikesCount);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleToggleRepost = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsRepostLoading(true);
    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setRepostsCount(newIsReposted ? repostsCount + 1 : repostsCount - 1);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (newIsReposted) {
        await supabase.from("reposts").insert({ content_id: contentId, user_id: user.id });
      } else {
        await supabase.from("reposts").delete().eq("content_id", contentId).eq("user_id", user.id);
      }
      toast.success(newIsReposted ? t('reposted') : t('repostCancelled'));
      router.refresh();
    } catch (error) {
      setIsReposted(!newIsReposted);
      setRepostsCount(initialRepostsCount);
      console.error("Failed to toggle repost:", error);
      toast.error(t('actionFailed'));
    } finally {
      setIsRepostLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${contentId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('linkCopied'));
    } catch {
      toast.error(t('copyFailed'));
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsBookmarkLoading(true);
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (newIsBookmarked) {
        await supabase.from("bookmarks").insert({ content_id: contentId, user_id: user.id });
        toast.success(t('bookmarked'));
      } else {
        await supabase.from("bookmarks").delete().eq("content_id", contentId).eq("user_id", user.id);
        toast.success(t('bookmarkCancelled'));
      }
      router.refresh();
    } catch (error) {
      setIsBookmarked(!newIsBookmarked);
      console.error("Failed to toggle bookmark:", error);
      toast.error(t('actionFailed'));
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
      <button
        onClick={handleToggleLike}
        disabled={isLikeLoading}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
          isLiked
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : "bg-secondary/60 hover:text-red-500"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
        <span className="font-mono font-medium">{likesCount}</span>
      </button>

      <button
        onClick={handleToggleRepost}
        disabled={isRepostLoading}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
          isReposted
            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            : "bg-secondary/60 hover:text-green-500"
        }`}
      >
        <Repeat2 className="h-3.5 w-3.5" />
        <span className="font-mono font-medium">{repostsCount}</span>
      </button>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 hover:text-info transition-colors rounded-full bg-secondary/60 px-3 py-1.5"
      >
        <Share2 className="h-3.5 w-3.5" />
        {t('share')}
      </button>

      <button
        onClick={handleToggleBookmark}
        disabled={isBookmarkLoading}
        className={`flex items-center gap-1.5 transition-colors rounded-full px-3 py-1.5 ${
          isBookmarked
            ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            : "bg-secondary/60 hover:text-yellow-500"
        }`}
        >
        <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
        {t('bookmark')}
      </button>
    </div>
  );
}
