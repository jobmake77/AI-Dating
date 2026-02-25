'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { ResizableImage } from './resizable-image'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  CheckSquare,
  ImageIcon,
  Smile,
  Video,
} from 'lucide-react'
import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { useToast } from '@/hooks/use-toast'
import { VideoExtension } from './video-extension'
import { useVideoUpload } from './video-upload'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onEmojiClick?: () => void
  showEmojiPicker?: boolean
  emojiPickerElement?: React.ReactNode
}

export interface TiptapEditorRef {
  insertContent: (content: string) => void
  getEditor: () => Editor | null
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ content, onChange, placeholder = '分享你的想法...', onEmojiClick, showEmojiPicker, emojiPickerElement }, ref) => {
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2],
          },
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder,
        }),
        ResizableImage.configure({
          inline: false,
          allowBase64: false,
        }),
        VideoExtension,
      ],
      content,
      editorProps: {
        attributes: {
          class: 'focus:outline-none min-h-[200px] p-4',
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    })

    const { fileInputRef: videoInputRef, uploading: videoUploading, progress: videoProgress, handleFileChange: handleVideoFileChange } = useVideoUpload({
      onUploadSuccess: (url) => {
        ;(editor as any)?.chain().focus().setVideo({ src: url }).run()
        toast({ title: '上传成功', description: '视频已插入到内容中' })
      },
      onError: (message) => {
        toast({ variant: 'destructive', title: '上传失败', description: message })
      },
    })

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      insertContent: (content: string) => {
        editor?.chain().focus().insertContent(content).run()
      },
      getEditor: () => editor,
    }))

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      // Show loading state
      toast({
        title: '上传中...',
        description: '正在上传图片，请稍候',
      })

      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadImage(formData)

        if (result.error) {
          toast({
            variant: 'destructive',
            title: '上传失败',
            description: result.error,
          })
          return
        }

        // Insert image into editor with proper spacing
        if (result.url) {
          editor
            .chain()
            .focus()
            .setImage({ src: result.url })
            .enter() // 添加换行，确保可以在图片后输入
            .run()
        }

        toast({
          title: '上传成功',
          description: '图片已插入到内容中',
        })
      } catch (error) {
        console.error('Image upload error:', error)
        toast({
          variant: 'destructive',
          title: '上传失败',
          description: '图片上传失败，请重试',
        })
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    if (!editor) {
      return <div className="border rounded-lg p-4 min-h-[200px] animate-pulse bg-muted/20" />
    }

    return (
      <div className="border rounded-lg bg-background">
        {/* Simplified Toolbar - Only Essential Icons */}
        <div className="border-b p-1.5 flex gap-0.5 bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
            title="加粗"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent' : ''}
            title="斜体"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-accent' : ''}
            title="列表"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? 'bg-accent' : ''}
            title="清单"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Image Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="插入图片"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Video Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={videoUploading}
            title="插入视频"
          >
            {videoUploading ? (
              <span className="text-xs tabular-nums">{videoProgress}%</span>
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
            onChange={handleVideoFileChange}
            className="hidden"
          />

          {/* Emoji Picker */}
          {onEmojiClick && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEmojiClick}
                className={showEmojiPicker ? 'bg-accent' : ''}
                title="插入表情"
              >
                <Smile className="h-4 w-4" />
              </Button>
              {showEmojiPicker && emojiPickerElement && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  {emojiPickerElement}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    )
  }
)

TiptapEditor.displayName = 'TiptapEditor'
