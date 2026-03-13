'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/user/follow-button'
import { SendMessageButton } from '@/components/user/send-message-button'
import { Calendar, FileText, Heart, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserProfileCardProps {
  user: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
    bio: string | null
    followers_count?: number
    following_count?: number
    created_at?: string
  }
  isOwner: boolean
  currentUserId?: string
  isFollowing?: boolean
  isAuthenticated: boolean
  stats?: {
    contents_count: number
    total_likes: number
  }
}

export function UserProfileCard({
  user,
  isOwner,
  currentUserId,
  isFollowing = false,
  isAuthenticated,
  stats,
}: UserProfileCardProps) {
  const canEdit = isOwner && currentUserId === user.id

  const statItems = [
    {
      icon: Award,
      label: 'Karma',
      value: (stats?.total_likes || 0).toLocaleString(),
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: FileText,
      label: '内容',
      value: (stats?.contents_count || 0).toString(),
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Heart,
      label: '获赞',
      value: (stats?.total_likes || 0).toString(),
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      icon: Users,
      label: '粉丝',
      value: (user.followers_count || 0).toString(),
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card overflow-hidden shadow-card"
    >
      {/* Gradient header */}
      <div className="h-24 gradient-primary opacity-80" />

      <div className="px-5 pb-5 -mt-8">
        {/* Avatar and name row */}
        <div className="flex items-end gap-4 mb-4">
          <Avatar className="h-16 w-16 rounded-xl shadow-primary border-4 border-card shrink-0">
            <AvatarImage src={user.avatar || undefined} alt={user.full_name || user.username} />
            <AvatarFallback className="rounded-xl gradient-primary font-mono text-xl font-bold text-white">
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-mono text-lg font-bold text-foreground">
                  {user.full_name || user.username}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">{user.bio}</p>
              </div>

              {canEdit ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                    <Link href="/settings">编辑</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FollowButton
                    userId={user.id}
                    initialIsFollowing={isFollowing}
                    isCurrentUser={isOwner}
                    isAuthenticated={isAuthenticated}
                  />
                  <SendMessageButton userId={user.id} isAuthenticated={isAuthenticated} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center rounded-lg ${stat.bg} px-3 py-2.5`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
              <span className="font-mono text-sm font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {user.created_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              加入于{' '}
              {formatDistanceToNow(new Date(user.created_at), {
                addSuffix: false,
                locale: zhCN,
              })}
              前
            </span>
          )}
          <Link href={`/u/${user.username}/following`} className="flex items-center gap-1 hover:text-primary transition-colors">
            <Users className="h-3.5 w-3.5" />
            <strong className="text-foreground">{user.following_count || 0}</strong> 关注中
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
