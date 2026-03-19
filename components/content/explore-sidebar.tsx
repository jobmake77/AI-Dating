"use client";

import { Filter, Hash } from "lucide-react";
import { getCategoryColor } from "@/lib/utils/categories";
import { useTranslations } from "use-intl";

interface ExploreSidebarProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
  }>;
  tags: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  activeCategory: string;
  activeTag: string;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  isMobile?: boolean;
}

export function ExploreSidebar({
  categories,
  tags,
  activeCategory,
  activeTag,
  onCategoryChange,
  onTagChange,
  isMobile = false,
}: ExploreSidebarProps) {
  const t = useTranslations('explorePage');
  return (
    <aside className={isMobile ? "w-full" : "hidden lg:block w-64 shrink-0"}>
      <div className={isMobile ? "space-y-3" : "sticky top-[60px] space-y-3"}>
        {/* Categories */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            {t('categories')}
          </h2>
          <div className="space-y-0.5">
            <button
              onClick={() => onCategoryChange("")}
              className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-all ${
                !activeCategory
                  ? "gradient-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t('allCategories')}
            </button>
            {categories.map((cat) => {
              const hsl = getCategoryColor(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-all flex items-center gap-2 ${
                    activeCategory === cat.slug
                      ? "font-medium border"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  style={
                    activeCategory === cat.slug
                      ? {
                          backgroundColor: `hsl(${hsl} / 0.1)`,
                          color: `hsl(${hsl})`,
                          borderColor: `hsl(${hsl} / 0.3)`,
                        }
                      : {}
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${hsl})` }}
                  />
                  <span className="truncate">{cat.name}</span>
                  <span className="font-mono text-[10px] ml-auto opacity-60">
                    {cat.postCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
            <Hash className="h-3 w-3" />
            {t('tags')}
          </h2>
          <div className="space-y-0.5">
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => onTagChange(tag.name)}
                className={`w-full text-left rounded-md px-2.5 py-1.5 text-xs transition-all flex items-center justify-between ${
                  activeTag === tag.name
                    ? "font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                style={
                  activeTag === tag.name
                    ? {
                        backgroundColor: `${tag.color.replace(")", " / 0.1)")}`,
                        color: tag.color,
                      }
                    : {}
                }
              >
                <span>{tag.name}</span>
                <span className="font-mono text-[10px] opacity-60">{tag.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
