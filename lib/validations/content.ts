import { z } from 'zod'

export const contentSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过 200 字符'),
  category: z.enum(['source-code', 'workshop', 'architecture', 'ai-frontier', 'interview'], {
    message: '请选择分类',
  }),
  content: z.string().min(100, '内容至少需要 100 字符'),
  excerpt: z.string().max(500, '摘要不能超过 500 字符').optional(),
  price_type: z.enum(['free', 'member_only'], {
    message: '请选择价格类型',
  }),
  tags: z.string().optional(),
})

export type ContentFormData = z.infer<typeof contentSchema>
