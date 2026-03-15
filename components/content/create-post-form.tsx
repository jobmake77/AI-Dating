'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, X, Upload, Bold, Italic, Image as ImageIcon, Video, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createContent } from '@/lib/actions/content'
import { uploadImage } from '@/lib/actions/upload'
import { getVideoUploadUrl } from '@/lib/actions/upload-video'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { toast } from 'sonner'
import type { ContentCategory } from '@/lib/types/content-category'

interface CreatePostFormProps {
  categories: ContentCategory[]
}

export function CreatePostForm({ categories }: CreatePostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.slug || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: '写下你的想法...',
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  const handleSubmit = async () => {
    if (!title.trim() || !editor?.getHTML()) {
      setError('请输入标题和内容')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const htmlContent = editor.getHTML()
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', htmlContent)
      formData.append('price_type', 'free')
      if (selectedCategory) {
        formData.append('category', selectedCategory)
      }
      if (coverImage) {
        formData.append('cover_image', coverImage)
      }

      await createContent(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发布失败，请重试'
      setError(errorMessage)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleVideoButtonClick = () => {
    videoInputRef.current?.click()
  }

  const handleCoverImageUpload = async (file: File) => {
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

      if (result.url) {
        setCoverImage(result.url)
        toast.success('封面上传成功')
      }
    } catch {
      toast.error('封面上传失败，请重试')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const titleCount = title.length
  const wordCount = editor?.getText().length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回首页
        </Link>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h1 className="text-lg font-bold text-foreground mb-6">创建新帖子</h1>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">标题</label>
                  <span className="text-xs text-muted-foreground">{titleCount}/100</span>
                </div>
                <Input
                  placeholder="输入一个吸引人的标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                  className="h-12 text-base bg-background border-border focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">封面图片（可选）</label>
                {coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <Image src={coverImage} alt="Cover" fill unoptimized sizes="768px" className="h-48 object-cover" />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-white hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">点击上传封面图片</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, GIF (最大 5MB)</p>
                  </button>
                )}
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCoverImageUpload(file)
                  }}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">内容</label>
                  <span className="text-xs text-muted-foreground">{wordCount} 字</span>
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

                <div className="mb-2 flex items-center gap-2 p-2 border border-border rounded-lg bg-background">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={editor?.isActive('bold') ? 'bg-secondary' : ''}
                    disabled={isUploadingImage || isUploadingVideo}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={editor?.isActive('italic') ? 'bg-secondary' : ''}
                    disabled={isUploadingImage || isUploadingVideo}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImageButtonClick}
                    disabled={isUploadingImage || isUploadingVideo}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVideoButtonClick}
                    disabled={isUploadingImage || isUploadingVideo}
                  >
                    {isUploadingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex-shrink-0"
          >
            <div className="sticky top-4 space-y-4">
              <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                <label className="text-sm font-medium text-foreground mb-3 block">选择分类</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const hsl = cat.color
                    const isSelected = selectedCategory === cat.slug
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all border ${
                          isSelected
                            ? 'font-medium'
                            : 'border-border text-muted-foreground hover:border-primary/20'
                        }`}
                        style={isSelected ? {
                          backgroundColor: `hsl(${hsl} / 0.1)`,
                          color: `hsl(${hsl})`,
                          borderColor: `hsl(${hsl} / 0.3)`,
                        } : {}}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: `hsl(${hsl})` }}
                        />
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 shadow-card space-y-3">
                <Button
                  size="lg"
                  className="w-full gap-2 gradient-primary text-white hover:opacity-90 shadow-primary"
                  onClick={handleSubmit}
                  disabled={!title.trim() || !editor?.getText().trim() || !selectedCategory || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? '发布中...' : '发布帖子'}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  保存草稿
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-muted-foreground"
                  onClick={() => router.push('/')}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
