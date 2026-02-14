# Day 2 Implementation Testing Guide

## Overview
This document provides step-by-step testing instructions for Day 2 features.

## Prerequisites
1. Database migrations applied
2. Development server running: `npm run dev`
3. At least one user account created via GitHub OAuth
4. One admin user (manually set role='admin' in database)

## Test Scenarios

### 1. Content Publishing Flow

**Steps:**
1. Login with GitHub account
2. Navigate to `/create`
3. Fill in the form:
   - Title: "测试文章：Next.js 14 App Router 深度解析"
   - Category: Select "源码深潜"
   - Price Type: Select "免费"
   - Excerpt: "深入探讨 Next.js 14 的 App Router 架构"
   - Tags: "Next.js, React, TypeScript"
   - Content: Write markdown content with code blocks
4. Switch to "预览" tab to see rendered markdown
5. Click "发布文章"

**Expected Results:**
- Form validates correctly
- Preview shows formatted markdown
- After submission, redirects to post detail page
- Content status is 'pending' in database
- Slug is auto-generated with nanoid
- Reading time is calculated

**Database Check:**
```sql
SELECT id, title, slug, status, reading_time, author_id
FROM contents
ORDER BY created_at DESC
LIMIT 1;
```

---

### 2. Content Display Flow

**Steps:**
1. Navigate to `/contents`
2. View the content list
3. Click on a content card
4. View the detail page

**Expected Results:**
- Content list shows all approved contents
- Cards display: title, excerpt, category badge, author, reading time, view count
- Detail page shows full markdown content
- Code blocks have syntax highlighting
- Author card appears in sidebar
- View count increments (check database)

---

### 3. Category Navigation

**Steps:**
1. Navigate to homepage `/`
2. Click on each category card:
   - 源码深潜 (source-code)
   - 实战工坊 (workshop)
   - 架构之道 (architecture)
   - AI 前沿 (ai-frontier)
   - 面试通关 (interview)
3. On category page, click category nav badges

**Expected Results:**
- Each category page shows only contents from that category
- Category description displays correctly
- Category nav highlights current category
- Empty state shows when no contents in category

---

### 4. Moderation System

**Steps:**
1. Login as admin user
2. Navigate to `/admin/contents`
3. View pending contents
4. Click "批准" on a content
5. Click "拒绝" on another content
6. Fill in rejection reason in dialog
7. Confirm rejection

**Expected Results:**
- Only admin can access `/admin/contents`
- Non-admin gets error
- Pending contents list displays
- Approve action updates status to 'approved'
- Reject action updates status to 'rejected' with reason
- Moderation logs are created
- Page refreshes after action

**Database Check:**
```sql
-- Check content status
SELECT id, title, status, rejection_reason
FROM contents
WHERE status IN ('approved', 'rejected');

-- Check moderation logs
SELECT * FROM moderation_logs
ORDER BY created_at DESC
LIMIT 5;
```

---

### 5. User Profile Pages

**Steps:**
1. Login with user account
2. Navigate to `/u/[your-username]`
3. View your profile
4. Click "编辑资料"
5. Navigate to `/settings`
6. Update bio and full name
7. Save changes
8. View another user's profile

**Expected Results:**
- Profile shows avatar, username, full name, bio
- GitHub link displays if available
- "编辑资料" button only shows for profile owner
- User's published contents list below profile
- Settings page allows editing bio and full name
- After save, redirects to profile page
- Other users' profiles are viewable

---

### 6. Pagination

**Steps:**
1. Create 15+ test contents (or use database seed)
2. Navigate to `/contents`
3. Click "下一页"
4. Click page numbers
5. Click "上一页"

**Expected Results:**
- 12 contents per page
- Pagination controls appear when > 12 contents
- Page numbers display correctly
- Ellipsis shows for skipped pages
- Current page is highlighted
- URL updates with ?page=N

---

### 7. Paywall Logic

**Steps:**
1. Create a content with price_type='member_only'
2. Approve it as admin
3. View as non-member user
4. View as member user (set membership_tier='premium' in database)

**Expected Results:**
- Non-members see truncated content (first 500 chars)
- Paywall alert displays with "升级会员" button
- Members see full content
- No paywall alert for members

**Database Update for Testing:**
```sql
UPDATE users
SET membership_tier = 'premium'
WHERE id = 'your-user-id';
```

---

### 8. Markdown Rendering

**Test Content:**
```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2
  - Nested item

1. Numbered item 1
2. Numbered item 2

[Link to Google](https://google.com)

> This is a blockquote

\`\`\`typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
\`\`\`

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

**Expected Results:**
- All markdown elements render correctly
- Code blocks have syntax highlighting
- Tables are formatted
- Links are clickable
- Blockquotes are styled

---

## Database Schema Verification

Run these queries to verify schema:

```sql
-- Check contents table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contents';

-- Check moderation_logs table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'moderation_logs';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('contents', 'moderation_logs');
```

---

## Performance Checks

1. **View Count Increment:**
   - Should not block page rendering
   - Runs asynchronously

2. **Content List Query:**
   - Should use pagination
   - Should filter by status='approved'

3. **Markdown Rendering:**
   - Should use React.memo for optimization
   - Code highlighting should not cause layout shift

---

## Common Issues & Solutions

### Issue: "Failed to create content"
- Check RLS policies on contents table
- Verify user is authenticated
- Check form validation errors

### Issue: Admin page returns 403
- Verify user role is 'admin' in database
- Check requireAdmin() middleware

### Issue: Markdown not rendering
- Verify react-markdown dependencies installed
- Check highlight.js CSS import
- Verify prose styles in globals.css

### Issue: View count not incrementing
- Check increment_view_count function exists
- Verify function permissions granted
- Check Supabase logs for errors

---

## Next Steps (Day 3)

After Day 2 is verified:
1. Subscription functionality
2. Payment integration (manual membership)
3. Image upload (Cloudflare R2)
4. Search functionality

---

**Testing Completed:** [ ]
**Issues Found:** [ ]
**Ready for Day 3:** [ ]
