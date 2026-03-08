# Content Enhancement Features - Quick Start Guide

This guide helps you integrate the new content enhancement features into your application.

---

## 1. Rich Text Editor Enhancements

### Code Highlighting

The editor now supports syntax-highlighted code blocks:

```typescript
import { TiptapEditor } from '@/components/editor/tiptap-editor'

// Code blocks are automatically enabled
// Users can click the code button or use Ctrl+Alt+C
```

### Drag-and-Drop Images

Images can be dragged directly into the editor:

```typescript
// No additional code needed - works out of the box
// Users can:
// 1. Drag image files into the editor
// 2. Paste images from clipboard
// 3. Click the image button to upload
```

### Video Embeds

Support for YouTube and Bilibili videos:

```typescript
// In your content, users can embed videos
// The editor will automatically convert URLs to embeds

// YouTube: https://www.youtube.com/watch?v=VIDEO_ID
// Bilibili: https://www.bilibili.com/video/BV_ID
```

### Links

Insert and edit links:

```typescript
// Users can:
// 1. Click the link button
// 2. Enter URL in prompt
// 3. Links are automatically styled
```

---

## 2. Draft Auto-Save

### Using the Auto-Save Hook

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAutoSave } from '@/hooks/use-auto-save'
import { getDraft } from '@/lib/actions/drafts'

export function CreateContentPage() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Initialize auto-save
  const { saveNow, loadFromLocalStorage, clearLocalStorage } = useAutoSave(
    {
      content,
      title,
      tags,
      price_type: 'free',
    },
    {
      enabled: true,
      interval: 30000, // 30 seconds
      onSave: () => {
        console.log('Draft auto-saved')
      },
      onError: (error) => {
        console.error('Auto-save failed:', error)
      },
    }
  )

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      // Try localStorage first (instant)
      const localDraft = loadFromLocalStorage()
      if (localDraft) {
        setContent(localDraft.content || '')
        setTitle(localDraft.title || '')
        setTags(localDraft.tags || [])
        return
      }

      // Fallback to database
      const result = await getDraft()
      if (result.data) {
        setContent(result.data.content || '')
        setTitle(result.data.title || '')
        setTags(result.data.tags || [])
      }
    }

    loadDraft()
  }, [])

  const handlePublish = async () => {
    // Your publish logic here
    // ...

    // Clear draft after successful publish
    clearLocalStorage()
  }

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
      />
      <TiptapEditor
        content={content}
        onChange={setContent}
      />
      <button onClick={saveNow}>手动保存</button>
      <button onClick={handlePublish}>发布</button>
    </div>
  )
}
```

### Manual Draft Operations

```typescript
import { saveDraft, getDraft, deleteDraft, publishDraft } from '@/lib/actions/drafts'

// Save draft
const result = await saveDraft({
  content: '<p>Draft content</p>',
  title: 'Draft Title',
  tags: ['tag1', 'tag2'],
  price_type: 'free',
})

// Get draft
const { data, error } = await getDraft()

// Delete draft
await deleteDraft()

// Publish draft (converts to content)
await publishDraft()
```

---

## 3. Version History

### Display Version History

```typescript
import { VersionHistory } from '@/components/content/version-history'

export function ContentDetailPage({ content, user }) {
  const isAuthor = user?.id === content.author_id

  return (
    <div>
      {/* Your content display */}
      <div className="prose">
        <h1>{content.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>

      {/* Version history */}
      <VersionHistory
        contentId={content.id}
        isAuthor={isAuthor}
      />
    </div>
  )
}
```

### Programmatic Version Operations

```typescript
import {
  getContentVersions,
  getContentVersion,
  restoreContentVersion,
  compareVersions,
  createManualVersion,
} from '@/lib/actions/content-versions'

// Get all versions
const { data: versions } = await getContentVersions(contentId)

// Get specific version
const { data: version } = await getContentVersion(versionId)

// Restore version
await restoreContentVersion(contentId, versionId)

// Compare two versions
const { data: comparison } = await compareVersions(versionId1, versionId2)

// Create manual version (milestone)
await createManualVersion(contentId, 'Major update')
```

---

## 4. Content Recommendations

### Fetch Personalized Recommendations

```typescript
// Client-side API call
export async function getRecommendations(limit = 10) {
  const response = await fetch(`/api/recommendations?limit=${limit}`)
  const { data } = await response.json()
  return data
}

// Usage in component
'use client'

import { useState, useEffect } from 'react'

export function RecommendedContent() {
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    getRecommendations(10).then(setRecommendations)
  }, [])

  return (
    <div>
      <h2>为你推荐</h2>
      {recommendations.map((content) => (
        <div key={content.id}>
          <h3>{content.title}</h3>
          <p>{content.recommendation_reason}</p>
        </div>
      ))}
    </div>
  )
}
```

### Server-Side Recommendations

```typescript
import {
  getPersonalizedRecommendations,
  getTrendingRecommendations,
  getRelatedContent,
} from '@/lib/algorithms/content-recommendations'

