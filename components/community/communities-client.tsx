"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommunityTabs } from "@/components/community/community-tabs";
import { CommunityList } from "@/components/community/community-list";
import { joinCommunity, leaveCommunity } from "@/lib/actions/communities";
import { toast } from "sonner";
import type { CommunityListItem } from '@/lib/types/community'
import { useTranslations } from "use-intl";

type CommunityTab = 'all' | 'joined' | 'trending'

interface CommunitiesClientProps {
  initialTab: CommunityTab;
  allCommunities: CommunityListItem[];
  joinedCommunities: CommunityListItem[];
  trendingCommunities: CommunityListItem[];
  showJoined: boolean;
}

export function CommunitiesClient({
  initialTab,
  allCommunities,
  joinedCommunities,
  trendingCommunities,
  showJoined
}: CommunitiesClientProps) {
  const t = useTranslations('communitiesPage')
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinToggle = async (communityId: string, isJoined: boolean) => {
    startTransition(async () => {
      try {
        if (isJoined) {
          const result = await leaveCommunity(communityId);
          if (result.success) {
            toast.success(t('leaveSuccess'));
            router.refresh();
          } else {
            toast.error(result.error || t('leaveFailed'));
          }
        } else {
          const result = await joinCommunity(communityId);
          if (result.success) {
            toast.success(t('joinSuccess'));
            router.refresh();
          } else {
            toast.error(result.error || t('joinFailed'));
          }
        }
      } catch {
        toast.error(t('actionFailed'));
      }
    });
  };

  // Filter communities based on search query
  const filteredCommunities = useMemo(() => {
    const communities = activeTab === 'joined'
      ? joinedCommunities
      : activeTab === 'trending'
        ? trendingCommunities
        : allCommunities

    if (!searchQuery.trim()) return communities;

    const query = searchQuery.toLowerCase();
    return communities.filter((community) =>
      community.name.toLowerCase().includes(query) ||
      community.description?.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery, allCommunities, joinedCommunities, trendingCommunities]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CommunityTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
          showJoined={showJoined}
        />
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 bg-card border-border text-xs shadow-card"
          />
        </div>
      </div>
      <CommunityList
        communities={filteredCommunities}
        onJoinToggle={handleJoinToggle}
      />
    </div>
  );
}
