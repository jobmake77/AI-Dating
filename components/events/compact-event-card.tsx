"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompactEventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    location: string;
    start_time: string;
    end_time?: string | null;
    participants_count: number;
    max_participants?: number | null;
    type: "official" | "offline";
    tags?: string[] | null;
  };
  index?: number;
}

const gradients = [
  "gradient-primary",
  "gradient-warm",
  "gradient-ocean",
  "gradient-sunset",
  "gradient-info",
  "gradient-success",
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CompactEventCard({ event, index = 0 }: CompactEventCardProps) {
  const gradientClass = gradients[index % gradients.length];
  const primaryTag = event.tags?.[0] || (event.type === "official" ? "官方活动" : "线下活动");

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-elevated transition-all group"
    >
      <div className={`h-1.5 ${gradientClass}`} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Link href={`/events/${event.id}`}>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
              </Link>
              {event.type === "official" && (
                <span className="rounded-full gradient-primary px-2 py-0.5 text-[10px] font-medium text-white">
                  官方
                </span>
              )}
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent font-medium">
                {primaryTag}
              </span>
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-primary/5 rounded-full px-2.5 py-1">
                <Calendar className="h-3 w-3 text-primary" />
                {formatDate(event.start_time)}
              </span>
              <span className="flex items-center gap-1.5 bg-info/5 rounded-full px-2.5 py-1">
                <Clock className="h-3 w-3 text-info" />
                {formatTime(event.start_time)}
              </span>
              <span className="flex items-center gap-1.5 bg-warning/5 rounded-full px-2.5 py-1">
                <MapPin className="h-3 w-3 text-warning" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5 bg-success/5 rounded-full px-2.5 py-1">
                <Users className="h-3 w-3 text-success" />
                <span className="font-mono">
                  {event.participants_count}
                  {event.max_participants && `/${event.max_participants}`}
                </span>
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="h-9 text-xs shrink-0 ml-4 gradient-primary text-white hover:opacity-90 shadow-primary"
            asChild
          >
            <Link href={`/events/${event.id}`}>报名参加</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
