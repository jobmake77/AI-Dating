import { useEffect, useCallback, useRef } from 'react'
import { saveDraft, DraftData } from '@/lib/actions/drafts'
import { useToast } from './use-toast'

interface UseAutoSaveOptions {
  enabled?: boolean
  interval?: number // milliseconds
  onSave?: () => void
  onError?: (error: string) => void
}

/**
 * Hook for auto-saving drafts
 * Combines localStorage (instant) and database (persistent) saving
 */
export function useAutoSave(
  data: DraftData,
  options: UseAutoSaveOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    onSave,
    onError,
  } = options

  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)

  // Save to localStorage immediately
  const saveToLocalStorage = useCallback((data: DraftData) => {
    try {
      localStorage.setItem('content-draft', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [])

  // Save to database
  const saveToDatabase = useCallback(async (data: DraftData) => {
    if (isSavingRef.current) return

    isSavingRef.current = true

    try {
      const result = await saveDraft(data)

      if (result.error) {
        onError?.(result.error)
        toast({
          variant: 'destructive',
          title: '自动保存失败',
          description: result.error,
        })
      } else {
        onSave?.()
        // Don't show toast for auto-save to avoid interrupting user
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
      onError?.(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      isSavingRef.current = false
    }
  }, [onSave, onError, toast])

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !data.content) return

    const dataString = JSON.stringify(data)

    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current) return

    // Save to localStorage immediately
    saveToLocalStorage(data)

    // Debounce database save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveToDatabase(data)
      lastSavedRef.current = dataString
    }, interval)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, interval, saveToLocalStorage, saveToDatabase])

  // Load from localStorage on mount
  const loadFromLocalStorage = useCallback((): DraftData | null => {
    try {
      const saved = localStorage.getItem('content-draft')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return null
  }, [])

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem('content-draft')
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }, [])

  // Manual save
  const saveNow = useCallback(async () => {
    if (!data.content) return

    saveToLocalStorage(data)
    await saveToDatabase(data)
    lastSavedRef.current = JSON.stringify(data)

    toast({
      title: '保存成功',
      description: '草稿已保存',
    })
  }, [data, saveToLocalStorage, saveToDatabase, toast])

  return {
    saveNow,
    loadFromLocalStorage,
    clearLocalStorage,
    isSaving: isSavingRef.current,
  }
}
