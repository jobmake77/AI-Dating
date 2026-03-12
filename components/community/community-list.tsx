"use client";

import { CompactCommunityCard } from "./compact-community-card";

interface CommunityListProps {
  communities: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon_url?: string | null;
    members_count: number;
    posts_count: number;
    tags?: string[] | null;
    is_joined?: boolean;
  }>;
  onJoinToggle?: (communityId: string, isJoined: boolean) => void;
}

export function CommunityList({ communities, onJoinToggle }: CommunityListProps) {
  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">暂无社区</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {communities.map((community, index) => (
        <CompactCommunityCard
          key={community.id}
          community={community}
          index={index}
          onJoinToggle={onJoinToggle}
        />
      ))}
    </div>
  );
}
