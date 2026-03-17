"use client";

import { LayoutGrid, UserCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";

interface CommunityTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showJoined?: boolean;
}

export function CommunityTabs({
  activeTab = "all",
  onTabChange,
  showJoined = true
}: CommunityTabsProps) {
  const t = useTranslations('communitiesPage');
  const [active, setActive] = useState(activeTab);
  const tabs = [
    { id: "all", label: t('tabAll'), icon: LayoutGrid, color: "text-primary" },
    { id: "joined", label: t('tabJoined'), icon: UserCheck, color: "text-success" },
    { id: "trending", label: t('tabTrending'), icon: TrendingUp, color: "text-warning" },
  ];

  const handleTabClick = (tabId: string) => {
    setActive(tabId);
    onTabChange?.(tabId);
  };

  const visibleTabs = showJoined ? tabs : tabs.filter(t => t.id !== "joined");

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-card">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            active === tab.id
              ? "gradient-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <tab.icon className={`h-3.5 w-3.5 ${active === tab.id ? "text-white" : tab.color}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
