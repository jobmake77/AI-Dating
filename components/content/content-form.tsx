'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contentSchema, type ContentFormData } from '@/lib/validations/content'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MarkdownEditor } from './markdown-editor'
import { MarkdownPreview } from './markdown-preview'
import { CATEGORY_OPTIONS } from '@/lib/constants/categories'

export function ContentForm() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
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
      formData.append('title', data.title)
      formData.append('category', data.category)
      formData.append('content', data.content)
      formData.append('excerpt', data.excerpt || '')
      formData.append('price_type', data.price_type)
      formData.append('tags', data.tags || '')

      await createContent(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败，请重试')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="输入文章标题"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">分类</Label>
          <Select
            onValueChange={(value) => setValue('category', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_type">价格类型</Label>
          <Select
            defaultValue="free"
            onValueChange={(value) => setValue('price_type', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">免费</SelectItem>
              <SelectItem value="member_only">会员专享</SelectItem>
            </SelectContent>
          </Select>
          {errors.price_type && (
            <p className="text-sm text-destructive">{errors.price_type.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">摘要（可选）</Label>
        <Input
          id="excerpt"
          {...register('excerpt')}
          placeholder="简短描述文章内容"
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">标签（可选，用逗号分隔）</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="例如：React, TypeScript, Next.js"
        />
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-4">
          <MarkdownEditor
            value={content}
            onChange={(value) => {
              setContent(value)
              setValue('content', value)
            }}
          />
          {errors.content && (
            <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
          )}
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <div className="border rounded-lg p-6 min-h-[400px]">
            {content ? (
              <MarkdownPreview content={content} />
            ) : (
              <p className="text-muted-foreground">暂无内容预览</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          保存草稿
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '发布中...' : '发布文章'}
        </Button>
      </div>
    </form>
  )
}
