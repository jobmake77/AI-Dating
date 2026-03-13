"use client";

import { useState } from "react";
import { CompactEventCard } from "@/components/events/compact-event-card";
import { EventFilterTabs, type EventFilterId } from "@/components/events/event-filter-tabs";
import type { EventListItem } from "@/lib/types/events";

interface EventsListClientProps {
  events: EventListItem[];
}

export function EventsListClient({ events }: EventsListClientProps) {
  const [filter, setFilter] = useState<EventFilterId>("upcoming");

  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : null;

    if (filter === "upcoming") {
      return startTime > now;
    } else if (filter === "past") {
      return endTime ? endTime < now : startTime < now;
    }
    return true; // "all"
  });

  return (
    <>
      <EventFilterTabs activeFilter={filter} onFilterChange={setFilter} />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filter === "upcoming"
              ? "暂无即将开始的活动"
              : filter === "past"
              ? "暂无已结束的活动"
              : "暂无活动"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-5">
          {filteredEvents.map((event, index) => (
            <CompactEventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
