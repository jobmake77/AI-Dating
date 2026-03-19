'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, Smile, Loader2 } from 'lucide-react'
import { sendMessage } from '@/lib/actions/chat'
import { uploadImage } from '@/lib/actions/upload'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'
import type { EmojiClickData } from 'emoji-picker-react'
import { useTranslations } from 'use-intl'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface ChatInputProps {
  conversationId: string
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const t = useTranslations('chatInput')
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!content.trim() || isSending) return

    const messageContent = content.trim()
    setContent('') // 立即清空输入框，提供即时反馈
    setIsSending(true)

    const result = await sendMessage(conversationId, messageContent)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('sendFailed'),
        description: result.error,
      })
      setContent(messageContent) // 恢复消息内容
      setIsSending(false)
      return
    }

    // 发送成功
    setIsSending(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData, 'chat-images')
    setIsUploading(false)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('uploadFailed'),
        description: result.error,
      })
      return
    }

    // 发送图片消息
    if (result.url) {
      setIsSending(true)
      const imageMessage = `[image:${result.url}]`
      const sendResult = await sendMessage(conversationId, imageMessage)

      if (sendResult.error) {
        toast({
          variant: 'destructive',
          title: t('sendFailed'),
          description: sendResult.error,
        })
      }

      setIsSending(false)
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-2">
        {/* 图片上传和表情按钮 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-accent"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isSending}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-info"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          className="min-h-[36px] max-h-[100px] text-xs bg-secondary/60 border-none resize-none flex-1"
          rows={1}
          disabled={isSending}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 gradient-primary text-white hover:opacity-90 shadow-primary rounded-full"
          onClick={handleSubmit}
          disabled={!content.trim() || isSending}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 表情选择器 */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-0 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  )
}
