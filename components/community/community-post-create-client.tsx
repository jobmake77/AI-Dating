'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createCommunityPost } from '@/lib/actions/community-posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bold, Italic, Image as ImageIcon, Video, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { uploadImage } from '@/lib/actions/upload'
import { getVideoUploadUrl } from '@/lib/actions/upload-video'

interface CommunityPostCreateClientProps {
  community: {
    id: string
    name: string
    icon_url: string | null
  }
  slug: string
}

export function CommunityPostCreateClient({ community, slug }: CommunityPostCreateClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: '分享你的想法...',
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadImage(formData, 'content-images')

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.url && editor) {
        editor.chain().focus().setImage({ src: result.url }).run()
        toast.success('图片上传成功')
      }
    } catch {
      toast.error('图片上传失败，请重试')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (!file) return

    setIsUploadingVideo(true)
    try {
      const result = await getVideoUploadUrl(file.name, file.type)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.uploadUrl && result.publicUrl) {
        // Upload file to R2
        const uploadResponse = await fetch(result.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error('上传失败')
        }

        // Insert video into editor
        if (editor) {
          editor.chain().focus().insertContent(`<video src="${result.publicUrl}" controls class="rounded-lg max-w-full"></video>`).run()
          toast.success('视频上传成功')
        }
      }
    } catch {
      toast.error('视频上传失败，请重试')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast.error('请输入内容')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set('content', editor.getHTML())

    const result = await createCommunityPost(community.id, formData)
    setIsSubmitting(false)

    if (result.success && result.data) {
      toast.success('发布成功', { description: '帖子已发布' })
      router.push(`/communities/${slug}/posts/${result.data.id}`)
    } else {
      toast.error('发布失败', { description: result.error || '请稍后重试' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-6 shadow-card"
    >
      <div className="mb-5">
        <h1 className="text-base font-bold text-foreground">发布帖子</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          在 <span className="font-medium text-foreground">{community.name}</span> 社区发布新帖子
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">标题 (可选)</label>
          <Input
            name="title"
            placeholder="给你的帖子起个标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-border pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage || !editor}
          >
            {isUploadingImage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            图片
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploadingVideo || !editor}
          >
            {isUploadingVideo ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Video className="h-3.5 w-3.5" />
            )}
            视频
          </Button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleVideoUpload(file)
          }}
        />

        {/* Editor */}
        <div className="rounded-lg bg-secondary/60 border-none">
          <EditorContent editor={editor} />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            onClick={() => router.push(`/communities/${slug}`)}
          >
            取消
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
            disabled={isSubmitting || !editor?.getHTML() || editor.getHTML() === '<p></p>'}
          >
            <Send className="h-3 w-3" />
            {isSubmitting ? '发布中...' : '发布帖子'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
