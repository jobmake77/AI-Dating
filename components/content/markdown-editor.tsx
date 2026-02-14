'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">内容（支持 Markdown）</Label>
      <Textarea
        id="content"
        name="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '使用 Markdown 编写内容...'}
        className="min-h-[400px] font-mono"
      />
      <p className="text-sm text-muted-foreground">
        支持 Markdown 语法：标题、列表、代码块、链接等
      </p>
    </div>
  )
}
