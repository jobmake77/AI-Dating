'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { updateContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TagInput } from '@/components/tags/tag-input'
import { Smile } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { EmojiClickData } from 'emoji-picker-react'
import { TiptapEditor, type TiptapEditorRef } from '@/components/editor/tiptap-editor'
import { CoverImageUpload } from './cover-image-upload'
import { useTranslations } from 'use-intl'

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface ContentEditFormProps {
  content: {
    id: string
    content: string
    tags: string[] | null
    price_type: string
    cover_image?: string | null
  }
}

export function ContentEditForm({ content: initialContent }: ContentEditFormProps) {
  const t = useTranslations('editorUi')
  const router = useRouter()
  const [content, setContent] = useState(initialContent.content)
  const [tags, setTags] = useState<string[]>(initialContent.tags || [])
  const [coverImage, setCoverImage] = useState<string>(initialContent.cover_image || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<TiptapEditorRef>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Strip HTML tags to check if there's actual content
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      setError(t('contentRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('price_type', 'free')
      formData.append('tags', JSON.stringify(tags))
      if (coverImage) {
        formData.append('cover_image', coverImage)
      }

      await updateContent(initialContent.id, formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'))
      setIsSubmitting(false)
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    // Insert emoji at cursor position using editor API
    if (editorRef.current) {
      editorRef.current.insertContent(emojiData.emoji)
    }
    setShowEmojiPicker(false)
  }

  const maxLength = 5000
  const textContent = content.replace(/<[^>]*>/g, '')
  const remaining = maxLength - textContent.length

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cover Image Upload */}
      <div className="space-y-2">
        <CoverImageUpload
          currentCover={coverImage}
          onUploadSuccess={(url) => setCoverImage(url)}
          onRemove={() => setCoverImage('')}
        />
      </div>

      {/* Tiptap Editor */}
      <div className="space-y-3">
        <TiptapEditor
          ref={editorRef}
          content={content}
          onChange={setContent}
          placeholder={t('writeSomething')}
        />

        {/* Character Count */}
        <div className="flex items-center justify-between px-2">
          <span className={`text-sm ${remaining < 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {t('charactersRemaining', { count: remaining })}
          </span>
        </div>

        {/* Tags */}
        <div className="px-2">
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder={t('addTagsPlaceholder')}
            maxTags={5}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-1">
          {/* Emoji Picker */}
          <div className="relative" ref={emojiPickerRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={showEmojiPicker ? 'text-primary bg-accent' : ''}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={350}
                  height={400}
                  searchPlaceholder={t('searchEmoji')}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            size="lg"
            className="rounded-full px-6"
          >
            {isSubmitting ? t('updating') : t('updateContent')}
          </Button>
        </div>
      </div>
    </form>
  )
}
