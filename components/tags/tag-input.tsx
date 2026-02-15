'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { searchTags } from '@/lib/actions/tags'
import type { Tag } from '@/lib/types/tag'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ value, onChange, placeholder = '添加标签...', maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索标签建议
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      searchTags(inputValue).then(tags => {
        // 过滤掉已选择的标签
        const filtered = tags.filter(tag => !value.includes(tag.name))
        setSuggestions(filtered)
        setShowSuggestions(true)
      })
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, value])

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim()
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed])
      setInputValue('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[42px]">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
              aria-label={`移除标签 ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {value.length < maxTags && (
          <div className="flex-1 min-w-[120px] relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={value.length === 0 ? placeholder : ''}
              className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {/* 标签建议下拉框 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 max-h-48 overflow-y-auto">
                {suggestions.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag.name)}
                    className="w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between"
                  >
                    <span>{tag.name}</span>
                    <span className="text-xs text-muted-foreground">{tag.usage_count} 次使用</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        按 Enter 或逗号添加标签，最多 {maxTags} 个标签。已添加 {value.length}/{maxTags}
      </p>
    </div>
  )
}
