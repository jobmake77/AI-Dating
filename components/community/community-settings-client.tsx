'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCommunity, deleteCommunity } from '@/lib/actions/communities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CommunityIconUpload } from '@/components/community/community-icon-upload'
import { CommunityCoverUpload } from '@/components/community/community-cover-upload'
import { Settings, Users, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'use-intl'

interface CommunitySettingsClientProps {
  community: {
    id: string
    slug: string
    name: string
    description: string | null
    type: string
    icon_url: string | null
    cover_url: string | null
  }
  slug: string
}

export function CommunitySettingsClient({ community, slug }: CommunitySettingsClientProps) {
  const t = useTranslations('communitiesPage')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [name, setName] = useState(community.name)
  const [description, setDescription] = useState(community.description || '')
  const [type, setType] = useState(community.type)
  const [iconUrl, setIconUrl] = useState<string>(community.icon_url || '')
  const [coverUrl, setCoverUrl] = useState<string>(community.cover_url || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const result = await updateCommunity(community.id, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(t('saveSuccess'), { description: t('saveSuccessDescription') })
      window.location.href = `/communities/${slug}`
    } else {
      toast.error(t('saveFailed'), { description: result.error || t('actionFailed') })
    }
  }

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    setIsDeleting(true)
    const result = await deleteCommunity(community.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success(t('deleteSuccess'), { description: t('deleteSuccessDescription') })
      router.push('/communities')
      router.refresh()
    } else {
      toast.error(t('deleteFailed'), { description: result.error || t('actionFailed') })
    }
  }

  const settingsTabs = [
    { id: 'basic', label: t('settingsBasic'), icon: Settings, color: 'text-primary' },
    { id: 'members', label: t('settingsMembers'), icon: Users, color: 'text-info' },
    { id: 'permissions', label: t('settingsPermissions'), icon: Shield, color: 'text-warning' },
    { id: 'danger', label: t('settingsDanger'), icon: Trash2, color: 'text-destructive' },
  ] as const

  return (
    <div className="flex gap-5">
      {/* Left Sidebar Navigation */}
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

      {/* Right Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">{t('settingsBasic')}</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <input type="hidden" name="icon_url" value={iconUrl} readOnly />
              <input type="hidden" name="cover_url" value={coverUrl} readOnly />

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('name')}</label>
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('descriptionLabel')}</label>
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-sm bg-secondary/60 border-none resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('typeLabel')}</label>
                <RadioGroup name="type" value={type} onValueChange={setType}>
                  <div className="flex items-center space-x-2 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="public" id="public" />
                    <label htmlFor="public" className="text-xs cursor-pointer flex-1">
                      <span className="font-medium text-foreground">{t('public')}</span>
                      <span className="text-muted-foreground"> - {t('publicDescription')}</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="private" id="private" />
                    <label htmlFor="private" className="text-xs cursor-pointer flex-1">
                      <span className="font-medium text-foreground">{t('private')}</span>
                      <span className="text-muted-foreground"> - {t('privateDescription')}</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('icon')}</label>
                <CommunityIconUpload
                  currentIcon={iconUrl || null}
                  onUploadSuccess={setIconUrl}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('cover')}</label>
                <CommunityCoverUpload
                  currentCover={coverUrl || null}
                  onUploadSuccess={setCoverUrl}
                  onRemove={() => setCoverUrl('')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">{t('settingsMembers')}</h2>
            <div className="rounded-lg bg-secondary/60 p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">{t('membersOpenElsewhere')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('membersHint')}
              </p>
              <Button asChild size="sm" className="mt-4 h-9 text-xs">
                <Link href={`/communities/${slug}/members`}>{t('goMembers')}</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'permissions' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">{t('settingsPermissions')}</h2>
            <div className="rounded-lg bg-secondary/60 p-8 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">{t('permissionsSoon')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t('permissionsHint')}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'danger' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-destructive mb-3">{t('settingsDanger')}</h2>
            <p className="text-xs text-muted-foreground mb-5">
              {t('dangerHint')}
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 text-xs"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {isDeleting ? t('deleting') : t('deleteCommunity')}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
