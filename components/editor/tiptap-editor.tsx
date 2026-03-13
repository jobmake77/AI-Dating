'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
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
  Code,
  Link as LinkIcon,
} from 'lucide-react'
import { useImperativeHandle, forwardRef, useRef, useCallback } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { useToast } from '@/hooks/use-toast'
import { VideoExtension } from './video-extension'
import { useVideoUpload } from './video-upload'
import { common, createLowlight } from 'lowlight'

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
    const lowlight = createLowlight(common)

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2],
          },
          codeBlock: false, // Disable default code block
        }),
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: 'javascript',
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
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
          role: 'textbox',
          'aria-label': placeholder,
          'aria-multiline': 'true',
        },
        handleDrop: (view, event, slice, moved) => {
          if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
              event.preventDefault()
              handleImageUploadFromFile(file)
              return true
            }
          }
          return false
        },
        handlePaste: (view, event) => {
          const items = event.clipboardData?.items
          if (items) {
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile()
                if (file) {
                  event.preventDefault()
                  handleImageUploadFromFile(file)
                  return true
                }
              }
            }
          }
          return false
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    })

    const { fileInputRef: videoInputRef, uploading: videoUploading, progress: videoProgress, handleFileChange: handleVideoFileChange } = useVideoUpload({
      onUploadSuccess: (url) => {
        editor?.chain().focus().setVideo({ src: url }).run()
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

    const handleImageUploadFromFile = useCallback(async (file: File) => {
      if (!editor) return

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

        if (result.url) {
          editor
            .chain()
            .focus()
            .setImage({ src: result.url })
            .enter()
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
    }, [editor, toast])

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      await handleImageUploadFromFile(file)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const setLink = useCallback(() => {
      if (!editor) return

      const previousUrl = editor.getAttributes('link').href
      const url = window.prompt('输入链接地址:', previousUrl)

      // cancelled
      if (url === null) {
        return
      }

      // empty
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }

      // update link
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    if (!editor) {
      return <div className="border rounded-lg p-4 min-h-[200px] animate-pulse bg-muted/20" />
    }

    return (
      <div className="border rounded-lg bg-background">
        {/* Simplified Toolbar - Only Essential Icons */}
        <div className="border-b p-1.5 flex gap-0.5 bg-muted/20" role="toolbar" aria-label="文本编辑工具栏">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
            title="加粗"
            aria-label="加粗 (Ctrl+B)"
            aria-pressed={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent' : ''}
            title="斜体"
            aria-label="斜体 (Ctrl+I)"
            aria-pressed={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-accent' : ''}
            title="列表"
            aria-label="无序列表"
            aria-pressed={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? 'bg-accent' : ''}
            title="清单"
            aria-label="任务清单"
            aria-pressed={editor.isActive('taskList')}
          >
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
            title="代码块"
            aria-label="代码块"
            aria-pressed={editor.isActive('codeBlock')}
          >
            <Code className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" role="separator" aria-hidden="true" />

          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive('link') ? 'bg-accent' : ''}
            title="插入链接"
            aria-label="插入链接"
            aria-pressed={editor.isActive('link')}
          >
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Image Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="插入图片"
            aria-label="插入图片"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="选择图片文件"
          />

          {/* Video Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={videoUploading}
            title="插入视频"
            aria-label={videoUploading ? `上传中 ${videoProgress}%` : "插入视频"}
          >
            {videoUploading ? (
              <span className="text-xs tabular-nums" aria-live="polite">{videoProgress}%</span>
            ) : (
              <Video className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
            onChange={handleVideoFileChange}
            className="hidden"
            aria-label="选择视频文件"
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
                aria-label="插入表情"
                aria-expanded={showEmojiPicker}
                aria-haspopup="dialog"
              >
                <Smile className="h-4 w-4" aria-hidden="true" />
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
