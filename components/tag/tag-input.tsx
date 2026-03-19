'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagBadge } from './tag-badge'
import { useTranslations } from 'use-intl'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const t = useTranslations('tagInput')
  const [inputValue, setInputValue] = useState(value)

  // Parse current tags
  const parseTags = (tagString: string): string[] => {
    const hashtags = tagString.match(/#[\w\u4e00-\u9fa5]+/g)?.map(tag => tag.slice(1)) || []
    const commaTags = tagString.split(/[,，]/).map(t => t.replace(/#/g, '').trim()).filter(Boolean)
    return [...new Set([...hashtags, ...commaTags])]
  }

  const currentTags = parseTags(inputValue)

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    const newValue = newTags.map(tag => `#${tag}`).join(' ')
    handleInputChange(newValue)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="tags">{t('label')}</Label>
        <Input
          id="tags"
          name="tags"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder || t('placeholder')}
        />
        <p className="text-sm text-muted-foreground">
          {t('hint')}
        </p>
      </div>

      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onRemove={() => removeTag(tag)}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  )
}
