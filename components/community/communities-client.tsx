"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommunityTabs } from "@/components/community/community-tabs";
import { CommunityList } from "@/components/community/community-list";
import { joinCommunity, leaveCommunity } from "@/lib/actions/communities";
import { toast } from "sonner";

interface CommunitiesClientProps {
  initialTab: "all" | "joined" | "trending";
  allCommunities: any[];
  joinedCommunities: any[];
  trendingCommunities: any[];
  showJoined: boolean;
}

export function CommunitiesClient({
  initialTab,
  allCommunities,
  joinedCommunities,
  trendingCommunities,
  showJoined
}: CommunitiesClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoinToggle = async (communityId: string, isJoined: boolean) => {
    startTransition(async () => {
      try {
        if (isJoined) {
          const result = await leaveCommunity(communityId);
          if (result.success) {
            toast.success("已退出社区");
            router.refresh();
          } else {
            toast.error(result.error || "退出失败");
          }
        } else {
          const result = await joinCommunity(communityId);
          if (result.success) {
            toast.success("已加入社区");
            router.refresh();
          } else {
            toast.error(result.error || "加入失败");
          }
        }
      } catch (error) {
        toast.error("操作失败，请重试");
      }
    });
  };

  const getCurrentCommunities = () => {
    switch (activeTab) {
      case "joined":
        return joinedCommunities;
      case "trending":
        return trendingCommunities;
      default:
        return allCommunities;
    }
  };

  // Filter communities based on search query
  const filteredCommunities = useMemo(() => {
    const communities = getCurrentCommunities();
    if (!searchQuery.trim()) return communities;

    const query = searchQuery.toLowerCase();
    return communities.filter((c: any) =>
      c.name?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
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
            placeholder="搜索社区..."
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

