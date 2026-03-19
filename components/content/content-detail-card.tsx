"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { getCategoryColor } from "@/lib/utils/categories";
import DOMPurify from "dompurify";
import { useMemo, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { deleteContent } from "@/lib/actions/content";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "use-intl";

interface ContentDetailCardProps {
  content: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    tags: string[] | null;
    category?: string;
    category_name?: string | null;
    category_color?: string | null;
    price_type: string;
    view_count: number;
    created_at: string;
    author_id: string;
    users: {
      username: string;
      avatar: string | null;
      full_name: string | null;
    };
  };
  canViewFullContent: boolean;
  currentUserId?: string;
}

export function ContentDetailCard({ content, canViewFullContent, currentUserId }: ContentDetailCardProps) {
  const t = useTranslations('contentUi');
  const locale = useLocale();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const catColorHsl = content.category_color || (content.category ? getCategoryColor(content.category) : "221 83% 53%");
  const primaryTag = content.tags?.[0] || t('defaultTag');
  const isAuthor = currentUserId === content.author_id;
  const sanitizedContent = useMemo(() => {
    const displayContent = canViewFullContent
      ? content.content
      : content.content.substring(0, 500) + "...";

    return DOMPurify.sanitize(displayContent, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "img", "a", "code", "pre", "blockquote", "div", "span", "table", "thead", "tbody", "tr", "th", "td"],
      ALLOWED_ATTR: ["href", "src", "alt", "width", "height", "class", "style", "target", "rel"],
    });
  }, [canViewFullContent, content.content]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteContent(content.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete content:", error);
      setIsDeleting(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card overflow-hidden shadow-card"
    >
      {/* Category color bar */}
      <div className="h-1" style={{ backgroundColor: `hsl(${catColorHsl})` }} />

      <div className="p-5">
        {/* Meta and Delete Button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={content.users.avatar || undefined} alt={content.users.full_name || content.users.username} />
              <AvatarFallback className="gradient-primary text-xs font-bold text-white">
                {content.users.full_name?.[0] || content.users.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/u/${content.users.username}`}
                className="font-mono font-medium text-primary hover:underline block"
              >
                {content.users.full_name || content.users.username}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(content.created_at), {
                    addSuffix: true,
                    locale: locale === 'en' ? enUS : zhCN,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {content.view_count} {t('views')}
                </span>
                {content.category && (
                  <Link
                    href={`/explore?category=${content.category}`}
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
                    style={{
                      backgroundColor: `hsl(${catColorHsl} / 0.1)`,
                      color: `hsl(${catColorHsl})`,
                    }}
                  >
                    {content.category_name || content.category}
                  </Link>
                )}
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary font-medium">
                  {primaryTag}
                </span>
              </div>
            </div>
          </div>

          {/* Delete Button (only visible to author) */}
          {isAuthor && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('confirmDeleteDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? t('deleting') : t('confirmDelete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-4">{content.title}</h1>

        {/* Content */}
        <div
          className="text-sm leading-relaxed text-foreground/90 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </motion.article>
  );
}
