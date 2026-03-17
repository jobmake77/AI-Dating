'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCommunity } from '@/lib/actions/communities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CommunityIconUpload } from '@/components/community/community-icon-upload'
import { CommunityCoverUpload } from '@/components/community/community-cover-upload'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Users, Send } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTranslations } from 'use-intl'

export default function CreateCommunityPage() {
  const t = useTranslations('communitiesPage')
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('public')
  const [iconUrl, setIconUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const result = await createCommunity(formData)
    setIsSubmitting(false)

    if (result.success && result.data) {
      toast.success(t('createSuccess'), { description: t('createSuccessDescription') })
      router.push(`/communities/${result.data.slug}`)
    } else {
      toast.error(t('createFailed'), { description: result.error || t('actionFailed') })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backToList')}
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-5">{t('create')}</h1>

        <div className="flex gap-5">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="icon_url" value={iconUrl} readOnly />
              <input type="hidden" name="cover_url" value={coverUrl} readOnly />

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('name')}</label>
                <Input
                  name="name"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{t('nameHint')}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('descriptionLabel')}</label>
                <Textarea
                  name="description"
                  placeholder={t('descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-sm bg-secondary/60 border-none resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('typeLabel')}</label>
                <RadioGroup name="type" value={type} onValueChange={setType} required>
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

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Link href="/communities">
                  <Button type="button" variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground">
                    {t('cancel')}
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
                  disabled={isSubmitting || !name.trim()}
                >
                  <Send className="h-3 w-3" />
                  {isSubmitting ? t('creating') : t('create')}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Right: Preview */}
          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block w-80 shrink-0"
          >
            <div className="sticky top-[72px]">
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-card">
                <div className="h-2 gradient-primary" />
                {coverUrl && (
                  <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/10 to-info/20 relative">
                    <Image src={coverUrl} alt={t('cover')} fill unoptimized sizes="320px" className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt={t('icon')}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-secondary/60 flex items-center justify-center text-2xl">
                        🏘️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        {name || t('previewName')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {description || t('previewDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="font-mono font-medium text-foreground">0</span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary font-medium">
                      {type === 'public' ? t('previewPublic') : t('previewPrivate')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-card p-4 shadow-card">
                <h3 className="text-xs font-bold text-foreground mb-2">{t('previewTitle')}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {t('previewHint')}
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
