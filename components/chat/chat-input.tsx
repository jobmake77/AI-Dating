'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, Smile, Loader2 } from 'lucide-react'
import { sendMessage } from '@/lib/actions/chat'
import { uploadImage } from '@/lib/actions/upload'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

interface ChatInputProps {
  conversationId: string
}

export function ChatInput({ conversationId }: ChatInputProps) {
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
        title: '发送失败',
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
        title: '上传失败',
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
          title: '发送失败',
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

  const handleEmojiClick = (emojiData: any) => {
    setContent(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-2">
        {/* 图片上传按钮 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          className="shrink-0 h-12 w-12 rounded-full"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </Button>

        {/* 表情按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isSending}
          className="shrink-0 h-12 w-12 rounded-full"
        >
          <Smile className="h-5 w-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="min-h-[48px] max-h-[200px] resize-none rounded-2xl border-2 focus-visible:ring-1 text-[15px] py-3"
          rows={1}
          disabled={isSending}
        />
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSending}
          size="icon"
          className="shrink-0 h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Send className="h-5 w-5" />
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
