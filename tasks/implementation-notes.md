# 实现说明和注意事项

## 实现细节

### 1. HTML 内容格式

#### 存储格式
```html
<h1>标题文本</h1>内容文本<br>换行内容
```

#### 提取逻辑
```typescript
// 提取标题
function extractTitle(html: string): string {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  return match ? match[1].replace(/<[^>]*>/g, '') : ''
}

// 提取内容
function extractPlainContent(html: string): string {
  let text = html.replace(/<h1[^>]*>.*?<\/h1>/i, '')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]*>/g, '')
  return text.trim()
}
```

### 2. 表单数据处理

#### 创建内容
```typescript
const htmlContent = `<h1>${title}</h1>${content.replace(/\n/g, '<br>')}`
const formData = new FormData()
formData.append('content', htmlContent)
formData.append('price_type', 'free')
if (selectedTag) {
  formData.append('tags', JSON.stringify([selectedTag]))
}
await createContent(formData)
```

#### 更新内容
```typescript
const htmlContent = `<h1>${title}</h1>${content.replace(/\n/g, '<br>')}`
const formData = new FormData()
formData.append('content', htmlContent)
formData.append('price_type', initialContent.price_type)
if (selectedTag) {
  formData.append('tags', JSON.stringify([selectedTag]))
}
await updateContent(initialContent.id, formData)
```

### 3. 状态管理

#### 表单状态
- `title`: 标题文本
- `content`: 内容文本（纯文本）
- `selectedTag`: 选中的标签（单个）
- `selectedCategory`: 选中的类别（当前仅用于 UI）
- `showTagPicker`: 标签选择器显示状态
- `showPreview`: 预览模式开关
- `isSubmitting`: 提交中状态
- `error`: 错误信息

#### 状态初始化（编辑模式）
```typescript
const [title, setTitle] = useState(
  extractTitle(initialContent.content) || initialContent.title
)
const [content, setContent] = useState(
  extractPlainContent(initialContent.content)
)
const [selectedTag, setSelectedTag] = useState(
  initialContent.tags?.[0] || ''
)
```

## 潜在问题和解决方案

### 1. 类别数据硬编码

**问题**: 类别列表目前是硬编码在组件中的。

**解决方案**:
```typescript
// 创建 lib/data/categories.ts
export const categories = [
  { id: '1', name: '官方公告', slug: 'announce' },
  // ...
]

// 或从数据库加载
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .order('order')
```

### 2. 标签数据硬编码

**问题**: 标签列表目前是硬编码的。

**解决方案**:
```typescript
// 从数据库加载热门标签
const { data: tags } = await supabase
  .from('tags')
  .select('name, color, count')
  .order('count', { ascending: false })
  .limit(20)
```

### 3. 单标签限制

**问题**: 当前只支持选择一个标签。

**解决方案**:
```typescript
// 改为数组状态
const [selectedTags, setSelectedTags] = useState<string[]>([])

// 添加/移除标签
const toggleTag = (tag: string) => {
  setSelectedTags(prev => 
    prev.includes(tag) 
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  )
}
```

### 4. 类别未保存

**问题**: 类别选择目前只是 UI 展示，未保存到数据库。

**解决方案**:
```typescript
// 在 formData 中添加类别
if (selectedCategory) {
  formData.append('category', selectedCategory)
}

// 更新数据库 schema
// ALTER TABLE contents ADD COLUMN category TEXT;
```

### 5. 工具栏按钮无功能

**问题**: 代码/图片/链接按钮目前是装饰性的。

**解决方案**:
```typescript
// 添加插入功能
const insertCode = () => {
  const code = '```\n// 代码\n```'
  setContent(prev => prev + '\n' + code)
}

const insertImage = () => {
  const img = '![图片描述](图片URL)'
  setContent(prev => prev + '\n' + img)
}

