"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";

export type EventFilterId = "upcoming" | "all" | "past";

interface EventFilterTabsProps {
  activeFilter?: EventFilterId;
  onFilterChange?: (filterId: EventFilterId) => void;
}

export function EventFilterTabs({
  activeFilter = "upcoming",
  onFilterChange,
}: EventFilterTabsProps) {
  const t = useTranslations('eventsPage')
  const [active, setActive] = useState<EventFilterId>(activeFilter);
  const filters = [
    { id: "upcoming", label: t('filterUpcoming') },
    { id: "all", label: t('filterAll') },
    { id: "past", label: t('filterPast') },
  ] as const;

  const handleFilterClick = (filterId: EventFilterId) => {
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