// Personalized recommendations
const recommendations = await getPersonalizedRecommendations(userId, 10)

// Trending content
const trending = await getTrendingRecommendations(10)

// Related content
const related = await getRelatedContent(contentId, 5)
```

### Track Reading History

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { trackReadingHistory } from '@/lib/algorithms/content-recommendations'

export function ContentReader({ contentId, userId }) {
  const startTimeRef = useRef(Date.now())
  const scrollPercentageRef = useRef(0)

  useEffect(() => {
    // Track scroll percentage
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const percentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      )
      scrollPercentageRef.current = Math.max(
        scrollPercentageRef.current,
        percentage
      )
    }

    window.addEventListener('scroll', handleScroll)

    // Track on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)

      const readDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const readPercentage = scrollPercentageRef.current

      // Only track if user read for at least 10 seconds
      if (readDuration >= 10) {
        trackReadingHistory(userId, contentId, readDuration, readPercentage)
      }
    }
  }, [contentId, userId])

  return (
    <div>
      {/* Your content */}
    </div>
  )
}
```

---

## 5. Database Migration

Run the migration to create necessary tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL file
psql -h your-db-host -U your-user -d your-db -f supabase/migrations/030_create_content_enhancement.sql
```

---

## 6. Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test drafts.test.ts

# Run with coverage
npm run test:coverage
```

---

## 7. Configuration

### Auto-Save Interval

Adjust the auto-save interval in your component:

```typescript
useAutoSave(data, {
  interval: 60000, // 60 seconds instead of default 30
})
```

### Recommendation Limit

Adjust the number of recommendations:

```typescript
// API call
fetch('/api/recommendations?limit=20')

// Server-side
getPersonalizedRecommendations(userId, 20)
```

---

## 8. Troubleshooting

### Draft Not Saving

1. Check browser console for errors
2. Verify user is authenticated
3. Check database connection
4. Verify RLS policies are correct

### Recommendations Not Showing

1. Check if user has reading history
2. Verify content is approved (status = 'approved')
3. Check API response in network tab
4. Fallback to trending if no personalized recommendations

### Version History Not Displaying

1. Verify content has been updated at least once
2. Check if trigger is enabled: `trigger_create_content_version`
3. Verify RLS policies allow reading versions
4. Check browser console for errors

---

## 9. Best Practices

### Auto-Save

- Don't show toast notifications for auto-save (avoid interrupting user)
- Always save to localStorage first for instant feedback
- Clear draft after successful publish
- Handle offline scenarios gracefully

### Version History

- Create manual versions for major milestones
- Limit version history display to recent 20 versions
- Provide clear restore confirmation
- Show diff view for better comparison (future enhancement)

### Recommendations

- Cache recommendations for 5 minutes
- Track user feedback (likes/dislikes) to improve algorithm
- A/B test different recommendation strategies
- Monitor recommendation relevance metrics

---

## 10. Performance Tips

### Auto-Save

- Debounce saves to avoid excessive database writes
- Use localStorage for instant saves
- Skip saves if content hasn't changed

### Recommendations

- Implement Redis caching for recommendations
- Pre-compute trending content hourly
- Use database indexes for faster queries

### Version History

- Paginate version history for content with many versions
- Lazy load version previews
- Consider archiving old versions (> 6 months)

---

## Support

For issues or questions, please refer to:
- Full documentation: `/docs/content-enhancement-report.md`
- Test examples: `/__tests__/lib/`
- Component examples: `/components/content/`

---

**Last Updated**: 2026-03-08
