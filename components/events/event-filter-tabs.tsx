"use client";

import { useState } from "react";

const filters = [
  { id: "upcoming", label: "即将开始" },
  { id: "all", label: "全部" },
  { id: "past", label: "已结束" },
] as const;

interface EventFilterTabsProps {
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
}

export function EventFilterTabs({
  activeFilter = "upcoming",
  onFilterChange,
}: EventFilterTabsProps) {
  const [active, setActive] = useState(activeFilter);

  const handleFilterClick = (filterId: string) => {
    setActive(filterId);
    onFilterChange?.(filterId);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-card">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
            active === filter.id
              ? "gradient-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
