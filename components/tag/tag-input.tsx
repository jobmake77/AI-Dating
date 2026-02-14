'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagBadge } from './tag-badge'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
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
        <Label htmlFor="tags">标签</Label>
        <Input
          id="tags"
          name="tags"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder || '输入标签，如：#GPT-4 #LangChain 或用逗号分隔'}
        />
        <p className="text-sm text-muted-foreground">
          支持 #标签 格式或逗号分隔，例如：#AI #机器学习 或 GPT-4, Claude
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