const insertLink = () => {
  const link = '[链接文字](URL)'
  setContent(prev => prev + link)
}
```

### 6. 保存草稿未实现

**问题**: 保存草稿按钮目前无功能。

**解决方案**:
```typescript
const saveDraft = async () => {
  const htmlContent = `<h1>${title}</h1>${content.replace(/\n/g, '<br>')}`
  const formData = new FormData()
  formData.append('content', htmlContent)
  formData.append('status', 'draft') // 添加状态字段
  
  await createContent(formData)
  // 或使用 localStorage 本地保存
}
```

### 7. 预览格式简单

**问题**: 预览模式只是显示纯文本，未渲染 Markdown。

**解决方案**:
```typescript
import ReactMarkdown from 'react-markdown'

{showPreview ? (
  <div className="min-h-[200px] rounded-lg bg-secondary/60 p-4 text-sm prose">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
) : (
  // Textarea
)}
```

### 8. 字数统计缺失

**问题**: 没有字数统计功能。

**解决方案**:
```typescript
const wordCount = content.length
const maxLength = 5000
const remaining = maxLength - wordCount

<div className="text-xs text-muted-foreground">
  {remaining} 字符剩余
</div>
```

## 性能优化建议

### 1. 防抖输入
```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSetContent = useDebouncedCallback(
  (value: string) => setContent(value),
  300
)
```

### 2. 懒加载标签
```typescript
const [tags, setTags] = useState<Tag[]>([])
const [isLoadingTags, setIsLoadingTags] = useState(false)

const loadTags = async () => {
  if (tags.length > 0) return
  setIsLoadingTags(true)
  // 加载标签
  setIsLoadingTags(false)
}
```

### 3. 自动保存草稿
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (title || content) {
      localStorage.setItem('draft', JSON.stringify({ title, content }))
    }
  }, 2000)
  return () => clearTimeout(timer)
}, [title, content])
```

## 测试清单

### 功能测试
- [ ] 创建新内容（标题 + 内容）
- [ ] 选择类别
- [ ] 选择标签
- [ ] 切换预览模式
- [ ] 提交表单
- [ ] 验证重定向
- [ ] 编辑现有内容
- [ ] 更新内容
- [ ] 取消操作
- [ ] 错误处理

### 边界测试
- [ ] 空标题提交
- [ ] 空内容提交
- [ ] 超长标题
- [ ] 超长内容
- [ ] 特殊字符处理
- [ ] HTML 注入防护

### UI 测试
- [ ] 移动端布局
- [ ] 平板布局
- [ ] 桌面端布局
- [ ] 深色模式
- [ ] 高对比度模式
- [ ] 动画流畅度

### 性能测试
- [ ] 首次渲染时间
- [ ] 输入响应速度
- [ ] 提交响应时间
- [ ] 内存占用

## 兼容性说明

### 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 依赖版本
- Next.js: 14+
- React: 18+
- Framer Motion: 12+
- Tailwind CSS: 3.x

### 数据库兼容
- 与现有 contents 表完全兼容
- 使用相同的 HTML 存储格式
- 标签系统保持不变

## 迁移指南

### 从旧版本迁移

1. **备份旧组件**
```bash
mv components/content/content-form.tsx components/content/content-form.tsx.bak
mv components/content/content-edit-form.tsx components/content/content-edit-form.tsx.bak
```

2. **更新导入**
```typescript
// 旧
import { ContentForm } from '@/components/content/content-form'
// 新
import { CreatePostForm } from '@/components/content/create-post-form'
```

3. **测试功能**
- 创建新内容
- 编辑现有内容
- 验证数据正确性

4. **清理旧代码**（确认无问题后）
```bash
rm components/content/content-form.tsx.bak
rm components/content/content-edit-form.tsx.bak
```

## 总结

新实现保持了与现有系统的完全兼容性，同时提供了更现代的用户界面。所有核心功能都已实现，部分增强功能（如多标签、草稿保存等）可以根据需求逐步添加。
