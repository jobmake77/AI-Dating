"use client";

import { Flame, Clock, Heart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const tabs = [
  { id: "hot", label: "热门", icon: Flame, color: "text-warning" },
  { id: "latest", label: "最新", icon: Clock, color: "text-info" },
  { id: "following", label: "关注", icon: Heart, color: "text-red-500" },
];

export function FeedTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "hot";

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    params.delete("page"); // Reset to page 1 when changing tabs
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
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
