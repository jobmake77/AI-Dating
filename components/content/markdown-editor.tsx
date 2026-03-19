'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'use-intl'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const t = useTranslations('editorUi')
  return (
    <div className="space-y-2">
      <Label htmlFor="content">{t('markdownLabel')}</Label>
      <Textarea
        id="content"
        name="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('markdownPlaceholder')}
        className="min-h-[400px] font-mono"
      />
      <p className="text-sm text-muted-foreground">
        {t('markdownHint')}
      </p>
    </div>
  )
}
