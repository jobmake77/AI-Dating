"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExploreSidebar } from "@/components/content/explore-sidebar";
import { CompactContentCard } from "@/components/content/compact-content-card";
import { getCategoryColor } from "@/lib/utils/categories";

interface ExploreClientProps {
  initialContents: any[];
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
}

export function ExploreClient({
  initialContents,
  categories,
  tags,
  activeCategory,
  activeTag,
}: ExploreClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [contents] = useState(initialContents);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams();

    // Start with current params
    if (activeCategory) params.set("category", activeCategory);
    if (activeTag) params.set("tag", activeTag);

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/explore?${queryString}` : "/explore");
  };

  const handleCategoryChange = (category: string) => {
    updateSearchParams({ category });
    setMobileFiltersOpen(false);
  };

  const handleTagChange = (tag: string) => {
    updateSearchParams({ tag });
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    router.push("/explore");
    setMobileFiltersOpen(false);
  };

  const activeCat = categories.find((c) => c.slug === activeCategory);

  // Filter contents
  const filteredContents = search
    ? contents.filter((content) =>
        content.title.toLowerCase().includes(search.toLowerCase()) ||
        content.excerpt?.toLowerCase().includes(search.toLowerCase())
      )
    : contents;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-4">
          {/* Desktop Sidebar */}
          <ExploreSidebar
            categories={categories}
            tags={tags}
            activeCategory={activeCategory}
            activeTag={activeTag}
            onCategoryChange={handleCategoryChange}
            onTagChange={handleTagChange}
          />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Search bar with mobile filter button */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索帖子..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 bg-card border-border text-sm shadow-card focus:ring-2 focus:ring-primary/20"
              />
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Active filters */}
            {(activeTag || activeCategory) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 flex items-center gap-2 flex-wrap"
              >
                {activeCat && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5"
                    style={{
                      backgroundColor: `hsl(${getCategoryColor(activeCat.slug)} / 0.1)`,
                      color: `hsl(${getCategoryColor(activeCat.slug)})`,
                    }}
                  >
                    {activeCat.name}
                  </span>
                )}
                {activeTag && (
                  <span className="rounded-full gradient-primary px-3 py-1 font-mono text-xs text-white shadow-sm">
                    {activeTag}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:underline"
                >
                  清除筛选
                </button>
              </motion.div>
            )}

            {/* Content list */}
            <div className="space-y-1.5">
              {filteredContents.length > 0 ? (
                filteredContents.map((content, index) => (
                  <CompactContentCard
                    key={content.id}
                    content={content}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>没有找到相关内容</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile filters modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">筛选</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ExploreSidebar
                  categories={categories}
                  tags={tags}
                  activeCategory={activeCategory}
                  activeTag={activeTag}
                  onCategoryChange={handleCategoryChange}
                  onTagChange={handleTagChange}
                  isMobile
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
