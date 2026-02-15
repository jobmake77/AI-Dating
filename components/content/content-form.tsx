'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TagInput } from '@/components/tags/tag-input'
import { Lock, Globe, Smile } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { EmojiClickData } from 'emoji-picker-react'
import { TiptapEditor, type TiptapEditorRef } from '@/components/editor/tiptap-editor'

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export function ContentForm() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [priceType, setPriceType] = useState<'free' | 'member'>('free')
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
      setError('请输入内容')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('price_type', priceType)
      formData.append('tags', JSON.stringify(tags))

      await createContent(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败，请重试')
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

      {/* Tiptap Editor */}
      <div className="space-y-3">
        <TiptapEditor
          ref={editorRef}
          content={content}
          onChange={setContent}
          placeholder="分享你的想法..."
        />

        {/* Character Count */}
        <div className="flex items-center justify-between px-2">
          <span className={`text-sm ${remaining < 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {remaining} 字符剩余
          </span>
        </div>

        {/* Tags */}
        <div className="px-2">
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="添加标签..."
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
                  searchPlaceholder="搜索表情..."
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Price Type Toggle */}
          <Button
            type="button"
            variant={priceType === 'free' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPriceType('free')}
          >
            <Globe className="h-4 w-4 mr-1" />
            公开
          </Button>
          <Button
            type="button"
            variant={priceType === 'member' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPriceType('member')}
          >
            <Lock className="h-4 w-4 mr-1" />
            会员
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          size="lg"
          className="rounded-full px-6"
        >
          {isSubmitting ? '发布中...' : '发布'}
        </Button>
      </div>
    </form>
  )
}
