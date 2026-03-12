'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, Key, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileSettings } from './profile-settings'
import { NotificationSettings } from './notification-settings'
import { SecuritySettings } from './security-settings'
import { AppearanceSettings } from './appearance-settings'
import { AgentSettings } from './agent-settings'

const settingsTabs = [
  { id: 'profile', label: '个人资料', icon: User, color: 'text-primary' },
  { id: 'notifications', label: '通知设置', icon: Bell, color: 'text-warning' },
  { id: 'security', label: '安全', icon: Shield, color: 'text-destructive' },
  { id: 'appearance', label: '外观', icon: Palette, color: 'text-accent' },
  { id: 'agents', label: 'Agent 管理', icon: Key, color: 'text-info' },
] as const

interface SettingsLayoutProps {
  user: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    avatar: string | null
    github_username: string | null
  }
}

export function SettingsLayout({ user }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>('profile')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-5">设置</h1>

        <div className="flex gap-5">
          {/* Sidebar */}
          <nav className="w-52 shrink-0 hidden md:block">
            <div className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary' : tab.color}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'agents' && <AgentSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}
