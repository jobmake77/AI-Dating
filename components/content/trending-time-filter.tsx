"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const timeFilters = [
  { value: "day", label: "今日" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "all", label: "全部" },
] as const;

interface TrendingTimeFilterProps {
  currentRange: string;
}

export function TrendingTimeFilter({ currentRange }: TrendingTimeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-card">
      {timeFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilterChange(filter.value)}
          className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
            currentRange === filter.value
              ? "gradient-warm text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
