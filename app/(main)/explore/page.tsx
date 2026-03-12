import { Suspense } from "react";
import { Metadata } from "next";
import { ExploreClient } from "@/components/content/explore-client";
import { getCategories, getPopularTags, getExploreContents } from "@/lib/queries/explore";

export const metadata: Metadata = {
  title: "探索 - AI-Dating",
  description: "探索 AI-Dating 社区的精彩内容，按分类和标签筛选你感兴趣的话题",
};

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const category = params.category || "";
  const tag = params.tag || "";
  const page = parseInt(params.page || "1", 10);

  // Fetch data in parallel
  const [categories, tags, contentsData] = await Promise.all([
    getCategories(),
    getPopularTags(),
    getExploreContents({ category, tag, page, limit: 20 }),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreClient
        initialContents={contentsData.contents}
        categories={categories}
        tags={tags}
        activeCategory={category}
        activeTag={tag}
      />
    </Suspense>
  );
}

