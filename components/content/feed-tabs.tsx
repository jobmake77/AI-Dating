"use client";

import { Flame, Clock, Heart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "use-intl";

interface FeedTabsProps {
  showFollowing?: boolean;
}

export function FeedTabs({ showFollowing = true }: FeedTabsProps) {
  const t = useTranslations('feedTabs');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "hot";
  const tabs = [
    { id: "hot", label: t('hot'), icon: Flame, color: "text-warning" },
    { id: "latest", label: t('latest'), icon: Clock, color: "text-info" },
    { id: "following", label: t('following'), icon: Heart, color: "text-red-500" },
  ];
  const visibleTabs = showFollowing ? tabs : tabs.filter((tab) => tab.id !== "following");

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    params.delete("page"); // Reset to page 1 when changing tabs
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-card">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === tab.id
              ? "gradient-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? "text-white" : tab.color}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
