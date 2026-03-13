'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, X, Upload } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateContent } from '@/lib/actions/content'
import { categories, getCategoryColor } from '@/lib/utils/categories'

const allTags = [
  { name: 'AI/ML', color: 'hsl(262 83% 58%)' },
  { name: 'Rust', color: 'hsl(24 95% 53%)' },
  { name: 'Web3', color: 'hsl(199 89% 48%)' },
  { name: 'DevOps', color: 'hsl(152 69% 40%)' },
  { name: '开源', color: 'hsl(38 92% 50%)' },
  { name: '前端', color: 'hsl(340 82% 52%)' },
  { name: '后端', color: 'hsl(221 83% 53%)' },
  { name: '项目分享', color: 'hsl(280 68% 55%)' },
  { name: '讨论', color: 'hsl(24 95% 53%)' },
  { name: '面试经验', color: 'hsl(38 92% 50%)' },
  { name: '问答', color: 'hsl(152 69% 40%)' },
  { name: '技术', color: 'hsl(199 89% 48%)' },
]

interface EditPostFormProps {
  content: {
    id: string
    title: string
    content: string
    tags: string[] | null
    price_type: string
    cover_image?: string | null
  }
}

function extractPlainContent(html: string): string {
  let text = html.replace(/<h1[^>]*>.*?<\/h1>/i, '')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]*>/g, '')
  return text.trim()
}

function extractTitle(html: string): string {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  return match ? match[1].replace(/<[^>]*>/g, '') : ''
}

export function EditPostForm({ content: initialContent }: EditPostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(extractTitle(initialContent.content) || initialContent.title)
  const [content, setContent] = useState(extractPlainContent(initialContent.content))
  const [selectedTags, setSelectedTags] = useState<string[]>(initialContent.tags || [])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(initialContent.cover_image || null)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('请输入标题和内容')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const htmlContent = `<h1>${title}</h1>${content.replace(/\n/g, '<br>')}`
      const formData = new FormData()
      formData.append('content', htmlContent)
      formData.append('price_type', 'free')

      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags))
      }

      await updateContent(initialContent.id, formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新失败，请重试'
      setError(errorMessage)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleAddTag = (tagName: string) => {
    if (!selectedTags.includes(tagName) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagName])
    }
    setShowTagPicker(false)
  }

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName))
  }

  const wordCount = content.length
  const titleCount = title.length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Link
          href={`/post/${initialContent.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回帖子
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
              <h1 className="text-lg font-bold text-foreground mb-6">编辑帖子</h1>

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
                    <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-white hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">点击上传封面图片</p>
                    <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, GIF (最大 5MB)</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">内容</label>
                  <span className="text-xs text-muted-foreground">{wordCount} 字</span>
                </div>
                <Textarea
                  placeholder="写下你的想法... 支持 Markdown 语法&#10;&#10;例如：&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;[链接](https://example.com)&#10;```代码块```"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] text-sm bg-background border-border font-mono resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">预览</label>
                <div className="rounded-lg border border-border bg-secondary/30 p-6 min-h-[200px]">
                  {content ? (
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                      {content}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">内容预览将在这里显示...</p>
                  )}
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
                    const hsl = getCategoryColor(cat.slug)
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

              <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  添加标签 ({selectedTags.length}/5)
                </label>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag) => {
                      const tagData = allTags.find(t => t.name === tag)
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${tagData?.color.replace(')', ' / 0.15)')}`,
                            color: tagData?.color
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 text-xs border-dashed"
                    onClick={() => setShowTagPicker(!showTagPicker)}
                    disabled={selectedTags.length >= 5}
                  >
                    + 选择标签
                  </Button>

                  {showTagPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-10 rounded-lg border border-border bg-card p-3 shadow-elevated max-h-64 overflow-y-auto animate-scale-in">
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => handleAddTag(tag.name)}
                            disabled={selectedTags.includes(tag.name)}
                            className="rounded-full px-3 py-1 text-xs transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: `${tag.color.replace(')', ' / 0.15)')}`,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 shadow-card space-y-3">
                <Button
                  size="lg"
                  className="w-full gap-2 gradient-primary text-white hover:opacity-90 shadow-primary"
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? '更新中...' : '更新帖子'}
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
                  onClick={() => router.push(`/post/${initialContent.id}`)}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 shadow-card">
                <h3 className="text-xs font-medium text-foreground mb-2">编辑提示</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• 标题要简洁明了，吸引读者</li>
                  <li>• 选择合适的分类和标签</li>
                  <li>• 支持 Markdown 语法</li>
                  <li>• 可以添加封面图片</li>
                  <li>• 最多可添加 5 个标签</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
