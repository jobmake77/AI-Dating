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
import { useTranslations } from 'use-intl'

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
    const t = useTranslations('editorToolbar')
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
        toast({ title: t('uploadSuccess'), description: t('videoInserted') })
      },
      onError: (message) => {
        toast({ variant: 'destructive', title: t('uploadFailed'), description: message })
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
        title: t('uploading'),
        description: t('uploadingImage'),
      })

      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadImage(formData)

        if (result.error) {
          toast({
            variant: 'destructive',
            title: t('uploadFailed'),
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
          title: t('uploadSuccess'),
          description: t('imageInserted'),
        })
      } catch (error) {
        console.error('Image upload error:', error)
        toast({
          variant: 'destructive',
          title: t('uploadFailed'),
          description: t('imageUploadFailed'),
        })
      }
    }, [editor, t, toast])

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
      const url = window.prompt(t('linkPrompt'), previousUrl)

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
    }, [editor, t])

    if (!editor) {
      return <div className="border rounded-lg p-4 min-h-[200px] animate-pulse bg-muted/20" />
    }

    return (
      <div className="border rounded-lg bg-background">
        {/* Simplified Toolbar - Only Essential Icons */}
        <div className="border-b p-1.5 flex gap-0.5 bg-muted/20" role="toolbar" aria-label={t('toolbarLabel')}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
            title={t('bold')}
            aria-label={t('boldAria')}
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
            title={t('italic')}
            aria-label={t('italicAria')}
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
            title={t('bulletList')}
            aria-label={t('bulletListAria')}
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
            title={t('taskList')}
            aria-label={t('taskListAria')}
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
            title={t('codeBlock')}
            aria-label={t('codeBlock')}
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
            title={t('insertLink')}
            aria-label={t('insertLink')}
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
            title={t('insertImage')}
            aria-label={t('insertImage')}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label={t('chooseImage')}
          />

          {/* Video Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={videoUploading}
            title={t('insertVideo')}
            aria-label={videoUploading ? t('uploadingProgress', { progress: videoProgress }) : t('insertVideo')}
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
            aria-label={t('chooseVideo')}
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
                title={t('insertEmoji')}
                aria-label={t('insertEmoji')}
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
