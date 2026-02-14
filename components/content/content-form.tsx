'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contentSchema, type ContentFormData } from '@/lib/validations/content'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RichTextEditor } from './rich-text-editor'
import { Lock, Globe } from 'lucide-react'

export function ContentForm() {
  const [content, setContent] = useState('')
  const [priceType, setPriceType] = useState<'free' | 'member_only'>('free')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      price_type: 'free',
    },
  })

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('price_type', data.price_type)

      await createContent(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败，请重试')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Rich Text Editor */}
      <RichTextEditor
        content={content}
        onChange={(value) => {
          setContent(value)
          setValue('content', value)
        }}
        placeholder="有什么新想法？支持 #标签、**粗体**、代码块..."
      />

      {errors.content && (
        <p className="text-sm text-destructive">{errors.content.message}</p>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {/* Price Type Toggle */}
          <Button
            type="button"
            variant={priceType === 'free' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPriceType('free')
              setValue('price_type', 'free')
            }}
          >
            <Globe className="h-4 w-4 mr-1" />
            公开
          </Button>
          <Button
            type="button"
            variant={priceType === 'member_only' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPriceType('member_only')
              setValue('price_type', 'member_only')
            }}
          >
            <Lock className="h-4 w-4 mr-1" />
            会员专享
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !content}
          size="lg"
        >
          {isSubmitting ? '发布中...' : '发布'}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>使用 #标签 来标记主题（如 #GPT-4 #LangChain）</li>
          <li>标题会自动从内容第一行提取</li>
          <li>支持粗体、斜体、代码块等格式</li>
        </ul>
      </div>
    </form>
  )
}
