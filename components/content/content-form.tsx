'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TagInput } from '@/components/tags/tag-input'
import { Smile } from 'lucide-react'
import type { EmojiClickData } from 'emoji-picker-react'
import { TiptapEditor, type TiptapEditorRef } from '@/components/editor/tiptap-editor'
import { CoverImageUpload } from './cover-image-upload'

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export function ContentForm() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string>('')
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
      formData.append('price_type', 'free')
      formData.append('tags', JSON.stringify(tags))
      if (coverImage) {
        formData.append('cover_image', coverImage)
      }

      await createContent(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发布失败，请重试'
      setError(errorMessage)
      setIsSubmitting(false)

      // 滚动到错误提示位置
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <label className="text-sm font-medium">封面图（可选）</label>
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
          placeholder="分享你的想法..."
          onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
          showEmojiPicker={showEmojiPicker}
          emojiPickerElement={
            showEmojiPicker ? (
              <div ref={emojiPickerRef}>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={350}
                  height={400}
                  searchPlaceholder="搜索表情..."
                  previewConfig={{ showPreview: false }}
                />
              </div>
            ) : null
          }
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
      <div className="flex items-center justify-end pt-4 border-t">
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
