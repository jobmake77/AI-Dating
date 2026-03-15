"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CommunityFeedTabsProps {
  activeTab: string;
  basePath: string;
}

export function CommunityFeedTabs({ activeTab, basePath }: CommunityFeedTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs = [
    { id: 'latest', label: '最新' },
    { id: 'popular', label: '热门' },
  ];

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
